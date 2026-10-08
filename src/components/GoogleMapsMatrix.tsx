// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Gem,
  Crosshair,
  Layers,
  Sparkles,
  Navigation,
  Compass,
  MapPin,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playQuartzClick, playCrystalChime, playShieldLockTone } from '../utils/crystalSoundEngine';
import type { GridNode } from './FuturisticMap';

interface GoogleMapsMatrixProps {
  centerLat: number;
  centerLon: number;
  nodes: GridNode[];
  onSelectNode: (node: GridNode) => void;
  onOpenModal: (node: GridNode) => void;
  onShieldNode: (node: GridNode) => Promise<void>;
  onShieldAll: () => Promise<void>;
  isShielding: boolean;
  isDroneOverlayActive: boolean;
  onToggleDroneOverlay: () => void;
  getCrystalFrequency: (type: string) => number;
  onSwitchToRadar?: () => void;
}

// Inner Controller for programmatic camera manipulation (recenter, pan)
function MapCameraController({ centerLat, centerLon, recenterTrigger }: { centerLat: number; centerLon: number; recenterTrigger: number }) {
  const map = useMap();

  useEffect(() => {
    if (map && recenterTrigger > 0) {
      map.panTo({ lat: centerLat, lng: centerLon });
      map.setZoom(14);
    }
  }, [map, recenterTrigger, centerLat, centerLon]);

  return null;
}

export function GoogleMapsMatrix({
  centerLat,
  centerLon,
  nodes,
  onSelectNode,
  onOpenModal,
  onShieldNode,
  onShieldAll,
  isShielding,
  isDroneOverlayActive,
  onToggleDroneOverlay,
  getCrystalFrequency,
  onSwitchToRadar
}: GoogleMapsMatrixProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Retrieve API Key: client-side env first, then backend fallback
  const [apiKey, setApiKey] = useState<string>(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [apiKeyLoading, setApiKeyLoading] = useState<boolean>(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [hasAuthError, setHasAuthError] = useState<boolean>(false);

  useEffect(() => {
    const onAuthFailure = () => {
      setHasAuthError(true);
    };
    window.addEventListener('gmp-auth-failure', onAuthFailure);
    return () => window.removeEventListener('gmp-auth-failure', onAuthFailure);
  }, []);

  const isKeyFormatValid = Boolean(apiKey && apiKey.startsWith('AIzaSy'));

  const [activeNode, setActiveNode] = useState<GridNode | null>(null);
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid');
  const [recenterCount, setRecenterCount] = useState<number>(0);

  // Simulated Aerial Drone Coordinates moving smoothly around Gatesville
  const [dronePositions, setDronePositions] = useState([
    { id: 'DRONE-01', callsign: 'Alpha-Patrol', lat: centerLat + 0.007, lng: centerLon - 0.008, alt: '420m', heading: 45 },
    { id: 'DRONE-02', callsign: 'Beta-Perimeter', lat: centerLat - 0.012, lng: centerLon + 0.015, alt: '510m', heading: 135 },
    { id: 'DRONE-03', callsign: 'Gamma-Citadel', lat: centerLat - 0.021, lng: centerLon + 0.018, alt: '380m', heading: 270 }
  ]);

  useEffect(() => {
    if (!apiKey) {
      fetch('/api/maps/config')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.apiKey) {
            setApiKey(data.apiKey);
          } else {
            setKeyError('Google Maps API Key not detected in environment.');
          }
        })
        .catch(err => {
          console.warn('Could not load Maps config:', err);
          setKeyError('Failed to load Maps configuration.');
        })
        .finally(() => setApiKeyLoading(false));
    } else {
      setApiKeyLoading(false);
    }
  }, [apiKey]);

  // Real-time orbital drone telemetry animation
  useEffect(() => {
    if (!isDroneOverlayActive) return;

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      const angle1 = (tick * 0.04) % (Math.PI * 2);
      const angle2 = (tick * 0.03 + 2) % (Math.PI * 2);
      const angle3 = (tick * 0.025 + 4) % (Math.PI * 2);

      setDronePositions([
        {
          id: 'DRONE-01',
          callsign: 'Alpha-Patrol',
          lat: centerLat + Math.sin(angle1) * 0.011,
          lng: centerLon + Math.cos(angle1) * 0.014,
          alt: `${Math.round(420 + Math.sin(tick * 0.1) * 25)}m`,
          heading: Math.round(((angle1 * 180) / Math.PI + 90) % 360)
        },
        {
          id: 'DRONE-02',
          callsign: 'Beta-Perimeter',
          lat: centerLat + 0.012 + Math.cos(angle2) * 0.015,
          lng: centerLon - 0.01 + Math.sin(angle2) * 0.018,
          alt: `${Math.round(510 + Math.cos(tick * 0.1) * 30)}m`,
          heading: Math.round(((angle2 * 180) / Math.PI + 180) % 360)
        },
        {
          id: 'DRONE-03',
          callsign: 'Gamma-Citadel',
          lat: centerLat - 0.02 + Math.sin(angle3) * 0.012,
          lng: centerLon + 0.018 + Math.cos(angle3) * 0.012,
          alt: `${Math.round(380 + Math.sin(tick * 0.12) * 20)}m`,
          heading: Math.round(((angle3 * 180) / Math.PI) % 360)
        }
      ]);
    }, 400);

    return () => clearInterval(interval);
  }, [isDroneOverlayActive, centerLat, centerLon]);

  const shieldedCount = nodes.filter(n => n.is_shielded).length;

  if (apiKeyLoading) {
    return (
      <div className="h-[420px] w-full flex flex-col items-center justify-center p-6 bg-slate-950/80 text-cyan-300 font-mono text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <div className="text-xs font-bold tracking-widest uppercase">Initializing Google Maps Platform Vector Engine...</div>
        <div className="text-[10px] text-slate-400 mt-1">Connecting to Sector 31-Gatesville Geospatial API</div>
      </div>
    );
  }

  if (!apiKey || !isKeyFormatValid || hasAuthError || keyError) {
    return (
      <div className={`h-[440px] w-full flex flex-col items-center justify-center p-6 text-center font-mono border rounded-lg transition-colors ${
        isLight ? 'bg-purple-50/70 border-purple-200 text-slate-800' : 'bg-[#050819] border-cyan-500/30 text-slate-200 shadow-xl'
      }`}>
        <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mb-3 text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider">
          {hasAuthError ? 'Google Maps Authentication Error' : 'Valid Google Maps API Key Required'}
        </h3>
        <p className="text-xs max-w-md mt-2 text-slate-400 leading-relaxed">
          {hasAuthError
            ? 'The Google Maps JavaScript API rejected the current key (InvalidKeyMapError). Please supply a standard Google Maps API key (format: AIzaSy...).'
            : !isKeyFormatValid
              ? 'Google Maps Platform requires a standard API key starting with "AIzaSy". The key in the current environment is an OAuth/session credential rather than a Google Maps API Key.'
              : keyError || 'Please configure your VITE_GOOGLE_MAPS_API_KEY to activate live geospatial vector & satellite telemetry.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {onSwitchToRadar && (
            <button
              onClick={() => {
                playQuartzClick();
                onSwitchToRadar();
              }}
              className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>RETURN TO TACTICAL RADAR</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[460px] rounded-lg overflow-hidden border border-purple-500/40 shadow-xl">
      <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
        {/* Top Floating Telemetry & Map Controls Toolbar */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Status Badge */}
          <div className={`px-2.5 py-1.5 rounded-md backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-2 shadow-md ${
            isLight
              ? 'bg-white/90 text-purple-900 border-purple-200'
              : 'bg-[#060919]/90 text-cyan-200 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
          }`}>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>GOOGLE MAPS // SECTOR 31-GATESVILLE</span>
            <span className="opacity-40">|</span>
            <span className="text-emerald-400">SHIELDS: {shieldedCount}/{nodes.length}</span>
          </div>

          {/* Quick Actions & View Modes */}
          <div className="flex items-center gap-1.5">
            {/* Map Type Selector */}
            <div className={`p-0.5 rounded-md backdrop-blur-md border flex items-center gap-1 text-[10px] font-mono font-bold ${
              isLight ? 'bg-white/90 border-purple-200' : 'bg-[#060919]/90 border-purple-900/50'
            }`}>
              <button
                onClick={() => {
                  playQuartzClick();
                  setMapTypeId('hybrid');
                }}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  mapTypeId === 'hybrid'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Satellite Imagery with Vector Overlays"
              >
                SATELLITE
              </button>
              <button
                onClick={() => {
                  playQuartzClick();
                  setMapTypeId('roadmap');
                }}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  mapTypeId === 'roadmap'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vector Roadmap"
              >
                ROADMAP
              </button>
              <button
                onClick={() => {
                  playQuartzClick();
                  setMapTypeId('terrain');
                }}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  mapTypeId === 'terrain'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Topographical Terrain"
              >
                TERRAIN
              </button>
            </div>

            {/* Recenter Gatesville Core */}
            <button
              onClick={() => {
                playQuartzClick();
                setRecenterCount(c => c + 1);
              }}
              className={`px-2.5 py-1.5 rounded-md backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                isLight
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                  : 'bg-[#090d24]/90 hover:bg-[#13193d] text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}
              title="Recenter on Gatesville Monolith Core"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">RECENTER</span>
            </button>

            {/* Drone Toggle */}
            <button
              onClick={() => {
                playQuartzClick();
                onToggleDroneOverlay();
              }}
              className={`px-2.5 py-1.5 rounded-md backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                isDroneOverlayActive
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 opacity-70'
              }`}
              title="Toggle Aerial Drone Patrols on Google Map"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDroneOverlayActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">DRONES ({isDroneOverlayActive ? 'ON' : 'OFF'})</span>
            </button>

            {/* Shield All Nodes Button */}
            <button
              onClick={() => {
                playShieldLockTone();
                onShieldAll();
              }}
              disabled={isShielding}
              className={`px-2.5 py-1.5 rounded-md backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  : 'bg-gradient-to-r from-emerald-900/90 to-cyan-900/90 hover:from-emerald-800 hover:to-cyan-800 text-emerald-200 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              }`}
              title="Engage Shields for all nodes on Google Map"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isShielding ? 'LOCKING...' : 'SHIELD ALL'}</span>
            </button>
          </div>
        </div>

        {/* The Google Map Container with explicit height to prevent height collapse (CF2) */}
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: centerLat, lng: centerLon }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Camera Controller */}
          <MapCameraController centerLat={centerLat} centerLon={centerLon} recenterTrigger={recenterCount} />

          {/* Central Monolith Core Landmark Marker */}
          <AdvancedMarker
            position={{ lat: centerLat, lng: centerLon }}
            title="Gatesville Core Crystal Monolith"
          >
            <div className="relative flex items-center justify-center cursor-pointer group">
              <div className="absolute w-10 h-10 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center">
                <Gem className="w-4 h-4 text-white -rotate-45" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Grid Node Advanced Markers */}
          {nodes.map(node => {
            const isSelected = activeNode?.node_id === node.node_id;
            return (
              <AdvancedMarker
                key={node.node_id}
                position={{ lat: node.latitude, lng: node.longitude }}
                title={`${node.name} (${node.classification})`}
                onClick={() => {
                  playQuartzClick();
                  setActiveNode(node);
                  onSelectNode(node);
                }}
              >
                <div className="relative flex flex-col items-center cursor-pointer group">
                  {/* Outer Pulsing Shield Aura */}
                  {node.is_shielded && (
                    <div
                      className="absolute -inset-2 rounded-full border border-cyan-400/50 animate-ping pointer-events-none"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  {/* Pin Element with Crystalline Aesthetics */}
                  <Pin
                    background={node.is_shielded ? node.color : '#ef4444'}
                    borderColor={node.is_shielded ? '#ffffff' : '#fca5a5'}
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.4 : 1.15}
                  >
                    <span className="text-[12px] select-none">
                      {node.is_shielded ? '💎' : '⚠️'}
                    </span>
                  </Pin>

                  {/* Compact Node Label Callout */}
                  <div
                    className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md border ${
                      node.is_shielded
                        ? 'bg-slate-950/85 text-cyan-200 border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                        : 'bg-rose-950/85 text-rose-200 border-rose-500/50'
                    }`}
                  >
                    {node.name.split(' ')[0]}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Drone Patrol Advanced Markers */}
          {isDroneOverlayActive &&
            dronePositions.map(drone => (
              <AdvancedMarker
                key={drone.id}
                position={{ lat: drone.lat, lng: drone.lng }}
                title={`${drone.callsign} [${drone.id}] - Alt: ${drone.alt}`}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)]">
                    <Navigation
                      className="w-3.5 h-3.5 text-emerald-400"
                      style={{ transform: `rotate(${drone.heading}deg)` }}
                    />
                  </div>
                  <div className="absolute top-full mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-emerald-300 border border-emerald-500/40 text-[8px] font-mono font-bold whitespace-nowrap">
                    {drone.id} ({drone.alt})
                  </div>
                </div>
              </AdvancedMarker>
            ))}

          {/* Interactive InfoWindow for Selected Node */}
          {activeNode && (
            <InfoWindow
              position={{ lat: activeNode.latitude, lng: activeNode.longitude }}
              onCloseClick={() => setActiveNode(null)}
              headerContent={
                <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{activeNode.name}</span>
                </div>
              }
            >
              <div className="p-1 font-mono text-xs max-w-[260px] text-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200">
                  <span className="text-slate-500">ID: {activeNode.node_id}</span>
                  <span className="font-bold text-purple-700">{activeNode.crystal_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Class:</span>
                    <span className="font-semibold text-slate-900">{activeNode.classification}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Frequency:</span>
                    <span className="font-semibold text-cyan-700">
                      {getCrystalFrequency(activeNode.crystal_type)} Hz
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Radius:</span>
                    <span className="font-semibold text-slate-900">{activeNode.base_radius_meters}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Shield Status:</span>
                    <span
                      className={`font-bold ${
                        activeNode.is_shielded ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {activeNode.is_shielded ? 'ACTIVE' : 'VULNERABLE'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {!activeNode.is_shielded && (
                    <button
                      onClick={async () => {
                        await onShieldNode(activeNode);
                        setActiveNode({ ...activeNode, is_shielded: true });
                      }}
                      disabled={isShielding}
                      className="flex-1 py-1 px-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Shield className="w-3 h-3" />
                      <span>{isShielding ? 'ENERGIZING...' : 'ENGAGE SHIELD'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenModal(activeNode)}
                    className="flex-1 py-1 px-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>OPEN MODAL</span>
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
