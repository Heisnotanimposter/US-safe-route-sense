import { useState, useCallback } from 'react';
import { CITY_PRESETS, CityPreset, DangerZone } from '@/lib/danger-zones';
import { 
  DRONE_CITY_CORRIDORS, 
  DroneCityCorridor, 
  DroneHazardZone, 
  DRONE_MISSION_PRESETS, 
  DroneDeliveryMission 
} from '@/lib/drone-hazards';
import { NavMode, CameraMode, PickingMode, GeoPoint } from '@/types/navigation';
import { toast } from 'sonner';

export function useNavigationState() {
  // Navigation mode
  const [navMode, setNavMode] = useState<NavMode>('DRONE_SKYWAY');

  // Presets & Active Mission
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITY_PRESETS[0]);
  const [selectedDroneCorridor, setSelectedDroneCorridor] = useState<DroneCityCorridor>(DRONE_CITY_CORRIDORS[0]);
  const [selectedDroneMission, setSelectedDroneMission] = useState<DroneDeliveryMission>(DRONE_MISSION_PRESETS[0]);

  // Waypoints
  const [origin, setOrigin] = useState<GeoPoint>(DRONE_CITY_CORRIDORS[0].defaultOrigin.coords);
  const [originName, setOriginName] = useState<string>(DRONE_CITY_CORRIDORS[0].defaultOrigin.name);
  const [destination, setDestination] = useState<GeoPoint>(DRONE_CITY_CORRIDORS[0].defaultDestination.coords);
  const [destinationName, setDestinationName] = useState<string>(DRONE_CITY_CORRIDORS[0].defaultDestination.name);

  // Dynamic Hazards
  const [groundDangerZones, setGroundDangerZones] = useState<DangerZone[]>(CITY_PRESETS[0].dangerZones);
  const [droneHazards, setDroneHazards] = useState<DroneHazardZone[]>(DRONE_CITY_CORRIDORS[0].hazards);

  // Camera & Interactive Picking
  const [cameraMode, setCameraMode] = useState<CameraMode>('QUARTER_VIEW');
  const [pickingMode, setPickingMode] = useState<PickingMode>('NONE');

  // Switch between Drone Skyway & Ground Car Mode
  const switchNavMode = useCallback((mode: NavMode) => {
    setNavMode(mode);
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
  }, [selectedDroneCorridor, selectedCity]);

  // Change City or Corridor
  const switchCorridorOrCity = useCallback((id: string) => {
    const corridor = DRONE_CITY_CORRIDORS.find(c => c.id === id || c.id.startsWith(id)) || DRONE_CITY_CORRIDORS[0];
    const city = CITY_PRESETS.find(c => c.id === id || id.startsWith(c.id)) || CITY_PRESETS[0];

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

    toast.info(`Switched to ${corridor.name} (${corridor.corridorDistanceKm} km corridor)`);
  }, [navMode]);

  // Set Custom Origin
  const updateOrigin = useCallback((coords: GeoPoint, name?: string) => {
    setOrigin(coords);
    setOriginName(name || `Custom Origin (${coords[1].toFixed(3)}, ${coords[0].toFixed(3)})`);
    toast.success('Origin waypoint updated');
  }, []);

  // Set Custom Destination
  const updateDestination = useCallback((coords: GeoPoint, name?: string) => {
    setDestination(coords);
    setDestinationName(name || `Custom Destination (${coords[1].toFixed(3)}, ${coords[0].toFixed(3)})`);
    toast.success('Destination waypoint updated');
  }, []);

  // Dynamic Hazard Insertion
  const addCustomHazard = useCallback((coords: GeoPoint) => {
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
  }, [navMode, droneHazards.length, groundDangerZones.length]);

  return {
    navMode,
    switchNavMode,
    selectedCity,
    selectedDroneCorridor,
    selectedDroneMission,
    setSelectedDroneMission,
    origin,
    originName,
    destination,
    destinationName,
    groundDangerZones,
    droneHazards,
    cameraMode,
    setCameraMode,
    pickingMode,
    setPickingMode,
    switchCorridorOrCity,
    updateOrigin,
    updateDestination,
    addCustomHazard
  };
}
