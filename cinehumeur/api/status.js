module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Méthode non autorisée" });
  }

  return response.status(200).json({
    ready: Boolean(process.env.TMDB_READ_TOKEN),
    service: "CinéHumeur API"
  });
};
