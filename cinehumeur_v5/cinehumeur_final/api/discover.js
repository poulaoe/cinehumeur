const BASE="https://api.themoviedb.org/3";
const getHeaders=()=>process.env.TMDB_READ_TOKEN?{Authorization:`Bearer ${process.env.TMDB_READ_TOKEN}`,accept:"application/json"}:null;

export default async function handler(req,res){
  const headers=getHeaders();if(!headers)return res.status(503).json({error:"TMDB_READ_TOKEN manquant"});
  const page=Math.max(1,Math.min(500,Number(req.query.page||1)));
  const u=new URL(`${BASE}/discover/movie`);
  Object.entries({language:"fr-FR",include_adult:"false",include_video:"false",sort_by:"popularity.desc","vote_count.gte":"100",page:String(page)}).forEach(([k,v])=>u.searchParams.set(k,v));
  try{const r=await fetch(u,{headers});res.status(r.status).json(await r.json())}catch{res.status(502).json({error:"TMDB indisponible"})}
}
