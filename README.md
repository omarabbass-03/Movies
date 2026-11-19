# 🎬 CineScope — Movies Explorer

A fast, responsive React app for browsing **Now Playing**, **Popular**, **Top Rated** and **Upcoming** movies, powered by the [TMDB API](https://developer.themoviedb.org/docs).

## ✨ Features

- **Featured hero** with backdrop art for the top movie in each category
- **Search all of TMDB** (debounced) — press <kbd>/</kbd> anywhere to focus search
- **Rating filter** (Any / 6+ / 7+ / 8+) and **sorting** (rating, newest, title)
- **Infinite scroll** with skeleton loaders
- **Movie details modal**: genres, runtime, director, top cast and an embedded **trailer**
- **Watchlist** saved in your browser
- **Shareable URLs** (`?view=popular&q=dune&movie=438631`)
- Fully responsive, keyboard accessible, respects reduced-motion
- TMDB token is kept **server-side** via a Vercel serverless proxy (`api/tmdb.js`)

## 🛠️ Tech

React 19 · Vite · plain CSS · Vercel Functions

## ⚙️ Local setup

```bash
npm install
echo "TMDB_TOKEN=<your TMDB API Read Access Token>" > .env.local
npm run dev
```

Get a token at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## 🚀 Deploy

Deployed on Vercel. Set the `TMDB_TOKEN` environment variable in the project, then:

```bash
vercel deploy --prod
```
