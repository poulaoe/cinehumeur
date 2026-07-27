export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const id = String(req.query?.id || "").trim();
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identifiant de film invalide" });
  }

  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "TMDB_READ_TOKEN non configuré" });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/watch/providers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB HTTP ${response.status}`);
    }

    const data = await response.json();
    const fr = data?.results?.FR || {};

    return res.status(200).json({
      flatrate: fr.flatrate || [],
      free: fr.free || [],
      ads: fr.ads || [],
      rent: fr.rent || [],
      buy: fr.buy || [],
      link: fr.link || ""
    });
  } catch (error) {
    console.error("Watch providers error:", error);
    return res.status(500).json({
      error: "Impossible de récupérer les plateformes françaises"
    });
  }
}