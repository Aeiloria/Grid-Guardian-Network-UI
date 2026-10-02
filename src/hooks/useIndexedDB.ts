import { useState, useEffect, useCallback } from 'react';
import { encryptPayload, decryptPayload } from '../utils/cryptoEngine';

export interface WellnessLog {
  id: string;
  timestamp: string;
  type: string;
  heartRateBefore: number;
  heartRateAfter: number;
  notes?: string;
  encryptedData?: string;
}

export interface CustomPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  classification: string;
  isEncrypted: boolean;
  notes?: string;
  encryptedPayload?: string;
}

const DB_NAME = 'GridGuardianDB';
const DB_VERSION = 1;
const STORE_LOGS = 'wellness_logs';
const STORE_PINS = 'custom_pins';

const DEFAULT_SECRET_TOKEN = 'GRID_GUARDIAN_SECURE_TOKEN_2099';

export function useIndexedDB() {
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([
    {
      id: 'log-seed-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'YOGA_STRETCH',
      heartRateBefore: 84,
      heartRateAfter: 68,
      notes: 'Gatesville Central Relay Baseline Calibrated'
    },
    {
      id: 'log-seed-2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'ANUHAZI_CHANT',
      heartRateBefore: 79,
      heartRateAfter: 71,
      notes: '432Hz Scalar Harmonic Lock'
    }
  ]);

  const [customPins, setCustomPins] = useState<CustomPin[]>([
    {
      id: 'pin-gatesville-1',
      name: 'Gatesville Primary Substation Alpha',
      lat: 31.4351,
      lng: -97.7439,
      classification: 'POWER_GRID',
      isEncrypted: false,
      notes: 'High voltage step-down relay'
    },
    {
      id: 'pin-gatesville-2',
      name: 'Leon River Water Treatment Node',
      lat: 31.4285,
      lng: -97.7380,
      classification: 'WATER_UTILITY',
      isEncrypted: false,
      notes: 'Hydraulic telemetry beacon'
    },
    {
      id: 'pin-gatesville-3',
      name: 'Coryell Memorial Node B',
      lat: 31.4420,
      lng: -97.7510,
      classification: 'EMERGENCY_MEDICAL',
      isEncrypted: false,
      notes: 'Emergency critical infrastructure anchor'
    }
  ]);

  // Open IndexedDB connection
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_LOGS)) {
          db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PINS)) {
          db.createObjectStore(STORE_PINS, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Fetch initial records
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = await openDB();
        const tx = db.transaction([STORE_LOGS, STORE_PINS], 'readonly');
        const logsStore = tx.objectStore(STORE_LOGS);
        const pinsStore = tx.objectStore(STORE_PINS);

        const logsReq = logsStore.getAll();
        const pinsReq = pinsStore.getAll();

        tx.oncomplete = () => {
          if (!mounted) return;
          if (logsReq.result && logsReq.result.length > 0) {
            setWellnessLogs(logsReq.result);
          }
          if (pinsReq.result && pinsReq.result.length > 0) {
            setCustomPins(pinsReq.result);
          }
        };
      } catch (e) {
        console.info('Using memory/localStorage fallback for storage:', e);
        try {
          const storedLogs = localStorage.getItem('grid_wellness_logs');
          const storedPins = localStorage.getItem('grid_custom_pins');
          if (storedLogs) setWellnessLogs(JSON.parse(storedLogs));
          if (storedPins) setCustomPins(JSON.parse(storedPins));
        } catch {
          // Ignore fallback parse error
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [openDB]);

  const saveWellnessLog = useCallback(async (log: WellnessLog, secretToken: string = DEFAULT_SECRET_TOKEN) => {
    // Encrypt notes with AES-GCM
    let encryptedData: string | undefined = undefined;
    if (log.notes) {
      try {
        encryptedData = await encryptPayload(log.notes, secretToken);
      } catch (err) {
        console.error('Failed to encrypt log payload:', err);
      }
    }

    const payload: WellnessLog = {
      ...log,
      encryptedData
    };

    setWellnessLogs(prev => [payload, ...prev]);

    try {
      const db = await openDB();
      const tx = db.transaction([STORE_LOGS], 'readwrite');
      tx.objectStore(STORE_LOGS).put(payload);
    } catch {
      try {
        const existing = JSON.parse(localStorage.getItem('grid_wellness_logs') || '[]');
        localStorage.setItem('grid_wellness_logs', JSON.stringify([payload, ...existing]));
      } catch {
        // memory state remains
      }
    }
  }, [openDB]);

  const saveCustomPin = useCallback(async (pin: CustomPin, secretToken: string = DEFAULT_SECRET_TOKEN) => {
    let encryptedPayload: string | undefined = undefined;
    if (pin.isEncrypted && pin.notes) {
      try {
        encryptedPayload = await encryptPayload(pin.notes, secretToken);
      } catch (err) {
        console.error('Failed to encrypt pin payload:', err);
      }
    }

    const item: CustomPin = {
      ...pin,
      encryptedPayload
    };

    setCustomPins(prev => [...prev.filter(p => p.id !== item.id), item]);

    try {
      const db = await openDB();
      const tx = db.transaction([STORE_PINS], 'readwrite');
      tx.objectStore(STORE_PINS).put(item);
    } catch {
      try {
        const existing: CustomPin[] = JSON.parse(localStorage.getItem('grid_custom_pins') || '[]');
        localStorage.setItem('grid_custom_pins', JSON.stringify([...existing.filter(p => p.id !== item.id), item]));
      } catch {
        // memory state remains
      }
    }
  }, [openDB]);

  const decryptLogNotes = useCallback(async (compoundHex: string, secretToken: string = DEFAULT_SECRET_TOKEN): Promise<string> => {
    try {
      return await decryptPayload(compoundHex, secretToken);
    } catch {
      return 'DECRYPTION_ERROR: Invalid key or corrupted envelope';
    }
  }, []);

  return {
    wellnessLogs,
    customPins,
    saveWellnessLog,
    saveCustomPin,
    decryptLogNotes
  };
}
