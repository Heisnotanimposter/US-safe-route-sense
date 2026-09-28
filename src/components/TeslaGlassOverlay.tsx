import React, { useState } from 'react';
import { CityPreset, DangerZone } from '@/lib/danger-zones';
import { DroneCityCorridor, DroneDeliveryMission } from '@/lib/drone-hazards';
import { RouteOption, RouteType, RouteStep, SafeToDirectRateMetrics, calculateSafeToDirectRate } from '@/lib/safe-routing-engine';
import { DroneRouteOption, DroneRouteProfileType, DroneFlightStep } from '@/lib/drone-routing-engine';
import { NavMode, CameraMode, PickingMode } from '@/types/navigation';
import {
  SituationalLayerConfig,
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility
} from '@/types/situational';

import { TopControlCard } from './hud/TopControlCard';
import { WaypointRouteCard } from './hud/WaypointRouteCard';
import { TurnByTurnBanner } from './hud/TurnByTurnBanner';
import { ActionToolstrip } from './hud/ActionToolstrip';
import { InteractivePickingBar } from './hud/InteractivePickingBar';
import { BottomPlaybackBar } from './hud/BottomPlaybackBar';
import { GlobalOsintPanel } from './hud/GlobalOsintPanel';
import { UseCaseModal } from './intel/UseCaseModal';

export type { NavMode };

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
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  pickingMode: PickingMode;
  onSetPickingMode: (mode: PickingMode) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenAnalytics: () => void;
  onOpenMobileExport: () => void;
  onOpenCompliance?: () => void;
  groundDangerZones: DangerZone[];
  // Situational Telemetry
  situationalLayers?: SituationalLayerConfig;
  onToggleSituationalLayer?: (key: keyof SituationalLayerConfig) => void;
  satellites?: SatelliteTrack[];
  flights?: LiveFlight[];
  earthquakes?: SeismicHazard[];
  facilities?: CriticalFacility[];
  mapCenter?: [number, number];
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
  onOpenCompliance,
  groundDangerZones,
  situationalLayers,
  onToggleSituationalLayer,
  satellites = [],
  flights = [],
  earthquakes = [],
  facilities = [],
  mapCenter = [-97.7431, 30.2672]
}) => {
  const [isUseCaseOpen, setIsUseCaseOpen] = useState<boolean>(false);
  const isDrone = navMode === 'DRONE_SKYWAY';
  const isOsint = navMode === 'GLOBAL_OSINT';

  // Compute Safe vs Direct Rate Metrics for car navigation
  const safeToDirectRate: SafeToDirectRateMetrics | null =
    !isDrone && !isOsint && activeGroundRoute && groundDirectRoute
      ? calculateSafeToDirectRate(activeGroundRoute, groundDirectRoute, groundDangerZones)
      : null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-6 select-none">
        {/* Interactive Picking Guidance Bar */}
        {!isOsint && (
          <InteractivePickingBar
            pickingMode={pickingMode}
            navMode={navMode}
            onCancelPicking={() => onSetPickingMode('NONE')}
          />
        )}

        {/* TOP SECTION: Left Floating Glass Card & Right Floating Action Toolstrip */}
        <div className="flex items-start justify-between gap-4">
          {/* Main Floating Glass Card */}
          <div className="apple-glass rounded-3xl p-4 w-full max-w-sm pointer-events-auto shadow-2xl transition-all duration-300 space-y-3">
            <TopControlCard
              navMode={navMode}
              onNavModeChange={onNavModeChange}
              selectedCity={selectedCity}
              selectedDroneCorridor={selectedDroneCorridor}
              onCityChange={onCityChange}
              selectedDroneMission={selectedDroneMission}
              onSelectDroneMission={onSelectDroneMission}
            />

            {!isOsint ? (
              <WaypointRouteCard
                navMode={navMode}
                originName={originName}
                destinationName={destinationName}
                activeGroundRoute={activeGroundRoute}
                groundDirectRoute={groundDirectRoute}
                activeDroneRoute={activeDroneRoute}
                activeGroundRouteType={activeGroundRouteType}
                activeDroneProfileType={activeDroneProfileType}
                onSelectGroundRouteType={onSelectGroundRouteType}
                onSelectDroneProfileType={onSelectDroneProfileType}
                safeToDirectRate={safeToDirectRate}
                pickingMode={pickingMode}
                onSetPickingMode={onSetPickingMode}
              />
            ) : situationalLayers && onToggleSituationalLayer ? (
              <GlobalOsintPanel
                layers={situationalLayers}
                onToggleLayer={onToggleSituationalLayer}
                satellites={satellites}
                flights={flights}
                earthquakes={earthquakes}
                facilities={facilities}
                mapCenter={mapCenter}
                onOpenCompliance={onOpenCompliance || (() => {})}
              />
            ) : null}
          </div>

          {/* Top Right Toolstrip */}
          <ActionToolstrip
            cameraMode={cameraMode}
            onSetCameraMode={onSetCameraMode}
            isAudioEnabled={isAudioEnabled}
            onToggleAudio={onToggleAudio}
            onOpenAnalytics={onOpenAnalytics}
            onOpenMobileExport={onOpenMobileExport}
            onOpenUseCases={() => setIsUseCaseOpen(true)}
            onOpenCompliance={onOpenCompliance}
          />
        </div>

        {/* MIDDLE SECTION: Live Turn-by-Turn Instruction Banner */}
        {!isOsint && (
          <div className="flex justify-start">
            <TurnByTurnBanner
              navMode={navMode}
              currentGroundStep={currentGroundStep}
              currentDroneStep={currentDroneStep}
              isSimulating={isSimulating}
              isAudioEnabled={isAudioEnabled}
              onToggleAudio={onToggleAudio}
            />
          </div>
        )}

        {/* BOTTOM SECTION: Simulation Playback & Altitude HUD Drawer */}
        {!isOsint && (
          <BottomPlaybackBar
            navMode={navMode}
            isSimulating={isSimulating}
            onToggleSimulation={onToggleSimulation}
            onResetSimulation={onResetSimulation}
            simProgress={simProgress}
            activeDroneRoute={activeDroneRoute}
            activeGroundRoute={activeGroundRoute}
          />
        )}
      </div>

      {/* Interactive Use Cases & Architecture Briefing Modal */}
      <UseCaseModal
        open={isUseCaseOpen}
        onOpenChange={setIsUseCaseOpen}
      />
    </>
  );
};
