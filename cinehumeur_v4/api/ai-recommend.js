const GENRE_IDS={
  "action":28,"aventure":12,"animation":16,"comédie":35,"crime":80,"documentaire":99,
  "drame":18,"famille":10751,"fantastique":14,"histoire":36,"horreur":27,
  "musique":10402,"mystère":9648,"romance":10749,"science-fiction":878,
  "thriller":53,"guerre":10752,"western":37
};

export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Méthode non autorisée"});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return res.status(503).json({error:"OPENAI_API_KEY manquante"});
  const {prompt,topGenres=[],rated=[]}=req.body||{};
  if(!String(prompt||"").trim())return res.status(400).json({error:"Envie vide"});

  const instructions=`Tu es le moteur éditorial de CinéHumeur, un conseiller cinéma francophone.
Analyse l'état émotionnel et l'intention de soirée. Ne recommande pas directement des titres.
Transforme la demande en un brief de recherche concis et nuancé.
Les moods autorisés sont: comfort, fun, intense, emotion, escape, dark, smart, surprise.
Les genres doivent être donnés sous forme d'identifiants TMDB parmi: ${JSON.stringify(GENRE_IDS)}.
Évite les diagnostics psychologiques. Réponds uniquement en JSON valide.`;

  const input={
    demande:String(prompt).slice(0,600),
    genres_appris:topGenres,
    notes_recentes:rated.slice(-40)
  };

  try{
    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||"gpt-5-mini",
        instructions,
        input:JSON.stringify(input),
        text:{format:{
          type:"json_schema",
          name:"cinehumeur_brief",
          strict:true,
          schema:{
            type:"object",
            additionalProperties:false,
            properties:{
              mood:{type:"string",enum:["comfort","fun","intense","emotion","escape","dark","smart","surprise"]},
              summary:{type:"string"},
              explanation:{type:"string"},
              constraints:{type:"array",items:{type:"string"},maxItems:5},
              preferred_genres:{type:"array",items:{type:"integer"},maxItems:5},
              avoid_genres:{type:"array",items:{type:"integer"},maxItems:5},
              min_rating:{type:"number"},
              prefer_less_popular:{type:"boolean"}
            },
            required:["mood","summary","explanation","constraints","preferred_genres","avoid_genres","min_rating","prefer_less_popular"]
          }
        }}
      })
    });
    const data=await response.json();
    if(!response.ok)return res.status(response.status).json({error:data?.error?.message||"Erreur OpenAI"});
    const text=data.output_text||data.output?.flatMap(x=>x.content||[]).find(x=>x.type==="output_text")?.text;
    if(!text)throw new Error("Réponse IA vide");
    return res.status(200).json(JSON.parse(text));
  }catch(error){
    return res.status(502).json({error:error.message||"Analyse IA indisponible"});
  }
}
