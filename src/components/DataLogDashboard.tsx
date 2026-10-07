import React, { useState } from 'react';
import { Database, Lock, Key, CheckCircle2, Gem } from 'lucide-react';
import { WellnessLog, CustomPin } from '../hooks/useIndexedDB';
import { decryptPayload } from '../utils/cryptoEngine';
import { useTheme } from '../context/ThemeContext';

interface DataLogDashboardProps {
  logs: WellnessLog[];
  pins: CustomPin[];
}

export function DataLogDashboard({ logs, pins }: DataLogDashboardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'logs' | 'pins'>('logs');
  const [secretPassphrase, setSecretPassphrase] = useState<string>('CRYSTAL_GUARDIAN_SECURE_TOKEN_2099');
  const [decryptedState, setDecryptedState] = useState<Record<string, string>>({});
  const [decryptErrors, setDecryptErrors] = useState<Record<string, string>>({});

  const handleDecrypt = async (id: string, cipherEnvelope?: string) => {
    if (!cipherEnvelope) return;
    try {
      const plain = await decryptPayload(cipherEnvelope, secretPassphrase);
      setDecryptedState(prev => ({ ...prev, [id]: plain }));
      setDecryptErrors(prev => ({ ...prev, [id]: '' }));
    } catch {
      setDecryptErrors(prev => ({ ...prev, [id]: 'Decryption Failed: Bad Passphrase' }));
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
          <Database className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            ENCRYPTED CRYSTAL TELEMETRY STORE (AES-GCM)
          </h2>
        </div>
        <div className={`flex items-center gap-1 p-0.5 rounded border ${
          isLight ? 'bg-purple-50 border-purple-200' : 'bg-[#0a0e28] border-purple-800/40'
        }`}>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
              activeTab === 'logs'
                ? isLight
                  ? 'bg-white text-purple-950 shadow-xs font-black'
                  : 'bg-gradient-to-r from-purple-900/60 to-cyan-900/60 text-cyan-200 font-bold border border-cyan-400/40'
                : isLight
                  ? 'text-purple-800 hover:text-purple-950'
                  : 'text-purple-300/70 hover:text-white'
            }`}
          >
            WELLNESS ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
              activeTab === 'pins'
                ? isLight
                  ? 'bg-white text-purple-950 shadow-xs font-black'
                  : 'bg-gradient-to-r from-purple-900/60 to-cyan-900/60 text-cyan-200 font-bold border border-cyan-400/40'
                : isLight
                  ? 'text-purple-800 hover:text-purple-950'
                  : 'text-purple-300/70 hover:text-white'
            }`}
          >
            CRYSTAL PINS ({pins.length})
          </button>
        </div>
      </div>

      {/* Symmetric Key Configuration */}
      <div className={`p-2.5 rounded border mb-3 flex items-center justify-between gap-2 transition-colors ${
        isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#090d26] border-purple-500/25'
      }`}>
        <div className="flex items-center gap-2 flex-1">
          <Key className="w-3.5 h-3.5 text-amber-500" />
          <span className={`text-[10px] font-bold whitespace-nowrap ${isLight ? 'text-purple-900' : 'text-purple-200'}`}>
            CRYSTAL AES KEY TOKEN:
          </span>
          <input
            type="password"
            value={secretPassphrase}
            onChange={(e) => setSecretPassphrase(e.target.value)}
            className={`rounded px-2 py-0.5 text-xs font-mono flex-1 border focus:outline-none transition-colors ${
              isLight
                ? 'bg-slate-50 border-purple-200 text-slate-800 focus:border-purple-600'
                : 'bg-[#050716] border-purple-500/40 text-cyan-300 focus:border-cyan-400'
            }`}
          />
        </div>
        <span className={`text-[9px] font-mono hidden sm:inline ${isLight ? 'text-purple-600' : 'text-purple-400/70'}`}>
          256-BIT LATTICE KEY
        </span>
      </div>

      {/* Logs View */}
      {activeTab === 'logs' && (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {logs.map((log) => {
            const isDecrypted = Boolean(decryptedState[log.id]);
            const error = decryptErrors[log.id];

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded border text-xs transition-all relative overflow-hidden ${
                  isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#090d24] border-purple-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono font-bold text-[11px] flex items-center gap-1 ${
                    isLight ? 'text-purple-800' : 'text-cyan-300'
                  }`}>
                    <Gem className="w-3 h-3 text-purple-400" /> {log.type}
                  </span>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-purple-300/70'}`}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className={`flex items-center gap-3 text-[11px] mb-1 font-mono ${
                  isLight ? 'text-slate-700' : 'text-[#a1b8e0]'
                }`}>
                  <span>HR: {log.heartRateBefore} → {log.heartRateAfter} BPM</span>
                  <span className="text-emerald-400 font-bold">
                    Δ -{log.heartRateBefore - log.heartRateAfter} BPM Vagal Coherence
                  </span>
                </div>

                {log.notes && (
                  <div className={`text-[10px] mb-1 ${isLight ? 'text-slate-600' : 'text-purple-200/80'}`}>
                    NOTE: {log.notes}
                  </div>
                )}

                {log.encryptedData && (
                  <div className={`mt-1 pt-1 border-t flex items-center justify-between gap-2 ${
                    isLight ? 'border-purple-100' : 'border-purple-950/60'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono truncate text-amber-500">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span className="truncate">
                        {isDecrypted ? decryptedState[log.id] : `ENVELOPE: ${log.encryptedData.substring(0, 24)}...`}
                      </span>
                    </div>

                    {!isDecrypted ? (
                      <button
                        onClick={() => handleDecrypt(log.id, log.encryptedData)}
                        className={`px-2 py-0.5 text-[9px] font-mono rounded border cursor-pointer ${
                          isLight
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300'
                            : 'bg-[#141b3d] hover:bg-[#1d2757] text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        DECRYPT
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                )}

                {error && <div className="text-[9px] text-rose-500 mt-1 font-bold">{error}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Pins View */}
      {activeTab === 'pins' && (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className={`p-2.5 rounded border text-xs transition-all ${
                isLight ? 'bg-white border-purple-200 shadow-xs' : 'bg-[#090d24] border-purple-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-[11px] flex items-center gap-1 ${isLight ? 'text-purple-950' : 'text-white'}`}>
                  <Gem className="w-3 h-3 text-cyan-400" /> {pin.name}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isLight ? 'bg-cyan-50 text-cyan-900 border-cyan-200' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                }`}>
                  {pin.classification}
                </span>
              </div>
              <div className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-purple-300/70'}`}>
                COORD: {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </div>
              {pin.notes && <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-[#7e91bd]'}`}>{pin.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
