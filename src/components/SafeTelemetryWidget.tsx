import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Radio, RefreshCw, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { playQuartzClick } from '../utils/crystalSoundEngine';

// Define a TypeScript interface for your telemetry item
export interface TelemetryItem {
  id: string;
  value: number;
  timestamp: string;
}

export const SafeTelemetryWidget: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // 1. Initialize state with safe defaults (empty array instead of undefined)
  const [metrics, setMetrics] = useState<TelemetryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating an asynchronous data fetch with live server verification
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/health').catch(() => null);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (res && res.ok) {
          const healthData = await res.json().catch(() => ({}));
          const latencySample = healthData?.server_time ? 18 : 24;
          const data: TelemetryItem[] = [
            { id: 'PKT-GV-01', value: latencySample, timestamp: now },
            { id: 'PKT-GV-02', value: 32, timestamp: now },
            { id: 'PKT-GV-03', value: 14, timestamp: now },
          ];
          setMetrics(data);
        } else {
          // Simulated fallback API response data
          const data: TelemetryItem[] = [
            { id: 'PKT-GV-01', value: 42, timestamp: '12:00 PM' },
            { id: 'PKT-GV-02', value: 58, timestamp: '12:05 PM' },
            { id: 'PKT-GV-03', value: 29, timestamp: '12:10 PM' },
          ];
          setMetrics(data);
        }
      } catch (err) {
        setError('Failed to load telemetry data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  if (loading) {
    return (
      <div className={`p-4 border-t flex items-center justify-center gap-2 font-mono text-xs ${
        isLight ? 'bg-purple-50/50 text-purple-700 border-purple-200' : 'bg-[#060818] text-cyan-400 border-purple-900/50'
      }`}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        <span>Loading secure feeds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 border-t flex items-center gap-2 font-mono text-xs ${
        isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
      }`}>
        <AlertCircle className="w-4 h-4 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 border-t font-mono transition-colors ${
      isLight
        ? 'bg-gradient-to-br from-white to-purple-50/20 border-purple-200 text-slate-800'
        : 'bg-[#060818] border-purple-900/50 text-[#c0d4ec]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-purple-950' : 'text-cyan-300'
          }`}>
            Live Telemetry Stream
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold">
          BUFFER: {metrics?.length ?? 0} ITEMS
        </span>
      </div>
      
      {/* 2. Use optional chaining (?.) to safeguard against empty or uninitialized arrays */}
      {metrics?.length === 0 ? (
        <p className="text-gray-400 text-xs">No active data packets detected.</p>
      ) : (
        <ul className="space-y-2">
          {metrics?.map((item) => (
            <li
              key={item?.id ?? Math.random().toString()}
              className={`flex justify-between items-center text-xs border-b pb-1.5 transition-colors ${
                isLight ? 'border-purple-100 text-slate-700' : 'border-slate-800/80 text-slate-300'
              }`}
            >
              <span className="font-bold">Packet ID: {item?.id ?? 'UNKNOWN'}</span>
              <span className="text-cyan-400 font-semibold">{item?.value ?? 0} ms</span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                {item?.timestamp ?? 'N/A'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
