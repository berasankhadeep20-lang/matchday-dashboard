# ⚽ MATCHDAY Dashboard

A modern live football data dashboard built with React + Vite. Live standings, fixtures, results, top scorers, tyre strategy — powered by the free football-data.org API.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

---

## ✨ Features

- **Live League Tables** — PL, La Liga, Bundesliga, Serie A, Ligue 1, UCL, World Cup
- **Home/Away/Total** split standings with form guide
- **Recent Results & Upcoming Fixtures** — week navigator with date grouping
- **Top Scorers & Assists** — leaderboard + bar chart
- **Team Browser** — stats grid, radar chart, recent form per team
- **Goals Chart** — scored vs conceded for all teams
- **Points Race** — matchday-by-matchday progression chart
- **Live Ticker** — real-time live match scores (auto-refresh 30s)
- Fully responsive — mobile + desktop
- Pitch dark theme with neon green accents
- `localStorage` username + API key persistence

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Free API key from [football-data.org](https://www.football-data.org/client/register)

```bash
git clone https://github.com/berasankhadeep20-lang/matchday-dashboard.git
cd matchday-dashboard
npm install
npm run dev
```

Open [http://localhost:5173/matchday-dashboard/](http://localhost:5173/matchday-dashboard/)

---

## 📦 Deploy to GitHub Pages

Deployment is fully automated via GitHub Actions.

### One-time setup

**Step 1 — Push to GitHub**
```bash
git init
git add .
git commit -m "⚽ Initial commit"
git branch -M main
git remote add origin https://github.com/berasankhadeep20-lang/matchday-dashboard.git
git push -u origin main
```

**Step 2 — Enable GitHub Pages**

Go to repo → **Settings → Pages → Source → GitHub Actions** → Save.

**Step 3 — Done!**

Every push to `main` auto-deploys to:
```
https://berasankhadeep20-lang.github.io/matchday-dashboard/
```

### Production CORS note (football-data.org)

football-data.org free-tier keys may reject browser requests from some origins.
If your deployed site shows CORS errors, set a proxy in your deployment environment:

```bash
VITE_FOOTBALL_DATA_PROXY="https://your-proxy.example.com/?url="
```

`VITE_FOOTBALL_DATA_PROXY` supports either:
- prefix format (e.g. `https://your-proxy.example.com/?url=`)
- placeholder format (e.g. `https://your-proxy.example.com/fetch?target={url}`)


---

## 🌐 API

| Service | Usage |
|---------|-------|
| [football-data.org](https://www.football-data.org) | Standings, fixtures, scorers, teams |

Free tier rate limit: 10 requests/minute — the app handles this automatically with a client-side queue.

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite 5 | UI + build |
| Tailwind CSS | Styling |
| Recharts | Charts |
| Framer Motion | Animations |
| Barlow Condensed + JetBrains Mono | Typography |

---

## 📁 Project Structure

```
matchday-dashboard/
├── .github/workflows/deploy.yml
├── public/favicon.svg
├── src/
│   ├── components/
│   │   ├── GoalsChart.jsx
│   │   ├── LeagueTable.jsx
│   │   ├── LiveTicker.jsx
│   │   ├── LoadingCard.jsx
│   │   ├── MatchCard.jsx
│   │   ├── MatchList.jsx
│   │   ├── Navbar.jsx
│   │   ├── PointsChart.jsx
│   │   ├── StatsBar.jsx
│   │   ├── TopScorers.jsx
│   │   └── WelcomeModal.jsx
│   ├── context/AppContext.jsx
│   ├── hooks/useFootballData.js
│   ├── pages/
│   │   ├── FixturesPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LeaguePage.jsx
│   │   ├── PlayersPage.jsx
│   │   └── TeamsPage.jsx
│   ├── utils/api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

*Not affiliated with any football club, league, or governing body.*
