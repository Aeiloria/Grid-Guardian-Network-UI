import React from 'react';
import { Heart, Activity, Volume2, ShieldCheck, Flame, Gem, ShieldAlert, Sparkles, Orbit } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playShieldLockTone, playVagalAlignmentTone, playBioPulseTone, playCrystalChime } from '../utils/crystalSoundEngine';

interface BiometricActionDeckProps {
  heartRateBpm: number;
  hrvMs: number;
  isBleConnected: boolean;
  isQuantumShieldActive?: boolean;
  onToggleQuantumShield?: () => void;
  onTriggerRoutine: (actionType: string) => void;
}

export function BiometricActionDeck({
  heartRateBpm,
  hrvMs,
  isBleConnected,
  isQuantumShieldActive = false,
  onToggleQuantumShield,
  onTriggerRoutine
}: BiometricActionDeckProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handlePrism01 = () => {
    playShieldLockTone();
    onTriggerRoutine('ANUHAZI_CHANT');
  };

  const handlePrism02 = () => {
    playVagalAlignmentTone();
    onTriggerRoutine('YOGA_STRETCH');
  };

  const handleQuantumToggle = () => {
    playShieldLockTone();
    playCrystalChime(isQuantumShieldActive ? 880 : 1320);
    if (onToggleQuantumShield) {
      onToggleQuantumShield();
    }
  };

  return (
    <div className={`p-4 border-b transition-colors relative ${
      isLight 
        ? 'bg-gradient-to-br from-white to-purple-50/10 border-purple-200 text-slate-800' 
        : 'bg-gradient-to-br from-[#060817] to-[#0a0d24] border-purple-900/40 text-[#c0d4ec]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-500 animate-pulse" />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            CRYSTAL BIO-RESONANCE & ROUTINE DECK
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
            isBleConnected
              ? isLight
                ? 'text-cyan-900 border-cyan-300 bg-cyan-50'
                : 'text-cyan-300 border-cyan-400/50 bg-cyan-950/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : isLight
                ? 'text-purple-900 border-purple-300 bg-purple-50'
                : 'text-purple-300 border-purple-500/50 bg-purple-950/60'
          }`}
        >
          {isBleConnected ? '✦ GATT CRYSTAL LINKED' : 'LOCAL BIO-PROXY'}
        </span>
      </div>

      {/* Crystalline Vital Displays (Interactive Audio Feedback) */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div
          onClick={() => playBioPulseTone()}
          className={`p-3 rounded border flex items-center justify-between transition-all relative overflow-hidden cursor-pointer active:scale-98 ${
            isLight ? 'bg-white/90 border-pink-200 shadow-sm hover:border-pink-300' : 'bg-[#0d0f28] border-pink-500/30 hover:border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
          }`}
          title="Click to pulse crystal bio-sensor"
        >
          <div>
            <div className={`text-[10px] font-bold ${isLight ? 'text-pink-800' : 'text-pink-400'}`}>
              CRYSTAL PULSE RATE
            </div>
            <div className="text-xl font-black text-pink-500 font-mono flex items-baseline gap-1 mt-0.5">
              {heartRateBpm} <span className="text-[10px] opacity-75">BPM</span>
            </div>
          </div>
          <Heart className="w-6 h-6 text-pink-500 animate-bounce" />
        </div>

        <div
          onClick={() => playBioPulseTone()}
          className={`p-3 rounded border flex items-center justify-between transition-all relative overflow-hidden cursor-pointer active:scale-98 ${
            isLight ? 'bg-white/90 border-cyan-200 shadow-sm hover:border-cyan-300' : 'bg-[#0a122a] border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
          }`}
          title="Click to probe lattice coherence"
        >
          <div>
            <div className={`text-[10px] font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
              LATTICE COHERENCE (HRV)
            </div>
            <div className={`text-xl font-black font-mono flex items-baseline gap-1 mt-0.5 ${
              isLight ? 'text-cyan-900' : 'text-cyan-300'
            }`}>
              {hrvMs} <span className="text-[10px] opacity-75">MS</span>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
        </div>
      </div>

      {/* Interactive Quantum Shield Mode Activator */}
      <div className="mb-3">
        <button
          onClick={handleQuantumToggle}
          className={`w-full p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden group shadow-md flex items-center justify-between ${
            isQuantumShieldActive
              ? isLight
                ? 'bg-gradient-to-r from-cyan-100 via-purple-100 to-pink-100 border-cyan-400 text-purple-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-gradient-to-r from-[#0d1f3c] via-[#1f1238] to-[#260f2e] border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              : isLight
                ? 'bg-white hover:bg-slate-50 border-purple-200 text-slate-700 hover:border-purple-300'
                : 'bg-[#090d24] hover:bg-[#0f1436] border-purple-900/50 text-[#c0d4ec] hover:border-purple-600/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all ${
              isQuantumShieldActive
                ? isLight
                  ? 'bg-cyan-500 text-white border-cyan-300 shadow-md animate-spin'
                  : 'bg-cyan-400/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_#06b6d4] animate-spin'
                : isLight
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : 'bg-[#12163b] text-purple-400 border-purple-800/40'
            }`} style={{ animationDuration: '8s' }}>
              <Orbit className="w-4 h-4" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-black tracking-widest ${
                  isQuantumShieldActive
                    ? isLight ? 'text-cyan-800' : 'text-cyan-400'
                    : isLight ? 'text-slate-500' : 'text-purple-400'
                }`}>
                  QUANTUM SHIELD MODE
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                  isQuantumShieldActive
                    ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800/20 text-slate-400 border-slate-700/40'
                }`}>
                  {isQuantumShieldActive ? 'FIELD ENGAGED' : 'STANDBY'}
                </span>
              </div>
              <div className="font-black text-xs mt-0.5">
                {isQuantumShieldActive
                  ? 'Rotating Iridescent Energy Field Active'
                  : 'Activate 360° Iridescent Quantum Defense Field'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors border ${
              isQuantumShieldActive
                ? 'bg-cyan-500 border-cyan-300'
                : isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'
            }`}>
              <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                isQuantumShieldActive ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </button>
      </div>

      {/* Crystal Routine Trigger Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handlePrism01}
          className={`p-3 rounded text-left transition-all border group cursor-pointer relative overflow-hidden active:scale-98 ${
            isLight
              ? 'bg-gradient-to-br from-purple-50 via-white to-cyan-50/60 hover:from-purple-100 hover:to-cyan-100 border-purple-300 text-purple-950 shadow-sm'
              : 'bg-gradient-to-br from-[#151133] to-[#0c1830] hover:from-[#1e1747] hover:to-[#102242] border-purple-500/40 text-cyan-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-mono font-bold tracking-widest ${
              isLight ? 'text-purple-800' : 'text-cyan-400'
            }`}>
              PRISM 01
            </span>
            <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-400" />
          </div>
          <div className="font-black text-xs">
            ANUHAZI QUARTZ LOCK
          </div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-purple-700' : 'text-purple-300/80'}`}>
            Refract 432Hz scalar acoustic shield
          </div>
        </button>

        <button
          onClick={handlePrism02}
          className={`p-3 rounded text-left transition-all border group cursor-pointer relative overflow-hidden active:scale-98 ${
            isLight
              ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 hover:from-emerald-100 hover:to-teal-100 border-emerald-300 text-emerald-950 shadow-sm'
              : 'bg-gradient-to-br from-[#0c1c20] to-[#0f1738] hover:from-[#11272d] hover:to-[#15214c] border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-mono font-bold tracking-widest ${
              isLight ? 'text-emerald-800' : 'text-emerald-400'
            }`}>
              PRISM 02
            </span>
            <Flame className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-400" />
          </div>
          <div className="font-black text-xs">
            VAGAL CRYSTAL ALIGNMENT
          </div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-300/80'}`}>
            Log bio-harmonic calibration routine
          </div>
        </button>
      </div>
    </div>
  );
}
