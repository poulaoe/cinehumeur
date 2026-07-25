const { tmdb, sendError } = require("./_tmdb");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Méthode non autorisée" });
  }

  const query = String(request.query.q || "").trim();
  if (query.length < 2 || query.length > 100) {
    return response.status(400).json({ error: "Recherche invalide" });
  }

  try {
    const data = await tmdb("/search/movie", {
      language: "fr-FR",
      include_adult: "false",
      query,
      page: 1
    });

    response.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    return response.status(200).json({
      results: data.results || []
    });
  } catch (error) {
    return sendError(response, error);
  }
};
