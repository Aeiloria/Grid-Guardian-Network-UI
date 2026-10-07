import React, { useState, useEffect, useMemo } from 'react';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw, Zap, Shield, Gem, Layers, Orbit, Sparkles, X, ShieldAlert, ShieldCheck, Activity, Info, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Supercluster, { type PointFeature } from 'supercluster';
import { useTheme } from '../context/ThemeContext';
import { playQuartzClick, playCrystalChime, playShieldLockTone, playVagalAlignmentTone } from '../utils/crystalSoundEngine';

interface FuturisticMapProps {
  centerLat: number;
  centerLon: number;
}

export interface GridNode {
  node_id: string;
  name: string;
  crystal_type: string;
  classification: string;
  latitude: number;
  longitude: number;
  base_radius_meters: number;
  is_shielded: boolean;
  color: string;
  shield_expires_at?: string;
}

interface ClusterExtraProps {
  allShielded: boolean;
  clusterName: string;
}

export function FuturisticMap({ centerLat, centerLon }: FuturisticMapProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Zoom scale: 0.7 (zoomed out: maximum clustering) to 2.5 (zoomed in: individual nodes)
  const [zoom, setZoom] = useState<number>(1);
  const [alignmentPulseKey, setAlignmentPulseKey] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<GridNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GridNode | null>(null);
  const [modalNode, setModalNode] = useState<GridNode | null>(null);
  const [selectedClusterData, setSelectedClusterData] = useState<{
    id: number;
    name: string;
    pointCount: number;
    allShielded: boolean;
    leaves: GridNode[];
  } | null>(null);
  const [isShielding, setIsShielding] = useState<boolean>(false);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [expandedClusterId, setExpandedClusterId] = useState<number | null>(null);

  // Solfeggio / harmonic frequency mapping by crystal category
  const getCrystalFrequency = (crystalType: string): number => {
    switch (crystalType) {
      case 'CLEAR_QUARTZ': return 528.0;
      case 'AQUAMARINE': return 432.0;
      case 'AMETHYST': return 639.0;
      case 'TOPAZ': return 741.0;
      case 'FLUORITE': return 852.0;
      case 'OBSIDIAN': return 963.0;
      case 'GARNET': return 396.0;
      default: return 528.0;
    }
  };

  const getClassificationDescription = (classification: string): string => {
    switch (classification) {
      case 'POWER_GRID': return 'Primary Vector Energy Distribution & Monolith Grid';
      case 'HYDRO_INFRA': return 'Aqueous Flow Modulation & Scalar Hydrology Array';
      case 'BIO_MEDICAL': return 'Cellular Resonance & Biological Shield Node';
      case 'LOGISTICS': return 'Vector Relay, Arterial Highway & Transport Protection';
      case 'PERIMETER_DEFENSE': return 'High-Density Citadel Perimeter Defense Node';
      default: return 'Tactical Vector Telemetry Grid';
    }
  };

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalNode(null);
      }
    };
    if (modalNode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalNode]);

  const [nodes, setNodes] = useState<GridNode[]>([
    {
      node_id: 'NODE-GV-01',
      name: 'Gatesville Primary Quartz Monolith',
      crystal_type: 'CLEAR_QUARTZ',
      classification: 'POWER_GRID',
      latitude: centerLat,
      longitude: centerLon,
      base_radius_meters: 250,
      is_shielded: true,
      color: '#06b6d4',
      shield_expires_at: new Date(Date.now() + 86400000).toISOString()
    },
    {
      node_id: 'NODE-GV-02',
      name: 'Leon River Aquamarine Flow Array',
      crystal_type: 'AQUAMARINE',
      classification: 'HYDRO_INFRA',
      latitude: centerLat - 0.0055,
      longitude: centerLon + 0.0048,
      base_radius_meters: 180,
      is_shielded: true,
      color: '#3b82f6',
      shield_expires_at: new Date(Date.now() + 43200000).toISOString()
    },
    {
      node_id: 'NODE-GV-03',
      name: 'Coryell Amethyst Bio-Shield Node',
      crystal_type: 'AMETHYST',
      classification: 'BIO_MEDICAL',
      latitude: centerLat + 0.0058,
      longitude: centerLon - 0.0062,
      base_radius_meters: 300,
      is_shielded: false,
      color: '#a855f7'
    },
    {
      node_id: 'NODE-GV-04',
      name: 'Hwy 36 Topaz Vector Relay',
      crystal_type: 'TOPAZ',
      classification: 'LOGISTICS',
      latitude: centerLat + 0.0160,
      longitude: centerLon - 0.0175,
      base_radius_meters: 150,
      is_shielded: false,
      color: '#f59e0b'
    },
    {
      node_id: 'NODE-GV-06',
      name: 'North Hwy 36 Fluorite Sentinel',
      crystal_type: 'FLUORITE',
      classification: 'LOGISTICS',
      latitude: centerLat + 0.0205,
      longitude: centerLon - 0.0215,
      base_radius_meters: 140,
      is_shielded: true,
      color: '#10b981',
      shield_expires_at: new Date(Date.now() + 60000000).toISOString()
    },
    {
      node_id: 'NODE-GV-05',
      name: 'Fort Cavazos Obsidian Citadel',
      crystal_type: 'OBSIDIAN',
      classification: 'PERIMETER_DEFENSE',
      latitude: centerLat - 0.0230,
      longitude: centerLon + 0.0225,
      base_radius_meters: 400,
      is_shielded: true,
      color: '#ec4899',
      shield_expires_at: new Date(Date.now() + 120000000).toISOString()
    },
    {
      node_id: 'NODE-GV-07',
      name: 'Cavazos Perimeter Garnet Beacon',
      crystal_type: 'GARNET',
      classification: 'PERIMETER_DEFENSE',
      latitude: centerLat - 0.0275,
      longitude: centerLon + 0.0265,
      base_radius_meters: 220,
      is_shielded: false,
      color: '#f43f5e'
    }
  ]);

  // Sync with backend grid endpoint if available
  useEffect(() => {
    fetch('/api/grid/status')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNodes(prev => prev.map(p => {
            const found = data.find((d: any) => d.node_id === p.node_id);
            return found ? { ...p, is_shielded: found.is_shielded } : p;
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Subtle crystal resonance chime when lattice matrix mounts or aligns
  useEffect(() => {
    const timer = setTimeout(() => {
      playCrystalChime(1046.5);
    }, 350);
    return () => clearTimeout(timer);
  }, [alignmentPulseKey]);

  // Radar sweep animation (deliberate, slow crystalline scan)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRadarAngle(prev => (prev + delta * 10) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Supercluster instance loaded with grid node GeoJSON features
  const superclusterIndex = useMemo(() => {
    const index = new Supercluster<GridNode, ClusterExtraProps>({
      radius: 65, // cluster radius in screen pixels
      maxZoom: 16,
      minPoints: 2,
      map: (props) => ({
        allShielded: props.is_shielded,
        clusterName: `${props.name.split(' ')[0]} Cluster`
      }),
      reduce: (accumulated, props) => {
        accumulated.allShielded = accumulated.allShielded && props.allShielded;
      }
    });

    const points: PointFeature<GridNode>[] = nodes.map(node => ({
      type: 'Feature',
      properties: {
        ...node
      },
      geometry: {
        type: 'Point',
        coordinates: [node.longitude, node.latitude] // GeoJSON is [lon, lat]
      }
    }));

    index.load(points);
    return index;
  }, [nodes]);

  // Map floating UI zoom level (0.7 - 2.5) to discrete Supercluster zoom (10 - 15)
  // At zoom <= 1.0, nodes cluster together. At zoom >= 1.6, all nodes separate out.
  const scZoom = useMemo(() => {
    return Math.min(15, Math.max(10, Math.round(10 + (zoom - 0.7) * 2.8)));
  }, [zoom]);

  // Calculate visible clusters & individual features using Supercluster
  const clusterFeatures = useMemo(() => {
    const bbox: [number, number, number, number] = [
      centerLon - 0.2,
      centerLat - 0.2,
      centerLon + 0.2,
      centerLat + 0.2
    ];
    return superclusterIndex.getClusters(bbox, scZoom);
  }, [superclusterIndex, scZoom, centerLon, centerLat]);

  const handleClearNodeShield = async (node: GridNode) => {
    setIsShielding(true);
    playShieldLockTone();
    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_signature';
      const res = await fetch('/api/grid/clear-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: node.node_id })
      });
      if (res.ok) {
        setNodes(prev => prev.map(n => (n.node_id === node.node_id ? { ...n, is_shielded: true } : n)));
        if (selectedNode && selectedNode.node_id === node.node_id) {
          setSelectedNode(prev => (prev ? { ...prev, is_shielded: true } : null));
        }
        if (modalNode && modalNode.node_id === node.node_id) {
          setModalNode(prev => (prev ? { ...prev, is_shielded: true } : null));
        }
      } else {
        setNodes(prev => prev.map(n => (n.node_id === node.node_id ? { ...n, is_shielded: true } : n)));
        if (selectedNode && selectedNode.node_id === node.node_id) {
          setSelectedNode(prev => (prev ? { ...prev, is_shielded: true } : null));
        }
        if (modalNode && modalNode.node_id === node.node_id) {
          setModalNode(prev => (prev ? { ...prev, is_shielded: true } : null));
        }
      }
    } catch {
      setNodes(prev => prev.map(n => (n.node_id === node.node_id ? { ...n, is_shielded: true } : n)));
      if (selectedNode && selectedNode.node_id === node.node_id) {
        setSelectedNode(prev => (prev ? { ...prev, is_shielded: true } : null));
      }
      if (modalNode && modalNode.node_id === node.node_id) {
        setModalNode(prev => (prev ? { ...prev, is_shielded: true } : null));
      }
    } finally {
      setIsShielding(false);
    }
  };

  const handleShieldEntireCluster = async (leaves: GridNode[]) => {
    setIsShielding(true);
    playShieldLockTone();
    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_signature';
      await Promise.all(
        leaves.map(n =>
          fetch('/api/grid/clear-node', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ id: n.node_id })
          }).catch(() => {})
        )
      );
      setNodes(prev =>
        prev.map(n =>
          leaves.some(cn => cn.node_id === n.node_id) ? { ...n, is_shielded: true } : n
        )
      );
      setSelectedClusterData(prev =>
        prev ? { ...prev, allShielded: true, leaves: prev.leaves.map(l => ({ ...l, is_shielded: true })) } : null
      );
    } finally {
      setIsShielding(false);
    }
  };

  const latSpan = 0.05 / zoom;
  const lonSpan = 0.07 / zoom;

  const getPosition = (lat: number, lon: number) => {
    const xPct = 50 + ((lon - centerLon) / lonSpan) * 100;
    const yPct = 50 - ((lat - centerLat) / latSpan) * 100;
    return {
      left: `${Math.max(6, Math.min(94, xPct))}%`,
      top: `${Math.max(6, Math.min(94, yPct))}%`
    };
  };

  const totalClustersCount = clusterFeatures.filter(f => (f.properties as any).cluster).length;

  return (
    <div className={`p-4 border-b transition-colors relative ${
      isLight 
        ? 'bg-gradient-to-br from-white to-purple-50/20 border-purple-200 text-slate-800' 
        : 'bg-gradient-to-br from-[#060815] to-[#091024] border-purple-900/40 text-[#c0d4ec]'
    }`}>
      {/* Top Header Deck & Supercluster Zoom Controller */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Crosshair className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-400'} animate-spin`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            SUPERCLUSTER RADAR // DYNAMIC ZOOM MATRIX
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Active Clustering Status Pill */}
          <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 select-none ${
            totalClustersCount > 0
              ? isLight
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : 'bg-purple-950/70 text-cyan-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
              : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-[#10142b] text-purple-300/60 border-purple-900/40'
          }`}>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {totalClustersCount > 0 ? `CLUSTERS (${totalClustersCount})` : 'INDIVIDUAL (EXPANDED)'}
            </span>
          </div>

          <button
            onClick={() => {
              playQuartzClick();
              setZoom(prev => Math.min(2.5, parseFloat((prev + 0.3).toFixed(1))));
              setExpandedClusterId(null);
            }}
            className={`p-1.5 rounded border cursor-pointer transition-colors ${
              isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
                : 'bg-[#10132b] hover:bg-[#1a1f42] border-purple-800/50 text-cyan-300'
            }`}
            title="Zoom In (Expands Superclusters into Individual Nodes)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playQuartzClick();
              setZoom(prev => Math.max(0.7, parseFloat((prev - 0.3).toFixed(1))));
              setExpandedClusterId(null);
            }}
            className={`p-1.5 rounded border cursor-pointer transition-colors ${
              isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
                : 'bg-[#10132b] hover:bg-[#1a1f42] border-purple-800/50 text-cyan-300'
            }`}
            title="Zoom Out (Animates Nodes into Superclusters)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playCrystalChime(1318.5);
              setAlignmentPulseKey(prev => prev + 1);
            }}
            className={`px-2 py-1 rounded border text-[10px] font-mono font-bold cursor-pointer transition-all flex items-center gap-1 ${
              isLight
                ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900 shadow-xs'
                : 'bg-cyan-950/70 hover:bg-cyan-900/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
            }`}
            title="Re-align Crystalline Matrix (Re-triggers Cyber-Crystal Node Pulse)"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">CRYSTAL PULSE</span>
          </button>
          <button
            onClick={() => {
              playQuartzClick();
              setZoom(1);
              setExpandedClusterId(null);
              setSelectedClusterData(null);
            }}
            className={`p-1.5 rounded border cursor-pointer transition-colors ${
              isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
                : 'bg-[#10132b] hover:bg-[#1a1f42] border-purple-800/50 text-cyan-300'
            }`}
            title="Reset Grid Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hexagonal Crystal Radar Canvas Container */}
      <div className={`relative h-[300px] w-full rounded border overflow-hidden shadow-2xl transition-colors ${
        isLight ? 'bg-gradient-to-br from-slate-50 via-purple-50/10 to-cyan-50/20 border-purple-200' : 'bg-[#030510] border-purple-900/50'
      }`}>
        {/* Prismatic Hexagonal Mesh Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: isLight
              ? `
                radial-gradient(circle at 50% 50%, rgba(168,85,247,0.08) 0%, transparent 80%),
                linear-gradient(to right, rgba(168,85,247,0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6,182,212,0.12) 1px, transparent 1px)
              `
              : `
                radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 80%),
                linear-gradient(to right, rgba(168,85,247,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6,182,212,0.15) 1px, transparent 1px)
              `,
            backgroundSize: '100% 100%, 32px 32px, 32px 32px'
          }}
        />

        {/* Concentric Faceted Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[110px] h-[110px] rounded-full border ${isLight ? 'border-purple-300/40' : 'border-purple-500/30'} rotate-45`} />
          <div className={`w-[190px] h-[190px] rounded-full border border-dashed ${isLight ? 'border-cyan-400/40' : 'border-cyan-400/30'}`} />
          <div className={`w-[260px] h-[260px] rounded-full border ${isLight ? 'border-pink-400/30' : 'border-pink-500/20'}`} />
        </div>

        {/* Prismatic Sweeping Laser Radar Beam */}
        <div
          className="absolute inset-0 pointer-events-none origin-center"
          style={{ transform: `rotate(${radarAngle}deg)` }}
        >
          <div
            className="w-1/2 h-full absolute right-1/2 top-0"
            style={{
              background: isLight
                ? 'conic-gradient(from 180deg at 100% 50%, rgba(168,85,247,0.22) 0deg, rgba(6,182,212,0.15) 30deg, rgba(236,72,153,0.05) 65deg, transparent 90deg)'
                : 'conic-gradient(from 180deg at 100% 50%, rgba(34,211,238,0.3) 0deg, rgba(168,85,247,0.25) 30deg, rgba(244,114,182,0.1) 65deg, transparent 90deg)'
            }}
          />
        </div>

        {/* Center Crystal Core Reticle with Staggered Matrix Spring & Pulse */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 45, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 240,
              damping: 18,
              duration: 1.2
            }}
            className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shadow-lg ${
              isLight ? 'border-purple-600 bg-white/95' : 'border-cyan-400 bg-[#080d21]/90 shadow-[0_0_14px_#06b6d4]'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isLight ? 'bg-purple-600' : 'bg-cyan-300'}`} />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: -4, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className={`text-[9px] font-mono mt-1.5 px-2 py-0.5 rounded font-black tracking-wider shadow-sm border ${
              isLight ? 'text-purple-900 bg-white/95 border-purple-200' : 'text-cyan-300 bg-[#070b1e]/90 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
            }`}
          >
            GATESVILLE CORE
          </motion.span>
        </div>

        {/* Supercluster Feature Rendering with Radial Bloom & Layout Animation */}
        <AnimatePresence mode="popLayout">
          {clusterFeatures.map((feature, featureIndex) => {
            const [longitude, latitude] = feature.geometry.coordinates;
            const pos = getPosition(latitude, longitude);
            const props = feature.properties as any;
            const isCluster = Boolean(props.cluster);

            if (isCluster) {
              const clusterId: number = props.cluster_id;
              const pointCount: number = props.point_count;
              const allShielded: boolean = Boolean(props.allShielded);
              const isExpanded = expandedClusterId === clusterId;
              const isSelected = selectedClusterData?.id === clusterId;

              // Extract child leaves for this supercluster
              const leaves = superclusterIndex.getLeaves(clusterId, 50).map(f => f.properties);

              return (
                <React.Fragment key={`cluster-${clusterId}`}>
                  {/* Supercluster Icon with smooth scale & radial spring entrance */}
                  <motion.div
                    layout
                    layoutId={`cluster-icon-${clusterId}`}
                    initial={{
                      opacity: 0,
                      scale: 0.1,
                      rotate: -90,
                      filter: 'brightness(2.2) blur(3px)'
                    }}
                    animate={{
                      opacity: 1,
                      scale: isExpanded ? 1.2 : 1,
                      rotate: 0,
                      filter: 'brightness(1) blur(0px)'
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.1,
                      filter: 'brightness(2) blur(2px)',
                      transition: { duration: 0.3 }
                    }}
                    transition={{
                      layout: { type: 'spring', stiffness: 280, damping: 24 },
                      opacity: {
                        duration: 0.8,
                        delay: featureIndex * 0.16,
                        ease: [0.16, 1, 0.3, 1]
                      },
                      scale: isExpanded
                        ? { duration: 0.25 }
                        : {
                            type: 'spring',
                            stiffness: 220,
                            damping: 18,
                            delay: featureIndex * 0.16
                          },
                      rotate: {
                        type: 'spring',
                        stiffness: 240,
                        damping: 20,
                        delay: featureIndex * 0.16
                      },
                      filter: {
                        duration: 1.0,
                        delay: featureIndex * 0.16,
                        ease: 'easeOut'
                      }
                    }}
                    whileHover={{ scale: 1.25, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playCrystalChime(1174.6);
                      setExpandedClusterId(prev => (prev === clusterId ? null : clusterId));
                      setSelectedClusterData({
                        id: clusterId,
                        name: `${leaves[0]?.name.split(' ')[0] || 'Central'} Supercluster`,
                        pointCount,
                        allShielded,
                        leaves
                      });
                      setSelectedNode(null);
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 select-none"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    {/* Concentric Cyber-Crystal Ripple Shockwave on mount / pulse */}
                    <motion.div
                      initial={{ opacity: 0.95, scale: 0.3 }}
                      animate={{
                        opacity: [0.95, 0.35, 0],
                        scale: [0.3, 2.0, 3.4]
                      }}
                      transition={{
                        duration: 3.2,
                        delay: featureIndex * 0.16 + 0.1,
                        repeat: Infinity,
                        repeatDelay: 5.0 + (featureIndex % 3) * 0.9,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className={`absolute -inset-2 rounded-full border pointer-events-none ${
                        allShielded
                          ? isLight ? 'border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.8)]'
                          : isLight ? 'border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.8)]'
                      }`}
                    />

                    {/* Animated Radial Connecting Circle & Beams when Cluster is Bloomed */}
                    {isExpanded && (
                      <svg className="absolute -top-[70px] -left-[70px] w-[140px] h-[140px] pointer-events-none overflow-visible">
                        <circle
                          cx="70"
                          cy="70"
                          r="44"
                          fill="none"
                          stroke={isLight ? 'rgba(168,85,247,0.35)' : 'rgba(6,182,212,0.35)'}
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="animate-spin"
                          style={{ animationDuration: '30s' }}
                        />
                        {leaves.map((_, i) => {
                          const angle = (i * (2 * Math.PI / leaves.length)) - (Math.PI / 2);
                          const targetX = 70 + Math.cos(angle) * 44;
                          const targetY = 70 + Math.sin(angle) * 44;
                          return (
                            <line
                              key={i}
                              x1="70"
                              y1="70"
                              x2={targetX}
                              y2={targetY}
                              stroke={isLight ? '#a855f7' : '#06b6d4'}
                              strokeWidth="1.5"
                              strokeOpacity="0.6"
                            />
                          );
                        })}
                      </svg>
                    )}

                    {/* Outer Supercluster Faceted Aura with gentle breathing pulse */}
                    <motion.div
                      animate={{
                        opacity: allShielded ? [0.45, 0.85, 0.45] : [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1],
                        rotate: [45, 52, 45],
                      }}
                      transition={{
                        duration: 5.0 + (featureIndex % 3) * 0.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: featureIndex * 0.16 + 0.3
                      }}
                      className={`w-9 h-9 rounded-md rotate-45 -translate-x-2 -translate-y-2 absolute pointer-events-none transition-all ${
                        allShielded
                          ? isLight ? 'bg-cyan-500/25 border-2 border-cyan-500/60' : 'bg-cyan-400/25 border-2 border-cyan-400/70 shadow-[0_0_16px_rgba(6,182,212,0.6)]'
                          : isLight ? 'bg-amber-500/25 border-2 border-amber-500/60' : 'bg-amber-400/25 border-2 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.6)]'
                      }`}
                    />

                    {/* Supercluster Center Facet with Item Count & Shimmer Flash */}
                    <motion.div
                      initial={{ scale: 0, rotate: 135 }}
                      animate={{
                        scale: isSelected ? 1.25 : [1, 1.08, 1],
                        rotate: 45
                      }}
                      transition={{
                        scale: isSelected
                          ? { type: 'spring', stiffness: 300, damping: 20 }
                          : {
                              duration: 4.6 + (featureIndex % 3) * 0.4,
                              repeat: Infinity,
                              repeatType: 'reverse',
                              ease: 'easeInOut',
                              delay: featureIndex * 0.16 + 0.35
                            },
                        rotate: {
                          type: 'spring',
                          stiffness: 260,
                          damping: 18,
                          delay: featureIndex * 0.16
                        }
                      }}
                      className={`w-6 h-6 rotate-45 flex items-center justify-center border text-[11px] font-black transition-all relative overflow-hidden ${
                        allShielded
                          ? isLight
                            ? 'bg-gradient-to-br from-cyan-600 via-purple-600 to-indigo-700 border-white text-white shadow-lg'
                            : 'bg-gradient-to-br from-cyan-400 via-purple-500 to-indigo-600 border-cyan-200 text-slate-950 shadow-[0_0_14px_#06b6d4]'
                          : isLight
                            ? 'bg-gradient-to-br from-amber-500 to-rose-600 border-white text-white shadow-lg'
                            : 'bg-gradient-to-br from-amber-400 to-rose-600 border-amber-200 text-slate-950 shadow-[0_0_14px_#f59e0b]'
                      } ${isSelected ? 'scale-125 ring-2 ring-cyan-400' : ''}`}
                    >
                      {/* Prismatic Shimmer glint on mount/pulse */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.2 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.2, 1.6, 0.2]
                        }}
                        transition={{
                          duration: 2.0,
                          delay: featureIndex * 0.16 + 0.4,
                          repeat: Infinity,
                          repeatDelay: 5.0 + (featureIndex % 3) * 0.8,
                          ease: 'easeInOut'
                        }}
                        className="absolute inset-0 bg-white/70 rounded-full blur-[1px] pointer-events-none"
                      />
                      <span className="-rotate-45 font-mono font-black relative z-10">
                        {pointCount}
                      </span>
                    </motion.div>

                    {/* Supercluster Label Tag */}
                    <motion.div
                      initial={{ opacity: 0, x: -8, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      transition={{ delay: featureIndex * 0.16 + 0.35, duration: 0.65 }}
                      className={`absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] px-2 py-0.5 rounded font-mono pointer-events-none border shadow-md flex items-center gap-1 ${
                        isLight ? 'bg-white/95 border-purple-200 text-purple-950' : 'bg-[#090d24]/95 border-purple-500/40 text-cyan-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                      }`}
                    >
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Cluster ({pointCount})</span>
                    </motion.div>
                  </motion.div>

                  {/* Radial Blooming Satellite Nodes for this cluster */}
                  <AnimatePresence>
                    {isExpanded && leaves.map((leaf, leafIdx) => {
                      const total = leaves.length;
                      const angle = (leafIdx * (2 * Math.PI / total)) - (Math.PI / 2);
                      const radialRadius = 45;
                      const radialX = Math.cos(angle) * radialRadius;
                      const radialY = Math.sin(angle) * radialRadius;

                      return (
                        <motion.div
                          key={`radial-${leaf.node_id}`}
                          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                          animate={{
                            opacity: 1,
                            x: radialX,
                            y: radialY,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            x: 0,
                            y: 0,
                            scale: 0.2,
                            transition: { duration: 0.22, ease: 'easeIn' }
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 22,
                            delay: leafIdx * 0.05
                          }}
                          whileHover={{ scale: 1.35, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playQuartzClick();
                            setSelectedNode(leaf);
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-40 select-none"
                          style={{ left: pos.left, top: pos.top }}
                        >
                          <div
                            className={`w-4 h-4 rotate-45 flex items-center justify-center border text-[8px] font-black transition-all ${
                              leaf.is_shielded
                                ? isLight
                                  ? 'bg-gradient-to-br from-cyan-500 to-purple-600 border-white text-white shadow-md'
                                  : 'bg-gradient-to-br from-cyan-400 to-purple-500 border-cyan-200 text-slate-950 shadow-[0_0_8px_#06b6d4]'
                                : isLight
                                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-white text-white shadow-md'
                                  : 'bg-gradient-to-br from-rose-500 to-purple-900 border-rose-300 text-white shadow-[0_0_8px_#f43f5e]'
                            }`}
                          >
                            <span className="-rotate-45">✦</span>
                          </div>

                          <div className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] px-1.5 py-0.2 rounded font-mono pointer-events-none border shadow-md ${
                            isLight ? 'bg-white/95 border-purple-200 text-purple-950' : 'bg-[#090d24]/95 border-purple-500/40 text-cyan-200'
                          }`}>
                            {leaf.crystal_type}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </React.Fragment>
              );
            }

            // Standalone individual grid node feature
            const singleNode = props as GridNode;
            const isNodeSelected = selectedNode?.node_id === singleNode.node_id;

            return (
              <motion.div
                key={`node-${singleNode.node_id}-${alignmentPulseKey}`}
                layout
                layoutId={`node-marker-${singleNode.node_id}`}
                initial={{
                  opacity: 0,
                  scale: 0.1,
                  rotate: -90,
                  filter: 'brightness(2.4) blur(3px)'
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  filter: 'brightness(1) blur(0px)'
                }}
                exit={{
                  opacity: 0,
                  scale: 0.1,
                  filter: 'brightness(2) blur(2px)',
                  transition: { duration: 0.35 }
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 280, damping: 24 },
                  opacity: {
                    duration: 0.9,
                    delay: featureIndex * 0.16,
                    ease: [0.16, 1, 0.3, 1]
                  },
                  scale: {
                    type: 'spring',
                    stiffness: 220,
                    damping: 18,
                    mass: 0.9,
                    delay: featureIndex * 0.16
                  },
                  rotate: {
                    type: 'spring',
                    stiffness: 240,
                    damping: 20,
                    delay: featureIndex * 0.16
                  },
                  filter: {
                    duration: 1.1,
                    delay: featureIndex * 0.16,
                    ease: 'easeOut'
                  }
                }}
                whileHover={{ scale: 1.25, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playQuartzClick();
                  setSelectedNode(singleNode);
                  setSelectedClusterData(null);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 select-none"
                style={{ left: pos.left, top: pos.top }}
              >
                {/* 1. Concentric Cyber-Crystal Ripple Shockwave (radiates outward on mount & pulse) */}
                <motion.div
                  initial={{ opacity: 0.95, scale: 0.2 }}
                  animate={{
                    opacity: [0.95, 0.35, 0],
                    scale: [0.2, 1.8, 3.2]
                  }}
                  transition={{
                    duration: 2.8,
                    delay: featureIndex * 0.16 + 0.1,
                    repeat: Infinity,
                    repeatDelay: 5.5 + (featureIndex % 3) * 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={`absolute -inset-1 rounded-full border pointer-events-none ${
                    singleNode.is_shielded
                      ? isLight
                        ? 'border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.7)]'
                      : isLight
                        ? 'border-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                        : 'border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)]'
                  }`}
                />

                {/* 2. Faceted Aura with gentle crystal breathing pulse */}
                <motion.div
                  animate={{
                    opacity: singleNode.is_shielded ? [0.4, 0.85, 0.4] : [0.35, 0.75, 0.35],
                    scale: [1, 1.25, 1],
                    rotate: [45, 52, 45],
                  }}
                  transition={{
                    duration: 4.8 + (featureIndex % 3) * 0.6,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: featureIndex * 0.16 + 0.3
                  }}
                  className={`w-7 h-7 rounded-sm rotate-45 -translate-x-1.5 -translate-y-1.5 absolute pointer-events-none ${
                    singleNode.is_shielded
                      ? isLight
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-cyan-400/25 border border-cyan-400/60 shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                      : isLight
                        ? 'bg-rose-500/20 border border-rose-500/50'
                        : 'bg-rose-500/25 border border-rose-500/60 shadow-[0_0_14px_rgba(244,63,94,0.5)]'
                  }`}
                />

                {/* 3. Crystal Gem Diamond Core with Refractive Light Shimmer */}
                <motion.div
                  initial={{ scale: 0, rotate: 135 }}
                  animate={{
                    scale: isNodeSelected ? 1.3 : [1, 1.1, 1],
                    rotate: 45
                  }}
                  transition={{
                    scale: isNodeSelected
                      ? { type: 'spring', stiffness: 300, damping: 20 }
                      : {
                          duration: 4.2 + (featureIndex % 3) * 0.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                          delay: featureIndex * 0.16 + 0.4
                        },
                    rotate: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 18,
                      delay: featureIndex * 0.16
                    }
                  }}
                  className={`w-4 h-4 rotate-45 flex items-center justify-center border text-[9px] font-black transition-all relative overflow-hidden ${
                    singleNode.is_shielded
                      ? isLight
                        ? 'bg-gradient-to-br from-cyan-500 to-purple-600 border-white text-white shadow-md'
                        : 'bg-gradient-to-br from-cyan-400 to-purple-500 border-cyan-200 text-slate-950 shadow-[0_0_12px_#06b6d4]'
                      : isLight
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-white text-white shadow-md'
                        : 'bg-gradient-to-br from-rose-500 to-purple-900 border-rose-300 text-white shadow-[0_0_12px_#f43f5e]'
                  } ${isNodeSelected ? 'scale-125 ring-2 ring-cyan-400' : ''}`}
                >
                  {/* Prismatic Shimmer flash overlay */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.2, 1.5, 0.2]
                    }}
                    transition={{
                      duration: 1.8,
                      delay: featureIndex * 0.16 + 0.5,
                      repeat: Infinity,
                      repeatDelay: 5.5 + (featureIndex % 4) * 0.7,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 bg-white/70 rounded-full blur-[1px] pointer-events-none"
                  />
                  <span className="-rotate-45 relative z-10">{singleNode.is_shielded ? '✦' : '!'}</span>
                </motion.div>

                {/* 4. Node Label Tag with delayed smooth slide-in */}
                <motion.div
                  initial={{ opacity: 0, x: -8, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.65,
                    delay: featureIndex * 0.16 + 0.35,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] px-2 py-0.5 rounded font-mono pointer-events-none border shadow-md ${
                    isLight
                      ? 'bg-white/95 border-purple-200 text-purple-950'
                      : 'bg-[#090d24]/95 border-purple-500/40 text-cyan-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                  }`}
                >
                  {singleNode.name.split(' ')[0]} ({singleNode.crystal_type})
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Bottom Legend */}
        <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono pointer-events-none p-1.5 rounded border shadow-sm ${
          isLight ? 'bg-white/90 border-purple-200 text-purple-900' : 'bg-[#06091c]/90 border-purple-900/60 text-cyan-300/80 shadow-[0_0_12px_rgba(0,0,0,0.5)]'
        }`}>
          <div className="flex items-center gap-3 font-bold">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rotate-45 bg-cyan-400 inline-block shadow-[0_0_6px_#06b6d4]" /> QUARTZ SHIELDED
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rotate-45 bg-rose-500 inline-block shadow-[0_0_6px_#f43f5e]" /> REFRACTION LEAK
            </span>
            <span className="flex items-center gap-1 text-purple-400 hidden sm:flex">
              <Layers className="w-3 h-3" /> SUPERCLUSTER
            </span>
          </div>
          <div>DATUM: WGS-84 // SCALE: {zoom.toFixed(1)}X</div>
        </div>
      </div>

      {/* Selected Supercluster Inspector Drawer */}
      <AnimatePresence>
        {selectedClusterData && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-3 p-3.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              isLight ? 'bg-white border-purple-200 shadow-md' : 'bg-[#0c1029] border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isLight ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-950/80 text-cyan-300 border-purple-500/50'
                }`}>
                  <Layers className="w-3 h-3" /> SUPERCLUSTER ({selectedClusterData.pointCount})
                </span>
                <span className={`text-xs font-black ${isLight ? 'text-purple-950' : 'text-white'}`}>
                  {selectedClusterData.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                  selectedClusterData.allShielded
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedClusterData.allShielded ? 'ALL SHIELDED' : 'PARTIAL SHIELD'}
                </span>
              </div>
              <div className={`text-[10px] font-mono flex flex-wrap gap-x-3 gap-y-1 ${isLight ? 'text-slate-600' : 'text-purple-300/80'}`}>
                {selectedClusterData.leaves.map(n => (
                  <button
                    key={n.node_id}
                    onClick={() => { playQuartzClick(); setSelectedNode(n); }}
                    className="underline hover:text-cyan-400 cursor-pointer"
                  >
                    {n.name.split(' ')[0]} ({n.crystal_type})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playCrystalChime(1318.5);
                  setZoom(prev => Math.min(2.5, prev + 0.6));
                }}
                className={`px-3 py-1.5 font-bold font-mono text-xs rounded cursor-pointer flex items-center gap-1.5 transition-all border ${
                  isLight
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border-purple-500/40'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>ZOOM IN TO EXPAND</span>
              </button>

              <button
                onClick={() => {
                  playCrystalChime(1174.6);
                  setExpandedClusterId(prev => (prev === selectedClusterData.id ? null : selectedClusterData.id));
                }}
                className={`px-3 py-1.5 font-bold font-mono text-xs rounded cursor-pointer flex items-center gap-1.5 transition-all border ${
                  isLight
                    ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
                    : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border-cyan-500/40'
                }`}
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>{expandedClusterId === selectedClusterData.id ? 'COLLAPSE' : 'RADIAL BLOOM'}</span>
              </button>

              {!selectedClusterData.allShielded && (
                <button
                  onClick={() => handleShieldEntireCluster(selectedClusterData.leaves)}
                  disabled={isShielding}
                  className={`px-3.5 py-1.5 font-bold font-mono text-xs rounded cursor-pointer flex items-center gap-1.5 transition-all shadow-md ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-700 to-cyan-700 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {isShielding ? 'LOCKING ALL...' : `SHIELD ALL (${selectedClusterData.pointCount})`}
                </button>
              )}

              <button
                onClick={() => setSelectedClusterData(null)}
                className={`text-xs px-2 py-1 cursor-pointer font-mono ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-purple-400 hover:text-white'
                }`}
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Inspector Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-3 p-3.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              isLight ? 'bg-white border-purple-200 shadow-md' : 'bg-[#0c1029] border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isLight ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-950/80 text-cyan-300 border-purple-500/50'
                }`}>
                  {selectedNode.node_id}
                </span>
                <span className={`text-xs font-black ${isLight ? 'text-purple-950' : 'text-white'}`}>
                  {selectedNode.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  {selectedNode.crystal_type}
                </span>
              </div>
              <div className={`text-[10px] font-mono flex flex-wrap gap-x-4 ${isLight ? 'text-slate-600' : 'text-purple-300/80'}`}>
                <span>LAT: {selectedNode.latitude.toFixed(4)}</span>
                <span>LON: {selectedNode.longitude.toFixed(4)}</span>
                <span>RADIUS: {selectedNode.base_radius_meters}m</span>
                <span>CLASSIFICATION: {selectedNode.classification}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!selectedNode.is_shielded ? (
                <button
                  onClick={() => handleClearNodeShield(selectedNode)}
                  disabled={isShielding}
                  className={`px-3.5 py-1.5 font-bold font-mono text-xs rounded cursor-pointer flex items-center gap-1.5 transition-all shadow-md ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-700 to-cyan-700 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {isShielding ? 'LOCKING CRYSTAL...' : 'REFRACT 48H SHIELD'}
                </button>
              ) : (
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border ${
                  isLight
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  QUARTZ MATRIX LOCKED
                </div>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className={`text-xs px-2 py-1 cursor-pointer font-mono ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-purple-400 hover:text-white'
                }`}
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
