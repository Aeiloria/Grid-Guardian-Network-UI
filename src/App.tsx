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
import { ThemeToggle } from './components/ThemeToggle';
import { SoundEffectsController } from './components/SoundEffectsController';
import { QuantumLatencyMonitor } from './components/QuantumLatencyMonitor';
import { useBleBiometrics } from './hooks/useBleBiometrics';
import { useIndexedDB } from './hooks/useIndexedDB';
import { startAudioProtectionFreq, stopAudioProtectionFreq, getAnalyserNode } from './utils/audioEngine';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Gem, Sparkles, Orbit } from 'lucide-react';

function GridGuardianApp() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isQuantumShieldActive, setIsQuantumShieldActive] = useState<boolean>(false);
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
        notes: 'Quartz chakra & vagal crystal calibration completed'
      });
    }
  };

  return (
    <div
      className={`min-h-screen pb-12 font-mono transition-colors duration-300 relative ${
        isQuantumShieldActive ? 'quantum-shield-active' : ''
      } ${
        isLight ? 'bg-gradient-to-br from-slate-100 via-purple-50/30 to-cyan-50/40 text-slate-900' : 'bg-gradient-to-br from-[#04060f] via-[#090b1c] to-[#040817] text-[#c0d4ec]'
      }`}
    >
      {/* Background ambient crystal lattice lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600 rounded-full blur-[140px]" />
      </div>

      {/* Top Vector Modulation Status Bar */}
      <div
        className={`px-4 py-2.5 text-xs font-bold tracking-wider transition-colors border-b flex flex-wrap items-center justify-between gap-2 relative z-10 backdrop-blur-md ${
          isAudioActive
            ? isLight
              ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-700 text-white border-purple-800 shadow-md'
              : 'bg-gradient-to-r from-purple-900/90 via-cyan-900/90 to-pink-900/90 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : isLight
              ? 'bg-white/90 text-purple-950 border-purple-200 shadow-xs'
              : 'bg-[#0a0d20]/90 text-purple-300 border-purple-950/70'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isAudioActive ? 'bg-cyan-400' : 'bg-purple-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isAudioActive ? 'bg-cyan-300' : 'bg-purple-500'
            }`} />
          </span>
          <span className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[11px]">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            {isAudioActive
              ? `🔊 432Hz QUARTZ RESONANCE ACTIVE // PRISMATIC SHIELD LOCKED`
              : `CYBER-CRYSTAL LATTICE STANDBY // AWAITING SCALAR PULSE`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SoundEffectsController />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Command Console Card with Prismatic Iridescent Border */}
      <div className="max-w-3xl mx-auto my-5 px-3 relative z-10">
        <div
          className={`rounded-xl overflow-hidden border transition-all duration-300 ${
            isLight
              ? 'bg-white/95 border-purple-200 shadow-[0_12px_40px_rgba(147,51,234,0.1)]'
              : 'bg-[#080b1f]/95 border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.2)]'
          }`}
        >
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
            isQuantumShieldActive={isQuantumShieldActive}
            onToggleQuantumShield={() => setIsQuantumShieldActive(prev => !prev)}
            onTriggerRoutine={handleActionTrigger}
          />

          <SyncMonitorDeck />
          <PerfTesterDeck />
          <QuantumLatencyMonitor />
          <DataLogDashboard logs={wellnessLogs} pins={customPins} />

          {/* Biometric Connect Trigger */}
          <div className="p-4 bg-transparent">
            <button
              onClick={isBleConnected ? disconnectGattDevice : connectGattDevice}
              className={`w-full p-3.5 font-black font-mono text-xs rounded border transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 group ${
                isBleConnected
                  ? isLight
                    ? 'bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-800 border-rose-300'
                    : 'bg-gradient-to-r from-rose-950/60 to-purple-950/60 hover:from-rose-900/70 hover:to-purple-900/70 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : isLight
                    ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-700 hover:opacity-95 text-white border-purple-800'
                    : 'bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 hover:from-cyan-500/30 hover:to-pink-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              }`}
            >
              <Gem className="w-4 h-4 transition-transform group-hover:rotate-45" />
              <span>
                {isBleConnected ? '✦ DISENGAGE WEARABLE CRYSTAL SENSOR' : '✦ SYNC BIOMETRIC CRYSTAL SENSOR (BLE GATT)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <PwaUpdatePrompt />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GridGuardianApp />
    </ThemeProvider>
  );
}
