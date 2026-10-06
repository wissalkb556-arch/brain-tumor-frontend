# 🧠 Brain Tumor Detector — Détection et classification de tumeurs cérébrales par IRM avec IA explicable

Application complète d'aide au diagnostic utilisant le deep learning pour classifier des IRM cérébrales en 4 catégories (gliome, méningiome, adénome pituitaire, aucune tumeur), avec cartes d'explicabilité Grad-CAM et génération automatique de rapports.

**🔗 Démo en ligne :** https://brain-tumor-frontend-iphk.onrender.com
**🔗 API :** https://brain-tumor-api-lc4s.onrender.com/docs

> ⚠️ Projet éducatif/portfolio. Ceci n'est pas un dispositif médical certifié et ne doit jamais remplacer un diagnostic médical professionnel.

---

## 📋 Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture technique](#architecture-technique)
- [Résultats et métriques](#résultats-et-métriques)
- [Limites connues](#limites-connues)
- [Stack technique](#stack-technique)
- [Installation locale](#installation-locale)
- [Dataset](#dataset)

---

## Aperçu

[Capture d'écran ici : page principale de l'application avec une analyse en cours]

Ce projet permet d'uploader une ou plusieurs IRM cérébrales et d'obtenir :
- La classification automatique (gliome, méningiome, adénome pituitaire, ou absence de tumeur)
- Le niveau de confiance du modèle pour chaque classe
- Une carte de chaleur **Grad-CAM** montrant quelle région de l'image a motivé la décision du modèle (explicabilité)
- Un rapport structuré généré automatiquement, dans un format proche d'un compte-rendu radiologique
- Un historique des analyses et un tableau de bord statistique
- L'export des rapports en PDF

## Fonctionnalités

[Capture d'écran ici : tableau de bord avec graphiques]

- **Analyse par lot (batch)** : plusieurs images à la suite, avec file d'attente et navigation par vignettes
- **Glisser-déposer (drag & drop)** des fichiers
- **Carte Grad-CAM** superposée à l'image originale pour visualiser la zone d'intérêt détectée
- **Tableau de bord** avec répartition des classes, distribution de la confiance (donut chart) et tendance des dernières analyses
- **Historique** persistant des analyses consultées (stockage local)
- **Export PDF** du rapport complet, image + heatmap + texte
- **Health check** automatique de l'API (indicateur en ligne/hors ligne)

## Architecture technique

[Capture d'écran ici : schéma ou diagramme d'architecture, optionnel]

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend       │  HTTP   │   Backend API      │         │  Modèle ResNet18 │
│   React + Vite    │ ──────> │   FastAPI           │ ──────> │  fine-tuné        │
│   (Render Static)│ <────── │   (Render Web Svc) │ <────── │  + Grad-CAM        │
└─────────────────┘  JSON   └──────────────────┘         └─────────────────┘
```

- **Frontend** : React + Vite, déployé en tant que site statique
- **Backend** : API FastAPI exposant `/predict` (classification) et `/` (health check)
- **Modèle** : ResNet18 pré-entraîné sur ImageNet, fine-tuné sur le dataset IRM (transfer learning avec déblocage progressif de `layer4` et taux d'apprentissage différenciés)
- **Explicabilité** : Grad-CAM implémenté via hooks PyTorch sur la dernière couche convolutionnelle
- **Génération de rapport** : logique déterministe (pas de LLM), pour garantir reproductibilité et fiabilité dans un contexte médical
- **Déploiement** : backend et frontend hébergés en permanence sur Render (plan gratuit), poids du modèle téléchargés dynamiquement depuis Hugging Face Hub au démarrage du conteneur (contournement de la limite de taille de fichier sur GitHub)

## Résultats et métriques

[Capture d'écran ici : matrice de confusion / classification report de l'entraînement]

| Métrique | Valeur |
|---|---|
| Précision globale (test) | ~94% |
| Précision (validation) | ~97% |
| Rappel glioma | 0.70 – 0.85 selon les runs |
| Architecture | ResNet18 (transfer learning) |
| Classes | glioma, meningioma, pituitary, notumor |

**Exemples de tests manuels :**

[Capture d'écran ici : tableau de tes tests manuels, image / classe réelle / classe prédite / confiance]

## Limites connues

Analyse honnête des limites, importante pour la crédibilité scientifique du projet :

- Le **rappel du glioma** est plus faible que les autres classes (0.70–0.85), un écart confirmé sur 3 méthodes d'évaluation indépendantes et vérifié via Grad-CAM comme une vraie difficulté visuelle (similarité avec le méningiome) et non un raccourci d'apprentissage (pas de sur-apprentissage : écart train/val d'environ 2 points seulement)
- Le dataset public utilisé présente un certain taux de quasi-doublons entre les ensembles d'entraînement et de test (limite documentée de ce dataset, pas de ce modèle)
- Ce système est un outil d'aide à la décision, pas un outil de diagnostic autonome — toute interprétation doit être validée par un professionnel de santé

## Stack technique

**Backend :** Python, PyTorch, torchvision, FastAPI, Uvicorn, Pillow, OpenCV
**Frontend :** React, Vite, JavaScript, jsPDF
**ML :** ResNet18 (transfer learning), Grad-CAM
**Déploiement :** Render (Web Service + Static Site), Hugging Face Hub (hébergement des poids), GitHub (CI/CD via auto-deploy)
**Dataset :** Kaggle — Brain Tumor MRI Dataset

## Installation locale

### Backend

```bash
git clone https://github.com/wissalkb556-arch/brain-tumor-api.git
cd brain-tumor-api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
git clone https://github.com/wissalkb556-arch/brain-tumor-frontend.git
cd brain-tumor-frontend
npm install
npm run dev
```

## Dataset

[Masoud Nickparvar — Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset), Kaggle. 4 classes : glioma, meningioma, pituitary, notumor.

---

*Projet réalisé par Wissal — [LinkedIn](#) · [GitHub](https://github.com/wissalkb556-arch)*
