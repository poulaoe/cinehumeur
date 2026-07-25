export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const url = "https://zvblefvoyptlhqemscky.supabase.co";

  const anonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YmxlZnZveXB0bGhxZW1zY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDEwNzEsImV4cCI6MjEwMDU3NzA3MX0.bHHzYIuSqB4AgFbb-TslCvs6ikBEaWU229vXkS1Fry4";

  res.status(200).json({
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    enabled: Boolean(url && anonKey),
  });
}
