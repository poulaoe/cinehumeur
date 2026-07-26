# CinéHumeur V2 — comptes et synchronisation

Cette version conserve le mode sans compte et ajoute :

- inscription et connexion par e-mail ;
- connexion Google ;
- sauvegarde locale immédiate ;
- synchronisation Supabase des avis, du catalogue chargé, de l’historique et du profil de recommandation ;
- protection des données par Row Level Security.

## 1. Créer le projet Supabase

1. Crée un projet sur Supabase.
2. Ouvre **SQL Editor**.
3. Copie-colle tout le fichier `supabase.sql`, puis exécute-le.
4. Dans **Authentication > URL Configuration** :
   - Site URL : `https://cinehumeur.vercel.app`
   - Redirect URLs : ajoute `https://cinehumeur.vercel.app/**`
5. Dans **Authentication > Providers**, active Email. Active Google seulement après avoir configuré ses identifiants OAuth.

## 2. Variables Vercel

Dans **Vercel > Settings > Environment Variables**, ajoute :

- `TMDB_READ_TOKEN` : ton jeton TMDB v4
- `SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_ANON_KEY` : clé publique/anon (publishable), jamais la service_role

Puis redéploie le projet.

## 3. Déploiement

Le Root Directory Vercel doit pointer vers le dossier contenant ce fichier, `index.html` et `api/`.

## Sécurité

La clé publique Supabase est destinée au navigateur. La table est protégée par RLS : chaque utilisateur ne peut lire ou modifier que sa propre ligne. Ne place jamais la clé `service_role` dans le frontend ni dans `/api/config`.
