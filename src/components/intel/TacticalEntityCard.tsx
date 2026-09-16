import React from 'react';
import {
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility,
  TrafficCCTV
} from '@/types/situational';
import { toMGRS } from '@/lib/situationalServices';
import {
  Radio,
  Plane,
  Activity,
  Building,
  Video,
  X,
  Crosshair,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface TacticalEntityCardProps {
  entity: {
    type: 'SATELLITE' | 'FLIGHT' | 'EARTHQUAKE' | 'FACILITY' | 'CCTV';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  } | null;
  onClose: () => void;
  onFocusCoordinates?: (coords: [number, number]) => void;
}

export const TacticalEntityCard: React.FC<TacticalEntityCardProps> = ({
  entity,
  onClose,
  onFocusCoordinates
}) => {
  if (!entity) return null;

  const { type, data } = entity;

  const getCoordinates = (): [number, number] => {
    return [data.longitude, data.latitude];
  };

  const [lng, lat] = getCoordinates();
  const mgrsCoord = toMGRS(lng, lat);

  return (
    <div className="absolute bottom-6 right-6 z-40 w-84 sm:w-96 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl p-4 shadow-2xl shadow-cyan-950/50 text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          {type === 'SATELLITE' && <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />}
          {type === 'FLIGHT' && <Plane className="w-5 h-5 text-emerald-400" />}
          {type === 'EARTHQUAKE' && <Activity className="w-5 h-5 text-rose-400 animate-bounce" />}
          {type === 'FACILITY' && <Building className="w-5 h-5 text-purple-400" />}
          {type === 'CCTV' && <Video className="w-5 h-5 text-blue-400" />}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              TACTICAL TELEMETRY · {type}
            </div>
            <h3 className="font-mono font-bold text-sm text-slate-100 truncate max-w-[210px]">
              {data.name || data.callsign || data.place || 'Unknown Target'}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Telemetry Metrics */}
      {type === 'SATELLITE' && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">ALTITUDE</span>
            <div className="text-cyan-300 font-bold text-sm mt-0.5">{(data as SatelliteTrack).altitudeKm} km</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">ORBIT VELOCITY</span>
            <div className="text-cyan-300 font-bold text-sm mt-0.5">{(data as SatelliteTrack).velocityKmS} km/s</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">NORAD ID</span>
            <div className="text-slate-200 text-xs mt-0.5">{(data as SatelliteTrack).noradId}</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">CLASS</span>
            <div className="text-emerald-400 text-xs mt-0.5">{(data as SatelliteTrack).category}</div>
          </div>
        </div>
      )}

      {type === 'FLIGHT' && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">ALTITUDE</span>
            <div className="text-emerald-300 font-bold text-sm mt-0.5">
              {(data as LiveFlight).altitudeFt.toLocaleString()} ft
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">AIRSPEED</span>
            <div className="text-emerald-300 font-bold text-sm mt-0.5">{(data as LiveFlight).velocityKnots} kts</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">HEADING</span>
            <div className="text-slate-200 text-xs mt-0.5">{(data as LiveFlight).headingDeg}&deg; TRUE</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">SQUAWK</span>
            <div className="text-amber-400 text-xs mt-0.5">{(data as LiveFlight).squawk || '1200'}</div>
          </div>
        </div>
      )}

      {type === 'EARTHQUAKE' && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          <div className="p-2 rounded bg-slate-900/80 border border-rose-500/30">
            <span className="text-[10px] text-slate-400">MAGNITUDE</span>
            <div className="text-rose-400 font-bold text-lg mt-0.5">M {(data as SeismicHazard).magnitude}</div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">FOCAL DEPTH</span>
            <div className="text-slate-200 font-bold text-sm mt-0.5">{(data as SeismicHazard).depthKm} km</div>
          </div>
          <div className="col-span-2 p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">TSUNAMI ADVISORY</span>
            <div className={`text-xs mt-0.5 ${(data as SeismicHazard).tsunamiAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
              {(data as SeismicHazard).tsunamiAlert ? 'WARNING: TSUNAMI ALERT ISSUED' : 'NONE DETECTED'}
            </div>
          </div>
        </div>
      )}

      {type === 'FACILITY' && (
        <div className="space-y-2 text-xs font-mono mb-3">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
            <span className="text-slate-400">OPERATOR:</span>
            <span className="text-purple-300 font-bold">{(data as CriticalFacility).operator}</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
            <span className="text-slate-400">RATED CAPACITY:</span>
            <span className="text-cyan-300 font-bold">{(data as CriticalFacility).capacity}</span>
          </div>
        </div>
      )}

      {type === 'CCTV' && (
        <div className="space-y-2 mb-3">
          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-700 bg-black">
            <img
              src={(data as TrafficCCTV).imageUrl}
              alt={(data as TrafficCCTV).name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback indicator
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&auto=format&fit=crop&q=60';
              }}
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SOURCE: {(data as TrafficCCTV).source.toUpperCase()}</span>
            <span>{(data as TrafficCCTV).direction || 'FEED ACTIVE'}</span>
          </div>
        </div>
      )}

      {/* MGRS & Tactical Footer */}
      <div className="p-2 rounded bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>MGRS:</span>
          <span className="text-cyan-300 font-bold">{mgrsCoord}</span>
        </div>
        {onFocusCoordinates && (
          <button
            onClick={() => onFocusCoordinates([lng, lat])}
            className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1 transition"
          >
            <span>LOCK CAM</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
