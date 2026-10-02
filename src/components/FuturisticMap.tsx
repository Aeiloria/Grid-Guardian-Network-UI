import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, ShieldAlert, Crosshair, ZoomIn, ZoomOut, RotateCcw, Zap } from 'lucide-react';

interface FuturisticMapProps {
  centerLat: number;
  centerLon: number;
}

interface GridNode {
  node_id: string;
  name: string;
  classification: string;
  latitude: number;
  longitude: number;
  base_radius_meters: number;
  is_shielded: boolean;
  shield_expires_at?: string;
}

export function FuturisticMap({ centerLat, centerLon }: FuturisticMapProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<GridNode | null>(null);
  const [isShielding, setIsShielding] = useState<boolean>(false);
  const [radarAngle, setRadarAngle] = useState<number>(0);

  const [nodes, setNodes] = useState<GridNode[]>([
    {
      node_id: 'NODE-GV-01',
      name: 'Gatesville Primary Substation Alpha',
      classification: 'POWER_GRID',
      latitude: centerLat,
      longitude: centerLon,
      base_radius_meters: 250,
      is_shielded: true,
      shield_expires_at: new Date(Date.now() + 86400000).toISOString()
    },
    {
      node_id: 'NODE-GV-02',
      name: 'Leon River Water Treatment Array',
      classification: 'HYDRO_INFRA',
      latitude: centerLat - 0.0066,
      longitude: centerLon + 0.0059,
      base_radius_meters: 180,
      is_shielded: true,
      shield_expires_at: new Date(Date.now() + 43200000).toISOString()
    },
    {
      node_id: 'NODE-GV-03',
      name: 'Coryell Memorial Medical Grid',
      classification: 'BIO_MEDICAL',
      latitude: centerLat + 0.0069,
      longitude: centerLon - 0.0071,
      base_radius_meters: 300,
      is_shielded: false
    },
    {
      node_id: 'NODE-GV-04',
      name: 'Hwy 36 Vector Transit Beacon',
      classification: 'LOGISTICS',
      latitude: centerLat + 0.0149,
      longitude: centerLon - 0.0161,
      base_radius_meters: 150,
      is_shielded: false
    },
    {
      node_id: 'NODE-GV-05',
      name: 'Fort Cavazos Perimeter Relay',
      classification: 'PERIMETER_DEFENSE',
      latitude: centerLat - 0.0241,
      longitude: centerLon + 0.0239,
      base_radius_meters: 400,
      is_shielded: true,
      shield_expires_at: new Date(Date.now() + 120000000).toISOString()
    }
  ]);

  // Sync with backend grid endpoint if available
  useEffect(() => {
    fetch('/api/grid/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNodes(data);
        }
      })
      .catch(() => {
        // Fallback to local default nodes
      });
  }, []);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleClearNodeShield = async (node: GridNode) => {
    setIsShielding(true);
    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_signature';
      const res = await fetch('/api/grid/clear-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: node.node_id })
      });
      if (res.ok) {
        const result = await res.json();
        setNodes(prev => prev.map(n => n.node_id === node.node_id ? { ...n, is_shielded: true } : n));
        if (selectedNode && selectedNode.node_id === node.node_id) {
          setSelectedNode(prev => prev ? { ...prev, is_shielded: true } : null);
        }
      } else {
        // Update locally
        setNodes(prev => prev.map(n => n.node_id === node.node_id ? { ...n, is_shielded: true } : n));
        if (selectedNode && selectedNode.node_id === node.node_id) {
          setSelectedNode(prev => prev ? { ...prev, is_shielded: true } : null);
        }
      }
    } catch {
      setNodes(prev => prev.map(n => n.node_id === node.node_id ? { ...n, is_shielded: true } : n));
      if (selectedNode && selectedNode.node_id === node.node_id) {
        setSelectedNode(prev => prev ? { ...prev, is_shielded: true } : null);
      }
    } finally {
      setIsShielding(false);
    }
  };

  // Convert lat/lon offset to relative percentage coordinates inside map container
  const mapWidth = 560;
  const mapHeight = 280;
  const latSpan = 0.05 / zoom;
  const lonSpan = 0.07 / zoom;

  const getPosition = (lat: number, lon: number) => {
    const xPct = 50 + ((lon - centerLon) / lonSpan) * 100;
    const yPct = 50 - ((lat - centerLat) / latSpan) * 100;
    return {
      left: `${Math.max(5, Math.min(95, xPct))}%`,
      top: `${Math.max(5, Math.min(95, yPct))}%`
    };
  };

  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#040810] text-[#c0d4ec]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#00ffcc] animate-spin" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            SECTOR 31-GATESVILLE // HIGH-DENSITY VECTOR RADAR
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.3))}
            className="p-1 bg-[#0f1827] border border-[#1e2f47] text-[#8fa8cc] hover:text-[#00ffcc] rounded cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.7, prev - 0.3))}
            className="p-1 bg-[#0f1827] border border-[#1e2f47] text-[#8fa8cc] hover:text-[#00ffcc] rounded cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 bg-[#0f1827] border border-[#1e2f47] text-[#8fa8cc] hover:text-[#00ffcc] rounded cursor-pointer"
            title="Reset Grid"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Futuristic Map Canvas Container */}
      <div className="relative h-[280px] w-full bg-[#02050c] border border-[#162438] rounded overflow-hidden shadow-2xl">
        {/* Vector Grid & Coordinate Rings */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0,255,204,0.12) 0%, transparent 70%),
              linear-gradient(to right, #112035 1px, transparent 1px),
              linear-gradient(to bottom, #112035 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 28px 28px, 28px 28px'
          }}
        />

        {/* Concentric Telemetry Range Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[120px] h-[120px] rounded-full border border-[#00ffcc]/20" />
          <div className="w-[200px] h-[200px] rounded-full border border-[#00ffcc]/15 border-dashed" />
          <div className="w-[270px] h-[270px] rounded-full border border-[#00ffcc]/10" />
        </div>

        {/* Dynamic Sweeping Radar Beam */}
        <div
          className="absolute inset-0 pointer-events-none origin-center"
          style={{
            transform: `rotate(${radarAngle}deg)`
          }}
        >
          <div
            className="w-1/2 h-full absolute right-1/2 top-0"
            style={{
              background: 'conic-gradient(from 180deg at 100% 50%, rgba(0,255,204,0.2) 0deg, rgba(0,255,204,0.0) 65deg, transparent 90deg)'
            }}
          />
        </div>

        {/* Center Coordinate Reticle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="w-4 h-4 border border-[#00ffcc] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#00ffcc] rounded-full animate-ping" />
          </div>
          <span className="text-[9px] font-mono text-[#00ffcc] mt-1 bg-[#02050c]/80 px-1 rounded">
            GATESVILLE (31.4351° N, 97.7439° W)
          </span>
        </div>

        {/* Map Nodes Markers */}
        {nodes.map(node => {
          const pos = getPosition(node.latitude, node.longitude);
          const isSelected = selectedNode?.node_id === node.node_id;

          return (
            <div
              key={node.node_id}
              onClick={() => setSelectedNode(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
              style={{ left: pos.left, top: pos.top }}
            >
              {/* Radius Aura */}
              <div
                className={`w-6 h-6 rounded-full -translate-x-1 -translate-y-1 absolute pointer-events-none animate-pulse ${
                  node.is_shielded
                    ? 'bg-[#00ffcc]/15 border border-[#00ffcc]/40'
                    : 'bg-[#ff3366]/20 border border-[#ff3366]/50'
                }`}
              />

              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                  node.is_shielded
                    ? 'bg-[#031e18] border-[#00ffcc] text-[#00ffcc] shadow-[0_0_8px_#00ffcc]'
                    : 'bg-[#29050e] border-[#ff3366] text-[#ff3366] shadow-[0_0_8px_#ff3366]'
                } ${isSelected ? 'ring-2 ring-white' : ''}`}
              >
                {node.is_shielded ? '✓' : '!'}
              </div>

              {/* Node Label Tag */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#060d19]/90 border border-[#1b2b42] text-[9px] px-1.5 py-0.5 rounded font-mono text-[#bad0ec] pointer-events-none">
                {node.name.split(' ')[0]}
              </div>
            </div>
          );
        })}

        {/* Bottom Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-[#5b7396] pointer-events-none bg-[#02050c]/85 p-1 rounded border border-[#101b2c]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#00ffcc]">
              <span className="w-2 h-2 rounded-full bg-[#00ffcc]" /> SHIELDED
            </span>
            <span className="flex items-center gap-1 text-[#ff3366]">
              <span className="w-2 h-2 rounded-full bg-[#ff3366]" /> VULNERABLE
            </span>
          </div>
          <div>DATUM: WGS-84 // SCALE: {(1 / zoom).toFixed(1)}X</div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="mt-2.5 p-3 bg-[#08101f] border border-[#1d2d47] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-[#132034] text-[#00ffcc] px-1.5 py-0.5 rounded">
                {selectedNode.node_id}
              </span>
              <span className="text-xs font-bold text-white">{selectedNode.name}</span>
            </div>
            <div className="text-[10px] text-[#7a95b8] font-mono flex flex-wrap gap-x-4">
              <span>LAT: {selectedNode.latitude.toFixed(4)}</span>
              <span>LON: {selectedNode.longitude.toFixed(4)}</span>
              <span>RADIUS: {selectedNode.base_radius_meters}m</span>
              <span>TYPE: {selectedNode.classification}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedNode.is_shielded ? (
              <button
                onClick={() => handleClearNodeShield(selectedNode)}
                disabled={isShielding}
                className="px-3 py-1.5 bg-[#00ffcc] text-[#060a13] font-bold text-xs rounded hover:bg-[#33ffdd] cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,204,0.4)]"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {isShielding ? 'LOCKING SHIELD...' : 'DEPLOY 48H SHIELD'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#00ffcc] font-bold bg-[#00ffcc]/10 border border-[#00ffcc]/30 px-3 py-1.5 rounded">
                <Shield className="w-3.5 h-3.5 text-[#00ffcc]" />
                SHIELD ACTIVE // RESONANCE LOCKED
              </div>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#647c9f] hover:text-white text-xs px-2 py-1"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
