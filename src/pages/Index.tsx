import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CITY_PRESETS, CityPreset, DangerZone } from '@/lib/danger-zones';
import { 
  DRONE_CITY_CORRIDORS, 
  DroneCityCorridor, 
  DroneHazardZone, 
  DRONE_MISSION_PRESETS, 
  DroneDeliveryMission 
} from '@/lib/drone-hazards';
import { fetchPhysicalRoadRoute, RouteOption, RouteType } from '@/lib/safe-routing-engine';
import { calculateDroneRoute, DroneRouteOption, DroneRouteProfileType } from '@/lib/drone-routing-engine';
import { RealMapQuarterView, CameraMode, PickingMode, NavMode } from '@/components/RealMapQuarterView';
import { TeslaGlassOverlay } from '@/components/TeslaGlassOverlay';
import { DangerAnalyticsPanel } from '@/components/DangerAnalyticsPanel';
import { MobilePlatformExportModal } from '@/components/MobilePlatformExportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Index: React.FC = () => {
  // 1. Navigation Mode - Flagship Drone Skyway Mode
  const [navMode, setNavMode] = useState<NavMode>('DRONE_SKYWAY');

  // 2. City & Corridor State
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITY_PRESETS[0]);
  const [selectedDroneCorridor, setSelectedDroneCorridor] = useState<DroneCityCorridor>(DRONE_CITY_CORRIDORS[0]);
  const [selectedDroneMission, setSelectedDroneMission] = useState<DroneDeliveryMission>(DRONE_MISSION_PRESETS[0]);

  // 3. Waypoint State (Initialized for Drone Skyway Corridor)
  const [origin, setOrigin] = useState<[number, number]>(DRONE_CITY_CORRIDORS[0].defaultOrigin.coords);
  const [originName, setOriginName] = useState<string>(DRONE_CITY_CORRIDORS[0].defaultOrigin.name);
  const [destination, setDestination] = useState<[number, number]>(DRONE_CITY_CORRIDORS[0].defaultDestination.coords);
  const [destinationName, setDestinationName] = useState<string>(DRONE_CITY_CORRIDORS[0].defaultDestination.name);

  // 4. Hazard Databases
  const [groundDangerZones, setGroundDangerZones] = useState<DangerZone[]>(CITY_PRESETS[0].dangerZones);
  const [droneHazards, setDroneHazards] = useState<DroneHazardZone[]>(DRONE_CITY_CORRIDORS[0].hazards);

  // 5. Ground Physical Road Routes State
  const [groundRoutes, setGroundRoutes] = useState<{
    safe: RouteOption | null;
    balanced: RouteOption | null;
    unsafe: RouteOption | null;
  }>({ safe: null, balanced: null, unsafe: null });

  // 6. Routing Profile State
  const [activeGroundRouteType, setActiveGroundRouteType] = useState<RouteType>('SAFE_GUARDIAN');
  const [activeDroneProfileType, setActiveDroneProfileType] = useState<DroneRouteProfileType>('AEROSAFE_SKYWAY');

  // 7. Camera & Interaction State
  const [cameraMode, setCameraMode] = useState<CameraMode>('QUARTER_VIEW');
  const [pickingMode, setPickingMode] = useState<PickingMode>('NONE');

  // 8. Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // 9. Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);

  // Voice speech synthesis ref
  const lastSpokenStepRef = useRef<number>(-1);

  // Fetch Physical Road Routes via OSRM whenever Origin, Destination, or Danger Zones Change
  useEffect(() => {
    let isCancelled = false;

    async function loadPhysicalRoutes() {
      try {
        const [safe, balanced, unsafe] = await Promise.all([
          fetchPhysicalRoadRoute(origin, destination, groundDangerZones, 'SAFE_GUARDIAN'),
          fetchPhysicalRoadRoute(origin, destination, groundDangerZones, 'BALANCED'),
          fetchPhysicalRoadRoute(origin, destination, groundDangerZones, 'DIRECT_UNSAFE')
        ]);

        if (!isCancelled) {
          setGroundRoutes({ safe, balanced, unsafe });
        }
      } catch (err) {
        console.error('Failed loading physical routes:', err);
      }
    }

    loadPhysicalRoutes();

    return () => {
      isCancelled = true;
    };
  }, [origin, destination, groundDangerZones]);

  // Compute Drone Routes
  const { safeDroneRoute, rapidDroneRoute, directUnsafeDroneRoute } = useMemo(() => {
    const aeroSafe = calculateDroneRoute(origin, destination, droneHazards, selectedDroneMission, 'AEROSAFE_SKYWAY');
    const rapid = calculateDroneRoute(origin, destination, droneHazards, selectedDroneMission, 'RAPID_EXPRESS');
    const unsafe = calculateDroneRoute(origin, destination, droneHazards, selectedDroneMission, 'DIRECT_UNSAFE_SKYLINE');

    return {
      safeDroneRoute: aeroSafe,
      rapidDroneRoute: rapid,
      directUnsafeDroneRoute: unsafe
    };
  }, [origin, destination, droneHazards, selectedDroneMission]);

  // Active Ground Route
  const activeGroundRoute = useMemo(() => {
    if (activeGroundRouteType === 'SAFE_GUARDIAN') return groundRoutes.safe;
    if (activeGroundRouteType === 'BALANCED') return groundRoutes.balanced;
    return groundRoutes.unsafe;
  }, [activeGroundRouteType, groundRoutes]);

  // Active Drone Route
  const activeDroneRoute = useMemo(() => {
    if (activeDroneProfileType === 'AEROSAFE_SKYWAY') return safeDroneRoute;
    if (activeDroneProfileType === 'RAPID_EXPRESS') return rapidDroneRoute;
    return directUnsafeDroneRoute;
  }, [activeDroneProfileType, safeDroneRoute, rapidDroneRoute, directUnsafeDroneRoute]);

  // Handle Mode Change (Drone vs Car)
  const handleNavModeChange = (mode: NavMode) => {
    setNavMode(mode);
    setSimProgress(0);
    setIsSimulating(false);
    lastSpokenStepRef.current = -1;

    if (mode === 'DRONE_SKYWAY') {
      setOrigin(selectedDroneCorridor.defaultOrigin.coords);
      setOriginName(selectedDroneCorridor.defaultOrigin.name);
      setDestination(selectedDroneCorridor.defaultDestination.coords);
      setDestinationName(selectedDroneCorridor.defaultDestination.name);
      toast.info('🛸 AeroSafe Regional Drone Skyway Mode (FAA Part 107)');
    } else {
      setOrigin(selectedCity.defaultOrigin.coords);
      setOriginName(selectedCity.defaultOrigin.name);
      setDestination(selectedCity.defaultDestination.coords);
      setDestinationName(selectedCity.defaultDestination.name);
      toast.info('🚗 Switched to Physical Road Navigation (OSRM Snapped)');
    }
  };

  // Handle Corridor / City Change
  const handleCorridorChange = (corridorOrCityId: string) => {
    const corridor = DRONE_CITY_CORRIDORS.find(c => c.id === corridorOrCityId || c.id.startsWith(corridorOrCityId)) || DRONE_CITY_CORRIDORS[0];
    const city = CITY_PRESETS.find(c => c.id === corridorOrCityId || corridorOrCityId.startsWith(c.id)) || CITY_PRESETS[0];

    setSelectedDroneCorridor(corridor);
    setSelectedCity(city);
    setDroneHazards(corridor.hazards);
    setGroundDangerZones(city.dangerZones);

    if (navMode === 'DRONE_SKYWAY') {
      setOrigin(corridor.defaultOrigin.coords);
      setOriginName(corridor.defaultOrigin.name);
      setDestination(corridor.defaultDestination.coords);
      setDestinationName(corridor.defaultDestination.name);
    } else {
      setOrigin(city.defaultOrigin.coords);
      setOriginName(city.defaultOrigin.name);
      setDestination(city.defaultDestination.coords);
      setDestinationName(city.defaultDestination.name);
    }

    setSimProgress(0);
    setIsSimulating(false);
    lastSpokenStepRef.current = -1;
    toast.info(`Switched to ${corridor.name} (${corridor.corridorDistanceKm} km corridor)`);
  };

  // Add Custom Hazard dynamically
  const handleAddCustomHazard = (coords: [number, number]) => {
    if (navMode === 'DRONE_SKYWAY') {
      const newHazard: DroneHazardZone = {
        id: `drone_h_${Date.now()}`,
        name: `Atmospheric Wind Funnel & Storm #${droneHazards.length + 1}`,
        category: 'weather_wind_shear',
        severity: 'critical',
        riskScore: 96,
        center: coords,
        radiusMeters: 2200,
        altitudeFloorMeters: 20,
        altitudeCeilingMeters: 160,
        description: 'Atmospheric disturbance detected. AeroSafe skyway recalculating 3D buffer.',
        impactMetrics: { windGustKnots: 38 },
        safetyAdvisory: 'Automatic 3D altitude buffer and perimeter detour active.',
        color: '#06b6d4'
      };
      setDroneHazards(prev => [...prev, newHazard]);
      toast.error(`💨 Weather disturbance deployed at [${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}]! Recalculating AeroSafe Skyway...`);
    } else {
      const newZone: DangerZone = {
        id: `custom_${Date.now()}`,
        name: `User Threat Zone #${groundDangerZones.length + 1}`,
        category: 'slum_red_zone',
        severity: 'critical',
        riskScore: 96,
        center: coords,
        radiusMeters: 1800,
        description: 'Active danger perimeter reported. Physical road path rerouting around threat.',
        recentIncidentsMonth: 22,
        reportedCrimes: ['Civil Alert'],
        safetyAdvisory: 'Instant physical highway bypass recalculation.',
        color: '#ef4444'
      };
      setGroundDangerZones(prev => [...prev, newZone]);
      toast.error(`⚠️ Threat perimeter placed at [${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}]! Recalculating physical road route...`);
    }
  };

  // Flight / Drive Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 1) {
            setIsSimulating(false);
            toast.success(navMode === 'DRONE_SKYWAY' ? '🏁 Drone arrived safely at landing SkyPad!' : '🏁 Arrived safely at destination!');
            return 1;
          }
          return prev + 0.0025; // Smooth progression
        });
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, navMode]);

  // Voice Guidance Audio
  useEffect(() => {
    if (!isAudioEnabled || !isSimulating) return;

    if (currentStepIndex !== lastSpokenStepRef.current) {
      lastSpokenStepRef.current = currentStepIndex;

      let instruction = '';
      if (navMode === 'DRONE_SKYWAY' && activeDroneRoute && activeDroneRoute.steps[currentStepIndex]) {
        instruction = activeDroneRoute.steps[currentStepIndex].instruction;
      } else if (activeGroundRoute && activeGroundRoute.steps[currentStepIndex]) {
        instruction = activeGroundRoute.steps[currentStepIndex].instruction;
      }

      if (instruction && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(instruction);
        utterance.rate = 1.05;
        utterance.pitch = navMode === 'DRONE_SKYWAY' ? 1.15 : 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentStepIndex, isAudioEnabled, navMode, activeDroneRoute, activeGroundRoute, isSimulating]);

  const currentGroundStep = activeGroundRoute?.steps[currentStepIndex] || null;
  const currentDroneStep = activeDroneRoute?.steps[currentStepIndex] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 1. Full-Bleed 3D Quarter-View Real Map Engine */}
      <RealMapQuarterView
        navMode={navMode}
        city={selectedCity}
        droneCorridor={selectedDroneCorridor}
        origin={origin}
        destination={destination}
        groundDangerZones={groundDangerZones}
        droneHazards={droneHazards}
        activeGroundRoute={activeGroundRoute}
        groundRoutes={groundRoutes}
        activeDroneRoute={activeDroneRoute}
        droneRoutes={{
          safe: safeDroneRoute,
          rapid: rapidDroneRoute,
          unsafe: directUnsafeDroneRoute
        }}
        activeGroundRouteType={activeGroundRouteType}
        activeDroneProfileType={activeDroneProfileType}
        onOriginChange={(coords) => {
          setOrigin(coords);
          setOriginName(`Custom Origin (${coords[1].toFixed(3)}, ${coords[0].toFixed(3)})`);
          setSimProgress(0);
          setIsSimulating(false);
          toast.success('SkyPad A repositioned');
        }}
        onDestinationChange={(coords) => {
          setDestination(coords);
          setDestinationName(`Custom Destination (${coords[1].toFixed(3)}, ${coords[0].toFixed(3)})`);
          setSimProgress(0);
          setIsSimulating(false);
          toast.success('SkyPad B repositioned');
        }}
        onAddCustomHazard={handleAddCustomHazard}
        simProgress={simProgress}
        isSimulating={isSimulating}
        cameraMode={cameraMode}
        pickingMode={pickingMode}
        onPickingComplete={() => setPickingMode('NONE')}
        onVehicleStepChange={setCurrentStepIndex}
      />

      {/* 2. Tesla & Apple-Inspired Minimalist Glass Overlay with 3D Altitude HUD */}
      <TeslaGlassOverlay
        navMode={navMode}
        onNavModeChange={handleNavModeChange}
        selectedCity={selectedCity}
        selectedDroneCorridor={selectedDroneCorridor}
        onCityChange={handleCorridorChange}
        selectedDroneMission={selectedDroneMission}
        onSelectDroneMission={setSelectedDroneMission}
        originName={originName}
        destinationName={destinationName}
        activeGroundRoute={activeGroundRoute}
        groundDirectRoute={groundRoutes.unsafe}
        activeDroneRoute={activeDroneRoute}
        activeGroundRouteType={activeGroundRouteType}
        activeDroneProfileType={activeDroneProfileType}
        onSelectGroundRouteType={setActiveGroundRouteType}
        onSelectDroneProfileType={setActiveDroneProfileType}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onResetSimulation={() => {
          setSimProgress(0);
          setIsSimulating(false);
          lastSpokenStepRef.current = -1;
        }}
        simProgress={simProgress}
        currentGroundStep={currentGroundStep}
        currentDroneStep={currentDroneStep}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        pickingMode={pickingMode}
        onSetPickingMode={setPickingMode}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenMobileExport={() => setIsMobileModalOpen(true)}
        groundDangerZones={groundDangerZones}
      />

      {/* 3. Slide-out Risk & Aero Telemetry Analytics Drawer */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto apple-glass border-white/10 text-slate-100 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100">
              {navMode === 'DRONE_SKYWAY' ? 'AeroSafe Drone Flight Telemetry' : 'Physical Road Safety & Crime Analytics'}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <DangerAnalyticsPanel
              navMode={navMode}
              selectedCity={selectedCity}
              selectedDroneCorridor={selectedDroneCorridor}
              selectedDroneMission={selectedDroneMission}
              activeGroundRoute={activeGroundRoute}
              groundDirectRoute={groundRoutes.unsafe}
              activeDroneRoute={activeDroneRoute}
              groundDangerZones={groundDangerZones}
              droneHazards={droneHazards}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Native Mobile Flutter & Swift Code Export Modal */}
      <MobilePlatformExportModal
        open={isMobileModalOpen}
        onOpenChange={setIsMobileModalOpen}
      />
    </div>
  );
};

export default Index;
