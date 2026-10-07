import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Crosshair, Radio, BatteryCharging, Eye, Compass, ShieldCheck } from 'lucide-react';
import { playQuartzClick, playCrystalChime } from '../utils/crystalSoundEngine';

export interface DroneFeed {
  id: string;
  callsign: string;
  model: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  speedKmh: number;
  batteryPct: number;
  status: 'PATROL_ACTIVE' | 'VECTOR_LOCK' | 'SURVEILLANCE';
  headingDeg: number;
  patrolRoute: { lat: number; lon: number }[];
  currentWaypointIdx: number;
}

interface DroneTelemetryOverlayProps {
  centerLat: number;
  centerLon: number;
  zoom: number;
  isLight: boolean;
}

export function DroneTelemetryOverlay({
  centerLat,
  centerLon,
  zoom,
  isLight
}: DroneTelemetryOverlayProps) {
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);

  // Simulated Aerial Patrol Drones over Gatesville Sector
  const [drones, setDrones] = useState<DroneFeed[]>([
    {
      id: 'DRN-01',
      callsign: 'AEGIS-V1',
      model: 'SkyGuardian Octo-Rotor',
      lat: centerLat + 0.008,
      lon: centerLon - 0.012,
      altitudeMeters: 145,
      speedKmh: 46.2,
      batteryPct: 88,
      status: 'PATROL_ACTIVE',
      headingDeg: 75,
      patrolRoute: [
        { lat: centerLat + 0.008, lon: centerLon - 0.012 },
        { lat: centerLat + 0.015, lon: centerLon + 0.005 },
        { lat: centerLat + 0.002, lon: centerLon + 0.018 },
        { lat: centerLat - 0.010, lon: centerLon + 0.008 },
        { lat: centerLat - 0.005, lon: centerLon - 0.015 }
      ],
      currentWaypointIdx: 0
    },
    {
      id: 'DRN-02',
      callsign: 'FALCON-X',
      model: 'Prismatic High-Altitude Glider',
      lat: centerLat - 0.014,
      lon: centerLon + 0.016,
      altitudeMeters: 210,
      speedKmh: 58.5,
      batteryPct: 74,
      status: 'PATROL_ACTIVE',
      headingDeg: 210,
      patrolRoute: [
        { lat: centerLat - 0.014, lon: centerLon + 0.016 },
        { lat: centerLat - 0.022, lon: centerLon - 0.002 },
        { lat: centerLat - 0.012, lon: centerLon - 0.022 },
        { lat: centerLat + 0.006, lon: centerLon - 0.008 }
      ],
      currentWaypointIdx: 0
    },
    {
      id: 'DRN-03',
      callsign: 'ORBIT-Z3',
      model: 'Vector Perimeter Sentinel',
      lat: centerLat + 0.018,
      lon: centerLon + 0.014,
      altitudeMeters: 175,
      speedKmh: 39.8,
      batteryPct: 92,
      status: 'PATROL_ACTIVE',
      headingDeg: 330,
      patrolRoute: [
        { lat: centerLat + 0.018, lon: centerLon + 0.014 },
        { lat: centerLat + 0.024, lon: centerLon - 0.010 },
        { lat: centerLat + 0.012, lon: centerLon - 0.025 },
        { lat: centerLat - 0.002, lon: centerLon - 0.010 }
      ],
      currentWaypointIdx: 0
    }
  ]);

  // Real-time aerial movement simulation along kinetic waypoints
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prevDrones =>
        prevDrones.map(drone => {
          const route = drone.patrolRoute;
          const targetWaypoint = route[drone.currentWaypointIdx];
          const dLat = targetWaypoint.lat - drone.lat;
          const dLon = targetWaypoint.lon - drone.lon;
          const dist = Math.sqrt(dLat * dLat + dLon * dLon);

          if (dist < 0.001) {
            // Next waypoint
            const nextIdx = (drone.currentWaypointIdx + 1) % route.length;
            return {
              ...drone,
              currentWaypointIdx: nextIdx,
              speedKmh: Math.round(40 + Math.random() * 20),
              headingDeg: Math.round((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360
            };
          }

          // Step along path
          const stepRatio = 0.035;
          const newLat = drone.lat + dLat * stepRatio;
          const newLon = drone.lon + dLon * stepRatio;
          const newHeading = Math.round((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;

          return {
            ...drone,
            lat: newLat,
            lon: newLon,
            headingDeg: newHeading,
            batteryPct: Math.max(15, parseFloat((drone.batteryPct - 0.01).toFixed(2)))
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const latSpan = 0.05 / zoom;
  const lonSpan = 0.07 / zoom;

  const getPosition = (lat: number, lon: number) => {
    const xPct = 50 + ((lon - centerLon) / lonSpan) * 100;
    const yPct = 50 - ((lat - centerLat) / latSpan) * 100;
    return {
      xPct: Math.max(4, Math.min(96, xPct)),
      yPct: Math.max(4, Math.min(96, yPct))
    };
  };

  const selectedDrone = drones.find(d => d.id === selectedDroneId);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* SVG Flight Corridor Patrol Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="dronePathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {drones.map(drone => {
          const pointsStr = drone.patrolRoute
            .map(pt => {
              const pos = getPosition(pt.lat, pt.lon);
              return `${pos.xPct}%,${pos.yPct}%`;
            })
            .join(' ');

          const currentPos = getPosition(drone.lat, drone.lon);
          const nextTarget = drone.patrolRoute[drone.currentWaypointIdx];
          const targetPos = getPosition(nextTarget.lat, nextTarget.lon);

          return (
            <g key={`trail-${drone.id}`}>
              {/* Closed patrol polygon loop */}
              <polygon
                points={pointsStr}
                fill="none"
                stroke="url(#dronePathGradient)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity={isLight ? '0.45' : '0.55'}
              />

              {/* Vector line to current waypoint */}
              <line
                x1={`${currentPos.xPct}%`}
                y1={`${currentPos.yPct}%`}
                x2={`${targetPos.xPct}%`}
                y2={`${targetPos.yPct}%`}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeOpacity="0.8"
                strokeDasharray="2 3"
              />
            </g>
          );
        })}
      </svg>

      {/* Drones with Pulsing Green Patrol Icons */}
      {drones.map(drone => {
        const pos = getPosition(drone.lat, drone.lon);
        const isSelected = selectedDroneId === drone.id;

        return (
          <div
            key={drone.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
            style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
            onClick={(e) => {
              e.stopPropagation();
              playQuartzClick();
              playCrystalChime(1318.5);
              setSelectedDroneId(prev => (prev === drone.id ? null : drone.id));
            }}
          >
            {/* 1. Pulsing Green Active Patrol Beacon Rings */}
            <div className="absolute -inset-2.5 rounded-full border border-emerald-400 opacity-75 animate-ping pointer-events-none" />
            <div className="absolute -inset-1.5 rounded-full border border-emerald-400/60 animate-pulse pointer-events-none shadow-[0_0_12px_#10b981]" />

            {/* 2. Main Kinetic Drone Hub */}
            <motion.div
              animate={{ rotate: drone.headingDeg }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${
                isLight
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  : 'bg-[#021811]/95 border-emerald-400 text-emerald-300 shadow-[0_0_15px_#10b981]'
              } ${isSelected ? 'scale-125 ring-2 ring-emerald-300' : ''}`}
            >
              {/* Central Radar Crosshair */}
              <Crosshair className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '14s' }} />

              {/* Kinetic Rotor Indicator Blades */}
              <div className="absolute top-0 w-1 h-1 rounded-full bg-emerald-400 -translate-y-1" />
              <div className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-400 translate-y-1" />
              <div className="absolute left-0 h-1 w-1 rounded-full bg-emerald-400 -translate-x-1" />
              <div className="absolute right-0 h-1 w-1 rounded-full bg-emerald-400 translate-x-1" />
            </motion.div>

            {/* 3. Drone Callsign & Altitude Tag */}
            <div className={`absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] px-1.5 py-0.5 rounded font-mono border shadow-md flex items-center gap-1 backdrop-blur-md pointer-events-none ${
              isLight
                ? 'bg-white/95 border-emerald-300 text-emerald-950'
                : 'bg-[#04150f]/95 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
            }`}>
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span className="font-bold">{drone.callsign}</span>
              <span className="text-[8px] opacity-75">{drone.altitudeMeters}m</span>
            </div>
          </div>
        );
      })}

      {/* Selected Drone Optical Telemetry HUD Drawer */}
      <AnimatePresence>
        {selectedDrone && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`absolute bottom-10 right-3 z-40 w-64 p-3 rounded-lg border-2 shadow-2xl backdrop-blur-md pointer-events-auto ${
              isLight
                ? 'bg-white/95 border-emerald-300 text-slate-900 shadow-xl'
                : 'bg-[#03150e]/95 border-emerald-400/80 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-500/30">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-black font-mono text-xs tracking-wider text-emerald-400">
                  {selectedDrone.callsign} // PATROL HUD
                </span>
              </div>
              <button
                onClick={() => setSelectedDroneId(null)}
                className="text-[10px] text-emerald-400/80 hover:text-emerald-300 cursor-pointer px-1 font-mono"
              >
                ✕
              </button>
            </div>

            {/* Model & Status */}
            <div className="text-[10px] font-mono text-emerald-300/80 mb-2">
              {selectedDrone.model}
            </div>

            {/* Live Data Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono mb-2.5">
              <div className="p-1 rounded bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-emerald-400/70 block">ALTITUDE</span>
                <span className="font-black text-emerald-300 text-[10px]">{selectedDrone.altitudeMeters} METERS</span>
              </div>
              <div className="p-1 rounded bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-emerald-400/70 block">AIRSPEED</span>
                <span className="font-black text-emerald-300 text-[10px]">{selectedDrone.speedKmh} KM/H</span>
              </div>
              <div className="p-1 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400/70 block">BATTERY</span>
                  <span className="font-black text-emerald-300 text-[10px]">{selectedDrone.batteryPct}%</span>
                </div>
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="p-1 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400/70 block">HEADING</span>
                  <span className="font-black text-emerald-300 text-[10px]">{selectedDrone.headingDeg}°</span>
                </div>
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-1 text-[8px] font-mono border-t border-emerald-500/20 text-emerald-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>GRID RECONNAISSANCE ACTIVE</span>
              </div>
              <span>GPS: {selectedDrone.lat.toFixed(4)}, {selectedDrone.lon.toFixed(4)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
