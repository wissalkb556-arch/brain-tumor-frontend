# BrainScan — Front-end

Interface React pour ton API de détection de tumeurs cérébrales : analyse d'IRM avec carte Grad-CAM, tableau de bord et historique des analyses.

## Installation

```bash
npm install
```

## Configuration

Ouvre `src/api.js` et remplace l'URL par celle de ton API (ton lien ngrok actuel, ou ton déploiement permanent plus tard) :

```js
export const API_URL = "https://ton-lien-ngrok-ou-deploiement.app";
```

## Lancer en local

```bash
npm run dev
```

Ouvre ensuite l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## Fonctionnement

- **Analyser** : glisse-dépose une ou plusieurs IRM (ou clique pour sélectionner), lance l'analyse par lot, navigue entre les images via la bande de miniatures. Affiche l'image originale et la carte Grad-CAM côte à côte, le rapport, les probabilités par classe, et une alerte automatique si la confiance est inférieure à 70%.
- **Export PDF** : bouton "Exporter en PDF" sur chaque résultat — génère un rapport complet (images + findings + texte) téléchargeable, via `jspdf`.
- **Tableau de bord** : statistiques agrégées, donut de répartition de la confiance, courbe de tendance sur les 20 dernières analyses, répartition par classe.
- **Historique** : liste de toutes les analyses passées, stockées dans le navigateur (`localStorage`), avec le rapport complet consultable au clic.

## Build pour la production

```bash
npm run build
```

Le résultat est dans `dist/` — déployable sur Vercel, Netlify, ou tout hébergeur statique.

## Limite connue à noter dans ta présentation

Le modèle a un recall plus faible sur la classe `glioma` (~79%), documenté et analysé via Grad-CAM dans le rapport du projet — l'interface affiche systématiquement une alerte de confiance faible dans ces cas, plutôt que de masquer l'incertitude.
