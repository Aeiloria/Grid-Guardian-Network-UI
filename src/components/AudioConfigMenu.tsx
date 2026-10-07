import React from 'react';
import { Sliders, Gem, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AudioConfigMenuProps {
  activeFreq: number;
  activeWave: OscillatorType;
  isAudioActive: boolean;
  onSettingsChange: (freq: number, wave: OscillatorType) => void;
}

const CRYSTAL_PRESETS = [
  { label: '432 Hz', value: 432.0, name: 'Clear Quartz' },
  { label: '528 Hz', value: 528.0, name: 'Emerald Matrix' },
  { label: '639 Hz', value: 639.0, name: 'Tourmaline Core' },
  { label: '741 Hz', value: 741.0, name: 'Obsidian Pulse' },
  { label: '852 Hz', value: 852.0, name: 'Sapphire Order' },
  { label: '963 Hz', value: 963.0, name: 'Amethyst Crown' }
];

const WAVE_TYPES: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];

export function AudioConfigMenu({
  activeFreq,
  activeWave,
  isAudioActive,
  onSettingsChange
}: AudioConfigMenuProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`p-4 border-b transition-colors relative ${
      isLight 
        ? 'bg-gradient-to-br from-white to-purple-50/10 border-purple-200 text-slate-800' 
        : 'bg-gradient-to-br from-[#060817] to-[#0b0e24] border-purple-900/40 text-[#c0d4ec]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sliders className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            CRYSTALLINE ACOUSTIC RESONATOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-purple-300/70'}`}>LATTICE:</span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isAudioActive
                ? isLight
                  ? 'bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-900 border-purple-300 shadow-xs'
                  : 'bg-gradient-to-r from-purple-900/40 to-cyan-900/40 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : isLight
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : 'bg-[#10142b] text-[#7888b0] border-[#1e274a]'
            }`}
          >
            {isAudioActive ? 'REFRACTING HARMONICS' : 'QUIESCENT'}
          </span>
        </div>
      </div>

      {/* Crystal Frequency Tuning */}
      <div className={`p-3 rounded border mb-3 transition-colors ${
        isLight ? 'bg-white/80 border-purple-200 shadow-xs' : 'bg-[#090d22]/90 border-purple-500/25'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isLight ? 'text-purple-900' : 'text-purple-200'}`}>
            <Gem className="w-3.5 h-3.5 text-cyan-500" /> CARRIER HARMONIC
          </span>
          <span className={`text-sm font-black font-mono tracking-wider ${
            isLight ? 'text-purple-950' : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]'
          }`}>
            {activeFreq.toFixed(1)} Hz
          </span>
        </div>

        <input
          type="range"
          min="100"
          max="1200"
          step="0.5"
          value={activeFreq}
          onChange={(e) => onSettingsChange(parseFloat(e.target.value), activeWave)}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer mb-2.5 ${
            isLight ? 'bg-purple-100 accent-purple-600' : 'bg-[#151c3d] accent-cyan-400'
          }`}
        />

        {/* Preset Gemstone Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
          {CRYSTAL_PRESETS.map((preset) => {
            const isSelected = Math.abs(activeFreq - preset.value) < 0.1;
            return (
              <button
                key={preset.value}
                onClick={() => onSettingsChange(preset.value, activeWave)}
                className={`p-1.5 text-[10px] font-mono rounded border transition-all cursor-pointer text-center relative overflow-hidden ${
                  isSelected
                    ? isLight
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold border-purple-700 shadow-sm'
                      : 'bg-gradient-to-br from-cyan-400/30 to-purple-600/30 text-cyan-200 font-bold border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : isLight
                      ? 'bg-purple-50/50 hover:bg-purple-100/60 border-purple-200 text-purple-900'
                      : 'bg-[#0f1430] hover:bg-[#181f47] border-purple-900/50 text-[#8ea3d0]'
                }`}
              >
                <div className="font-bold">{preset.label}</div>
                <div className="text-[8px] opacity-80 truncate">{preset.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Crystal Waveform Selector */}
      <div className={`p-3 rounded border transition-colors ${
        isLight ? 'bg-white/80 border-purple-200 shadow-xs' : 'bg-[#090d22]/90 border-purple-500/25'
      }`}>
        <div className={`text-[11px] font-bold mb-2 ${isLight ? 'text-purple-900' : 'text-purple-200'}`}>
          REFRACTIVE GEOMETRY (WAVEFORM)
        </div>
        <div className="grid grid-cols-4 gap-2">
          {WAVE_TYPES.map((type) => {
            const isSelected = activeWave === type;
            return (
              <button
                key={type}
                onClick={() => onSettingsChange(activeFreq, type)}
                className={`p-2 rounded text-xs font-mono uppercase text-center border transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-gradient-to-r from-purple-700 to-cyan-700 text-white font-black shadow-sm'
                      : 'bg-gradient-to-r from-purple-600/40 to-cyan-500/40 text-cyan-200 font-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : isLight
                      ? 'bg-white border-purple-200 text-purple-900 hover:border-purple-300'
                      : 'bg-[#0e132e] border-purple-900/40 text-[#7f94c0] hover:border-purple-700'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
