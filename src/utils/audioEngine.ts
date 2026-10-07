/**
 * Audio Protection & Scalar Frequency Synthesis Engine
 * Provides harmonic vector wave modulation, Web Audio Analyser, and frequency locks.
 */

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let harmonicOscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;
let biquadFilter: BiquadFilterNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startAudioProtectionFreq(frequency: number = 432.0, waveType: OscillatorType = 'sine'): void {
  try {
    const ctx = getAudioContext();

    // Clean up existing audio instances
    stopAudioProtectionFreq();

    // Setup Analyser Node (high smoothing for calm, non-jittery bars)
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.94;

    // Master Gain to prevent harsh clipping
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.15);

    // Harmonic Biquad Filter to remove high-frequency digital artifacts
    biquadFilter = ctx.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.setValueAtTime(Math.min(frequency * 4, 18000), ctx.currentTime);

    // Primary Scalar Resonance Oscillator
    oscillator = ctx.createOscillator();
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Secondary Sub-Harmonic Carrier (Golden Ratio Phi harmonic detune: frequency * 1.618 or slight offset)
    harmonicOscillator = ctx.createOscillator();
    harmonicOscillator.type = 'sine';
    harmonicOscillator.frequency.setValueAtTime(frequency * 0.5, ctx.currentTime);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.08, ctx.currentTime);

    // Node routing graph
    oscillator.connect(biquadFilter);
    harmonicOscillator.connect(harmonicGain);
    harmonicGain.connect(biquadFilter);

    biquadFilter.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    // Launch oscillation
    oscillator.start();
    harmonicOscillator.start();
  } catch (error) {
    console.error('Audio engine start failed:', error);
  }
}

export function stopAudioProtectionFreq(): void {
  try {
    if (gainNode && audioCtx && audioCtx.state === 'running') {
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      setTimeout(() => {
        try {
          if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
          }
          if (harmonicOscillator) {
            harmonicOscillator.stop();
            harmonicOscillator.disconnect();
            harmonicOscillator = null;
          }
        } catch {
          // Ignore state race exceptions on shutdown
        }
      }, 120);
    } else {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      if (harmonicOscillator) {
        harmonicOscillator.stop();
        harmonicOscillator.disconnect();
        harmonicOscillator = null;
      }
    }
  } catch (error) {
    console.warn('Audio engine stop exception:', error);
  }
}

export function getAnalyserNode(): AnalyserNode | null {
  return analyserNode;
}
