import React, { useState, useEffect } from 'react';
import { MasterGridDashboard } from './components/MasterGridDashboard';
import { BiometricActionDeck } from './components/BiometricActionDeck';
import { AudioConfigMenu } from './components/AudioConfigMenu';
import { WaveAnalyzer } from './components/WaveAnalyzer';
import { FuturisticMap } from './components/FuturisticMap';
import { DataLogDashboard } from './components/DataLogDashboard';
import { SyncMonitorDeck } from './components/SyncMonitorDeck';
import { PerfTesterDeck } from './components/PerfTesterDeck';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { useBleBiometrics } from './hooks/useBleBiometrics';
import { useIndexedDB } from './hooks/useIndexedDB';
import { startAudioProtectionFreq, stopAudioProtectionFreq, getAnalyserNode } from './utils/audioEngine';

export default function App() {
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(432.0);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const GATESVILLE_LAT = 31.4351;
  const GATESVILLE_LON = -97.7439;

  const { heartRate, isBleConnected, connectGattDevice, disconnectGattDevice } = useBleBiometrics();
  const { wellnessLogs, customPins, saveWellnessLog } = useIndexedDB();

  useEffect(() => {
    setAnalyser(isAudioActive ? getAnalyserNode() : null);
  }, [isAudioActive]);

  useEffect(() => {
    const runNetworkAudit = () => {
      if ('performance' in window) {
        const resourceLogs = performance.getEntriesByType('resource');
        resourceLogs.forEach((resource: any) => {
          if (resource.name && (resource.name.includes('sw.js') || resource.name.includes('assets/') || resource.name.includes('arcgis'))) {
            const name = resource.name.split('/').pop() || 'resource';
            console.log(`📦 [RESOURCE] ${name} | Wire: ${(resource.transferSize / 1024).toFixed(2)}KB | Unpacked: ${(resource.decodedBodySize / 1024).toFixed(2)}KB`);
          }
        });
      }
    };
    const timer = setTimeout(runNetworkAudit, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleActionTrigger = (actionType: string) => {
    if (actionType === 'ANUHAZI_CHANT') {
      if (isAudioActive) {
        stopAudioProtectionFreq();
        setIsAudioActive(false);
      } else {
        startAudioProtectionFreq(frequency, waveType);
        setIsAudioActive(true);
      }
    } else if (actionType === 'YOGA_STRETCH') {
      saveWellnessLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'YOGA_STRETCH',
        heartRateBefore: heartRate || 75,
        heartRateAfter: 70,
        notes: 'Vagus nerve calibration routine completed'
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#020408', minHeight: '100vh', paddingBottom: '30px', fontFamily: 'monospace' }}>
      <div style={{
        backgroundColor: isAudioActive ? '#00ffcc' : '#101726',
        color: isAudioActive ? '#0a0f1d' : '#8fa0ba',
        padding: '8px',
        textAlign: 'center',
        fontSize: '0.8em',
        fontWeight: 'bold',
        borderBottom: '1px solid #1a2636',
        letterSpacing: '0.05em'
      }}>
        {isAudioActive ? '🔊 VECTOR MODULATION ACTIVE LOCK' : 'HUB STANDBY // SCALAR DATA ARRAYS OFFLINE'}
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#060a13', boxShadow: '0 0 30px rgba(0,0,0,0.7)' }}>
        <MasterGridDashboard />
        <FuturisticMap centerLat={GATESVILLE_LAT} centerLon={GATESVILLE_LON} />
        <WaveAnalyzer analyserNode={analyser} isAudioActive={isAudioActive} />
        
        <AudioConfigMenu 
          activeFreq={frequency}
          activeWave={waveType}
          isAudioActive={isAudioActive}
          onSettingsChange={(f, w) => {
            setFrequency(f);
            setWaveType(w);
            if (isAudioActive) startAudioProtectionFreq(f, w);
          }}
        />

        <BiometricActionDeck 
          heartRateBpm={heartRate || 75}
          hrvMs={isBleConnected ? 62 : 45}
          isBleConnected={isBleConnected}
          onTriggerRoutine={handleActionTrigger}
        />

        <SyncMonitorDeck />
        <PerfTesterDeck />
        <DataLogDashboard logs={wellnessLogs} pins={customPins} />

        <div style={{ padding: '0 20px 20px 20px' }}>
          <button
            onClick={isBleConnected ? disconnectGattDevice : connectGattDevice}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isBleConnected ? 'rgba(255,0,51,0.1)' : 'rgba(0,255,204,0.05)',
              color: isBleConnected ? '#ff0033' : '#00ffcc',
              border: `1px solid ${isBleConnected ? '#ff0033' : '#1a2636'}`,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}
          >
            {isBleConnected ? '❌ DISCONNECT WEARABLE SENSOR' : '🔗 SYNC BIOMETRIC DEVICE'}
          </button>
        </div>
      </div>
      <PwaUpdatePrompt />
    </div>
  );
}
