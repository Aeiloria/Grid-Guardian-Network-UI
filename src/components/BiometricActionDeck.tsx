import React from 'react';
import { Heart, Activity, Volume2, ShieldCheck, Flame, Zap } from 'lucide-react';

interface BiometricActionDeckProps {
  heartRateBpm: number;
  hrvMs: number;
  isBleConnected: boolean;
  onTriggerRoutine: (actionType: string) => void;
}

export function BiometricActionDeck({
  heartRateBpm,
  hrvMs,
  isBleConnected,
  onTriggerRoutine
}: BiometricActionDeckProps) {
  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#070c17] text-[#c0d4ec]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ff3366] animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            BIOMETRIC TELEMETRY & ROUTINE DECK
          </h2>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            isBleConnected
              ? 'text-[#00ffcc] border-[#00ffcc]/30 bg-[#00ffcc]/10'
              : 'text-[#ffaa00] border-[#ffaa00]/30 bg-[#ffaa00]/10'
          }`}
        >
          {isBleConnected ? 'GATT LINKED' : 'LOCAL SENSOR PROXY'}
        </span>
      </div>

      {/* Biometric Vital Displays */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#0b1222] border border-[#1a2636] p-2.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#5e779b] font-bold">HEART RATE</div>
            <div className="text-xl font-black text-[#ff3366] font-mono flex items-baseline gap-1">
              {heartRateBpm} <span className="text-[10px] text-[#708aa8]">BPM</span>
            </div>
          </div>
          <Heart className="w-6 h-6 text-[#ff3366] animate-bounce" />
        </div>

        <div className="bg-[#0b1222] border border-[#1a2636] p-2.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#5e779b] font-bold">HRV INTERVAL</div>
            <div className="text-xl font-black text-[#00ffcc] font-mono flex items-baseline gap-1">
              {hrvMs} <span className="text-[10px] text-[#708aa8]">MS</span>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-[#00ffcc]" />
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onTriggerRoutine('ANUHAZI_CHANT')}
          className="p-3 bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] rounded text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00ffcc]">
              ROUTINE 01
            </span>
            <Volume2 className="w-4 h-4 text-[#00ffcc] group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-bold text-xs text-[#ffffff]">ANUHAZI FREQ LOCK</div>
          <div className="text-[10px] text-[#7ea1c9] mt-0.5">Toggle 432Hz scalar acoustic shield</div>
        </button>

        <button
          onClick={() => onTriggerRoutine('YOGA_STRETCH')}
          className="p-3 bg-[#38ef7d]/10 hover:bg-[#38ef7d]/20 border border-[#38ef7d]/40 text-[#38ef7d] rounded text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#38ef7d]">
              ROUTINE 02
            </span>
            <Flame className="w-4 h-4 text-[#38ef7d] group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-bold text-xs text-[#ffffff]">YOGA & BIO-RESET</div>
          <div className="text-[10px] text-[#7ea1c9] mt-0.5">Log vagal coherence & stretch sequence</div>
        </button>
      </div>
    </div>
  );
}
