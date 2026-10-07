import React, { useState, useEffect } from 'react';
import { Shield, Zap, Radio, Cpu, Sparkles, Gem, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { SoundEffectsController } from './SoundEffectsController';
import { playQuartzClick, playCrystalChime } from '../utils/crystalSoundEngine';

export function MasterGridDashboard() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [currentTime, setCurrentTime] = useState<string>('');
  const [gridIntegrity] = useState<number>(99.7);
  const [shieldCapacity] = useState<number>(98.9);
  const [crystalHarmonic] = useState<number>(432.0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const runAiTacticalAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    playCrystalChime(1046.5);
    try {
      const response = await fetch('/api/gemini/grid-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
