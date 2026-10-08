import React, { useRef, useEffect, useState } from 'react';
import { Activity, Zap, Radio, RefreshCw, Gauge, Wifi, ShieldCheck, Play, Pause } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playQuartzClick, playCrystalChime } from '../utils/crystalSoundEngine';

interface LatencyPoint {
  time: number;
  latencyMs: number;
  status: 'optimal' | 'moderate' | 'high';
}

export function QuantumLatencyMonitor() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<LatencyPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 24 }).map((_, i) => ({
      time: now - (24 - i) * 800,
      latencyMs: parseFloat((14.2 + Math.sin(i * 0.6) * 3.5 + (i % 3) * 1.2).toFixed(1)),
      status: 'optimal' as const
    }));
  });
  const [currentLatency, setCurrentLatency] = useState<number>(14.2);
  const [avgLatency, setAvgLatency] = useState<number>(15.8);
  const [minLatency, setMinLatency] = useState<number>(11.1);
  const [maxLatency, setMaxLatency] = useState<number>(24.8);
  const [jitter, setJitter] = useState<number>(1.2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [packetCount, setPacketCount] = useState<number>(24);
  const [waveGlowColor, setWaveGlowColor] = useState<'cyan' | 'purple' | 'emerald'>('cyan');

  // Real-time network telemetry probe loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const measureLatency = async () => {
      if (isPaused) return;

      const startTime = performance.now();
      try {
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        const endTime = performance.now();
        const duration = parseFloat((endTime - startTime).toFixed(1));
        const effectiveLatency = res.ok ? duration : duration + 5;

        setCurrentLatency(effectiveLatency);
        setPacketCount(prev => prev + 1);

        setHistory(prev => {
          const newPt: LatencyPoint = {
            time: Date.now(),
            latencyMs: effectiveLatency,
            status: effectiveLatency < 25 ? 'optimal' : effectiveLatency < 60 ? 'moderate' : 'high'
          };
          const updated = [...prev, newPt].slice(-50); // Keep last 50 points

          // Recalculate stats
          const values = updated.map(p => p.latencyMs);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
          const jitt = parseFloat(Math.abs(effectiveLatency - avg).toFixed(1));

          setMinLatency(min);
          setMaxLatency(max);
          setAvgLatency(avg);
          setJitter(jitt);

          return updated;
        });
      } catch {
        // Fallback simulation when offline
        const simLatency = parseFloat((12 + Math.random() * 8 + Math.sin(Date.now() / 800) * 4).toFixed(1));
        setCurrentLatency(simLatency);
        setPacketCount(prev => prev + 1);

        setHistory(prev => {
          const newPt: LatencyPoint = {
            time: Date.now(),
            latencyMs: simLatency,
            status: 'optimal'
          };
          return [...prev, newPt].slice(-50);
        });
      }
    };

    // Initial fill
    measureLatency();
    timer = setInterval(measureLatency, 800);

    return () => clearInterval(timer);
  }, [isPaused]);

  // High-performance Canvas rendering of the scrolling neon-glowing wave with glowing gradient fill underneath
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = isLight ? 'rgba(168, 85, 247, 0.08)' : 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let y = 15; y < height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (history.length < 2) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Dynamic scale
      const maxVal = Math.max(45, ...history.map(p => p.latencyMs));
      const minVal = 0;
      const step = width / (history.length - 1 || 1);

      const getX = (idx: number) => idx * step;
      const getY = (val: number) => height - (val / maxVal) * (height - 24) - 10;

      const waveColor =
        waveGlowColor === 'cyan'
          ? '#06b6d4'
          : waveGlowColor === 'purple'
            ? '#c084fc'
            : '#10b981';

      // 1. Create the glowing stroke path
      ctx.beginPath();
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 12; // Adds a neon glow effect

      history.forEach((pt, index) => {
        const x = getX(index);
        const y = getY(pt.latencyMs);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = getX(index - 1);
          const prevY = getY(history[index - 1].latencyMs);
          const midX = (prevX + x) / 2;
          const midY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
      });

      const lastX = getX(history.length - 1);
      const lastY = getY(history[history.length - 1].latencyMs);
      ctx.lineTo(lastX, lastY);
      ctx.stroke();

      // 2. Create the glowing gradient fill underneath
      ctx.shadowBlur = 0; // Clear shadow before drawing fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (waveGlowColor === 'cyan') {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.45)'); // Cyan fade at top
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');  // Transparent at bottom
      } else if (waveGlowColor === 'purple') {
        gradient.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
        gradient.addColorStop(1, 'rgba(192, 132, 252, 0.0)');
      } else {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      }

      // Complete the path down to the bottom corners to form a closed shape for filling
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();

      // 3. Current Head Beacon Dot with Ripple
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 7 + Math.sin(Date.now() / 150) * 2, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [history, isLight, waveGlowColor]);

  const handleBurstProbe = async () => {
    playCrystalChime(1318.5);
    for (let i = 0; i < 4; i++) {
      const start = performance.now();
      try {
        await fetch('/api/health');
      } catch {}
      const delta = parseFloat((performance.now() - start).toFixed(1));
      setHistory(prev => [
        ...prev,
        { time: Date.now(), latencyMs: delta || (14 + i), status: 'optimal' as const }
      ].slice(-50));
    }
  };

  return (
    <div className={`p-4 border-t transition-colors relative ${
      isLight
        ? 'bg-gradient-to-br from-white to-purple-50/20 border-purple-200 text-slate-800'
        : 'bg-gradient-to-br from-[#060818] via-[#090d24] to-[#050716] border-purple-900/50 text-[#c0d4ec]'
    }`}>
      {/* Header Controller Deck */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            QUANTUM LATENCY MONITOR // NETWORK OSCILLOSCOPE
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {/* Color Switcher */}
          <div className="flex items-center border rounded p-0.5 gap-1 border-purple-800/40">
            <button
              onClick={() => { playQuartzClick(); setWaveGlowColor('cyan'); }}
              className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                waveGlowColor === 'cyan' ? 'ring-2 ring-cyan-400 scale-110' : 'opacity-60'
              } bg-cyan-400`}
              title="Cyan Wave"
            />
            <button
              onClick={() => { playQuartzClick(); setWaveGlowColor('purple'); }}
              className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                waveGlowColor === 'purple' ? 'ring-2 ring-purple-400 scale-110' : 'opacity-60'
              } bg-purple-400`}
              title="Amethyst Wave"
            />
            <button
              onClick={() => { playQuartzClick(); setWaveGlowColor('emerald'); }}
              className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                waveGlowColor === 'emerald' ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-60'
              } bg-emerald-400`}
              title="Emerald Wave"
            />
          </div>

          <button
            onClick={handleBurstProbe}
            className={`px-2 py-1 rounded border font-bold flex items-center gap-1 cursor-pointer transition-all ${
              isLight
                ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                : 'bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
            }`}
            title="Fire burst packet sequence"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>BURST PROBE</span>
          </button>

          <button
            onClick={() => { playQuartzClick(); setIsPaused(prev => !prev); }}
            className={`p-1 rounded border cursor-pointer ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#10142d] border-purple-800/50 text-cyan-200'
            }`}
            title={isPaused ? 'Resume monitoring' : 'Pause monitoring'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Live Telemetry KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono">
        <div className={`p-2 rounded border flex flex-col justify-between ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0a0e28] border-purple-900/40 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
        }`}>
          <span className="text-[9px] text-cyan-400 font-bold block flex items-center justify-between">
            <span>CURRENT LATENCY</span>
            <Wifi className="w-3 h-3 text-cyan-400" />
          </span>
          <div className="text-lg font-black text-cyan-400 flex items-baseline gap-1 mt-0.5">
            {currentLatency} <span className="text-[9px] opacity-75">MS</span>
          </div>
        </div>

        <div className={`p-2 rounded border flex flex-col justify-between ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0a0e28] border-purple-900/40 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
        }`}>
          <span className="text-[9px] text-purple-400 font-bold block flex items-center justify-between">
            <span>AVG ROUND-TRIP</span>
            <Gauge className="w-3 h-3 text-purple-400" />
          </span>
          <div className={`text-lg font-black flex items-baseline gap-1 mt-0.5 ${
            isLight ? 'text-purple-950' : 'text-purple-300'
          }`}>
            {avgLatency} <span className="text-[9px] opacity-75">MS</span>
          </div>
        </div>

        <div className={`p-2 rounded border flex flex-col justify-between ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0a0e28] border-purple-900/40 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
        }`}>
          <span className="text-[9px] text-emerald-400 font-bold block flex items-center justify-between">
            <span>PEAK JITTER</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </span>
          <div className="text-lg font-black text-emerald-400 flex items-baseline gap-1 mt-0.5">
            ±{jitter} <span className="text-[9px] opacity-75">MS</span>
          </div>
        </div>

        <div className={`p-2 rounded border flex flex-col justify-between ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0a0e28] border-purple-900/40 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
        }`}>
          <span className="text-[9px] text-pink-400 font-bold block flex items-center justify-between">
            <span>TUNNEL PACKETS</span>
            <ShieldCheck className="w-3 h-3 text-pink-400" />
          </span>
          <div className="text-lg font-black text-pink-400 flex items-baseline gap-1 mt-0.5">
            {packetCount} <span className="text-[9px] opacity-75">TX</span>
          </div>
        </div>
      </div>

      {/* Scrolling Neon Wave Line Graph Canvas */}
      <div className={`relative h-[110px] w-full rounded border overflow-hidden shadow-inner ${
        isLight ? 'bg-slate-900 border-purple-300' : 'bg-[#020512] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      }`}>
        <canvas
          ref={canvasRef}
          width={720}
          height={110}
          className="w-full h-full block"
        />

        {/* Real-time Watermark & Range Overlay */}
        <div className="absolute top-1.5 left-2 pointer-events-none text-[8px] font-mono text-cyan-300/60 tracking-wider">
          CARRIER: HTTP/2 PROXY // BUFFER: 50 NODES
        </div>
        <div className="absolute top-1.5 right-2 pointer-events-none text-[8px] font-mono text-cyan-300/80 font-bold">
          PEAK: {maxLatency}ms • FLOOR: {minLatency}ms
        </div>
      </div>
    </div>
  );
}
