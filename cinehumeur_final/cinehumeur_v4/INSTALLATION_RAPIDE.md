# Installation rapide

Dans le dépôt :

```bash
rm -rf cinehumeur_final
mv cinehumeur_v4 cinehumeur_final
git add .
git commit -m "CineHumeur V4 - interface premium et IA conversationnelle"
git push origin main
```

Dans Vercel, ajoute `OPENAI_API_KEY`, puis redéploie. Les variables Supabase et TMDB existantes restent inchangées.
