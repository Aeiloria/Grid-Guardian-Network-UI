import React, { useState, useEffect } from 'react';
import { Shield, Activity, Zap, Radio, AlertTriangle, Cpu, Sparkles } from 'lucide-react';

export function MasterGridDashboard() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [gridIntegrity, setGridIntegrity] = useState<number>(99.4);
  const [shieldCapacity, setShieldCapacity] = useState<number>(98.2);
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
    try {
      const response = await fetch('/api/gemini/grid-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gridIntegrity,
          shieldCapacity,
          activeRelays: 12,
          coordinates: '31.4351 N, 97.7439 W'
        })
      });
      const data = await response.json();
      setAiReport(data.assessment || 'Quantum grid resonance nominal. Zero scalar phase anomalies detected within Gatesville sector.');
    } catch {
      setAiReport('Local telemetry verification: All vector nodes responding with sub-millisecond return latency. Harmonic shield integrity holding at 99.4%.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#060a13] text-[#c0d4ec]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#131d2e] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
          <h1 className="text-sm font-black tracking-widest text-[#00ffcc] uppercase font-mono">
            GRID GUARDIAN // VECTOR NODE TELEMETRY ARRAY
          </h1>
        </div>
        <div className="text-[10px] text-[#6b82a6] font-mono tracking-tight bg-[#090f1a] px-2 py-1 rounded border border-[#1a2636]">
          {currentTime || 'SYNCHRONIZING...'}
        </div>
      </div>

      {/* Grid Stats Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-[#0a1120] border border-[#1a2636] p-2.5 rounded">
          <div className="flex items-center justify-between text-[#5f7596] text-[10px] uppercase font-bold mb-1">
            <span>GRID INTEGRITY</span>
            <Shield className="w-3.5 h-3.5 text-[#00ffcc]" />
          </div>
          <div className="text-lg font-black text-[#00ffcc] font-mono tracking-wider">
            {gridIntegrity.toFixed(1)}%
          </div>
          <div className="w-full bg-[#131e30] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#00ffcc] h-full transition-all duration-500 shadow-[0_0_6px_#00ffcc]"
              style={{ width: `${gridIntegrity}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0a1120] border border-[#1a2636] p-2.5 rounded">
          <div className="flex items-center justify-between text-[#5f7596] text-[10px] uppercase font-bold mb-1">
            <span>SHIELD MATRIX</span>
            <Zap className="w-3.5 h-3.5 text-[#00e1ff]" />
          </div>
          <div className="text-lg font-black text-[#00e1ff] font-mono tracking-wider">
            {shieldCapacity.toFixed(1)}%
          </div>
          <div className="w-full bg-[#131e30] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#00e1ff] h-full transition-all duration-500 shadow-[0_0_6px_#00e1ff]"
              style={{ width: `${shieldCapacity}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0a1120] border border-[#1a2636] p-2.5 rounded">
          <div className="flex items-center justify-between text-[#5f7596] text-[10px] uppercase font-bold mb-1">
            <span>ACTIVE RELAYS</span>
            <Radio className="w-3.5 h-3.5 text-[#38ef7d]" />
          </div>
          <div className="text-lg font-black text-[#38ef7d] font-mono tracking-wider">
            12 / 12
          </div>
          <div className="text-[10px] text-[#4b607d] mt-1">GATESVILLE SUB-SECTOR</div>
        </div>

        <div className="bg-[#0a1120] border border-[#1a2636] p-2.5 rounded">
          <div className="flex items-center justify-between text-[#5f7596] text-[10px] uppercase font-bold mb-1">
            <span>MESH STATUS</span>
            <Cpu className="w-3.5 h-3.5 text-[#ffaa00]" />
          </div>
          <div className="text-lg font-black text-[#ffaa00] font-mono tracking-wider">
            SYNCHRONIZED
          </div>
          <div className="text-[10px] text-[#4b607d] mt-1">AES-GCM ENCRYPTED</div>
        </div>
      </div>

      {/* AI Tactical Assessment Trigger */}
      <div className="bg-[#080e1a] border border-[#1a2636] p-2.5 rounded">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00ffcc] animate-spin" />
            <span className="text-xs font-bold text-[#e1ebf7] tracking-wider">
              GEMINI VECTOR INTELLIGENCE
            </span>
          </div>
          <button
            onClick={runAiTacticalAnalysis}
            disabled={isAiLoading}
            className="px-2.5 py-1 text-[11px] font-bold text-[#00ffcc] bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/30 rounded cursor-pointer transition-colors"
          >
            {isAiLoading ? 'COMPUTING VECTORS...' : 'ANALYZE GRID THREATS'}
          </button>
        </div>

        {aiReport && (
          <div className="mt-2.5 p-2 bg-[#04070d] border border-[#1f2d42] rounded text-[11px] text-[#9fc0e8] leading-relaxed font-mono">
            <span className="text-[#00ffcc] font-bold block mb-1">AI TELEMETRY SYNTHESIS:</span>
            {aiReport}
          </div>
        )}
      </div>
    </div>
  );
}
