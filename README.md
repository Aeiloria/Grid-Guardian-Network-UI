# Grid Guardian Network UI

Operator console for a fictional Gatesville, Texas grid: a local node map, acoustic routines, browser biometrics, and a client-side shield visualization. The repo homepage is `https://grid-guardian-network-ui.vercel.app`. `.env.example` sets `APP_URL` to an AI Studio host. Those are configuration values; this document describes the code on `main`.

`main` has no other root README. Behavior below was read from source after commit `cf4b667` (biometric HRV display and quantum shield overlay).

## Run locally

The lockfile is `bun.lock`. There is no `package-lock.json`.

```bash
bun install
bun run dev
```

`bun run dev` and `bun run start` both run `tsx server.ts`. That process:

- Listens on `0.0.0.0` and `PORT`, default `3000`.
- In any `NODE_ENV` other than `production`, mounts Vite in middleware mode and serves the React app from the same port.
- In `production`, serves `dist/` and falls back to `dist/index.html`. Build that bundle first with `bun run build`.

`bun run lint` is `tsc --noEmit`. There is no test script.

Copy `.env.example` to a gitignored env file and replace every value yourself. The example file currently contains credential-shaped strings. Do not commit them, and do not paste them into docs or tickets. Rotate any key that has already been pushed.

| Variable | What reads it |
| --- | --- |
| `PORT` | `server.ts` (default `3000`) and `backend/server.js` (default `5000`) |
| `NODE_ENV` | `server.ts` chooses Vite middleware vs `dist/` |
| `GEMINI_API_KEY` | `POST /api/gemini/grid-assessment` in `server.ts` |
| `VITE_GOOGLE_MAPS_API_KEY` | Client `import.meta.env` and `GET /api/maps/config` |
| `JWT_SECRET` | JWT checks in both servers. Each file also has its own hardcoded fallback. |
| `APP_URL` | Listed in `.env.example`. No server route reads it. |
| `DISABLE_HMR` | `vite.config.ts`. `true` turns off HMR and file watching. |

`dotenv` is a dependency and is not imported. Express reads `process.env` only. Vite loads `.env` and `.env.local` for `import.meta.env` on its own. A key that exists only in a dotenv file is visible to the map components and invisible to `server.ts` until you export it into the process.

## Two different APIs

`server.ts` is the process `bun run dev` starts. `backend/server.js` is a smaller Express app aimed at port `5000`. They do not share memory. `migrations/deploy.sql` is not executed by either process. `/api/health` always returns `database: "CONNECTED"` as a constant string.

| | `server.ts` (dev / single process) | `backend/server.js` |
| --- | --- | --- |
| Bind | `0.0.0.0:$PORT` (default 3000) | `listen(PORT)` with no host (default 5000) |
| Nodes | Five in-memory Gatesville records | Two in-memory records |
| `GET /api/grid/status` | Public JSON array | Public JSON array |
| `GET /api/health` | Public, includes `nodes` count | Public, no `nodes` field |
| `GET /api/maps/config` | Public `{ apiKey }` | Absent |
| `POST /api/gemini/grid-assessment` | Public. Calls Gemini model string `gemini-3.8-flash` when `GEMINI_API_KEY` is set. Any Gemini error, and a missing key, still returns HTTP 200 with a fixed fallback sentence. | Absent |
| `POST /api/grid/clear-node` | Body `{ id }`. Sets `is_shielded`, stamps `shield_last_cleared_at`, sets `shield_expires_at` 48 hours ahead. Returns `{ status: "CORE_LOCKED", node }`. Unknown id is 404. | Same mutation and response, stricter auth |

Auth on `server.ts` accepts a bearer token that contains the substring `demo_signature`, the exact token `DEVELOPMENT_PREVIEW_TOKEN`, or any JWT that fails verification. Failed verification still continues as `{ user_id: "local_operator", role: "GRID_COMMANDER" }`. A missing `Authorization` header is 401.

Auth on `backend/server.js` requires a JWT signed with `JWT_SECRET` (or that file's fallback). A bad signature is 403. The map's clear-node request is built for the permissive server.

`src/components/FuturisticMap.tsx` keeps its own node list. `GET /api/grid/status` only overwrites `is_shielded` when `node_id` matches. If clear-node fails or throws, the map still sets `is_shielded: true` in React state.

Open pull request [#2](https://github.com/Aeiloria/Grid-Guardian-Network-UI/pull/2) (`orion/security-cleanup`) proposes removing the permissive JWT path, requiring `JWT_SECRET`, and gating Gemini and the map key. It is not merged, and its base is the parent of the biometric commit. Until that branch lands on current `main`, the table above is the running behavior.

## UI map

`src/App.tsx` stacks the console. Gatesville center is `31.4351, -97.7439`.

| Surface | Module | Role |
| --- | --- | --- |
| Status and Gemini assessment | `MasterGridDashboard.tsx` | `POST /api/gemini/grid-assessment` |
| Node radar | `FuturisticMap.tsx` | Local nodes, supercluster, clear-node |
| Google map | `GoogleMapsMatrix.tsx` | Client `VITE_GOOGLE_MAPS_API_KEY`, then `/api/maps/config` |
| Acoustic shield | `audioEngine.ts`, `AudioConfigMenu.tsx` | Web Audio oscillator, default 432 Hz sine |
| Biometrics and quantum shield | `useBleBiometrics.ts`, `BiometricActionDeck.tsx`, `QuantumShieldOverlay.tsx` | See [docs/biometric-hrv-and-quantum-shield.md](docs/biometric-hrv-and-quantum-shield.md) |
| Wellness logs | `useIndexedDB.ts` | IndexedDB `GridGuardianDB`, localStorage fallback |
| Health probes | `QuantumLatencyMonitor.tsx`, `SyncMonitorDeck.tsx`, `SafeTelemetryWidget.tsx` | `GET /api/health` |

`src/main.tsx` swallows Google Maps auth, quota, and script errors and dispatches `gmp-auth-failure` so a bad map key does not crash the page.

`firebase` and `three` are in `package.json` after the biometric commit. No `src` module imports them. `firebase-applet-config.json` is also unused by application code. Leave its contents out of docs and client bundles.

## Deploy sketches

These files describe an intended layout. They are not a working compose stack in this repo.

- `nginx.conf` listens on 80 and 443 for `gridguardian.network`, redirects HTTP to HTTPS, proxies `/api/` to `backend_api:5000`, and proxies `/` to `frontend_client:3000`. Certificate paths are `/etc/nginx/certs/live_chain.crt` and `private_key.key`. No compose file defines those upstreams or certs.
- `.github/workflows/pipeline.yml` runs `npm ci` and `npm run build` on Ubuntu with an npm cache. The repo only has `bun.lock`, so `npm ci` has no lockfile to install from. The deploy job builds with context `./backend` and `backend/Dockerfile`. That directory contains `Dockerfile` and `server.js` only. The Dockerfile copies `package*.json`, runs `npm ci --omit=dev`, and starts `node backend/server.js`, which does not match a `./backend` build context.
- Pull request [#1](https://github.com/Aeiloria/Grid-Guardian-Network-UI/pull/1) adds a Rollouts deploy report and is not merged.

## Pitfalls

- Clear-node against `backend/server.js` rejects the demo bearer token. The map still paints the node as shielded.
- `/api/health` does not check Postgres. `migrations/deploy.sql` is a schema sketch (`users`, `grid_nodes`, `landmark_sync_logs`).
- Gemini failures look successful: HTTP 200 plus the canned assessment.
- A connected BLE heart-rate monitor is still overwritten by the 4-second local walk. Details are in the biometric doc.
- `useIndexedDB` renders seed logs and pins immediately, then replaces them only when IndexedDB or localStorage already has rows.
- Latency lines are appended to `latency_profile_matrix.log` in the process working directory. That file is gitignored (`*.log`) and disappears on an ephemeral host.
- `FuturisticMap` opens the Google engine only when the client key starts with `AIzaSy`. Any other value, including the current `.env.example` contents, leaves the console on the radar. `GoogleMapsMatrix` uses the same prefix check before it treats a key as usable.
