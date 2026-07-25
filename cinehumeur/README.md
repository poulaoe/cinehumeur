# CinéHumeur — version Vercel partageable

Cette version contient :

- le site dans `index.html` ;
- un backend Vercel dans `api/` ;
- le grand catalogue et la recherche TMDB ;
- le jeton TMDB conservé côté serveur ;
- l’apprentissage local des goûts ;
- trois recommandations ;
- les avis après visionnage qui recalculent les propositions.

## Déploiement sans ligne de commande

1. Décompresse le ZIP.
2. Crée un compte sur GitHub et un nouveau dépôt.
3. Ajoute tous les fichiers du dossier au dépôt.
4. Sur Vercel, choisis **Add New → Project**.
5. Importe le dépôt GitHub.
6. Dans **Environment Variables**, ajoute :
   - nom : `TMDB_READ_TOKEN`
   - valeur : ton nouveau Read Access Token v4
7. Clique sur **Deploy**.
8. Vercel fournit une adresse publique à partager.

Ne mets jamais le jeton dans `index.html`, GitHub ou `.env.example`.

## Vérification

Après déploiement, ouvre :

`https://ton-site.vercel.app/api/status`

Tu dois obtenir `"ready": true`.

## Développement local

Crée un fichier `.env.local` :

```env
TMDB_READ_TOKEN=ton_nouveau_jeton_v4
```

Puis installe Vercel CLI et lance :

```bash
npx vercel dev
```
