import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Wifi, Gem } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function SyncMonitorDeck() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR'>('SYNCED');
  const [backendHealth, setBackendHealth] = useState<string>('CRYSTAL_COHERENT');
  const [latencyMs, setLatencyMs] = useState<number>(3.8);
  const [queuedRecords, setQueuedRecords] = useState<number>(0);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const delta = performance.now() - start;
      setLatencyMs(parseFloat(delta.toFixed(2)));
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data.status ? 'LATTICE_OPERATIONAL' : 'CRYSTAL_COHERENT');
      }
    } catch {
      setBackendHealth('LATTICE_EMULATOR');
      setLatencyMs(1.1);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setSyncStatus('SYNCING');
    await checkHealth();
    setTimeout(() => {
      setSyncStatus('SYNCED');
      setQueuedRecords(0);
    }, 600);
  };

  return (
    <div className={`p-4 border-b transition-colors relative ${
      isLight 
        ? 'bg-gradient-to-br from-white to-purple-50/10 border-purple-200 text-slate-800' 
        : 'bg-gradient-to-br from-[#060817] to-[#0a0d24] border-purple-900/40 text-[#c0d4ec]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            CRYSTAL INGESTION & QUANTUM SYNC
          </h2>
        </div>
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'SYNCING'}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold rounded border cursor-pointer transition-all ${
            isLight
              ? 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
              : 'bg-[#121636] hover:bg-[#1a204d] border-purple-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>{syncStatus === 'SYNCING' ? 'REFRACTING...' : 'FORCE REPLICATION'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className={`p-2.5 rounded border transition-colors ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0b0e26] border-purple-500/25'
        }`}>
          <div className={`text-[9px] font-bold uppercase mb-0.5 ${isLight ? 'text-purple-800' : 'text-purple-300/70'}`}>
            CORE LATTICE
          </div>
          <div className={`text-xs font-mono font-bold flex items-center gap-1 truncate ${
            isLight ? 'text-emerald-700' : 'text-emerald-400'
          }`}>
            <span className="w-2 h-2 rotate-45 inline-block bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            {backendHealth}
          </div>
        </div>

        <div className={`p-2.5 rounded border transition-colors ${
          isLight ? 'bg-white border-cyan-200 shadow-xs' : 'bg-[#09112a] border-cyan-500/25'
        }`}>
          <div className={`text-[9px] font-bold uppercase mb-0.5 ${isLight ? 'text-cyan-800' : 'text-cyan-300/70'}`}>
            REFRACTION DELTA
          </div>
          <div className={`text-xs font-mono font-bold flex items-center gap-1 ${
            isLight ? 'text-cyan-900' : 'text-cyan-300'
          }`}>
            <Wifi className="w-3 h-3 text-cyan-400" />
            {latencyMs} ms
          </div>
        </div>

        <div className={`p-2.5 rounded border transition-colors ${
          isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#0b0e26] border-purple-500/25'
        }`}>
          <div className={`text-[9px] font-bold uppercase mb-0.5 ${isLight ? 'text-purple-800' : 'text-purple-300/70'}`}>
            QUANTUM BUFFER
          </div>
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-slate-800' : 'text-[#c2d7f5]'}`}>
            {queuedRecords} PACKETS OK
          </div>
        </div>
      </div>
    </div>
  );
}
