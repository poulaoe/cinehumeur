const BASE="https://api.themoviedb.org/3";

function headers(){
  const token=process.env.TMDB_READ_TOKEN;
  return token
    ?{Authorization:`Bearer ${token}`,accept:"application/json"}
    :null;
}

async function tmdb(path,headers){
  const response=await fetch(`${BASE}${path}`,{headers});
  if(!response.ok){
    const body=await response.text();
    throw new Error(`TMDB ${response.status}: ${body.slice(0,180)}`);
  }
  return response.json();
}

export default async function handler(req,res){
  const authHeaders=headers();

  if(!authHeaders){
    return res.status(503).json({
      error:"TMDB_READ_TOKEN manquant dans Vercel."
    });
  }

  const id=String(req.query.id||"").replace(/\D/g,"");
  if(!id){
    return res.status(400).json({error:"Identifiant du film manquant."});
  }

  try{
    const [movie,releases]=await Promise.all([
      tmdb(
        `/movie/${id}?language=fr-FR&append_to_response=credits,videos,recommendations`,
        authHeaders
      ),
      tmdb(`/movie/${id}/release_dates`,authHeaders).catch(()=>({results:[]}))
    ]);

    const french=(releases.results||[]).find(item=>item.iso_3166_1==="FR");
    const certification=(french?.release_dates||[])
      .map(item=>item.certification)
      .find(Boolean)||"";

    return res.status(200).json({...movie,certification});
  }catch(error){
    return res.status(502).json({
      error:"Impossible de charger la fiche du film.",
      detail:error.message
    });
  }
}
