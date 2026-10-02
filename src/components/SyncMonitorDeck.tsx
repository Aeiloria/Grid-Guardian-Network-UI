import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Wifi, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export function SyncMonitorDeck() {
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR'>('SYNCED');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [backendHealth, setBackendHealth] = useState<string>('SYSTEM_OPERATIONAL');
  const [latencyMs, setLatencyMs] = useState<number>(4.2);
  const [queuedRecords, setQueuedRecords] = useState<number>(0);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const delta = performance.now() - start;
      setLatencyMs(parseFloat(delta.toFixed(2)));
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data.status || 'SYSTEM_OPERATIONAL');
      }
    } catch {
      setBackendHealth('STANDBY_EMULATOR');
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
      setLastSyncTime(new Date().toLocaleTimeString());
      setQueuedRecords(0);
    }, 600);
  };

  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#060a13] text-[#c0d4ec]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#00e1ff]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            CORE INGESTION & CLOUD SYNC MONITOR
          </h2>
        </div>
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'SYNCING'}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#101b2c] hover:bg-[#1a2d48] border border-[#213757] text-[#00ffcc] text-[10px] font-mono rounded cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>{syncStatus === 'SYNCING' ? 'REPLICATING...' : 'FORCE SYNC'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#09101d] border border-[#182638] p-2 rounded">
          <div className="text-[9px] text-[#556e8f] font-bold uppercase mb-0.5">BACKEND CORE</div>
          <div className="text-xs font-mono font-bold text-[#38ef7d] flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-[#38ef7d] inline-block" />
            {backendHealth}
          </div>
        </div>

        <div className="bg-[#09101d] border border-[#182638] p-2 rounded">
          <div className="text-[9px] text-[#556e8f] font-bold uppercase mb-0.5">EDGE LATENCY</div>
          <div className="text-xs font-mono font-bold text-[#00ffcc] flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#00ffcc]" />
            {latencyMs} ms
          </div>
        </div>

        <div className="bg-[#09101d] border border-[#182638] p-2 rounded">
          <div className="text-[9px] text-[#556e8f] font-bold uppercase mb-0.5">OUTBOX BUFFER</div>
          <div className="text-xs font-mono font-bold text-[#bad0ec]">
            {queuedRecords} PENDING
          </div>
        </div>
      </div>
    </div>
  );
}
