const { tmdb, sendError } = require("./_tmdb");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const page = Math.max(1, Math.min(500, Number(request.query.page) || 1));
    const data = await tmdb("/discover/movie", {
      language: "fr-FR",
      include_adult: "false",
      include_video: "false",
      sort_by: "popularity.desc",
      "vote_count.gte": 100,
      page
    });

    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return response.status(200).json({
      page: data.page,
      total_pages: data.total_pages,
      results: data.results || []
    });
  } catch (error) {
    return sendError(response, error);
  }
};
