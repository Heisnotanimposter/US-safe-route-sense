import React from 'react';
import { 
  MapPin, 
  ArrowUpDown, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Milestone, 
  Radio, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { RouteOption, RouteType } from '@/lib/safe-routing-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Props {
  originName: string;
  originCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  onSwapPoints: () => void;
  routeOptions: RouteOption[];
  activeRouteType: RouteType;
  onSelectRouteType: (type: RouteType) => void;
  showBaselineComparison: boolean;
  onToggleBaselineComparison: (show: boolean) => void;
}

export const RouteControlPanel: React.FC<Props> = ({
  originName,
  originCoords,
  destinationName,
  destinationCoords,
  onSwapPoints,
  routeOptions,
  activeRouteType,
  onSelectRouteType,
  showBaselineComparison,
  onToggleBaselineComparison
}) => {
  return (
    <div className="space-y-4">
      {/* Waypoint Card */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Navigation Waypoints
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSwapPoints}
            className="h-6 px-2 text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            Swap
          </Button>
        </div>

        <div className="space-y-2.5">
          {/* Point A */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-blue-500/30">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/60 flex items-center justify-center text-xs font-bold font-mono text-blue-400 shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {originName}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Origin Coordinates: [{originCoords[0]}, {originCoords[1]}]
              </div>
            </div>
          </div>

          {/* Point B */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/30">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/60 flex items-center justify-center text-xs font-bold font-mono text-emerald-400 shrink-0">
              B
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {destinationName}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Destination Coordinates: [{destinationCoords[0]}, {destinationCoords[1]}]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Profiles Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Safety Routing Profiles
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Baseline Risk Overlay:</span>
            <Switch
              checked={showBaselineComparison}
              onCheckedChange={onToggleBaselineComparison}
              className="data-[state=checked]:bg-red-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {routeOptions.map((opt) => {
            const isSelected = activeRouteType === opt.type;
            const isGuardian = opt.type === 'SAFE_GUARDIAN';
            const isBalanced = opt.type === 'BALANCED';
            const isDanger = opt.type === 'DIRECT_UNSAFE';

            return (
              <button
                key={opt.type}
                onClick={() => onSelectRouteType(opt.type)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? isGuardian
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                      : isBalanced
                      ? 'bg-blue-950/40 border-blue-500/70 shadow-lg shadow-blue-500/10'
                      : 'bg-red-950/40 border-red-500/70 shadow-lg shadow-red-500/10'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Glow accent bar */}
                {isSelected && (
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      isGuardian ? 'bg-emerald-500' : isBalanced ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isGuardian && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    {isBalanced && <Zap className="w-4 h-4 text-blue-400" />}
                    {isDanger && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    <span className="text-xs font-bold text-slate-100">
                      {opt.title}
                    </span>
                  </div>

                  <Badge
                    className={`text-[10px] font-mono font-bold ${
                      isGuardian
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isBalanced
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {opt.badge}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  {opt.subtitle}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Safety Score</div>
                    <div
                      className={`text-xs font-bold font-mono ${
                        opt.safetyScore >= 90
                          ? 'text-emerald-400'
                          : opt.safetyScore >= 70
                          ? 'text-blue-400'
                          : 'text-red-400'
                      }`}
                    >
                      {opt.safetyScore}%
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Travel Time</div>
                    <div className="text-xs font-bold font-mono text-slate-200 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {opt.estimatedTimeMin} min
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Distance</div>
                    <div className="text-xs font-bold font-mono text-slate-200 flex items-center justify-center gap-1">
                      <Milestone className="w-3 h-3 text-slate-400" />
                      {opt.totalDistanceKm} km
                    </div>
                  </div>
                </div>

                {/* Bypassed indicator */}
                {isGuardian && opt.bypassedDangerZones.length > 0 && (
                  <div className="mt-2.5 text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Safely circumvents {opt.bypassedDangerZones.length} high-crime & slum zones</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
