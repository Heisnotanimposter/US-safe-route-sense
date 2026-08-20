import React from 'react';
import { Plane, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, Activity, Gauge } from 'lucide-react';
import { DroneRouteOption, AltitudeProfilePoint } from '@/lib/drone-routing-engine';

interface Props {
  activeDroneRoute: DroneRouteOption | null;
  simProgress: number; // 0 to 1
  isSimulating: boolean;
}

export const DroneAltitudeProfileHUD: React.FC<Props> = ({
  activeDroneRoute,
  simProgress,
  isSimulating
}) => {
  if (!activeDroneRoute) return null;

  const points = activeDroneRoute.altitudeProfile || [];
  if (points.length < 2) return null;

  // Chart Dimensions
  const width = 600;
  const height = 140;
  const paddingX = 45;
  const paddingY = 24;

  const maxAlt = 140; // max Y in meters (FAA Part 107 is 120m)
  const totalDistanceKm = points[points.length - 1].distanceKm || 1;

  // Coordinate mappers
  const getX = (distKm: number) => paddingX + (distKm / totalDistanceKm) * (width - paddingX * 2);
  const getY = (altM: number) => height - paddingY - (altM / maxAlt) * (height - paddingY * 2);

  // Build SVG path for Drone Altitude
  const flightPathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.distanceKm);
    const y = getY(pt.altitudeAglMeters + pt.terrainElevationMeters);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  // Build SVG path for Terrain Ground
  const terrainPathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.distanceKm);
    const y = getY(pt.terrainElevationMeters);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  // Fill area under flight path
  const areaFillD = `${flightPathD} L ${getX(totalDistanceKm)} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  // Calculate current drone position along the profile
  const currentDistKm = simProgress * totalDistanceKm;
  const currentPtIdx = Math.min(
    Math.floor(simProgress * (points.length - 1)),
    points.length - 2
  );
  const ptA = points[currentPtIdx];
  const ptB = points[currentPtIdx + 1];
  const segT = (currentDistKm - ptA.distanceKm) / (ptB.distanceKm - ptA.distanceKm || 1);

  const currentAltAgl = Math.round(ptA.altitudeAglMeters + (ptB.altitudeAglMeters - ptA.altitudeAglMeters) * Math.max(0, Math.min(1, segT)));
  const currentTerrain = Math.round(ptA.terrainElevationMeters + (ptB.terrainElevationMeters - ptA.terrainElevationMeters) * Math.max(0, Math.min(1, segT)));
  const currentDroneX = getX(currentDistKm);
  const currentDroneY = getY(currentAltAgl + currentTerrain);

  const isClimbing = ptA.phase === 'climb';
  const isDescending = ptA.phase === 'descent';
  const verticalSpeed = isClimbing ? '+4.5 m/s' : (isDescending ? '-3.2 m/s' : '0.0 m/s');

  return (
    <div className="apple-glass rounded-3xl p-4 shadow-2xl border border-cyan-500/30 text-white select-none">
      {/* Header telemetry */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
              3D Flight Altitude Profile <span className="text-cyan-400 font-normal">({activeDroneRoute.distanceFormatted})</span>
            </div>
            <div className="text-[10px] text-slate-400">
              FAA Part 107 Airspace · Cruising {activeDroneRoute.cruisingAltitudeMeters}m AGL
            </div>
          </div>
        </div>

        {/* Live dynamic HUD badges */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold font-mono text-cyan-300">
              {currentAltAgl} <span className="text-[10px] text-slate-400 font-normal">m AGL</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 flex items-center justify-end gap-1">
              {isClimbing && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
              {isDescending && <ArrowDownRight className="w-3 h-3 text-amber-400" />}
              {!isClimbing && !isDescending && <Gauge className="w-3 h-3 text-cyan-400" />}
              <span>{verticalSpeed}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="text-right">
            <div className="text-xs font-bold font-mono text-emerald-300">
              {Math.max(20, currentAltAgl - 15)}m
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              Clearance Margin
            </div>
          </div>
        </div>
      </div>

      {/* SVG Altitude Profile Graphic HUD */}
      <div className="relative w-full h-[120px] bg-slate-950/70 rounded-2xl border border-white/5 overflow-hidden p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            {/* Neon Cyan Gradient */}
            <linearGradient id="cyanSkyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Terrain Ground Gradient */}
            <linearGradient id="terrainGroundGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={getY(120)} x2={width - paddingX} y2={getY(120)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <text x={paddingX + 6} y={getY(120) - 4} fill="#ef4444" fontSize="9" fontFamily="monospace" opacity="0.8">120m FAA CEILING</text>

          <line x1={paddingX} y1={getY(60)} x2={width - paddingX} y2={getY(60)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 2" />
          <text x={paddingX + 6} y={getY(60) - 4} fill="#64748b" fontSize="8" fontFamily="monospace">60m MIN SKYWAY</text>

          {/* Fill under skyway */}
          <path d={areaFillD} fill="url(#cyanSkyGradient)" />

          {/* Ground Terrain Line */}
          <path d={terrainPathD} fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

          {/* Flight Altitude Ribbon Line */}
          <path d={flightPathD} fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Vertical Drop Laser Line from Drone to Ground */}
          <line
            x1={currentDroneX}
            y1={currentDroneY}
            x2={currentDroneX}
            y2={getY(currentTerrain)}
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.9"
          />

          {/* Ground Projection Dot */}
          <circle cx={currentDroneX} cy={getY(currentTerrain)} r="3" fill="#06b6d4" opacity="0.8" />

          {/* Dynamic 3D Drone Beacon Marker */}
          <g transform={`translate(${currentDroneX}, ${currentDroneY})`}>
            <circle r="9" fill="#06b6d4" fillOpacity="0.25" className="animate-ping" />
            <circle r="5.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* X Axis Distance Labels */}
          <text x={paddingX} y={height - 6} fill="#64748b" fontSize="9" fontFamily="monospace">0 km (Takeoff)</text>
          <text x={width / 2} y={height - 6} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            {(totalDistanceKm / 2).toFixed(1)} km (Cruise Corridor)
          </text>
          <text x={width - paddingX} y={height - 6} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
            {totalDistanceKm.toFixed(1)} km (Landing SkyPad)
          </text>
        </svg>
      </div>
    </div>
  );
};
