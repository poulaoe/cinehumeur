const BASE_URL = "https://api.themoviedb.org/3";

function getHeaders() {
  const token = process.env.TMDB_READ_TOKEN;

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  };
}

async function tmdbRequest(path, headers) {
  const response = await fetch(`${BASE_URL}${path}`, { headers });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Erreur TMDB ${response.status} : ${message.slice(0, 200)}`
    );
  }

  return response.json();
}

export default async function handler(req, res) {
  const headers = getHeaders();

  if (!headers) {
    return res.status(503).json({
      error: "La variable TMDB_READ_TOKEN est absente dans Vercel.",
    });
  }

  const id = String(req.query.id || "").replace(/\D/g, "");

  if (!id) {
    return res.status(400).json({
      error: "Identifiant du film manquant.",
    });
  }

  try {
    const [movie, credits, recommendations, frenchVideos, englishVideos, releases] =
      await Promise.all([
        tmdbRequest(`/movie/${id}?language=fr-FR`, headers),

        tmdbRequest(
          `/movie/${id}/credits?language=fr-FR`,
          headers
        ).catch(() => ({ cast: [], crew: [] })),

        tmdbRequest(
          `/movie/${id}/recommendations?language=fr-FR&page=1`,
          headers
        ).catch(() => ({ results: [] })),

        tmdbRequest(
          `/movie/${id}/videos?language=fr-FR`,
          headers
        ).catch(() => ({ results: [] })),

        tmdbRequest(
          `/movie/${id}/videos?language=en-US`,
          headers
        ).catch(() => ({ results: [] })),

        tmdbRequest(
          `/movie/${id}/release_dates`,
          headers
        ).catch(() => ({ results: [] })),
      ]);

    const frenchResults = frenchVideos.results || [];
    const englishResults = englishVideos.results || [];

    const videos = [
      ...frenchResults,
      ...englishResults.filter(
        englishVideo =>
          !frenchResults.some(
            frenchVideo => frenchVideo.key === englishVideo.key
          )
      ),
    ];

    const frenchRelease = (releases.results || []).find(
      item => item.iso_3166_1 === "FR"
    );

    const certification =
      (frenchRelease?.release_dates || [])
        .map(item => item.certification)
        .find(Boolean) || "";

    return res.status(200).json({
      ...movie,
      credits,
      recommendations,
      videos: {
        results: videos,
      },
      certification,
    });
  } catch (error) {
    console.error("Erreur fiche film :", error);

    return res.status(502).json({
      error: "Impossible de charger la fiche du film.",
      detail: error.message,
    });
  }
}