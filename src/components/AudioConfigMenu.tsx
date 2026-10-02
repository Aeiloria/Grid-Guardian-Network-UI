import React from 'react';
import { Sliders, Radio, Music, Volume2, Shield } from 'lucide-react';

interface AudioConfigMenuProps {
  activeFreq: number;
  activeWave: OscillatorType;
  isAudioActive: boolean;
  onSettingsChange: (freq: number, wave: OscillatorType) => void;
}

const PRESET_FREQUENCIES = [
  { label: '432 Hz', value: 432.0, name: 'Anuhazi Harmonic' },
  { label: '528 Hz', value: 528.0, name: 'Solfeggio Mirabilis' },
  { label: '639 Hz', value: 639.0, name: 'Interconnection' },
  { label: '741 Hz', value: 741.0, name: 'Scalar Detonation' },
  { label: '852 Hz', value: 852.0, name: 'Pure Clarity' },
  { label: '963 Hz', value: 963.0, name: 'Crown Vector' }
];

const WAVE_TYPES: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];

export function AudioConfigMenu({
  activeFreq,
  activeWave,
  isAudioActive,
  onSettingsChange
}: AudioConfigMenuProps) {
  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#060b14] text-[#c0d4ec]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00ffcc]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            ACOUSTIC SCALAR SYNTHESIZER
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5e779b] font-mono">STATUS:</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isAudioActive
                ? 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40'
                : 'bg-[#152033] text-[#7890b0]'
            }`}
          >
            {isAudioActive ? 'TRANSMITTING' : 'MUTED'}
          </span>
        </div>
      </div>

      {/* Frequency Tuning */}
      <div className="bg-[#09101c] border border-[#1a2636] p-3 rounded mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-[#8fa7c7]">CARRIER FREQUENCY</span>
          <span className="text-sm font-black font-mono text-[#00ffcc] tracking-wider">
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
          className="w-full h-1.5 bg-[#142034] rounded-lg appearance-none cursor-pointer accent-[#00ffcc] mb-2"
        />

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
          {PRESET_FREQUENCIES.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onSettingsChange(preset.value, activeWave)}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer text-center ${
                Math.abs(activeFreq - preset.value) < 0.1
                  ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] font-bold'
                  : 'bg-[#0d1626] border-[#1c2c42] text-[#8aa3c7] hover:border-[#2f4669]'
              }`}
            >
              <div>{preset.label}</div>
              <div className="text-[8px] opacity-75 truncate">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Waveform Selector */}
      <div className="bg-[#09101c] border border-[#1a2636] p-3 rounded">
        <div className="text-[11px] font-bold text-[#8fa7c7] mb-2">OSCILLATION GEOMETRY</div>
        <div className="grid grid-cols-4 gap-2">
          {WAVE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onSettingsChange(activeFreq, type)}
              className={`p-2 rounded text-xs font-mono uppercase text-center border transition-all cursor-pointer ${
                activeWave === type
                  ? 'bg-[#00e1ff]/20 border-[#00e1ff] text-[#00e1ff] font-bold shadow-[0_0_10px_rgba(0,225,255,0.2)]'
                  : 'bg-[#0d1626] border-[#1c2c42] text-[#7189ad] hover:border-[#2f4669]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
