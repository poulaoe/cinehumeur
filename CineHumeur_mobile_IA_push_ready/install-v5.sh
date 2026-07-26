#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d "cinehumeur_final" ]; then
  echo "Erreur : le dossier cinehumeur_final est introuvable."
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
backup="cinehumeur_final_backup_${timestamp}"

if [ -d "$backup" ]; then
  rm -rf "$backup"
fi

mv cinehumeur_final "$backup"
mv cinehumeur_v5/cinehumeur_final cinehumeur_final
rm -rf cinehumeur_v5

git add .
git commit -m "CineHumeur V5 - interface premium et IA conversationnelle"
git push origin main

echo
echo "Terminé. Sauvegarde locale conservée dans : $backup"
echo "Vérifie ensuite le déploiement Vercel."
