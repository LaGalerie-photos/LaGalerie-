
# LaGalerie

Site statique de galerie photo (thème **sombre** par défaut). Modifie les images dans `photos/` et la liste dans `data/photos.json`.

## Lancer en local
- Via Python :
  ```bash
  python3 -m http.server 8080
  ```
  Puis ouvre http://localhost:8080

## Déployer
- GitHub Pages (Settings → Pages → Branch: main / root),
- ou Netlify (glisser-déposer le dossier).

## Ajouter des images
1. Copie tes photos dans `photos/` (jpg/png/svg…).
2. Ajoute une entrée dans `data/photos.json` avec le chemin `src` correspondant.

Bon shoot !
