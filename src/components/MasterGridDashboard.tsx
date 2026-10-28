import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Zap, Radio, Cpu, Sparkles, Gem, Activity, Heart, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { SoundEffectsController } from './SoundEffectsController';
import { playQuartzClick, playCrystalChime } from '../utils/crystalSoundEngine';
import { authorizedHeaders } from '../utils/session';
import { WellnessLog, useIndexedDB } from '../hooks/useIndexedDB';

interface MasterGridDashboardProps {
  wellnessLogs?: WellnessLog[];
}

export function MasterGridDashboard({ wellnessLogs }: MasterGridDashboardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Fallback to IndexedDB hook if not explicitly passed
  const fallbackDb = useIndexedDB();
  const logsToUse = wellnessLogs ?? fallbackDb.wellnessLogs ?? [];

  const [currentTime, setCurrentTime] = useState<string>('');
  const [gridIntegrity] = useState<number>(99.7);
  const [shieldCapacity] = useState<number>(98.9);
  const [crystalHarmonic] = useState<number>(432.0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'delta'>('both');

  // Prepare chronological telemetry dataset for Recharts
  const chartData = useMemo(() => {
    if (!logsToUse || logsToUse.length === 0) return [];

    const sorted = [...logsToUse].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((log, index) => {
      const dateObj = new Date(log.timestamp);
      const timeLabel = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `L-${index + 1}`;
      const delta = (log.heartRateBefore ?? 0) - (log.heartRateAfter ?? 0);

      return {
        id: log.id,
        index: index + 1,
        time: timeLabel,
        fullTime: !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString() : log.timestamp,
        type: log.type || 'BIOMETRIC_LOG',
        before: log.heartRateBefore ?? 0,
        after: log.heartRateAfter ?? 0,
        delta: delta,
        notes: log.notes || ''
      };
    });
  }, [logsToUse]);

  // Aggregate telemetry statistics
  const telemetryStats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgBefore: 0, avgAfter: 0, avgDelta: 0, maxDelta: 0 };
    }
    const sumBefore = chartData.reduce((acc, c) => acc + c.before, 0);
    const sumAfter = chartData.reduce((acc, c) => acc + c.after, 0);
    const sumDelta = chartData.reduce((acc, c) => acc + c.delta, 0);
    const maxDelta = Math.max(...chartData.map(c => c.delta));

    return {
      avgBefore: Math.round(sumBefore / chartData.length),
      avgAfter: Math.round(sumAfter / chartData.length),
      avgDelta: Math.round(sumDelta / chartData.length),
      maxDelta: Math.max(0, maxDelta)
    };
  }, [chartData]);

  const runAiTacticalAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    playCrystalChime(1046.5);
    try {
      const response = await fetch('/api/gemini/grid-assessment', {
        method: 'POST',
        headers: authorizedHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          gridIntegrity,
          shieldCapacity,
          activeRelays: 12,
          coordinates: '31.4351 N, 97.7439 W (Gatesville Crystalline Core)'
        })
      });
      const data = await response.json();
      setAiReport(data.assessment || 'Crystalline lattice frequency aligned at 432Hz. Zero refractive scalar distortion across Gatesville quadrant.');
      playCrystalChime(1567.98);
    } catch {
      setAiReport('Prismatic Vector Scan: 12/12 Quartz resonators harmonized. Crystalline refraction shield holding at 99.7% efficiency with sub-millisecond quantum latency.');
      playCrystalChime(1318.5);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`p-4 border-b transition-colors relative overflow-hidden ${
      isLight 
        ? 'bg-gradient-to-br from-white via-purple-50/20 to-cyan-50/30 border-purple-200 text-slate-800' 
        : 'bg-gradient-to-br from-[#070914] via-[#0d1024] to-[#0a1220] border-purple-900/40 text-[#c7d8f0]'
    }`}>
      {/* Decorative crystal facet gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-teal-400 opacity-90" />

      {/* Header Deck */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3.5 ${
        isLight ? 'border-purple-100' : 'border-purple-950/60'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Gem className={`w-5 h-5 ${isLight ? 'text-purple-600' : 'text-cyan-400'} animate-pulse`} />
            <div className={`absolute -inset-1 rounded-full blur-xs opacity-60 ${isLight ? 'bg-purple-400' : 'bg-cyan-500'}`} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest font-mono flex items-center gap-1.5 uppercase">
              <span className={`bg-gradient-to-r ${
                isLight ? 'from-purple-900 via-indigo-900 to-cyan-900' : 'from-cyan-300 via-purple-300 to-pink-300'
              } bg-clip-text text-transparent`}>
                CYBER-CRYSTAL GUARDIAN
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                isLight ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-purple-950/80 border-purple-500/50 text-cyan-300'
              }`}>
                QUARTZ ARRAY
              </span>
            </h1>
            <div className={`text-[10px] font-mono tracking-tight ${isLight ? 'text-slate-500' : 'text-purple-300/70'}`}>
              HIGH-DENSITY VECTOR NODE TELEMETRY // SECTOR 31-GATESVILLE
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`text-[10px] font-mono tracking-tight px-2.5 py-1 rounded border shadow-xs ${
            isLight ? 'bg-white/80 text-purple-900 border-purple-200' : 'bg-[#0b0e20] text-cyan-300 border-purple-900/60 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
          }`}>
            {currentTime || 'SYNCHRONIZING...'}
          </div>
          <SoundEffectsController compact={true} />
          <ThemeToggle compact={true} />
        </div>
      </div>

      {/* Crystalline Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <div
          onClick={() => playQuartzClick()}
          className={`p-3 rounded border transition-all relative overflow-hidden group cursor-pointer active:scale-98 ${
            isLight 
              ? 'bg-white/90 border-purple-200 shadow-sm hover:border-purple-300' 
              : 'bg-[#0c1024]/90 border-purple-500/25 hover:border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-1">
            <span className={isLight ? 'text-purple-800' : 'text-purple-300'}>CRYSTAL INTEGRITY</span>
            <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
          </div>
          <div className={`text-xl font-black font-mono tracking-wider ${
            isLight ? 'text-purple-950' : 'text-purple-200 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]'
          }`}>
            {gridIntegrity.toFixed(1)}%
          </div>
          <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${
            isLight ? 'bg-purple-100' : 'bg-purple-950/60'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${gridIntegrity}%` }}
            />
          </div>
          <div className={`text-[9px] mt-1 font-mono ${isLight ? 'text-purple-600' : 'text-purple-400/70'}`}>
            QUARTZ MONOLITH
          </div>
        </div>

        <div
          onClick={() => playQuartzClick()}
          className={`p-3 rounded border transition-all relative overflow-hidden group cursor-pointer active:scale-98 ${
            isLight 
              ? 'bg-white/90 border-cyan-200 shadow-sm hover:border-cyan-300' 
              : 'bg-[#091326]/90 border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-1">
            <span className={isLight ? 'text-cyan-800' : 'text-cyan-300'}>PRISM SHIELD</span>
            <Zap className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
          </div>
          <div className={`text-xl font-black font-mono tracking-wider ${
            isLight ? 'text-cyan-950' : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'
          }`}>
            {shieldCapacity.toFixed(1)}%
          </div>
          <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${
            isLight ? 'bg-cyan-100' : 'bg-cyan-950/60'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500"
              style={{ width: `${shieldCapacity}%` }}
            />
          </div>
          <div className={`text-[9px] mt-1 font-mono ${isLight ? 'text-cyan-600' : 'text-cyan-400/70'}`}>
            REFRACTIVE BARRIER
          </div>
        </div>

        <div
          onClick={() => playQuartzClick()}
          className={`p-3 rounded border transition-all relative overflow-hidden group cursor-pointer active:scale-98 ${
            isLight 
              ? 'bg-white/90 border-pink-200 shadow-sm hover:border-pink-300' 
              : 'bg-[#150e24]/90 border-pink-500/25 hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-1">
            <span className={isLight ? 'text-pink-800' : 'text-pink-300'}>CRYSTAL NODES</span>
            <Radio className={`w-3.5 h-3.5 ${isLight ? 'text-pink-600' : 'text-pink-400'}`} />
          </div>
          <div className={`text-xl font-black font-mono tracking-wider ${
            isLight ? 'text-pink-950' : 'text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]'
          }`}>
            12 / 12
          </div>
          <div className={`text-[9px] mt-2 font-mono ${isLight ? 'text-pink-600' : 'text-pink-400/70'}`}>
            TOURMALINE LATTICE
          </div>
        </div>

        <div
          onClick={() => playQuartzClick()}
          className={`p-3 rounded border transition-all relative overflow-hidden group cursor-pointer active:scale-98 ${
            isLight 
              ? 'bg-white/90 border-emerald-200 shadow-sm hover:border-emerald-300' 
              : 'bg-[#0a181d]/90 border-emerald-500/25 hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-1">
            <span className={isLight ? 'text-emerald-800' : 'text-emerald-300'}>SCALAR FREQ</span>
            <Activity className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          </div>
          <div className={`text-xl font-black font-mono tracking-wider ${
            isLight ? 'text-emerald-950' : 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
          }`}>
            {crystalHarmonic.toFixed(1)} Hz
          </div>
          <div className={`text-[9px] mt-2 font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400/70'}`}>
            EMERALD HARMONIC
          </div>
        </div>
      </div>

      {/* Wellness Heart Rate Fluctuations Recharts Line Chart */}
      <div className={`p-3.5 rounded border mb-3.5 transition-all ${
        isLight
          ? 'bg-white/90 border-purple-200 shadow-xs'
          : 'bg-[#080d22]/90 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.12)]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-rose-400'} animate-pulse`} />
            <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
              WELLNESS HEART RATE FLUCTUATIONS // RECHARTS TELEMETRY
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className={`p-0.5 rounded border text-[10px] font-mono flex items-center gap-1 ${
              isLight ? 'bg-purple-50 border-purple-200' : 'bg-[#0c1233] border-purple-800/50'
            }`}>
              <button
                onClick={() => {
                  playQuartzClick();
                  setActiveChartMetric('both');
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  activeChartMetric === 'both'
                    ? isLight
                      ? 'bg-white text-purple-950 font-black shadow-xs'
                      : 'bg-purple-900/70 text-cyan-200 font-bold border border-cyan-400/40'
                    : isLight
                      ? 'text-purple-700 hover:text-purple-950'
                      : 'text-purple-300/70 hover:text-white'
                }`}
              >
                INITIAL vs STABILIZED
              </button>
              <button
                onClick={() => {
                  playQuartzClick();
                  setActiveChartMetric('delta');
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  activeChartMetric === 'delta'
                    ? isLight
                      ? 'bg-white text-purple-950 font-black shadow-xs'
                      : 'bg-purple-900/70 text-cyan-200 font-bold border border-cyan-400/40'
                    : isLight
                      ? 'text-purple-700 hover:text-purple-950'
                      : 'text-purple-300/70 hover:text-white'
                }`}
              >
                COHERENCE (Δ)
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className={`p-1.5 px-2.5 rounded border text-center ${
            isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/20 border-rose-500/25'
          }`}>
            <div className="text-[9px] font-mono text-rose-400 font-bold">AVG INITIAL HR</div>
            <div className={`text-sm font-black font-mono ${isLight ? 'text-rose-900' : 'text-rose-300'}`}>
              {telemetryStats.avgBefore > 0 ? `${telemetryStats.avgBefore} BPM` : '—'}
            </div>
          </div>

          <div className={`p-1.5 px-2.5 rounded border text-center ${
            isLight ? 'bg-cyan-50/70 border-cyan-200' : 'bg-cyan-950/20 border-cyan-500/25'
          }`}>
            <div className="text-[9px] font-mono text-cyan-400 font-bold">AVG STABILIZED HR</div>
            <div className={`text-sm font-black font-mono ${isLight ? 'text-cyan-950' : 'text-cyan-300'}`}>
              {telemetryStats.avgAfter > 0 ? `${telemetryStats.avgAfter} BPM` : '—'}
            </div>
          </div>

          <div className={`p-1.5 px-2.5 rounded border text-center ${
            isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/25'
          }`}>
            <div className="text-[9px] font-mono text-emerald-400 font-bold">AVG VAGAL GAIN (Δ)</div>
            <div className={`text-sm font-black font-mono ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
              {telemetryStats.avgDelta > 0 ? `-${telemetryStats.avgDelta} BPM` : '—'}
            </div>
          </div>

          <div className={`p-1.5 px-2.5 rounded border text-center ${
            isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-500/25'
          }`}>
            <div className="text-[9px] font-mono text-purple-400 font-bold">LOGGED SESSIONS</div>
            <div className={`text-sm font-black font-mono ${isLight ? 'text-purple-950' : 'text-purple-200'}`}>
              {chartData.length} SESSIONS
            </div>
          </div>
        </div>

        {/* Recharts Line Chart Container */}
        {chartData.length === 0 ? (
          <div className={`h-40 flex flex-col items-center justify-center rounded border font-mono text-xs text-center p-4 ${
            isLight ? 'bg-purple-50/40 border-purple-200 text-slate-500' : 'bg-[#050716] border-purple-900/40 text-purple-300/70'
          }`}>
            <Activity className="w-6 h-6 mb-2 opacity-50 text-cyan-400 animate-pulse" />
            <span>Awaiting wellness biometric telemetry in IndexedDB store.</span>
            <span className="text-[10px] text-slate-400 mt-1">Execute a Yoga Stretch or Anuhazi Chant routine to log HR fluctuations.</span>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-52 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isLight ? 'rgba(147, 51, 234, 0.12)' : 'rgba(168, 85, 247, 0.18)'}
                />
                <XAxis
                  dataKey="time"
                  stroke={isLight ? '#7e22ce' : '#a855f7'}
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke={isLight ? '#7e22ce' : '#a855f7'}
                  fontSize={10}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className={`p-2.5 rounded border text-xs font-mono shadow-xl backdrop-blur-md ${
                        isLight ? 'bg-white/95 border-purple-200 text-slate-800' : 'bg-[#080c22]/95 border-purple-500/40 text-cyan-200'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-purple-500/20">
                          <span className="font-bold text-[11px] text-purple-400 uppercase flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-400" /> {data.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{data.fullTime}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] text-rose-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Initial HR:
                            </span>
                            <span className="font-bold text-xs">{data.before} BPM</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] text-cyan-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Stabilized HR:
                            </span>
                            <span className="font-bold text-xs">{data.after} BPM</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-purple-500/20 text-emerald-400 font-bold">
                            <span className="text-[10px]">Δ Vagal Coherence:</span>
                            <span>-{data.delta} BPM</span>
                          </div>
                          {data.notes && (
                            <div className="text-[9px] text-slate-400 italic pt-1 truncate max-w-[200px]">
                              &ldquo;{data.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                  iconType="circle"
                />
                <ReferenceLine
                  y={70}
                  stroke={isLight ? '#16a34a' : '#10b981'}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Baseline 70 BPM',
                    fill: isLight ? '#16a34a' : '#34d399',
                    fontSize: 9,
                    position: 'insideBottomRight'
                  }}
                />

                {activeChartMetric === 'both' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="before"
                      name="Initial HR (BPM)"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ fill: '#f43f5e', r: 3.5, strokeWidth: 1, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#fda4af' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="after"
                      name="Stabilized HR (BPM)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ fill: '#06b6d4', r: 3.5, strokeWidth: 1, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#67e8f9' }}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="delta"
                    name="Vagal Reduction (Δ BPM)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6ee7b7' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AI Crystalline Intelligence Trigger */}
      <div className={`p-3 rounded border transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-purple-50/70 via-white to-cyan-50/70 border-purple-200 shadow-xs' 
          : 'bg-gradient-to-r from-[#110e26]/80 via-[#0d142b]/80 to-[#0c1c28]/80 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-300'} animate-spin`} />
            <span className={`text-xs font-black tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
              GEMINI CRYSTALLINE SYNTHESIS ENGINE
            </span>
          </div>
          <button
            onClick={runAiTacticalAnalysis}
            disabled={isAiLoading}
            className={`px-3 py-1 text-[11px] font-mono font-bold rounded cursor-pointer transition-all border shadow-xs ${
              isLight
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-purple-700'
                : 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 text-cyan-200 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
            }`}
          >
            {isAiLoading ? 'REFRACTING VECTORS...' : 'ANALYZE CRYSTAL GRID'}
          </button>
        </div>

        {aiReport && (
          <div className={`mt-2.5 p-2.5 rounded border text-[11px] leading-relaxed font-mono relative overflow-hidden ${
            isLight
              ? 'bg-white border-purple-200 text-slate-800 shadow-sm'
              : 'bg-[#080a1c]/90 border-purple-500/40 text-purple-200 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]'
          }`}>
            <span className={`font-bold block mb-1 flex items-center gap-1.5 ${isLight ? 'text-purple-800' : 'text-cyan-300'}`}>
              <Gem className="w-3.5 h-3.5" /> PRISMATIC FIELD ASSESSMENT:
            </span>
            {aiReport}
          </div>
        )}
      </div>
    </div>
  );
}
