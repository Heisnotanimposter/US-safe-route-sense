import React, { useState, useEffect } from 'react';
import {
  SituationalLayerConfig,
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility
} from '@/types/situational';
import {
  Globe,
  Radio,
  Plane,
  Activity,
  Flame,
  Building,
  Video,
  Clock,
  Crosshair,
  ShieldCheck
} from 'lucide-react';
import { toMGRS } from '@/lib/situationalServices';

interface GlobalOsintPanelProps {
  layers: SituationalLayerConfig;
  onToggleLayer: (key: keyof SituationalLayerConfig) => void;
  satellites: SatelliteTrack[];
  flights: LiveFlight[];
  earthquakes: SeismicHazard[];
  facilities: CriticalFacility[];
  mapCenter: [number, number]; // [lng, lat]
  onOpenCompliance: () => void;
}

export const GlobalOsintPanel: React.FC<GlobalOsintPanelProps> = ({
  layers,
  onToggleLayer,
  satellites,
  flights,
  earthquakes,
  facilities,
  mapCenter,
  onOpenCompliance
}) => {
  const [zuluTime, setZuluTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setZuluTime(now.toISOString().slice(11, 19) + 'Z');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const centerMGRS = toMGRS(mapCenter[0], mapCenter[1]);

  return (
    <div className="apple-glass rounded-2xl p-3 pointer-events-auto border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 text-slate-100 max-w-sm w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400 animate-spin duration-3000" />
          <div>
            <div className="font-mono font-bold text-xs tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>GLOBAL ORBITAL OSINT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              Commercial Situational Intelligence
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCompliance}
          className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 transition"
          title="View commercial compliance and legal attribution"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>LICENSES</span>
        </button>
      </div>

      {/* Clock & Coordinates Banner */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
        <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-200 font-bold">{zuluTime}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex items-center gap-1 text-slate-300 truncate">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate text-cyan-200">{centerMGRS}</span>
        </div>
      </div>

      {/* Real-time Layer Toggles */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-slate-400 tracking-wider">LIVE TELEMETRY FEEDS</div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
          {/* Satellites */}
          <button
            onClick={() => onToggleLayer('satellites')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.satellites
                ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${layers.satellites ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>SATELLITES</span>
            </div>
            <span className="text-[9px] font-bold">{satellites.length}</span>
          </button>

          {/* Flights */}
          <button
            onClick={() => onToggleLayer('flights')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.flights
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Plane className={`w-3.5 h-3.5 ${layers.flights ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>AIR RADAR</span>
            </div>
            <span className="text-[9px] font-bold">{flights.length}</span>
          </button>

          {/* Earthquakes */}
          <button
            onClick={() => onToggleLayer('seismic')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.seismic
                ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Activity className={`w-3.5 h-3.5 ${layers.seismic ? 'text-rose-400' : 'text-slate-500'}`} />
              <span>SEISMIC</span>
            </div>
            <span className="text-[9px] font-bold">{earthquakes.length}</span>
          </button>

          {/* Critical Facilities */}
          <button
            onClick={() => onToggleLayer('criticalFacilities')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.criticalFacilities
                ? 'bg-purple-950/50 border-purple-500/60 text-purple-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Building className={`w-3.5 h-3.5 ${layers.criticalFacilities ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>FACILITIES</span>
            </div>
            <span className="text-[9px] font-bold">{facilities.length}</span>
          </button>

          {/* Thermal Fires */}
          <button
            onClick={() => onToggleLayer('thermalFires')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.thermalFires
                ? 'bg-amber-950/50 border-amber-500/60 text-amber-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${layers.thermalFires ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>WILDFIRES</span>
            </div>
            <span className="text-[9px] font-bold">NASA</span>
          </button>

          {/* CCTV */}
          <button
            onClick={() => onToggleLayer('cctvCameras')}
            className={`p-1.5 rounded-lg border flex items-center justify-between transition ${
              layers.cctvCameras
                ? 'bg-blue-950/50 border-blue-500/60 text-blue-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Video className={`w-3.5 h-3.5 ${layers.cctvCameras ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>TRAFFIC CAM</span>
            </div>
            <span className="text-[9px] font-bold">LIVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
