import React from 'react';
import { Crosshair, PlusCircle, X } from 'lucide-react';
import { PickingMode, NavMode } from '@/types/navigation';

interface Props {
  pickingMode: PickingMode;
  navMode: NavMode;
  onCancelPicking: () => void;
}

export const InteractivePickingBar: React.FC<Props> = ({
  pickingMode,
  navMode,
  onCancelPicking
}) => {
  if (pickingMode === 'NONE') return null;

  const isDrone = navMode === 'DRONE_SKYWAY';

  const getMessage = () => {
    switch (pickingMode) {
      case 'PICK_A':
        return isDrone 
          ? '🎯 Click on map to position SkyPad Origin (H1)' 
          : '🎯 Click on map to position Start Location (A)';
      case 'PICK_B':
        return isDrone 
          ? '🎯 Click on map to position Landing SkyPad (H2)' 
          : '🎯 Click on map to position Target Destination (B)';
      case 'ADD_HAZARD':
        return isDrone 
          ? '⚠️ Click on map to deploy dynamic Weather / NFZ Disturbance' 
          : '⚠️ Click on map to deploy High-Threat Crime Perimeter';
      default:
        return '';
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="apple-glass rounded-full px-5 py-2.5 border border-cyan-400/50 shadow-2xl flex items-center gap-3 bg-slate-950/90 text-white">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-semibold tracking-wide">
          {getMessage()}
        </span>
        <button
          onClick={onCancelPicking}
          className="ml-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
