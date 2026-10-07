import React from 'react';
import { Sparkles, Gem, Disc } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isLight ? 'Obsidian Crystal Punk' : 'Diamond Prism White'} theme`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[11px] font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer border select-none focus:outline-none focus:ring-2 relative overflow-hidden group shadow-md ${
        isLight
          ? 'bg-gradient-to-r from-purple-50 via-white to-cyan-50 hover:from-purple-100 hover:to-cyan-100 text-purple-950 border-purple-300 focus:ring-purple-400'
          : 'bg-gradient-to-r from-[#17122b] via-[#0f172a] to-[#0c1a2d] hover:from-[#231b40] hover:to-[#122842] text-cyan-300 border-purple-500/40 focus:ring-cyan-400/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
      } ${className}`}
      title={`Active: ${isLight ? 'Diamond Prism (Light)' : 'Obsidian Crystal (Dark)'}. Click to refract.`}
    >
      {/* Prismatic Shimmer line on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      {isLight ? (
        <>
          <Gem className="w-3.5 h-3.5 text-purple-600 transition-transform duration-300 group-hover:rotate-45" />
          {!compact && <span className="bg-gradient-to-r from-purple-700 to-cyan-700 bg-clip-text text-transparent font-black">DIAMOND PRISM</span>}
          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">LIGHT</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:scale-125" />
          {!compact && <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-black">OBSIDIAN PUNK</span>}
          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-700/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]">CRYSTAL</span>
        </>
      )}
    </button>
  );
}
