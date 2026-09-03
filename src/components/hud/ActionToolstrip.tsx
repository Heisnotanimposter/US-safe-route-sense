import React from 'react';
import { 
  Compass, 
  Eye, 
  Layers, 
  BarChart3, 
  Smartphone, 
  BookOpen,
  Volume2,
  VolumeX 
} from 'lucide-react';
import { CameraMode } from '@/types/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenAnalytics: () => void;
  onOpenMobileExport: () => void;
  onOpenUseCases: () => void;
}

export const ActionToolstrip: React.FC<Props> = ({
  cameraMode,
  onSetCameraMode,
  isAudioEnabled,
  onToggleAudio,
  onOpenAnalytics,
  onOpenMobileExport,
  onOpenUseCases
}) => {
  return (
    <div className="apple-glass rounded-2xl p-1.5 pointer-events-auto flex items-center gap-1 shadow-2xl border border-white/10">
      <TooltipProvider>
        {/* Quarter-View 3D Camera */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSetCameraMode('QUARTER_VIEW')}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                cameraMode === 'QUARTER_VIEW'
                  ? 'bg-white/20 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            3D Quarter-View (58° Tilt)
          </TooltipContent>
        </Tooltip>

        {/* Driver / Drone Follow Camera */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSetCameraMode('DRIVER_FOLLOW')}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                cameraMode === 'DRIVER_FOLLOW'
                  ? 'bg-white/20 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            Vehicle Follow Camera
          </TooltipContent>
        </Tooltip>

        {/* Top-Down 2D Camera */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSetCameraMode('TOP_DOWN')}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                cameraMode === 'TOP_DOWN'
                  ? 'bg-white/20 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            Top-Down 2D Map
          </TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Use Cases & Architecture Briefing Button (NEW) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenUseCases}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline font-mono text-[11px] font-bold">Use Cases</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            System Mission Briefing, Use Cases & Architecture
          </TooltipContent>
        </Tooltip>

        {/* Analytics Drawer Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenAnalytics}
              className="p-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            Telemetry & Safety Analytics
          </TooltipContent>
        </Tooltip>

        {/* Mobile Platform Code Exporter Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenMobileExport}
              className="p-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-slate-900 border-white/10 text-slate-200">
            Export Flutter & Swift Code SDK
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
