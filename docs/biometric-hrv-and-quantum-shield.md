# Biometric display and quantum shield

Landed on `main` in `cf4b667` (`feat: implement biometric HRV and quantum shielding`). This page covers the browser path only. Grid-node shielding is a different feature and is summarized at the end.

## Intent

Give the operator a heart-rate and HRV readout, and a full-screen particle field whose timing follows those numbers. The numbers drive animation. Server node flags stay on the clear-node route described at the end of this page.

## Data path

```
useBleBiometrics
  heartRate, hrv, isBleConnected
        │
        ▼
App.tsx
  heartRate || 75
  hrv || (isBleConnected ? 62 : 45)
        │
        ├── BiometricActionDeck  (BPM, HRV label, shield toggle, two routines)
        └── QuantumShieldOverlay (canvas field, only while the toggle is on)
```

`hrv` in the hook is a `number` that starts at `45`, so the `62` fallback in `App.tsx` runs only if that value is ever `0`.

### BLE

`connectGattDevice` calls `navigator.bluetooth.requestDevice` with filter `{ services: ['heart_rate'] }` and optional `battery_service`.

On a successful GATT connection:

- `deviceName` is the device name or `GATT-Telemetry-Sensor`.
- `isSimulated` is false.
- The heart-rate measurement characteristic is subscribed when the service is present. Flag bit 0 selects a 16-bit little-endian BPM at byte 1; otherwise BPM is the uint8 at byte 1.
- A `gattserverdisconnected` event calls `disconnectGattDevice`.

HRV is not read from the characteristic. Battery level is not read from `battery_service`. The hook stores `batteryLevel` and nothing in `src` renders it.

If Web Bluetooth is missing, or `requestDevice` throws (including a cancelled chooser), the hook switches to the emulator:

- `deviceName`: `BioPulse-X100 (Quantum Mesh)`
- `isSimulated`: true
- starting heart rate `78`, HRV `62`, battery `98`

### The 4-second walk

Whenever `isBleConnected` is true, including a real GATT session, an interval every 4 seconds:

- walks heart rate by a random delta in `[-2, 2)` and clamps it to `58..130`
- walks HRV by a random integer delta in `[-2, 2]` and clamps it to `35..85`

A live BPM notification can land, then the next interval replaces it. Disconnect clears the interval, drops the device, sets `isSimulated` false, and resets HRV to `45`. It leaves the last heart-rate value in state.

The deck badge says `GATT CRYSTAL LINKED` whenever `isBleConnected` is true. That includes the emulator. `isSimulated` is not shown in the deck.

## Quantum shield (client)

`isQuantumShieldActive` is React state in `App.tsx`, default false. The deck button toggles it. The overlay's close control sets it false. Nothing in this path calls the network.

While active, the app root gets class `quantum-shield-active`. `src/index.css` then draws a fixed cyan inset glow (`::before`, `quantumFieldPulse`) and a blurred rotating conic wash (`::after`, `rotateQuantumEnergy`, 24s).

`QuantumShieldOverlay` mounts a full-window `<canvas>` and a HUD. Particle counts are `75` (`BALANCED`) and `120` (`HIGH`). Wave modes are `STANDING_LATTICE` (default), `TRANSVERSE_FLUX` (hexagon), and `RADIAL_PRISM` (concentric circle). The canvas loop is a `requestAnimationFrame` that stops when `isActive` is false. `three` is a dependency and is not imported here. The overlay uses the 2D canvas and `framer-motion`.

Timing, from the overlay's own comments and formulas. BPM is clamped to `45..180` and HRV to `15..130` before the math. `beatPeriod` is `60 / bpm` seconds.

| Quantity | Formula |
| --- | --- |
| Cardiac phase | `(elapsed % beatPeriod) / beatPeriod` |
| Systolic surge | Sine over the first 28% of the beat, then a smaller sine over the rest |
| `freqModulation` | `0.65 + (hrv / 55) * 0.55` |
| `intensityFactor` | `0.55 + (hrv / 55) * 0.65` |
| `coherencePercentage` | `min(99.9, 65 + (hrv / 100) * 34.8)` |
| `omega` | `2π * (1 / beatPeriod) * freqModulation` |

The deck button repeats a scale and shadow animation for one `beatPeriod`. The HUD prints BPM, the raw `hrvMs` prop, `coherencePercentage`, `omega`, and `intensityFactor`. The label `HRV COHERENCE` next to `intensityFactor * 100` is a display string. The percentage used for the coherence readout is `coherencePercentage`.

Turning the shield on plays `playShieldLockTone` and `playCrystalChime`. Those helpers live in `src/utils/crystalSoundEngine.ts` and are local oscillators.

## Deck routines

These are separate from the quantum shield toggle.

| Control | Sound | `onTriggerRoutine` | Effect in `App.tsx` |
| --- | --- | --- | --- |
| PRISM 01, Anuhazi quartz lock | shield-lock tone | `ANUHAZI_CHANT` | Toggles `startAudioProtectionFreq` / `stopAudioProtectionFreq` at the current frequency and wave. Default frequency is `432`, default wave is `sine`. |
| PRISM 02, Vagal crystal alignment | vagal-alignment tone | `YOGA_STRETCH` | `saveWellnessLog` with `heartRateBefore` equal to the current heart rate or `75`, and `heartRateAfter` hardcoded to `70`. |

Clicking the BPM or HRV tiles plays `playBioPulseTone` and does not change the numbers.

## Grid-node shield (server)

`POST /api/grid/clear-node` with `{ id }` sets `is_shielded` on an in-memory record and sets a 48-hour `shield_expires_at`. The map calls it when an operator shields a node or a cluster. That flag is independent of `isQuantumShieldActive`.

`server.ts` accepts the map's demo bearer token. `backend/server.js` does not. On a non-OK response or a thrown fetch, `FuturisticMap` still sets `is_shielded: true` in component state. See the root [README](../README.md) for the two servers and for open pull request #2, which proposes stricter auth and is not on `main`.

## Constraints

- Requires a user gesture for the Web Bluetooth chooser. Browsers without `navigator.bluetooth` always take the emulator path.
- The overlay allocates particles for the current viewport and rebuilds them when BPM, HRV, wave mode, density, or theme change, because those values are effect dependencies.
- High density is 120 particles plus five interference rings. It is a main-thread canvas loop.
- Seed wellness logs in `useIndexedDB` appear before IndexedDB returns. A yoga-stretch save prepends a log in React state and writes IndexedDB, with localStorage key `grid_wellness_logs` if IndexedDB throws.
- Notes are encrypted with the helper in `cryptoEngine.ts` under a default token constant in `useIndexedDB.ts`. Treat that constant as a placeholder, not a secret store.
