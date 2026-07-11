# 🎬 Streambert Web

> Client web **films & séries** propulsé par [TMDB](https://www.themoviedb.org) — tendances, recherche, bibliothèque, suivi de progression, et plus. Interface moderne sombre, responsive (desktop → mobile).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seasayDev/streambert-web)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

---

## ✨ Fonctionnalités

- 🔥 **Tendances** films & séries de la semaine
- 🔍 **Recherche** globale (films, séries, personnes)
- 📚 **Bibliothèque** personnelle (watchlist, progression, « vu »)
- 📺 **Pages détail** : synopsis, casting, saisons/épisodes, bandes-annonces
- 🌐 **Multilingue** : métadonnées TMDB selon la langue choisie
- 🎨 **Apparence configurable** : thème clair/sombre, couleur d'accent, taille de police, mode compact
- 🔔 **Notifications** de nouveaux épisodes (selon préférences)
- 📱 **Responsive** : sidebar desktop → barre d'onglets mobile, design tactile
- 🎬 **Sous-titres & trailers** (intégrés)
- ♿ Animations douces + focus-ring accessible (désactivables)

---

## 🧱 Stack

| Couche | Techno |
|--------|--------|
| **UI** | React 18 + Vite 7 |
| **Styles** | CSS natif (variables, glassmorphism, responsive) |
| **Données** | TMDB API v3 (Read Access Token) |
| **État** | React hooks + `localStorage` (persistance locale) |
| **Déploiement** | Vercel (static SPA) |

> Le token TMDB est stocké localement dans le navigateur — Streambert Web n'a **pas** de backend : tout passe par l'API publique TMDB directement depuis le client.

---

## 🚀 Lancer en local

```bash
npm install
npm run dev          # http://localhost:5173
```

Build de production :

```bash
npm run build        # sortie dans dist/
npm run preview      # prévisualise le build
```

Au premier lancement, l'app demande un **TMDB Read Access Token** (gratuit) :
1. Crée un compte sur https://www.themoviedb.org
2. *Settings → API* → copie le **API Read Access Token** (le long JWT `eyJ...`, pas la courte API Key)
3. Colle-le dans Streambert

---

## 🌐 Déployer sur Vercel

Le repo est prêt (SPA + `vercel.json` rewrite).

**Option A — Bouton 1 clic**
Clique sur le badge *Deploy with Vercel* en haut.

**Option B — Dashboard**
1. https://vercel.com → *Add New… → Project* → importe `seasayDev/streambert-web`
2. Config (pré-remplie) :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
3. *Deploy* → URL `https://streambert-web-xxxx.vercel.app`

---

## 📁 Structure

```
streambert-web/
├── index.html
├── src/
│   ├── main.jsx              # entrée
│   ├── App.jsx              # shell (sidebar, navigation, état global)
│   ├── components/          # Sidebar, modales, cards, SetupScreen…
│   ├── pages/               # Home, Movie, TV, Library, Settings, Downloads
│   ├── styles/             # global.css (thème, responsive) + fonts
│   └── utils/              # api, storage, subtitles, ratings…
├── public/                  # logo, favicon, icônes
├── package.json
└── vercel.json
```

---

## 📝 Licence

ISC.

---

*Dérivé de [Streambert](https://github.com/truelockmc/streambert) (app desktop) — version web.
Basé sur les données de [The Movie Database (TMDB)](https://www.themoviedb.org), non affilié à TMDB.*
