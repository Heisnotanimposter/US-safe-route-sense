import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Gauge, 
  TrendingUp,
  Plane
} from 'lucide-react';
import { DroneRouteOption } from '@/lib/drone-routing-engine';
import { RouteOption } from '@/lib/safe-routing-engine';
import { NavMode } from '@/types/navigation';
import { DroneAltitudeProfileHUD } from '@/components/DroneAltitudeProfileHUD';

interface Props {
  navMode: NavMode;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simProgress: number;
  activeDroneRoute: DroneRouteOption | null;
  activeGroundRoute: RouteOption | null;
}

export const BottomPlaybackBar: React.FC<Props> = ({
  navMode,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simProgress,
  activeDroneRoute,
  activeGroundRoute
}) => {
  const [isAltitudeHUDOpen, setIsAltitudeHUDOpen] = useState<boolean>(true);
  const isDrone = navMode === 'DRONE_SKYWAY';

  const activeDistance = isDrone ? activeDroneRoute?.distanceFormatted : activeGroundRoute?.distanceFormatted;
  const activeTimeMin = isDrone ? activeDroneRoute?.flightTimeMin : activeGroundRoute?.estimatedTimeMin;
  const activeSafetyScore = isDrone ? activeDroneRoute?.safetyScore : activeGroundRoute?.safetyScore;

  return (
    <div className="w-full flex flex-col items-center gap-2 pointer-events-auto">
      {/* 3D Drone Altitude Profile Drawer (Exclusive to Drone Mode) */}
      {isDrone && activeDroneRoute && (
        <div className="w-full max-w-2xl apple-glass rounded-2xl p-3 border border-white/10 shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono">
                3D TERRAIN & AIRSPACE ALTITUDE PROFILE
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">FAA Part 107 (Max 120m AGL)</span>
            </div>
            <button
              onClick={() => setIsAltitudeHUDOpen(!isAltitudeHUDOpen)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {isAltitudeHUDOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isAltitudeHUDOpen && (
            <div className="pt-1">
              <DroneAltitudeProfileHUD
                activeDroneRoute={activeDroneRoute}
                simProgress={simProgress}
                isSimulating={isSimulating}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Playback Control Bar */}
      <div className="apple-glass rounded-2xl p-3 max-w-xl w-full border border-white/10 shadow-2xl flex items-center justify-between gap-4">
        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSimulation}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 transition-all shadow-lg ${
              isSimulating
                ? 'bg-amber-400 shadow-amber-400/30'
                : isDrone
                ? 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/30'
                : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/30'
            }`}
          >
            {isSimulating ? (
              <Pause className="w-4 h-4 fill-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            )}
          </button>
          <button
            onClick={onResetSimulation}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress & Route Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              {isDrone ? 'FLIGHT DISPATCH' : 'CONVOY EN ROUTE'}
            </span>
            <span className="text-white font-bold">
              {Math.round(simProgress * 100)}% COMPLETED
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-75 ${
                isDrone 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(simProgress * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Right Metric readout */}
        <div className="text-right shrink-0 border-l border-white/10 pl-4 font-mono">
          <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            {activeDistance || '-- km'}
          </div>
          <div className="text-[10px] text-slate-400">
            {activeTimeMin ? `~${activeTimeMin} min` : '--'} • {activeSafetyScore || 0}% Safe
          </div>
        </div>
      </div>
    </div>
  );
};
