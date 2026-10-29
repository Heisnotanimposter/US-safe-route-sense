import React, { useState } from 'react';
import { RealMapQuarterView } from '@/components/RealMapQuarterView';
import { TeslaGlassOverlay } from '@/components/TeslaGlassOverlay';
import { DangerAnalyticsPanel } from '@/components/DangerAnalyticsPanel';
import { MobilePlatformExportModal } from '@/components/MobilePlatformExportModal';
import { CommercialAttributionModal } from '@/components/intel/CommercialAttributionModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useNavigationState } from '@/hooks/useNavigationState';
import { useGroundRouting } from '@/hooks/useGroundRouting';
import { useDroneRouting } from '@/hooks/useDroneRouting';
import { useRouteSimulation } from '@/hooks/useRouteSimulation';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';
import { useSituationalTelemetry } from '@/hooks/useSituationalTelemetry';

const Index: React.FC = () => {
  // 1. Navigation State (Modes: DRONE_SKYWAY, GROUND_VEHICLE, GLOBAL_OSINT)
  const navState = useNavigationState();

  // Map center for MGRS calculations & regional telemetry
  const [mapCenter, setMapCenter] = useState<[number, number]>([-97.7431, 30.2672]);

  // 2. Global Situational Telemetry (Satellites, Air Radar, Seismic, Infrastructure, CCTV)
  const situational = useSituationalTelemetry(mapCenter[0], mapCenter[1]);

  // 3. Ground Physical Road Routes (OSRM Snapped with Danger Avoidance)
  const groundRouting = useGroundRouting(
    navState.origin,
    navState.destination,
    navState.groundDangerZones
  );

  // 4. 3D Regional Drone Skyway Routes (FAA Part 107 Compliant)
  const droneRouting = useDroneRouting(
    navState.origin,
    navState.destination,
    navState.droneHazards,
    navState.selectedDroneMission
  );

  // 5. Vehicle / Drone Flight Simulation Engine
  const simulation = useRouteSimulation(navState.navMode);

  // 6. Turn-by-Turn Voice Audio Guidance
  const voice = useVoiceGuidance(
    navState.navMode,
    simulation.isSimulating,
    simulation.currentStepIndex,
    groundRouting.activeGroundRoute,
    droneRouting.activeDroneRoute
  );

  // 7. Slide-out Analytics, Mobile Export, and Commercial Compliance Modal Triggers
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);

  const currentGroundStep = groundRouting.activeGroundRoute?.steps[simulation.currentStepIndex] || null;
  const currentDroneStep = droneRouting.activeDroneRoute?.steps[simulation.currentStepIndex] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 1. Full-Bleed 3D Quarter-View Real Map Engine */}
      <RealMapQuarterView
        navMode={navState.navMode}
        city={navState.selectedCity}
        droneCorridor={navState.selectedDroneCorridor}
        origin={navState.origin}
        destination={navState.destination}
        groundDangerZones={navState.groundDangerZones}
        droneHazards={navState.droneHazards}
        activeGroundRoute={groundRouting.activeGroundRoute}
        groundRoutes={groundRouting.groundRoutes}
        activeDroneRoute={droneRouting.activeDroneRoute}
        droneRoutes={droneRouting.droneRoutes}
        activeGroundRouteType={groundRouting.activeGroundRouteType}
        activeDroneProfileType={droneRouting.activeDroneProfileType}
        onOriginChange={(coords) => {
          navState.updateOrigin(coords);
          simulation.resetSimulation();
        }}
        onDestinationChange={(coords) => {
          navState.updateDestination(coords);
          simulation.resetSimulation();
        }}
        onAddCustomHazard={navState.addCustomHazard}
        simProgress={simulation.simProgress}
        isSimulating={simulation.isSimulating}
        cameraMode={navState.cameraMode}
        pickingMode={navState.pickingMode}
        onPickingComplete={() => navState.setPickingMode('NONE')}
        onVehicleStepChange={simulation.setCurrentStepIndex}
        // Situational Telemetry Props
        situationalLayers={situational.layers}
        satellites={situational.satellites}
        flights={situational.flights}
        earthquakes={situational.earthquakes}
        facilities={situational.facilities}
        cctvCameras={situational.cctvCameras}
        thermalFires={situational.thermalFires}
        selectedTelemetryEntity={situational.selectedEntity}
        onSelectTelemetryEntity={situational.setSelectedEntity}
        onCloseTelemetryEntity={() => situational.setSelectedEntity(null)}
        onMapCenterChange={setMapCenter}
      />

      {/* 2. Apple & Tesla-Inspired Minimalist Glass Overlay with 3D Altitude & OSINT HUD */}
      <TeslaGlassOverlay
        navMode={navState.navMode}
        onNavModeChange={(mode) => {
          navState.switchNavMode(mode);
          simulation.resetSimulation();
          voice.resetSpeech();
        }}
        selectedCity={navState.selectedCity}
        selectedDroneCorridor={navState.selectedDroneCorridor}
        onCityChange={(id) => {
          navState.switchCorridorOrCity(id);
          simulation.resetSimulation();
          voice.resetSpeech();
        }}
        selectedDroneMission={navState.selectedDroneMission}
        onSelectDroneMission={navState.setSelectedDroneMission}
        originName={navState.originName}
        destinationName={navState.destinationName}
        activeGroundRoute={groundRouting.activeGroundRoute}
        groundDirectRoute={groundRouting.groundRoutes.unsafe}
        activeDroneRoute={droneRouting.activeDroneRoute}
        activeGroundRouteType={groundRouting.activeGroundRouteType}
        activeDroneProfileType={droneRouting.activeDroneProfileType}
        onSelectGroundRouteType={groundRouting.setActiveGroundRouteType}
        onSelectDroneProfileType={droneRouting.setActiveDroneProfileType}
        isSimulating={simulation.isSimulating}
        onToggleSimulation={simulation.toggleSimulation}
        onResetSimulation={() => {
          simulation.resetSimulation();
          voice.resetSpeech();
        }}
        simProgress={simulation.simProgress}
        currentGroundStep={currentGroundStep}
        currentDroneStep={currentDroneStep}
        cameraMode={navState.cameraMode}
        onSetCameraMode={navState.setCameraMode}
        pickingMode={navState.pickingMode}
        onSetPickingMode={navState.setPickingMode}
        isAudioEnabled={voice.isAudioEnabled}
        onToggleAudio={voice.toggleAudio}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenMobileExport={() => setIsMobileModalOpen(true)}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        groundDangerZones={navState.groundDangerZones}
        // Situational Props
        situationalLayers={situational.layers}
        onToggleSituationalLayer={situational.toggleLayer}
        satellites={situational.satellites}
        flights={situational.flights}
        earthquakes={situational.earthquakes}
        facilities={situational.facilities}
        mapCenter={mapCenter}
      />

      {/* 3. Slide-out Risk & Aero Telemetry Analytics Drawer */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto apple-glass border-white/10 text-slate-100 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100">
              {navState.navMode === 'DRONE_SKYWAY' 
                ? 'AeroSafe Drone Flight Telemetry' 
                : navState.navMode === 'GLOBAL_OSINT'
                ? 'Global Situational Telemetry'
                : 'Physical Road Safety & Crime Analytics'}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <DangerAnalyticsPanel
              navMode={navState.navMode}
              selectedCity={navState.selectedCity}
              selectedDroneCorridor={navState.selectedDroneCorridor}
              selectedDroneMission={navState.selectedDroneMission}
              activeGroundRoute={groundRouting.activeGroundRoute}
              groundDirectRoute={groundRouting.groundRoutes.unsafe}
              activeDroneRoute={droneRouting.activeDroneRoute}
              groundDangerZones={navState.groundDangerZones}
              droneHazards={navState.droneHazards}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Native Mobile Flutter & Swift Code Export Modal */}
      <MobilePlatformExportModal
        open={isMobileModalOpen}
        onOpenChange={setIsMobileModalOpen}
      />

      {/* 5. Commercial Compliance & Licensing Registry Modal */}
      <CommercialAttributionModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />
    </div>
  );
};

export default Index;
