import React from 'react';
import { Plane, ShieldCheck, ChevronDown, Package, HeartPulse, Scan } from 'lucide-react';
import { CityPreset, CITY_PRESETS } from '@/lib/danger-zones';
import { DroneCityCorridor, DRONE_CITY_CORRIDORS, DroneDeliveryMission, DRONE_MISSION_PRESETS } from '@/lib/drone-hazards';
import { NavMode } from '@/types/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  navMode: NavMode;
  onNavModeChange: (mode: NavMode) => void;
  selectedCity: CityPreset;
  selectedDroneCorridor: DroneCityCorridor;
  onCityChange: (cityOrCorridorId: string) => void;
  selectedDroneMission: DroneDeliveryMission;
  onSelectDroneMission: (mission: DroneDeliveryMission) => void;
}

export const TopControlCard: React.FC<Props> = ({
  navMode,
  onNavModeChange,
  selectedCity,
  selectedDroneCorridor,
  onCityChange,
  selectedDroneMission,
  onSelectDroneMission
}) => {
  const isDrone = navMode === 'DRONE_SKYWAY';

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      case 'Package': return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'Scan': return <Scan className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Plane className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${
            isDrone 
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/30' 
              : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30'
          }`}>
            {isDrone ? (
              <Plane className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              {isDrone ? 'AeroSafe 3D' : 'SafeRoute'} <span className={`${isDrone ? 'text-cyan-400' : 'text-emerald-400'} font-mono`}>Skyway</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {isDrone ? 'Regional 3D UAV Airspace' : 'Physical Road Avoidance'}
            </div>
          </div>
        </div>

        {/* Drone vs Ground Navigation Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950/60 rounded-full border border-white/10">
          <button
            onClick={() => onNavModeChange('DRONE_SKYWAY')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              isDrone 
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛸 Drone
          </button>
          <button
            onClick={() => onNavModeChange('GROUND_VEHICLE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              !isDrone 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚗 Car
          </button>
        </div>
      </div>

      {/* Regional Corridor Selector */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/80 border border-white/10 text-left flex items-center justify-between text-xs font-medium text-slate-200 transition-colors">
              <div className="truncate">
                <span className="text-[10px] text-cyan-400 font-mono block">REGIONAL SKYWAY NETWORK:</span>
                <span className="font-bold text-white">
                  {isDrone ? selectedDroneCorridor.name : selectedCity.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="apple-glass border-white/10 text-slate-100 min-w-[240px]">
            {isDrone ? (
              DRONE_CITY_CORRIDORS.map(corridor => (
                <DropdownMenuItem
                  key={corridor.id}
                  onClick={() => onCityChange(corridor.id)}
                  className="cursor-pointer flex flex-col items-start py-2 hover:bg-white/10 focus:bg-white/10"
                >
                  <div className="font-semibold text-xs text-white flex items-center justify-between w-full">
                    <span>{corridor.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{corridor.corridorDistanceKm} km</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{corridor.region}</div>
                </DropdownMenuItem>
              ))
            ) : (
              CITY_PRESETS.map(city => (
                <DropdownMenuItem
                  key={city.id}
                  onClick={() => onCityChange(city.id)}
                  className="cursor-pointer flex flex-col items-start py-2 hover:bg-white/10 focus:bg-white/10"
                >
                  <div className="font-semibold text-xs text-white">{city.name}, {city.state}</div>
                  <div className="text-[10px] text-slate-400">Safety Index: {city.safetyRating}/100</div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Drone Mission Preset Selector */}
      {isDrone && (
        <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10">
          <div className="text-[10px] text-slate-400 font-mono uppercase mb-1.5 flex items-center justify-between">
            <span>UAV Mission Profile</span>
            <span className="text-cyan-400 font-bold">{selectedDroneMission.priorityLevel}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DRONE_MISSION_PRESETS.map(mission => {
              const isSelected = selectedDroneMission.id === mission.id;
              return (
                <button
                  key={mission.id}
                  onClick={() => onSelectDroneMission(mission)}
                  className={`p-1.5 rounded-lg text-left transition-all border flex flex-col justify-between h-14 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {getMissionIcon(mission.icon)}
                    <span className="text-[9px] font-mono">{mission.payloadWeightKg}kg</span>
                  </div>
                  <div className="text-[10px] font-semibold truncate leading-tight mt-0.5">
                    {mission.title.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
