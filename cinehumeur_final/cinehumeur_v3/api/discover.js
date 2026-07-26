const BASE="https://api.themoviedb.org/3";
const headers=()=>process.env.TMDB_READ_TOKEN?{Authorization:`Bearer ${process.env.TMDB_READ_TOKEN}`,accept:"application/json"}:null;

export default async function handler(req,res){
  const h=headers(); if(!h)return res.status(503).json({error:"TMDB_READ_TOKEN manquant"});
  const page=Math.max(1,Math.min(500,Number(req.query.page||1)));
  const u=new URL(`${BASE}/discover/movie`);
  u.searchParams.set("language","fr-FR");u.searchParams.set("include_adult","false");
  u.searchParams.set("sort_by","popularity.desc");u.searchParams.set("vote_count.gte","100");u.searchParams.set("page",String(page));
  try{const r=await fetch(u,{headers:h});return res.status(r.status).json(await r.json())}
  catch{return res.status(502).json({error:"TMDB indisponible"})}
}
