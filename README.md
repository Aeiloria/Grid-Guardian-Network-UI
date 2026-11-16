# Grid Guardian Network UI

Operator console for a Gatesville grid view, a local biometric deck, and a client-side quantum-shield canvas. The app is a Vite React SPA served by `server.ts`.

There is no README on `main` today. This page covers the biometric and shield path added in `cf4b667a` (`BiometricActionDeck`, `QuantumShieldOverlay`, `useBleBiometrics`) and the HTTP routes those screens sit next to.

## Run

```bash
bun install
bun run dev
```

`dev` and `start` run `tsx server.ts`. `build` is `vite build`. `lint` is `tsc --noEmit`. The lockfile in the repo is `bun.lock`.

The process reads `PORT` (default `3000`) and listens on `0.0.0.0`. When `NODE_ENV` is not `production`, Express mounts the Vite dev middleware. In production it serves `dist/`.

Environment names the server reads, with no values:

- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

Set them in the host environment. Do not paste values into git. `.env.example` on `main` is not a safe template to copy from.

## What the screen does

`App.tsx` stacks the dashboard, map, wave analyzer, audio menu, biometric deck, sync and perf decks, latency monitor, telemetry widget, and data log. The map is centered on Gatesville (`31.4351`, `-97.7439`).

`package.json` lists `firebase` and `three`. The shield overlay draws with a canvas 2D context. No application source file imports `firebase`. The committed `firebase-applet-config.json` is not a setup sample; leave it out of docs and out of new commits.

## Biometric deck

`useBleBiometrics` owns heart rate and HRV.

- Disconnected defaults in the hook are heart rate `76` and HRV `45`. `App` passes `heartRate || 75` and `hrv || (isBleConnected ? 62 : 45)` into the deck and the overlay.
- Sync asks Web Bluetooth for the `heart_rate` service and optionally `battery_service`. A heart-rate notification writes BPM from the measurement flags (8-bit or 16-bit). The hook does not read an HRV characteristic.
- While `isBleConnected` is true, a 4-second interval random-walks both BPM (clamped 58–130) and HRV (clamped 35–85). That walk also runs after a real GATT connection, so a live BPM notification is overwritten on the next tick.
- If Web Bluetooth is missing or the picker fails, the hook still sets `isBleConnected` and `isSimulated`, names the device `BioPulse-X100 (Quantum Mesh)`, and seeds BPM `78` / HRV `62`. `App` never reads `isSimulated`. The deck badge follows `isBleConnected`, so the emulator shows the linked state.

`BiometricActionDeck` clamps BPM to 45–180 only to compute the animation period `60 / bpm`.

- Quantum Shield Mode calls `onToggleQuantumShield`. `App` flips `isQuantumShieldActive`. The button period uses that same BPM clamp.
- Prism 01 (`ANUHAZI_CHANT`) toggles `startAudioProtectionFreq` / `stopAudioProtectionFreq` at the frequency and wave from `AudioConfigMenu` (initial state `432` Hz sine). The button label stays "432Hz" even after that setting changes.
- Prism 02 (`YOGA_STRETCH`) calls `saveWellnessLog` with `heartRateBefore` set to the current reading or `75`, and `heartRateAfter` fixed at `70`.

## Quantum shield overlay

`QuantumShieldOverlay` is a full-screen canvas shown only while `isActive` is true. It is a local visualization. It does not call the grid APIs and it does not change `gridNodesStore`.

Props are `isActive`, `heartRateBpm`, `hrvMs`, and `onDeactivate`.

- BPM is clamped to 45–180 for the beat period. HRV is clamped to 15–130 before the HUD scales it. The coherence percentage on the HUD is `min(99.9, 65 + (rawHrv / 100) * 34.8)`, not a sensor RMSSD.
- Wave modes are `STANDING_LATTICE` (default), `TRANSVERSE_FLUX` (hexagon), and `RADIAL_PRISM` (concentric circle).
- Particle count is 75 in `BALANCED` and 120 in `HIGH`.
- Disengage calls `onDeactivate`, which clears the flag in `App`.

## HTTP routes

Implemented in `server.ts`. Node records live in the in-memory `gridNodesStore` array. `GET /api/health` still returns `database: "CONNECTED"`.

| Method | Path | Auth on current `main` | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | none | `{ status, database, nodes }` |
| GET | `/api/grid/status` | none | the in-memory node list |
| GET | `/api/maps/config` | none | JSON `apiKey` from `VITE_GOOGLE_MAPS_API_KEY`, or an empty string |
| POST | `/api/grid/clear-node` | bearer gate below | body `{ id }` matching `node_id`. Sets `is_shielded` and a 48-hour expiry. Unknown id is 404. |
| POST | `/api/gemini/grid-assessment` | none | Uses `GEMINI_API_KEY` and model `gemini-3.8-flash` when the key is set. On a missing key or a thrown client error, responds 200 with a fixed Gatesville fallback sentence. |

`authenticateToken` returns 401 only when the bearer token is absent. On current `main`, a bearer that fails `jwt.verify` is still accepted as role `GRID_COMMANDER`. If `JWT_SECRET` is unset, the server substitutes a hardcoded string. Do not copy that string into docs or tickets. Open pull request #2 ("Security cleanup: auth-gate Gemini and map keys") changes this gate and is not merged; this README describes `main`.

Every request appends a latency line to `latency_profile_matrix.log` in the working directory.

## CI pitfall

`.github/workflows/pipeline.yml` runs on push and pull request to `main`. The audit job uses `actions/setup-node` with `cache: npm` and then `npm ci`. This repo has `bun.lock` and no `package-lock.json`, so that job fails before build and Lighthouse. `package_and_deploy_containers` needs the audit job, so a `main` push does not publish `ghcr.io/<repo>/grid-backend:latest` while the audit is red. Local `bun run lint` and `bun run build` are the checks that match the lockfile.

## Constraints

- HRV on screen is a local number. Pairing a heart-rate strap does not supply it.
- The shield canvas is not the node shield flag. Clearing a node is `POST /api/grid/clear-node`.
- The maps config route returns the server env value to any caller. Do not log that response.
- There is no test suite in `package.json`.
