
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const imdbId = String(req.query?.imdbId || "").trim();

  if (!/^tt\d{5,12}$/.test(imdbId)) {
    return res.status(400).json({ error: "Identifiant IMDb invalide" });
  }

  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "La variable OMDB_API_KEY n'est pas configurée dans Vercel"
    });
  }

  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("i", imdbId);
    url.searchParams.set("plot", "short");
    url.searchParams.set("r", "json");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OMDb HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
      return res.status(404).json({
        error: data.Error || "Film introuvable sur OMDb"
      });
    }

    const ratings = Array.isArray(data.Ratings)
      ? data.Ratings
          .filter(item => item?.Source && item?.Value)
          .map(item => ({
            source: String(item.Source),
            value: String(item.Value)
          }))
      : [];

    return res.status(200).json({
      imdbId,
      title: data.Title || "",
      ratings,
      imdbRating: data.imdbRating && data.imdbRating !== "N/A"
        ? data.imdbRating
        : null,
      metascore: data.Metascore && data.Metascore !== "N/A"
        ? data.Metascore
        : null
    });
  } catch (error) {
    console.error("OMDb ratings error:", error);
    return res.status(500).json({
      error: "Impossible de récupérer les notes externes"
    });
  }
}