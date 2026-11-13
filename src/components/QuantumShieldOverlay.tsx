import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Orbit, Activity, Zap, Waves, X, Radio, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playCrystalChime, playBioPulseTone } from '../utils/crystalSoundEngine';

interface QuantumShieldOverlayProps {
  isActive: boolean;
  heartRateBpm: number;
  hrvMs: number;
  onDeactivate: () => void;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  radius: number;
  baseRadius: number;
  angle: number;
  radialDist: number;
  radialSpeed: number;
  orbitSpeed: number;
  phase: number;
  color: string;
  energy: number;
}

export function QuantumShieldOverlay({
  isActive,
  heartRateBpm,
  hrvMs,
  onDeactivate
}: QuantumShieldOverlayProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [waveMode, setWaveMode] = useState<'STANDING_LATTICE' | 'TRANSVERSE_FLUX' | 'RADIAL_PRISM'>('STANDING_LATTICE');
  const [particleDensity, setParticleDensity] = useState<'HIGH' | 'BALANCED'>('BALANCED');
  const [showTelemetryHUD, setShowTelemetryHUD] = useState<boolean>(true);

  // Cardiac cycle period in seconds (T = 60 / BPM)
  const beatPeriod = useMemo(() => {
    const bpm = Math.max(45, Math.min(180, heartRateBpm || 75));
    return 60 / bpm;
  }, [heartRateBpm]);

  // HRV dynamic modulation factors (Standard resting HRV ~20ms - 110ms, centered at 55ms)
  // Higher HRV corresponds to greater parasympathetic vagal tone and higher coherent resonance
  const hrvMetrics = useMemo(() => {
    const rawHrv = Math.max(15, Math.min(130, hrvMs || 50));
    // Normalized HRV scale [0.5 .. 1.8] centered at 55ms
    const normalizedCoherence = Math.min(2.0, Math.max(0.4, rawHrv / 55));
    // High HRV -> High coherence, lower chaotic frequency fluctuation, crystalline standing wave resonance
    // Lower HRV -> Higher sympathetic flux rate, increased jitter/vibrational frequency, sharp energetic surge
    // Dynamic wave frequency modulation factor [0.7 .. 1.6]
    const freqModulation = 0.65 + (rawHrv / 55) * 0.55; 
    // Intensity factor: scales wave amplitude, bloom radiance, beam luminescence, and bond radius
    const intensityFactor = 0.55 + (rawHrv / 55) * 0.65; // [0.7 .. 2.0]
    // Vagal standing wave coherence percentage [65% .. 99.8%]
    const coherencePercentage = Math.min(99.9, 65 + (rawHrv / 100) * 34.8);

    return {
      rawHrv,
      normalizedCoherence,
      freqModulation,
      intensityFactor,
      coherencePercentage
    };
  }, [hrvMs]);

  // Frequency omega in rad/s modulated by both cardiac cadence and HRV frequency scaling
  const omega = useMemo(() => {
    return (2 * Math.PI * (1 / beatPeriod)) * hrvMetrics.freqModulation;
  }, [beatPeriod, hrvMetrics.freqModulation]);

  // Particle-wave simulation loop
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    const count = particleDensity === 'HIGH' ? 120 : 75;
    const particles: Particle[] = [];

    const palette = isLight
      ? [
          'rgba(6, 182, 212, 0.85)', // cyan-500
          'rgba(147, 51, 234, 0.85)', // purple-600
          'rgba(236, 72, 153, 0.85)', // pink-500
          'rgba(16, 185, 129, 0.85)', // emerald-500
          'rgba(59, 130, 246, 0.85)'  // blue-500
        ]
      : [
          'rgba(34, 211, 238, 0.9)', // cyan-400
          'rgba(192, 132, 252, 0.9)', // purple-400
          'rgba(244, 114, 182, 0.9)', // pink-400
          'rgba(52, 211, 153, 0.9)',  // emerald-400
          'rgba(96, 165, 250, 0.9)'   // blue-400
        ];

    const maxDist = Math.hypot(width, height) / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radialDist = Math.random() * (maxDist * 0.85) + 30;
      particles.push({
        x: centerX() + Math.cos(angle) * radialDist,
        y: centerY() + Math.sin(angle) * radialDist,
        originX: centerX(),
        originY: centerY(),
        radius: Math.random() * 2.4 + 1.2,
        baseRadius: Math.random() * 2.4 + 1.2,
        angle,
        radialDist,
        radialSpeed: (Math.random() - 0.5) * 0.35 * hrvMetrics.freqModulation,
        orbitSpeed: (Math.random() * 0.003 + 0.001) * (i % 2 === 0 ? 1 : -1) * hrvMetrics.freqModulation,
        phase: Math.random() * Math.PI * 2,
        color: palette[i % palette.length],
        energy: Math.random() * 0.5 + 0.5
      });
    }

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Cardiac cycle phase fraction [0..1)
      const cardiacPhase = (elapsed % beatPeriod) / beatPeriod;
      // Systolic pulse surge (strong pulse during first 28% of heartbeat cycle)
      const systolicSurge = cardiacPhase < 0.28 
        ? Math.sin((cardiacPhase / 0.28) * Math.PI) 
        : Math.max(0, Math.sin(((cardiacPhase - 0.28) / 0.72) * Math.PI * 0.5) * 0.2);

      // HRV dynamic scaling factors
      const { intensityFactor, freqModulation } = hrvMetrics;

      ctx.clearRect(0, 0, width, height);

      const cx = centerX();
      const cy = centerY();

      // 1. Draw Wave Interference Rings (Standing Waves)
      const waveCount = 5;
      for (let w = 1; w <= waveCount; w++) {
        const baseRadius = (w / waveCount) * Math.min(width, height) * 0.46;
        // Modulate with heartbeat pulse surge, HRV intensity, and HRV frequency
        const pulseOffset = systolicSurge * 22 * (w / waveCount) * intensityFactor;
        const currentRadius = baseRadius + pulseOffset + Math.sin(elapsed * omega + w) * (6 * intensityFactor);

        ctx.beginPath();
        if (waveMode === 'STANDING_LATTICE') {
          // Standing wave with sinusoidal radial perturbation - frequency and amplitude scaled by HRV
          const points = 72;
          for (let p = 0; p <= points; p++) {
            const th = (p / points) * Math.PI * 2;
            const waveMod = Math.sin(th * 6 * freqModulation + elapsed * 1.5 * freqModulation) * (8 * intensityFactor + systolicSurge * 10 * intensityFactor);
            const r = currentRadius + waveMod;
            const px = cx + Math.cos(th) * r;
            const py = cy + Math.sin(th) * r;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (waveMode === 'TRANSVERSE_FLUX') {
          // Hexagonal crystal standing wave
          const sides = 6;
          for (let s = 0; s <= sides; s++) {
            const th = (s / sides) * Math.PI * 2 + (elapsed * 0.1 * freqModulation);
            const r = currentRadius * (1 + systolicSurge * 0.08 * intensityFactor);
            const px = cx + Math.cos(th) * r;
            const py = cy + Math.sin(th) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else {
          // Pure concentric harmonic circle
          ctx.arc(cx, cy, Math.max(1, currentRadius), 0, Math.PI * 2);
        }

        const alpha = Math.min(1.0, Math.max(0.08, (1 - (w / waveCount) * 0.7) * (0.35 + systolicSurge * 0.45) * intensityFactor));
        ctx.strokeStyle = isLight 
          ? `rgba(6, 182, 212, ${alpha})`
          : `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, (1 + systolicSurge * 1.5) * Math.min(1.8, intensityFactor));
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -elapsed * 25 * w * freqModulation;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw Transverse Wave Crest Beams (Interference Lattice)
      if (waveMode === 'STANDING_LATTICE') {
        const beamCount = 8;
        for (let b = 0; b < beamCount; b++) {
          const angle = (b / beamCount) * Math.PI * 2 + elapsed * 0.05 * freqModulation;
          const beamLen = Math.min(width, height) * 0.48;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const endX = cx + Math.cos(angle) * (beamLen + systolicSurge * 30 * intensityFactor);
          const endY = cy + Math.sin(angle) * (beamLen + systolicSurge * 30 * intensityFactor);
          ctx.lineTo(endX, endY);
          const beamAlpha = Math.min(1.0, (isLight ? 0.12 : 0.15 + systolicSurge * 0.22) * intensityFactor);
          ctx.strokeStyle = isLight 
            ? `rgba(168, 85, 247, ${beamAlpha})`
            : `rgba(192, 132, 252, ${beamAlpha})`;
          ctx.lineWidth = 1 * Math.min(1.6, intensityFactor);
          ctx.setLineDash([4, 16]);
          ctx.lineDashOffset = elapsed * 15 * freqModulation;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Update & Draw Quantum Particles with Wave-Particle Duality
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.orbitSpeed;
        p.radialDist += p.radialSpeed;

        if (p.radialDist > maxDist * 0.88) {
          p.radialDist = 40;
        } else if (p.radialDist < 30) {
          p.radialDist = maxDist * 0.8;
        }

        // Particle position modulated by standing wave function:
        // Psi(r, t) = A * cos(k * r - omega * t)
        const k = 0.02 * freqModulation;
        const waveDisplacement = Math.sin(k * p.radialDist - elapsed * omega + p.phase) * (6 * intensityFactor + systolicSurge * 16 * intensityFactor);
        const actualDist = p.radialDist + waveDisplacement + systolicSurge * 28 * intensityFactor;

        p.x = cx + Math.cos(p.angle) * actualDist;
        p.y = cy + Math.sin(p.angle) * actualDist;

        // Render Particle Node with HRV-responsive bloom & size
        ctx.beginPath();
        const dynamicRadius = p.baseRadius * (1 + systolicSurge * 0.6) * Math.min(1.5, Math.max(0.7, intensityFactor));
        ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = (8 + systolicSurge * 14) * intensityFactor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inter-particle Freedom Bond Lattice Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          const connectThreshold = (75 + systolicSurge * 35) * Math.min(1.6, intensityFactor);
          if (dist < connectThreshold) {
            const bondAlpha = Math.min(1.0, (1 - dist / connectThreshold) * (0.2 + systolicSurge * 0.35) * intensityFactor);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLight
              ? `rgba(6, 182, 212, ${bondAlpha})`
              : `rgba(34, 211, 238, ${bondAlpha})`;
            ctx.lineWidth = (0.8 + systolicSurge * 0.6) * Math.min(1.5, intensityFactor);
            ctx.stroke();
          }
        }
      }

      // 4. Central Core Emitter Harmonic Radiance
      const coreRadius = (28 + systolicSurge * 14) * Math.min(1.6, intensityFactor);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.5);
      if (isLight) {
        gradient.addColorStop(0, `rgba(6, 182, 212, ${Math.min(1.0, (0.45 + systolicSurge * 0.4) * intensityFactor)})`);
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${Math.min(1.0, (0.25 + systolicSurge * 0.25) * intensityFactor)})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        gradient.addColorStop(0, `rgba(34, 211, 238, ${Math.min(1.0, (0.5 + systolicSurge * 0.45) * intensityFactor)})`);
        gradient.addColorStop(0.5, `rgba(192, 132, 252, ${Math.min(1.0, (0.3 + systolicSurge * 0.3) * intensityFactor)})`);
        gradient.addColorStop(1, 'rgba(8, 11, 31, 0)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, heartRateBpm, beatPeriod, omega, waveMode, particleDensity, isLight, hrvMetrics]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="quantum-shield-master-overlay"
          layout
          layoutId="quantum-shield-envelope"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 24,
            mass: 0.8
          }}
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
        >
          {/* Heartbeat-Synchronized Organic Pulse Ambient Halo modulated by HRV */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              scale: [1, 1 + 0.045 * hrvMetrics.intensityFactor, 0.995, 1],
              opacity: [
                0.65 * hrvMetrics.intensityFactor,
                Math.min(1.0, 0.98 * hrvMetrics.intensityFactor),
                0.78 * hrvMetrics.intensityFactor,
                0.65 * hrvMetrics.intensityFactor
              ]
            }}
            transition={{
              duration: beatPeriod / hrvMetrics.freqModulation,
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.28, 0.7, 1]
            }}
          >
            {/* Iridescent Vignette Border */}
            <div
              className={`absolute inset-0 border-[3px] transition-colors pointer-events-none ${
                isLight
                  ? 'border-cyan-400/60 shadow-[inset_0_0_80px_rgba(6,182,212,0.25),0_0_40px_rgba(168,85,247,0.3)]'
                  : 'border-cyan-400/70 shadow-[inset_0_0_120px_rgba(6,182,212,0.35),inset_0_0_200px_rgba(168,85,247,0.25),0_0_50px_rgba(6,182,212,0.5)]'
              }`}
            />
          </motion.div>

          {/* Interactive Particle-Wave Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Center Emitter Core Layout Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              layoutId="quantum-shield-orb"
              className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
              onClick={() => {
                playBioPulseTone();
                playCrystalChime(1320);
              }}
              title="Quantum Core Emitter: Click to emit bio-acoustic resonance pulse"
              animate={{
                scale: [1, 1 + 0.12 * hrvMetrics.intensityFactor, 0.98, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                scale: {
                  duration: beatPeriod / hrvMetrics.freqModulation,
                  repeat: Infinity,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.28, 0.7, 1]
                },
                rotate: {
                  duration: Math.max(8, 24 / hrvMetrics.freqModulation),
                  repeat: Infinity,
                  ease: 'linear'
                }
              }}
            >
              <div
                className={`w-20 h-20 rounded-full border flex items-center justify-center backdrop-blur-md transition-all ${
                  isLight
                    ? 'bg-white/80 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] text-cyan-700'
                    : 'bg-[#060a24]/80 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.6)] text-cyan-300'
                }`}
              >
                <Orbit className="w-9 h-9 animate-spin" />
              </div>

              {/* Concentric cardiac wave ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-400/60 pointer-events-none"
                animate={{
                  scale: [1, 1.8 + 0.8 * hrvMetrics.intensityFactor],
                  opacity: [0.85 * hrvMetrics.intensityFactor, 0]
                }}
                transition={{
                  duration: beatPeriod / hrvMetrics.freqModulation,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            </motion.div>
          </div>

          {/* Top Floating Laboratory Telemetry HUD (Pointer Events Enabled) */}
          <div className="absolute top-14 left-4 right-4 pointer-events-none flex items-start justify-between z-50">
            {/* Left HUD: Cardiac-Wave Coupling Telemetry */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`p-3 rounded-lg border backdrop-blur-md pointer-events-auto max-w-sm transition-all ${
                isLight
                  ? 'bg-white/90 border-cyan-300 text-slate-800 shadow-md'
                  : 'bg-[#070b24]/90 border-cyan-500/50 text-[#c0d4ec] shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-cyan-500/30 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    QUANTUM SHIELD // WAVE-PARTICLE TELEMETRY
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  HRV COHERENCE {(hrvMetrics.intensityFactor * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="opacity-70 text-[9px] block">CARDIAC CADENCE (BPM)</span>
                  <span className="font-bold text-pink-500 text-xs flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-bounce" />
                    {heartRateBpm} BPM ({beatPeriod.toFixed(2)}s)
                  </span>
                </div>
                <div>
                  <span className="opacity-70 text-[9px] block">HRV COHERENCE (Ψ)</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {hrvMs}ms ({hrvMetrics.coherencePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="opacity-70 text-[9px] block">ANGULAR FREQ (ω)</span>
                  <span className="font-bold text-purple-400 text-xs">
                    {omega.toFixed(2)} rad/s ({hrvMetrics.freqModulation.toFixed(2)}x)
                  </span>
                </div>
                <div>
                  <span className="opacity-70 text-[9px] block">WAVE INTENSITY (I)</span>
                  <span className="font-bold text-cyan-400 text-xs">
                    {(hrvMetrics.intensityFactor * 100).toFixed(1)}% · {(3000 / (heartRateBpm || 75)).toFixed(1)} Å
                  </span>
                </div>
              </div>

              {/* Mode Switcher Pill Group */}
              <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-1 text-[9px]">
                <button
                  onClick={() => setWaveMode('STANDING_LATTICE')}
                  className={`px-2 py-1 rounded transition-colors font-bold cursor-pointer ${
                    waveMode === 'STANDING_LATTICE'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#101538] text-cyan-300/70 hover:bg-[#161d4e]'
                  }`}
                >
                  STANDING LATTICE
                </button>
                <button
                  onClick={() => setWaveMode('TRANSVERSE_FLUX')}
                  className={`px-2 py-1 rounded transition-colors font-bold cursor-pointer ${
                    waveMode === 'TRANSVERSE_FLUX'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#101538] text-purple-300/70 hover:bg-[#161d4e]'
                  }`}
                >
                  HEXAGONAL FLUX
                </button>
                <button
                  onClick={() => setWaveMode('RADIAL_PRISM')}
                  className={`px-2 py-1 rounded transition-colors font-bold cursor-pointer ${
                    waveMode === 'RADIAL_PRISM'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#101538] text-pink-300/70 hover:bg-[#161d4e]'
                  }`}
                >
                  RADIAL PRISM
                </button>
              </div>
            </motion.div>

            {/* Right HUD: Controls & Deactivation */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-2 pointer-events-auto"
            >
              <button
                onClick={() => setParticleDensity(prev => prev === 'HIGH' ? 'BALANCED' : 'HIGH')}
                className={`px-3 py-2 rounded-lg border text-[10px] font-bold font-mono tracking-wider transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer ${
                  particleDensity === 'HIGH'
                    ? isLight
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-sm'
                      : 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : isLight
                      ? 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
                      : 'bg-[#080d24]/80 border-purple-900/60 text-[#c0d4ec] hover:border-purple-600'
                }`}
                title="Toggle Quantum Particle Density"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>PARTICLES: {particleDensity}</span>
              </button>

              <button
                onClick={() => {
                  playCrystalChime(880);
                  onDeactivate();
                }}
                className={`p-2 rounded-lg border font-mono text-[10px] font-bold transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer ${
                  isLight
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800 shadow-sm'
                    : 'bg-rose-950/80 hover:bg-rose-900/90 border-rose-500/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
                title="Disengage Quantum Shield"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">DISENGAGE SHIELD</span>
              </button>
            </motion.div>
          </div>

          {/* Bottom Pulse Telemetry Bar */}
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex items-center justify-between text-[9px] font-mono opacity-80">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3 h-3" />
              NON-COERCIVE FREEDOM BOND // AEILORIA.CORE v4.8
            </span>
            <span className="text-purple-400 hidden sm:inline">
              SYS-PULSE: T={beatPeriod.toFixed(2)}s | PHI=0.618 | ENTROPY-DELTA=-94.2%
            </span>
            <span className="text-emerald-400">
              STATE: SELF_SUSTAINING CRYSTAL LATTICE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
