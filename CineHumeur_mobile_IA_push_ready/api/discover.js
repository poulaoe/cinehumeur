const TMDB_BASE = "https://api.themoviedb.org/3";

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function allowedSort(sort) {
  const allowed = new Set([
    "popularity.desc",
    "popularity.asc",
    "vote_average.desc",
    "vote_average.asc",
    "primary_release_date.desc",
    "primary_release_date.asc",
    "revenue.desc",
    "revenue.asc"
  ]);

  return allowed.has(sort) ? sort : "popularity.desc";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  const token = process.env.TMDB_READ_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "TMDB_READ_TOKEN n'est pas configuré."
    });
  }

  const page = Math.round(
    clampNumber(req.query.page, 1, 500, 1)
  );

  const region =
    /^[A-Z]{2}$/.test(String(req.query.region || ""))
      ? String(req.query.region)
      : "FR";

  const originalLanguage =
    /^[a-z]{2,3}$/.test(
      String(req.query.with_original_language || "")
    )
      ? String(req.query.with_original_language)
      : "";

  const voteCount = clampNumber(
    req.query.vote_count_gte,
    0,
    1000000,
    0
  );

  const voteAverage = clampNumber(
    req.query.vote_average_gte,
    0,
    10,
    0
  );

  const sortBy = allowedSort(
    String(req.query.sort_by || "")
  );

  const params = new URLSearchParams({
    language: "fr-FR",
    region,
    page: String(page),
    include_adult: "false",
    include_video: "false",
    sort_by: sortBy,
    "vote_count.gte": String(voteCount),
    "vote_average.gte": String(voteAverage)
  });

  if (originalLanguage) {
    params.set(
      "with_original_language",
      originalLanguage
    );
  }

  try {
    const response = await fetch(
      `${TMDB_BASE}/discover/movie?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.status_message ||
          "Erreur TMDB"
      });
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=86400"
    );

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Impossible de contacter TMDB."
    });
  }
}