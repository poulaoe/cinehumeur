# CinéHumeur V4

Version premium centrée sur l’humeur, avec :

- saisie libre conversationnelle ;
- analyse IA via l’API Responses d’OpenAI ;
- repli intelligent local si la clé OpenAI manque ;
- scoring combinant humeur, genres, notes et historique ;
- trois rôles : choix sûr, pépite, découverte ;
- authentification Google/email et synchronisation Supabase ;
- catalogue TMDB sécurisé côté serveur.

## Variables Vercel

- `TMDB_READ_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- optionnel : `OPENAI_MODEL` (par défaut `gpt-5-mini`)

Le Root Directory doit rester `cinehumeur_final`.
