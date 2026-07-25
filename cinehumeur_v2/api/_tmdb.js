const BASE_URL = "https://api.themoviedb.org/3";

function getToken() {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    const error = new Error("TMDB_READ_TOKEN manquant");
    error.statusCode = 503;
    throw error;
  }
  return token;
}

async function tmdb(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const error = new Error(`Erreur TMDB ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
}

function sendError(response, error) {
  const status = Number(error.statusCode) || 500;
  response.status(status).json({
    error: status === 503
      ? "Le serveur n’est pas encore configuré avec TMDB_READ_TOKEN."
      : "Impossible de contacter TMDB pour le moment."
  });
}

module.exports = { tmdb, sendError };
