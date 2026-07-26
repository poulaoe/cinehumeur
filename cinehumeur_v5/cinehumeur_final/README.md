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


## Structure attendue sur GitHub

Vercel doit avoir `cinehumeur_final` comme Root Directory. Les fichiers doivent être directement placés ainsi :

```text
cinehumeur_final/
├── index.html
├── api/
├── package.json
├── vercel.json
├── manifest.webmanifest
├── sw.js
└── supabase.sql
```

Il ne faut pas conserver un sous-dossier `cinehumeur_v4` ou `cinehumeur_v5` à l'intérieur de `cinehumeur_final`.
