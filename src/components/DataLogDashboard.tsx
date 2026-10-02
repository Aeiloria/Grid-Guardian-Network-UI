import React, { useState } from 'react';
import { Database, Lock, Unlock, Key, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { WellnessLog, CustomPin } from '../hooks/useIndexedDB';
import { decryptPayload } from '../utils/cryptoEngine';

interface DataLogDashboardProps {
  logs: WellnessLog[];
  pins: CustomPin[];
}

export function DataLogDashboard({ logs, pins }: DataLogDashboardProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'pins'>('logs');
  const [secretPassphrase, setSecretPassphrase] = useState<string>('GRID_GUARDIAN_SECURE_TOKEN_2099');
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
    <div className="p-4 border-b border-[#1a2636] bg-[#050a14] text-[#c0d4ec]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00ffcc]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            ENCRYPTED TELEMETRY STORE (INDEXEDDB / AES-GCM)
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/50 font-bold'
                : 'text-[#6b85a8] hover:text-white'
            }`}
          >
            WELLNESS LOGS ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
              activeTab === 'pins'
                ? 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/50 font-bold'
                : 'text-[#6b85a8] hover:text-white'
            }`}
          >
            CUSTOM PINS ({pins.length})
          </button>
        </div>
      </div>

      {/* Symmetric Key Configuration */}
      <div className="bg-[#091121] border border-[#1a2940] p-2.5 rounded mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Key className="w-3.5 h-3.5 text-[#ffaa00]" />
          <span className="text-[10px] font-bold text-[#7997be] whitespace-nowrap">LOCAL AES KEY TOKEN:</span>
          <input
            type="password"
            value={secretPassphrase}
            onChange={(e) => setSecretPassphrase(e.target.value)}
            className="bg-[#040810] border border-[#1f314c] rounded px-2 py-0.5 text-xs text-[#00ffcc] font-mono flex-1 focus:outline-none focus:border-[#00ffcc]"
          />
        </div>
        <span className="text-[9px] text-[#4d6687] font-mono hidden sm:inline">256-BIT SHA DERIVED</span>
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
                className="bg-[#08101d] border border-[#19273c] p-2.5 rounded text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[#00ffcc] font-bold text-[11px]">
                    {log.type}
                  </span>
                  <span className="text-[9px] font-mono text-[#5b7596]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#8aa5c7] mb-1 font-mono">
                  <span>HR: {log.heartRateBefore} → {log.heartRateAfter} BPM</span>
                  <span className="text-[#38ef7d]">Δ -{log.heartRateBefore - log.heartRateAfter} BPM Vagal Drop</span>
                </div>

                {log.notes && (
                  <div className="text-[10px] text-[#6e89ac] mb-1">
                    NOTE: {log.notes}
                  </div>
                )}

                {log.encryptedData && (
                  <div className="mt-1 pt-1 border-t border-[#131e30] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#ffaa00] truncate">
                      <Lock className="w-3 h-3 text-[#ffaa00]" />
                      <span className="truncate">
                        {isDecrypted ? decryptedState[log.id] : `ENVELOPE: ${log.encryptedData.substring(0, 24)}...`}
                      </span>
                    </div>

                    {!isDecrypted ? (
                      <button
                        onClick={() => handleDecrypt(log.id, log.encryptedData)}
                        className="px-2 py-0.5 bg-[#142236] hover:bg-[#1f3452] text-[#00ffcc] text-[9px] font-mono rounded border border-[#233b5c] cursor-pointer"
                      >
                        DECRYPT
                      </button>
                    ) : (
                      <span className="text-[9px] text-[#38ef7d] font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                )}

                {error && <div className="text-[9px] text-[#ff3366] mt-1">{error}</div>}
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
              className="bg-[#08101d] border border-[#19273c] p-2.5 rounded text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-[11px]">{pin.name}</span>
                <span className="text-[9px] font-mono bg-[#142236] text-[#00e1ff] px-1.5 py-0.5 rounded">
                  {pin.classification}
                </span>
              </div>
              <div className="text-[10px] text-[#718dae] font-mono">
                COORD: {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </div>
              {pin.notes && <div className="text-[10px] text-[#556e8f] mt-1">{pin.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
