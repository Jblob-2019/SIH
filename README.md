# AquaMind · Hydraulic Intelligence Command

Production-ready full-stack app for the AquaMind HIC dashboard.

* **Front-end:** React 18 + Vite 5 (no other UI deps; CSS is the original design).
* **Back-end:** Node 18+ / Express 4.
* **State:** in-memory placeholder store (replace with a real DB later).
* **Run locally:** one command (`npm run dev`) boots both API and web.

## Ports

| Service  | Dev URL                  |
|----------|--------------------------|
| Front-end (Vite) | http://127.0.0.1:5000 |
| Back-end (Express) | http://127.0.0.1:4000 |

```
shi dumb ass/
├── package.json                ← workspace root (concurrently)
├── .env.example
├── server/
│   ├── package.json
│   └── src/
│       ├── index.js            ← Express entry
│       ├── routes/index.js     ← /api routes
│       └── data/store.js       ← in-memory seed
└── client/
    ├── package.json
    ├── vite.config.js          ← /api proxy → :4000
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx
        ├── components/         ← Sidebar, Topbar
        ├── views/              ← 17 React view modules
        ├── lib/api.js          ← fetch wrapper
        ├── lib/hooks.js        ← useApi, pill, rid
        └── styles/app.css      ← extracted from supplied HTML
```

## Quick start

```bash
cd "shi dumb ass"
npm run install:all         # installs root + server + client deps
npm run dev                 # starts API on :4000 and Vite on :5173
```

Open <http://127.0.0.1:5000>.

## Production

```bash
npm run build               # builds client/dist
npm start                   # serves API + built client from server
```

The Express server (port 4000) will then serve the React bundle directly.

## API quick reference

| Method | Path                         | Purpose                          |
|-------:|------------------------------|----------------------------------|
| GET    | /health                      | health check                     |
| GET    | /api/metrics                 | dashboard KPIs                   |
| GET    | /api/lakes                   | list lakes                       |
| GET    | /api/lakes/:id               | lake + its sensors               |
| GET    | /api/sensors                 | all sensors                      |
| GET    | /api/sensors/:id             | one sensor                       |
| GET    | /api/sensors/:id/readings    | 24h readings                     |
| GET    | /api/incidents               | list incidents                   |
| POST   | /api/incidents               | create `{lake,title,severity?}`  |
| PATCH  | /api/incidents/:id           | update status                    |
| GET    | /api/anomalies               | anomaly feed                     |
| GET    | /api/forecasts               | 14-day forecast series           |
| GET    | /api/biodiversity            | species list                     |
| GET    | /api/maintenance             | work orders                      |
| GET    | /api/optimize                | AI recommendations               |
| GET    | /api/recovery                | recovery programmes              |
| GET    | /api/emergency               | emergency alerts                 |
| GET    | /api/reports                 | reports catalogue                |
| GET    | /api/citizen                 | citizen tickets                  |
| POST   | /api/assistant               | `{prompt}` → reply (placeholder) |

## Swapping the data store

Replace `server/src/data/store.js` with a real implementation that exports the same async API (metrics, lakes, lake, sensors, …). No route files need to change.