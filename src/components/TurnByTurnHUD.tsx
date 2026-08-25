import React from 'react';
import { 
  ArrowUp, 
  ArrowUpLeft, 
  ArrowUpRight, 
  CornerUpLeft, 
  CornerUpRight, 
  Flag, 
  ShieldAlert, 
  ShieldCheck, 
  Navigation2,
  AlertCircle
} from 'lucide-react';
import { RouteStep } from '@/lib/safe-routing-engine';
import { Badge } from '@/components/ui/badge';

interface Props {
  steps: RouteStep[];
  currentStepIndex: number;
  remainingDistanceKm: number;
  remainingTimeMin: number;
  currentSafetyScore: number;
}

export const TurnByTurnHUD: React.FC<Props> = ({
  steps,
  currentStepIndex,
  remainingDistanceKm,
  remainingTimeMin,
  currentSafetyScore
}) => {
  if (steps.length === 0) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const nextStep = steps[currentStepIndex + 1];

  const getManeuverIcon = (turnType: RouteStep['turnType']) => {
    switch (turnType) {
      case 'straight':
        return <ArrowUp className="w-6 h-6 text-cyan-400" />;
      case 'slight_left':
        return <ArrowUpLeft className="w-6 h-6 text-cyan-400" />;
      case 'turn_left':
        return <CornerUpLeft className="w-6 h-6 text-cyan-400" />;
      case 'slight_right':
        return <ArrowUpRight className="w-6 h-6 text-cyan-400" />;
      case 'turn_right':
        return <CornerUpRight className="w-6 h-6 text-cyan-400" />;
      case 'arrive':
        return <Flag className="w-6 h-6 text-emerald-400" />;
      default:
        return <ArrowUp className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
            Turn-by-Turn Safe HUD
          </span>
        </div>

        <Badge
          className={`text-[10px] font-mono ${
            currentStep.safetyStatus === 'secure'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : currentStep.safetyStatus === 'caution'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
          }`}
        >
          {currentStep.safetyStatus === 'secure' ? 'ZONE SECURE' : 'CAUTION ZONE'}
        </Badge>
      </div>

      {/* Main Maneuver Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
          {getManeuverIcon(currentStep.turnType)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
            In {currentStep.distanceKm} km
          </div>
          <div className="text-sm font-bold text-slate-100 truncate">
            {currentStep.instruction}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {currentStep.roadName}
          </div>
        </div>
      </div>

      {/* Warning Box if any danger nearby */}
      {currentStep.warningMessage && (
        <div className="bg-red-950/40 border border-red-500/40 p-2.5 rounded-lg flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{currentStep.warningMessage}</span>
        </div>
      )}

      {/* Next Step Preview */}
      {nextStep && (
        <div className="text-xs text-slate-400 flex items-center justify-between px-1 pt-1 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Then:</span>
          <span className="truncate max-w-[240px] text-slate-300">{nextStep.instruction}</span>
        </div>
      )}

      {/* Remaining Distance & ETA */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500">Remaining Dist</div>
          <div className="text-xs font-bold font-mono text-slate-200">
            {remainingDistanceKm} km
          </div>
        </div>
        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500">Estimated ETA</div>
          <div className="text-xs font-bold font-mono text-emerald-400">
            {remainingTimeMin} min
          </div>
        </div>
      </div>
    </div>
  );
};
