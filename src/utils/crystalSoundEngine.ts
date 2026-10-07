/**
 * Low-Latency Procedural Cyber-Crystal Sound Effects Engine
 * Generates subtle, crystalline acoustic feedback using Web Audio API synthesis.
 */

let sfxAudioCtx: AudioContext | null = null;
let sfxEnabled: boolean = true;

function getSfxContext(): AudioContext | null {
  try {
    if (!sfxAudioCtx || sfxAudioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      sfxAudioCtx = new AudioCtxClass();
    }
    if (sfxAudioCtx.state === 'suspended') {
      sfxAudioCtx.resume();
    }
    return sfxAudioCtx;
  } catch (err) {
    console.warn('Web Audio SFX unavailable:', err);
    return null;
  }
}

export function isSfxMuted(): boolean {
  return !sfxEnabled;
}

export function toggleSfx(): boolean {
  sfxEnabled = !sfxEnabled;
  return sfxEnabled;
}

export function setSfxMuted(muted: boolean): void {
  sfxEnabled = !muted;
}

/**
 * Crisp, subtle crystal click (soft quartz micro-transient)
 */
export function playQuartzClick(): void {
  if (!sfxEnabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  } catch {
    // Ignore audio gesture restrictions
  }
}

/**
 * Shimmering crystal chime (delicate high-register bell refraction)
 */
export function playCrystalChime(baseFreq = 1046.5): void {
  if (!sfxEnabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Fundamental C6 and harmonic E6/G6 refraction
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.0, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, now);
    filter.Q.setValueAtTime(3.0, now);

    gainNode.gain.setValueAtTime(0.045, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  } catch {
    // Graceful silence on blocked autoplay
  }
}

/**
 * Prismatic Shield Lock Chord (rising ethereal crystal arpeggio)
 */
export function playShieldLockTone(): void {
  if (!sfxEnabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Harmonic frequencies in quartz solfeggio interval (528Hz, 639Hz, 1056Hz)
    const freqs = [528.0, 639.0, 1056.0];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const startTime = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, startTime);

      gain.gain.setValueAtTime(0.035, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  } catch {
    // Ignore audio state errors
  }
}

/**
 * Bio-Resonance Pulse Tone (gentle crystalline cardiac resonance)
 */
export function playBioPulseTone(): void {
  if (!sfxEnabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432.0, now);
    osc.frequency.exponentialRampToValueAtTime(216.0, now + 0.15);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(108.0, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.19);
    subOsc.stop(now + 0.19);
  } catch {
    // Fallback safe
  }
}

/**
 * Vagal Crystal Alignment Tone (soothing, calming harmonic chord)
 */
export function playVagalAlignmentTone(): void {
  if (!sfxEnabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [432.0, 528.0, 864.0];

    notes.forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, startTime);

      gain.gain.setValueAtTime(0.03, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.62);
    });
  } catch {
    // Fallback safe
  }
}
