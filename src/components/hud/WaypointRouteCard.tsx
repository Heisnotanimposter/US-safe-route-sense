import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Crosshair, 
  PlusCircle, 
  ShieldAlert,
  ArrowRight,
  Plane
} from 'lucide-react';
import { RouteOption, RouteType, SafeToDirectRateMetrics } from '@/lib/safe-routing-engine';
import { DroneRouteOption, DroneRouteProfileType } from '@/lib/drone-routing-engine';
import { NavMode, PickingMode } from '@/types/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  navMode: NavMode;
  originName: string;
  destinationName: string;
  activeGroundRoute: RouteOption | null;
  groundDirectRoute: RouteOption | null;
  activeDroneRoute: DroneRouteOption | null;
  activeGroundRouteType: RouteType;
  activeDroneProfileType: DroneRouteProfileType;
  onSelectGroundRouteType: (type: RouteType) => void;
  onSelectDroneProfileType: (type: DroneRouteProfileType) => void;
  safeToDirectRate: SafeToDirectRateMetrics | null;
  pickingMode: PickingMode;
  onSetPickingMode: (mode: PickingMode) => void;
}

export const WaypointRouteCard: React.FC<Props> = ({
  navMode,
  originName,
  destinationName,
  activeGroundRoute,
  activeDroneRoute,
  activeGroundRouteType,
  activeDroneProfileType,
  onSelectGroundRouteType,
  onSelectDroneProfileType,
  safeToDirectRate,
  onSetPickingMode
}) => {
  const isDrone = navMode === 'DRONE_SKYWAY';

  return (
    <div className="space-y-2.5">
      {/* Waypoints Origin & Destination */}
      <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-white/10 space-y-2 text-xs">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2 truncate">
            <div className={`w-2.5 h-2.5 rounded-full ${isDrone ? 'bg-cyan-400 ring-2 ring-cyan-400/30' : 'bg-cyan-400 ring-2 ring-cyan-400/30'}`} />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block font-mono">
                {isDrone ? 'SKYPAD A (ORIGIN)' : 'START LOCATION'}
              </span>
              <span className="text-slate-200 font-medium truncate block">{originName}</span>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSetPickingMode('PICK_A')}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
                Click to reposition origin on map
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="border-t border-white/5 pt-2 flex items-center justify-between group">
          <div className="flex items-center gap-2 truncate">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block font-mono">
                {isDrone ? 'SKYPAD B (DESTINATION)' : 'TARGET DESTINATION'}
              </span>
              <span className="text-slate-200 font-medium truncate block">{destinationName}</span>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSetPickingMode('PICK_B')}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
                Click to reposition destination on map
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Add Threat / Weather Disturbance Pin Button */}
        <div className="pt-1">
          <button
            onClick={() => onSetPickingMode('ADD_HAZARD')}
            className="w-full py-1.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isDrone ? 'Drop Weather Disturbance Pin' : 'Drop Ground Threat Pin'}</span>
          </button>
        </div>
      </div>

      {/* Route Profiles Selector */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          {isDrone ? 'AEROSAFE 3D CORRIDOR PROFILES' : 'ROUTING ALGORITHM OPTIONS'}
        </div>

        {isDrone ? (
          <div className="grid grid-cols-3 gap-1.5">
            {/* AeroSafe Skyway */}
            <button
              onClick={() => onSelectDroneProfileType('AEROSAFE_SKYWAY')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeDroneProfileType === 'AEROSAFE_SKYWAY'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] font-mono font-bold text-cyan-300">98% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">AeroSafe</div>
              <div className="text-[9px] text-slate-400 truncate">Part 107 Clear</div>
            </button>

            {/* Rapid Express */}
            <button
              onClick={() => onSelectDroneProfileType('RAPID_EXPRESS')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeDroneProfileType === 'RAPID_EXPRESS'
                  ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-mono font-bold text-blue-300">85% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">Rapid</div>
              <div className="text-[9px] text-slate-400 truncate">Buffer Min</div>
            </button>

            {/* Direct Unsafe */}
            <button
              onClick={() => onSelectDroneProfileType('DIRECT_UNSAFE_SKYLINE')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeDroneProfileType === 'DIRECT_UNSAFE_SKYLINE'
                  ? 'bg-red-500/20 border-red-400 text-white shadow-lg shadow-red-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[9px] font-mono font-bold text-red-300">22% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">Direct NFZ</div>
              <div className="text-[9px] text-red-400 truncate">Storm Intercept</div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {/* Safe Guardian */}
            <button
              onClick={() => onSelectGroundRouteType('SAFE_GUARDIAN')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeGroundRouteType === 'SAFE_GUARDIAN'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-mono font-bold text-emerald-300">99% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">Safe</div>
              <div className="text-[9px] text-slate-400 truncate">0 Crimes</div>
            </button>

            {/* Balanced */}
            <button
              onClick={() => onSelectGroundRouteType('BALANCED')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeGroundRouteType === 'BALANCED'
                  ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-mono font-bold text-blue-300">88% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">Balanced</div>
              <div className="text-[9px] text-slate-400 truncate">Inner Arterial</div>
            </button>

            {/* Direct Unsafe */}
            <button
              onClick={() => onSelectGroundRouteType('DIRECT_UNSAFE')}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeGroundRouteType === 'DIRECT_UNSAFE'
                  ? 'bg-red-500/20 border-red-400 text-white shadow-lg shadow-red-500/10'
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[9px] font-mono font-bold text-red-300">24% SAFE</span>
              </div>
              <div className="font-bold text-[11px] leading-tight">Direct Red</div>
              <div className="text-[9px] text-red-400 truncate">Crime Hotspot</div>
            </button>
          </div>
        )}
      </div>

      {/* Safe vs Direct Rate Banner (Car Mode) */}
      {!isDrone && safeToDirectRate && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950/60 border border-emerald-500/20 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3 h-3" /> SAFE-TO-DIRECT RATE
            </span>
            <span className="text-[10px] font-mono text-white font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-400/30">
              +{safeToDirectRate.safetyGainPercent}% Security
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>+{safeToDirectRate.detourDistancePercent}% Detour ({safeToDirectRate.extraTimeMinutes} min)</span>
            <span className="font-bold text-emerald-300">Evades {safeToDirectRate.totalCrimesEvadedPerMonth} Crimes/Mo</span>
          </div>
        </div>
      )}

      {/* Drone Flight Telemetry Pill (Drone Mode) */}
      {isDrone && activeDroneRoute && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-950/60 border border-cyan-500/20 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 font-bold">
              <Plane className="w-3 h-3" /> AEROSAFE TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded-md border border-cyan-400/30">
              {activeDroneRoute.cruisingAltitudeMeters}m AGL
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>Batt Est: {activeDroneRoute.batteryRemainingPercent}% SoC</span>
            <span className="font-bold text-cyan-300">Acoustic: {activeDroneRoute.acousticComplianceScore}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
