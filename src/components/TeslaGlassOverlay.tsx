import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Eye, 
  Layers, 
  Smartphone, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  ChevronDown,
  Wind,
  CloudRain,
  Plane,
  Users,
  Volume1,
  Navigation,
  Package,
  HeartPulse,
  Scan,
  BatteryCharging,
  Gauge,
  TrendingUp,
  Activity,
  ChevronUp
} from 'lucide-react';
import { CityPreset, CITY_PRESETS, DangerZone } from '@/lib/danger-zones';
import { 
  DroneHazardZone, 
  DroneCityCorridor, 
  DRONE_CITY_CORRIDORS, 
  DroneDeliveryMission, 
  DRONE_MISSION_PRESETS 
} from '@/lib/drone-hazards';
import { RouteOption, RouteType, RouteStep, SafeToDirectRateMetrics, calculateSafeToDirectRate } from '@/lib/safe-routing-engine';
import { DroneRouteOption, DroneRouteProfileType, DroneFlightStep } from '@/lib/drone-routing-engine';
import { DroneAltitudeProfileHUD } from '@/components/DroneAltitudeProfileHUD';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type NavMode = 'DRONE_SKYWAY' | 'GROUND_VEHICLE';

interface Props {
  navMode: NavMode;
  onNavModeChange: (mode: NavMode) => void;
  selectedCity: CityPreset;
  selectedDroneCorridor: DroneCityCorridor;
  onCityChange: (cityId: string) => void;
  selectedDroneMission: DroneDeliveryMission;
  onSelectDroneMission: (mission: DroneDeliveryMission) => void;
  originName: string;
  destinationName: string;
  activeGroundRoute: RouteOption | null;
  groundDirectRoute: RouteOption | null;
  activeDroneRoute: DroneRouteOption | null;
  activeGroundRouteType: RouteType;
  activeDroneProfileType: DroneRouteProfileType;
  onSelectGroundRouteType: (type: RouteType) => void;
  onSelectDroneProfileType: (type: DroneRouteProfileType) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simProgress: number;
  currentGroundStep: RouteStep | null;
  currentDroneStep: DroneFlightStep | null;
  cameraMode: 'QUARTER_VIEW' | 'DRIVER_FOLLOW' | 'TOP_DOWN';
  onSetCameraMode: (mode: 'QUARTER_VIEW' | 'DRIVER_FOLLOW' | 'TOP_DOWN') => void;
  pickingMode: 'NONE' | 'PICK_A' | 'PICK_B' | 'ADD_HAZARD';
  onSetPickingMode: (mode: 'NONE' | 'PICK_A' | 'PICK_B' | 'ADD_HAZARD') => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenAnalytics: () => void;
  onOpenMobileExport: () => void;
  groundDangerZones: DangerZone[];
}

export const TeslaGlassOverlay: React.FC<Props> = ({
  navMode,
  onNavModeChange,
  selectedCity,
  selectedDroneCorridor,
  onCityChange,
  selectedDroneMission,
  onSelectDroneMission,
  originName,
  destinationName,
  activeGroundRoute,
  groundDirectRoute,
  activeDroneRoute,
  activeGroundRouteType,
  activeDroneProfileType,
  onSelectGroundRouteType,
  onSelectDroneProfileType,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simProgress,
  currentGroundStep,
  currentDroneStep,
  cameraMode,
  onSetCameraMode,
  pickingMode,
  onSetPickingMode,
  isAudioEnabled,
  onToggleAudio,
  onOpenAnalytics,
  onOpenMobileExport,
  groundDangerZones
}) => {
  const [isAltitudeHUDOpen, setIsAltitudeHUDOpen] = useState<boolean>(true);
  const isDrone = navMode === 'DRONE_SKYWAY';
  const activeDistance = isDrone ? activeDroneRoute?.distanceFormatted : activeGroundRoute?.distanceFormatted;
  const activeTimeMin = isDrone ? activeDroneRoute?.flightTimeMin : activeGroundRoute?.estimatedTimeMin;
  const activeSafetyScore = isDrone ? activeDroneRoute?.safetyScore : activeGroundRoute?.safetyScore;

  // Compute Safe vs Direct Rate Metrics for car navigation
  const safeToDirectRate: SafeToDirectRateMetrics | null = (!isDrone && activeGroundRoute && groundDirectRoute)
    ? calculateSafeToDirectRate(activeGroundRoute, groundDirectRoute, groundDangerZones)
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-6 select-none">
      {/* TOP SECTION: Apple Maps / Tesla Floating Glass Control Card */}
      <div className="flex items-start justify-between gap-4">
        {/* Main Floating Glass Card */}
        <div className="apple-glass rounded-3xl p-4 w-full max-w-sm pointer-events-auto shadow-2xl transition-all duration-300">
          {/* Header & Mode Switcher */}
          <div className="flex items-center justify-between mb-3">
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
          <div className="mb-2.5">
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
              <DropdownMenuContent className="apple-glass border-white/10 text-slate-100 min-w-[240px] p-1.5 rounded-2xl">
                {DRONE_CITY_CORRIDORS.map(corridor => (
                  <DropdownMenuItem
                    key={corridor.id}
                    onClick={() => onCityChange(corridor.id)}
                    className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-white/10 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{corridor.name}</div>
                      <div className="text-[10px] text-slate-400">{corridor.region}</div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                      {corridor.corridorDistanceKm} km
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Drone Mission Selector (Visible in Drone Mode) */}
          {isDrone && (
            <div className="mb-2.5 p-2 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl">
              <div className="text-[10px] font-mono text-cyan-400 font-semibold mb-1 flex items-center justify-between">
                <span>MISSION PROFILE:</span>
                <span className="text-slate-400">{selectedDroneMission.payloadWeightKg} kg</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {DRONE_MISSION_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onSelectDroneMission(m)}
                    className={`py-1.5 px-1 rounded-xl text-center text-[10px] font-medium transition-all ${
                      selectedDroneMission.id === m.id
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 bg-black/20'
                    }`}
                  >
                    {m.type === 'medical_transport' && '💉 Medical'}
                    {m.type === 'ecommerce_parcel' && '📦 Parcel'}
                    {m.type === 'infrastructure_inspection' && '🏗️ Scan'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Waypoint Indicators */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-2.5 mb-2.5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <span className="text-xs text-slate-300 font-medium truncate flex-1">
                {originName}
              </span>
              <button
                onClick={() => onSetPickingMode(pickingMode === 'PICK_A' ? 'NONE' : 'PICK_A')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                  pickingMode === 'PICK_A' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                {pickingMode === 'PICK_A' ? 'Tap Map' : 'Set A'}
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span className="text-xs text-slate-300 font-medium truncate flex-1">
                {destinationName}
              </span>
              <button
                onClick={() => onSetPickingMode(pickingMode === 'PICK_B' ? 'NONE' : 'PICK_B')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                  pickingMode === 'PICK_B' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                {pickingMode === 'PICK_B' ? 'Tap Map' : 'Set B'}
              </button>
            </div>
          </div>

          {/* Safe vs Direct Rate Comparison Live Badge */}
          {!isDrone && safeToDirectRate && (
            <div className="mb-2.5 px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safe to Direct Rate:</span>
              </div>
              <div className="font-mono font-bold text-emerald-400">
                +{safeToDirectRate.safetyGainPercent}% Safer (+{safeToDirectRate.extraTimeMinutes}m)
              </div>
            </div>
          )}

          {/* Route Profile Glass Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/50 rounded-2xl border border-white/5 mb-3">
            {isDrone ? (
              <>
                <button
                  onClick={() => onSelectDroneProfileType('AEROSAFE_SKYWAY')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeDroneProfileType === 'AEROSAFE_SKYWAY'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold">AeroSafe</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-cyan-400">99%</div>
                </button>

                <button
                  onClick={() => onSelectDroneProfileType('RAPID_EXPRESS')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeDroneProfileType === 'RAPID_EXPRESS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold">Express</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-emerald-400">88%</div>
                </button>

                <button
                  onClick={() => onSelectDroneProfileType('DIRECT_UNSAFE_SKYLINE')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeDroneProfileType === 'DIRECT_UNSAFE_SKYLINE'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[11px] font-bold">Skyline</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-red-400">24%</div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSelectGroundRouteType('SAFE_GUARDIAN')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeGroundRouteType === 'SAFE_GUARDIAN'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold">Safe</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-emerald-400">
                    {activeGroundRouteType === 'SAFE_GUARDIAN' ? `${activeGroundRoute?.safetyScore || 99}%` : '99%'}
                  </div>
                </button>

                <button
                  onClick={() => onSelectGroundRouteType('BALANCED')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeGroundRouteType === 'BALANCED'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold">Balanced</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-blue-400">86%</div>
                </button>

                <button
                  onClick={() => onSelectGroundRouteType('DIRECT_UNSAFE')}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    activeGroundRouteType === 'DIRECT_UNSAFE'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[11px] font-bold">Direct</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-red-400">
                    {groundDirectRoute?.safetyScore || 24}%
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Primary Simulation Launch Button */}
          <Button
            onClick={onToggleSimulation}
            className={`w-full h-11 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-xl ${
              isSimulating
                ? 'bg-amber-500/90 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : isDrone
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isSimulating ? (
              <span className="flex items-center justify-center gap-2">
                <Pause className="w-4 h-4 fill-current" />
                Pause Navigation
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Launch {isDrone ? 'Drone Flight' : 'Physical Route'} ({activeDistance || '38.5 km'})
              </span>
            )}
          </Button>
        </div>

        {/* TOP RIGHT: Floating Quick Tools Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle Altitude HUD */}
          {isDrone && (
            <button
              onClick={() => setIsAltitudeHUDOpen(!isAltitudeHUDOpen)}
              className={`apple-glass-pill apple-glass-hover px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xl ${
                isAltitudeHUDOpen ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400' : 'text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">3D Altitude HUD</span>
            </button>
          )}

          {/* Custom Hazard Trigger */}
          <button
            onClick={() => onSetPickingMode(pickingMode === 'ADD_HAZARD' ? 'NONE' : 'ADD_HAZARD')}
            className={`apple-glass-pill apple-glass-hover px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xl ${
              pickingMode === 'ADD_HAZARD' ? 'bg-red-600/80 text-white border-red-400' : 'text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">
              {pickingMode === 'ADD_HAZARD' ? 'Click to Drop Threat' : '+ Hazard'}
            </span>
          </button>

          {/* Risk Analytics Pill */}
          <button
            onClick={onOpenAnalytics}
            className="apple-glass-pill apple-glass-hover px-3 py-2 rounded-2xl text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xl"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{isDrone ? 'Aero Telemetry' : 'Rate & Risk Data'}</span>
          </button>

          {/* Mobile Code Export */}
          <button
            onClick={onOpenMobileExport}
            className="apple-glass-pill apple-glass-hover px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xl border-cyan-500/30"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Flutter & Swift</span>
          </button>
        </div>
      </div>

      {/* MID-BOTTOM: Floating 3D Altitude Elevation Profile HUD in Drone Mode */}
      {isDrone && isAltitudeHUDOpen && (
        <div className="w-full max-w-xl mx-auto pointer-events-auto my-2">
          <DroneAltitudeProfileHUD
            activeDroneRoute={activeDroneRoute}
            simProgress={simProgress}
            isSimulating={isSimulating}
          />
        </div>
      )}

      {/* BOTTOM SECTION: Tesla Style Floating Status Dock & Apple Camera Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tesla Floating Navigation Status Dock */}
        <div className="apple-glass-pill px-6 py-3 rounded-3xl pointer-events-auto flex items-center gap-6 shadow-2xl w-full sm:w-auto justify-between sm:justify-start">
          {/* Speedometer */}
          <div className="text-center min-w-[55px]">
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {isSimulating ? (isDrone ? '80' : '45') : '0'}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-mono text-slate-400">
              {isDrone ? 'KM/H' : 'MPH'}
            </div>
          </div>

          <div className="h-7 w-px bg-white/10" />

          {/* ETA & Distance */}
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>{Math.max(1, Math.round((activeTimeMin || 28) * (1 - simProgress)))} min</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{activeDistance || '38.5 km'}</span>
              {isDrone && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-cyan-400 font-mono">{activeDroneRoute?.cruisingAltitudeMeters || 115}m AGL</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
              {isDrone 
                ? (currentDroneStep?.instruction || 'Autonomous Regional Skyway Clear')
                : (currentGroundStep?.instruction || 'Following physical expressway')
              }
            </div>
          </div>

          <div className="h-7 w-px bg-white/10" />

          {/* Safety Score Meter / Drone Battery */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold font-mono text-emerald-300">
              {activeSafetyScore || 99}% {isDrone ? 'AIRSAFE' : 'SAFE'}
            </span>
          </div>

          {/* Audio & Reset Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleAudio}
              className={`p-2 rounded-xl transition-colors ${
                isAudioEnabled ? 'text-cyan-400 hover:bg-white/10' : 'text-slate-500 hover:bg-white/5'
              }`}
              title="Voice Guidance"
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onResetSimulation}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Flight"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Apple-Style Camera Perspective Stack (Quarter-View / Follow / 2D) */}
        <div className="apple-glass-pill p-1.5 rounded-2xl pointer-events-auto flex items-center gap-1 shadow-2xl self-end sm:self-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSetCameraMode('QUARTER_VIEW')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    cameraMode === 'QUARTER_VIEW'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  3D Quarter
                </button>
              </TooltipTrigger>
              <TooltipContent>58° Aerial 3D Quarter-View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSetCameraMode('DRIVER_FOLLOW')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    cameraMode === 'DRIVER_FOLLOW'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Follow
                </button>
              </TooltipTrigger>
              <TooltipContent>Follow Drone Lock</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSetCameraMode('TOP_DOWN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    cameraMode === 'TOP_DOWN'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  2D Radar
                </button>
              </TooltipTrigger>
              <TooltipContent>2D Tactical Bird's Eye Radar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
