
const TMDB_BASE="https://api.themoviedb.org/3";

function number(value,fallback=0){
  const parsed=Number(value);
  return Number.isFinite(parsed)?parsed:fallback;
}

function safeLimit(value){
  return Math.max(20,Math.min(160,Math.round(number(value,100))));
}

async function tmdb(path,token){
  const response=await fetch(`${TMDB_BASE}${path}`,{
    headers:{
      Authorization:`Bearer ${token}`,
      accept:"application/json"
    }
  });

  const payload=await response.json().catch(()=>({}));

  if(!response.ok){
    throw new Error(payload.status_message||`Erreur TMDB ${response.status}`);
  }

  return payload;
}

function normalized(movie){
  return {
    id:movie.id,
    title:movie.title||movie.original_title||"Sans titre",
    original_title:movie.original_title||"",
    release_date:movie.release_date||"",
    genre_ids:Array.isArray(movie.genre_ids)?movie.genre_ids:[],
    poster_path:movie.poster_path||"",
    backdrop_path:movie.backdrop_path||"",
    vote_average:number(movie.vote_average),
    vote_count:number(movie.vote_count),
    popularity:number(movie.popularity),
    overview:movie.overview||"",
    original_language:movie.original_language||""
  };
}


function bayesianRating(movie){
  const votes=Math.max(0,number(movie.vote_count));
  const rating=Math.max(0,number(movie.vote_average));
  const minimumVotes=500;
  const globalMean=6.2;

  return (
    (votes/(votes+minimumVotes))*rating+
    (minimumVotes/(votes+minimumVotes))*globalMean
  );
}

function isLowConfidenceFrench(item){
  const movie=item.movie;
  if(movie.original_language!=="fr")return false;

  const hasTasteSignal=item.sourceCount>0;
  if(hasTasteSignal)return false;

  const votes=number(movie.vote_count);
  const bayesian=bayesianRating(movie);
  const popularity=number(movie.popularity);

  // Un film français de complément doit avoir suffisamment de recul public.
  return votes<250||bayesian<6.25||popularity<2;
}

function isLikelyWeakCandidate(item){
  const movie=item.movie;
  const votes=number(movie.vote_count);
  const rating=number(movie.vote_average);
  const bayesian=bayesianRating(movie);
  const genres=Array.isArray(movie.genre_ids)?movie.genre_ids:[];

  // Téléfilms et titres trop peu évalués sont souvent très instables.
  if(genres.includes(10770)&&item.sourceCount===0)return true;
  if(item.sourceCount===0&&votes<150)return true;
  if(item.sourceCount===0&&rating<6.0)return true;
  if(item.sourceCount===0&&bayesian<6.15)return true;

  return false;
}

export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Méthode non autorisée"});
  }

  const token=process.env.TMDB_READ_TOKEN;
  if(!token){
    return res.status(500).json({
      error:"TMDB_READ_TOKEN n’est pas configuré."
    });
  }

  const body=req.body&&typeof req.body==="object"?req.body:{};
  const rated=Array.isArray(body.rated)?body.rated:[];
  const limit=safeLimit(body.limit);
  const region=/^[A-Z]{2}$/.test(String(body.region||""))
    ?String(body.region)
    :"FR";

  const positive=rated
    .filter(item=>item&&["love","like"].includes(item.rating))
    .slice(0,8);

  const negativeIds=new Set(
    rated
      .filter(item=>item?.rating==="dislike")
      .map(item=>String(item.id))
  );

  const ratedIds=new Set(rated.map(item=>String(item.id)));
  const origins={};
  const candidates=new Map();

  try{
    for(const seed of positive){
      const seedId=String(seed.id);
      const weight=seed.rating==="love"?4:2;

      for(const page of [1,2]){
        const payload=await tmdb(
          `/movie/${encodeURIComponent(seedId)}/recommendations?language=fr-FR&page=${page}`,
          token
        );

        for(const raw of payload.results||[]){
          if(!raw?.id||ratedIds.has(String(raw.id)))continue;

          const movie=normalized(raw);
          const id=String(movie.id);
          const current=candidates.get(id)||{
            movie,
            sourceScore:0,
            sourceCount:0
          };

          current.sourceScore+=weight;
          current.sourceCount+=1;
          candidates.set(id,current);

          const list=origins[id]||[];
          if(!list.some(origin=>String(origin.id)===seedId)){
            list.push({
              id:Number(seed.id),
              title:String(seed.title||"Film aimé"),
              rating:seed.rating
            });
          }
          origins[id]=list.slice(0,5);
        }
      }
    }

    if(body.includeFrench!==false){
      for(const page of [1,2,3]){
        const params=new URLSearchParams({
          language:"fr-FR",
          region,
          page:String(page),
          sort_by:page===1?"vote_average.desc":"popularity.desc",
          with_original_language:"fr",
          include_adult:"false",
          include_video:"false",
          "vote_count.gte":page===1?"600":"250",
          "vote_average.gte":page===1?"6.6":"6.3"
        });

        const payload=await tmdb(`/discover/movie?${params.toString()}`,token);

        for(const raw of payload.results||[]){
          if(!raw?.id||ratedIds.has(String(raw.id)))continue;

          const movie=normalized(raw);
          const id=String(movie.id);
          const current=candidates.get(id)||{
            movie,
            sourceScore:0,
            sourceCount:0
          };

          // Le cinéma français complète le catalogue mais ne domine pas
          // artificiellement les voisins issus des films préférés.
          current.sourceScore+=0.7;
          candidates.set(id,current);
        }
      }
    }

    const results=[...candidates.values()]
      .filter(item=>!negativeIds.has(String(item.movie.id)))
      .filter(item=>!isLikelyWeakCandidate(item))
      .filter(item=>!isLowConfidenceFrench(item))
      .sort((a,b)=>{
        const qualityA=bayesianRating(a.movie);
        const qualityB=bayesianRating(b.movie);

        const frenchBonusA=
          a.movie.original_language==="fr"&&a.sourceCount>0
            ?8
            :0;

        const frenchBonusB=
          b.movie.original_language==="fr"&&b.sourceCount>0
            ?8
            :0;

        const scoreA=
          a.sourceScore*22+
          Math.min(a.sourceCount,4)*16+
          Math.max(0,qualityA-6)*18+
          Math.min(Math.log10(number(a.movie.vote_count)+1),4)*3+
          Math.min(Math.log10(number(a.movie.popularity)+1),3)+
          frenchBonusA;

        const scoreB=
          b.sourceScore*22+
          Math.min(b.sourceCount,4)*16+
          Math.max(0,qualityB-6)*18+
          Math.min(Math.log10(number(b.movie.vote_count)+1),4)*3+
          Math.min(Math.log10(number(b.movie.popularity)+1),3)+
          frenchBonusB;

        return scoreB-scoreA;
      })
      .slice(0,limit)
      .map(item=>item.movie);

    res.setHeader(
      "Cache-Control",
      "s-maxage=900, stale-while-revalidate=3600"
    );

    return res.status(200).json({
      results,
      origins,
      seeds:positive.length
    });
  }catch(error){
    console.error(error);
    return res.status(500).json({
      error:"Impossible de construire les recommandations personnalisées."
    });
  }
}