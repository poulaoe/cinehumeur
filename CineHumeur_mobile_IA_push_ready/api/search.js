const BASE="https://api.themoviedb.org/3";
const getHeaders=()=>process.env.TMDB_READ_TOKEN?{Authorization:`Bearer ${process.env.TMDB_READ_TOKEN}`,accept:"application/json"}:null;

export default async function handler(req,res){
  const headers=getHeaders();if(!headers)return res.status(503).json({error:"TMDB_READ_TOKEN manquant"});
  const q=String(req.query.q||"").trim();if(!q)return res.status(400).json({error:"Recherche vide"});
  const u=new URL(`${BASE}/search/movie`);Object.entries({language:"fr-FR",include_adult:"false",query:q}).forEach(([k,v])=>u.searchParams.set(k,v));
  try{const r=await fetch(u,{headers});res.status(r.status).json(await r.json())}catch{res.status(502).json({error:"TMDB indisponible"})}
}
