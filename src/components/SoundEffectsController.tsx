import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { isSfxMuted, toggleSfx, playCrystalChime } from '../utils/crystalSoundEngine';
import { useTheme } from '../context/ThemeContext';

interface SoundEffectsControllerProps {
  compact?: boolean;
}

export function SoundEffectsController({ compact = false }: SoundEffectsControllerProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [muted, setMuted] = useState<boolean>(isSfxMuted());

  const handleToggle = () => {
    const isNowEnabled = toggleSfx();
    setMuted(!isNowEnabled);
    if (isNowEnabled) {
      playCrystalChime(1318.5); // E6 crystal chime confirmation
    }
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      aria-label={muted ? 'Enable crystalline sound effects' : 'Mute crystalline sound effects'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer border select-none focus:outline-none focus:ring-2 ${
        isLight
          ? muted
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
            : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 shadow-xs'
          : muted
            ? 'bg-[#101426] hover:bg-[#181d38] text-purple-400/50 border-purple-900/40'
            : 'bg-[#111736] hover:bg-[#1b234f] text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
      }`}
      title={muted ? 'Crystal SFX: Muted (Click to enable)' : 'Crystal SFX: Active (Click to mute)'}
    >
      {muted ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          {!compact && <span>SFX OFF</span>}
        </>
      ) : (
        <>
          <Volume2 className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`} />
          {!compact && <span>SFX ON</span>}
          <span className={`text-[9px] px-1 rounded ${
            isLight ? 'bg-purple-200/70 text-purple-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
          }`}>
            ✦
          </span>
        </>
      )}
    </button>
  );
}
