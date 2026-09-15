import React from 'react';
import { 
  Navigation, 
  ArrowUp, 
  ArrowUpLeft, 
  ArrowUpRight, 
  CornerUpLeft, 
  CornerUpRight, 
  RotateCcw, 
  Flag,
  AlertTriangle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { RouteStep } from '@/lib/safe-routing-engine';
import { DroneFlightStep } from '@/lib/drone-routing-engine';
import { NavMode } from '@/types/navigation';

interface Props {
  navMode: NavMode;
  currentGroundStep: RouteStep | null;
  currentDroneStep: DroneFlightStep | null;
  isSimulating: boolean;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const TurnByTurnBanner: React.FC<Props> = ({
  navMode,
  currentGroundStep,
  currentDroneStep,
  isSimulating,
  isAudioEnabled,
  onToggleAudio
}) => {
  const isDrone = navMode === 'DRONE_SKYWAY';

  if (!isSimulating && !currentGroundStep && !currentDroneStep) {
    return null;
  }

  const getTurnIcon = (type?: string) => {
    switch (type) {
      case 'straight': return <ArrowUp className="w-5 h-5 text-white" />;
      case 'slight_left': return <ArrowUpLeft className="w-5 h-5 text-white" />;
      case 'turn_left': return <CornerUpLeft className="w-5 h-5 text-white" />;
      case 'slight_right': return <ArrowUpRight className="w-5 h-5 text-white" />;
      case 'turn_right': return <CornerUpRight className="w-5 h-5 text-white" />;
      case 'u_turn': return <RotateCcw className="w-5 h-5 text-white" />;
      case 'arrive': return <Flag className="w-5 h-5 text-emerald-400" />;
      default: return <Navigation className="w-5 h-5 text-white" />;
    }
  };

  const instruction = isDrone 
    ? (currentDroneStep?.instruction || 'Cruising along active AeroSafe skyway corridor...')
    : (currentGroundStep?.instruction || 'Proceed on current course...');

  const subtext = isDrone
    ? (currentDroneStep ? `${currentDroneStep.waypointName} • ${currentDroneStep.altitudeAglMeters}m AGL • ${currentDroneStep.speedKmh} km/h` : 'Autonomous Flight Mode')
    : (currentGroundStep ? `${currentGroundStep.roadName} • in ${currentGroundStep.distanceFormatted}` : 'GPS Navigation Active');

  const warning = isDrone
    ? currentDroneStep?.telemetryNotice
    : currentGroundStep?.warningMessage;

  return (
    <div className="apple-glass rounded-2xl p-3 max-w-sm pointer-events-auto border border-white/10 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isDrone ? 'bg-cyan-500 shadow-cyan-500/30' : 'bg-emerald-500 shadow-emerald-500/30'
        }`}>
          {isDrone ? (
            <Navigation className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          ) : (
            getTurnIcon(currentGroundStep?.turnType)
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate leading-tight">
            {instruction}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
            {subtext}
          </div>
          {warning && (
            <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">{warning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice Audio Toggle Button */}
      <button
        onClick={onToggleAudio}
        className={`p-2 rounded-xl transition-colors shrink-0 ${
          isAudioEnabled 
            ? 'bg-white/10 text-white hover:bg-white/20' 
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
        }`}
        title={isAudioEnabled ? 'Mute Voice Audio' : 'Unmute Voice Audio'}
      >
        {isAudioEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
