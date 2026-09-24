import React, { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DangerZone, CityPreset } from '@/lib/danger-zones';
import { DroneHazardZone, DroneCityCorridor } from '@/lib/drone-hazards';
import { RouteOption, RouteType } from '@/lib/safe-routing-engine';
import { DroneRouteOption, DroneRouteProfileType } from '@/lib/drone-routing-engine';
import { NavMode, CameraMode, PickingMode, GeoPoint } from '@/types/navigation';
import {
  SituationalLayerConfig,
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility,
  TrafficCCTV,
  ThermalHotspot
} from '@/types/situational';
import { updateOriginPin, updateDestPin, updateVehicleMarkerIcon } from './map/MapMarkers';
import { getActiveHazardFeatures, setupMapLayers } from './map/MapLayers';
import { SituationalLayers } from './map/SituationalLayers';
import { TacticalEntityCard } from './intel/TacticalEntityCard';

export type { NavMode, CameraMode, PickingMode };

interface Props {
  navMode: NavMode;
  city: CityPreset;
  droneCorridor: DroneCityCorridor;
  origin: GeoPoint;
  destination: GeoPoint;
  groundDangerZones: DangerZone[];
  droneHazards: DroneHazardZone[];
  activeGroundRoute: RouteOption | null;
  groundRoutes?: {
    safe: RouteOption | null;
    balanced: RouteOption | null;
    unsafe: RouteOption | null;
  };
  activeDroneRoute: DroneRouteOption | null;
  droneRoutes?: {
    safe: DroneRouteOption | null;
    rapid: DroneRouteOption | null;
    unsafe: DroneRouteOption | null;
  };
  activeGroundRouteType: RouteType;
  activeDroneProfileType: DroneRouteProfileType;
  onOriginChange: (coords: GeoPoint) => void;
  onDestinationChange: (coords: GeoPoint) => void;
  onAddCustomHazard: (coords: GeoPoint) => void;
  simProgress: number; // 0 to 1
  isSimulating: boolean;
  cameraMode: CameraMode;
  pickingMode: PickingMode;
  onPickingComplete: () => void;
  onVehicleStepChange?: (stepIndex: number) => void;
  // Situational Telemetry
  situationalLayers?: SituationalLayerConfig;
  satellites?: SatelliteTrack[];
  flights?: LiveFlight[];
  earthquakes?: SeismicHazard[];
  facilities?: CriticalFacility[];
  cctvCameras?: TrafficCCTV[];
  thermalFires?: ThermalHotspot[];
  selectedTelemetryEntity?: {
    type: 'SATELLITE' | 'FLIGHT' | 'EARTHQUAKE' | 'FACILITY' | 'CCTV';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  } | null;
  onSelectTelemetryEntity?: (entity: {
    type: 'SATELLITE' | 'FLIGHT' | 'EARTHQUAKE' | 'FACILITY' | 'CCTV';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }) => void;
  onCloseTelemetryEntity?: () => void;
  onMapCenterChange?: (center: [number, number]) => void;
}

export const RealMapQuarterView: React.FC<Props> = ({
  navMode,
  city,
  droneCorridor,
  origin,
  destination,
  groundDangerZones,
  droneHazards,
  activeGroundRoute,
  groundRoutes,
  activeDroneRoute,
  droneRoutes,
  onOriginChange,
  onDestinationChange,
  onAddCustomHazard,
  simProgress,
  cameraMode,
  pickingMode,
  onPickingComplete,
  onVehicleStepChange,
  situationalLayers,
  satellites = [],
  flights = [],
  earthquakes = [],
  facilities = [],
  cctvCameras = [],
  thermalFires = [],
  selectedTelemetryEntity = null,
  onSelectTelemetryEntity,
  onCloseTelemetryEntity,
  onMapCenterChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Markers
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);

  const isDrone = navMode === 'DRONE_SKYWAY';
  const isOsint = navMode === 'GLOBAL_OSINT';

  const activePathCoordinates: GeoPoint[] = isDrone
    ? (activeDroneRoute?.pathCoordinates || [])
    : (activeGroundRoute?.pathCoordinates || []);

  const activeRouteColor = isDrone
    ? (activeDroneRoute?.color || '#06b6d4')
    : (activeGroundRoute?.color || '#10b981');

  const getSafeRouteCoords = useCallback((): GeoPoint[] => {
    if (isDrone) return droneRoutes?.safe?.pathCoordinates || [];
    return groundRoutes?.safe?.pathCoordinates || [];
  }, [isDrone, droneRoutes?.safe, groundRoutes?.safe]);

  const getBalancedRouteCoords = useCallback((): GeoPoint[] => {
    if (isDrone) return droneRoutes?.rapid?.pathCoordinates || [];
    return groundRoutes?.balanced?.pathCoordinates || [];
  }, [isDrone, droneRoutes?.rapid, groundRoutes?.balanced]);

  const getDirectRouteCoords = useCallback((): GeoPoint[] => {
    if (isDrone) return droneRoutes?.unsafe?.pathCoordinates || [];
    return groundRoutes?.unsafe?.pathCoordinates || [];
  }, [isDrone, droneRoutes?.unsafe, groundRoutes?.unsafe]);

  const pickingModeRef = useRef(pickingMode);
  useEffect(() => {
    pickingModeRef.current = pickingMode;
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = pickingMode !== 'NONE' ? 'crosshair' : 'grab';
    }
  }, [pickingMode]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = isOsint ? [-97.7431, 30.2672] : isDrone ? droneCorridor.center : city.center;
    const initialZoom = isOsint ? 3.0 : isDrone ? droneCorridor.zoom : city.zoom;
    const initialPitch = isOsint ? 35 : isDrone ? droneCorridor.pitch : city.pitch;
    const initialBearing = isOsint ? -10 : isDrone ? droneCorridor.bearing : city.bearing;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap &copy; CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch || 58,
      bearing: initialBearing || -20,
      antialias: true,
      attributionControl: false
    });

    mapRef.current = map;

    // 1. Origin SkyPad Marker
    const elA = document.createElement('div');
    updateOriginPin(elA, navMode);
    originMarkerRef.current = new maplibregl.Marker({ element: elA })
      .setLngLat(origin)
      .addTo(map);

    // 2. Destination SkyPad Marker
    const elB = document.createElement('div');
    updateDestPin(elB, navMode);
    destMarkerRef.current = new maplibregl.Marker({ element: elB })
      .setLngLat(destination)
      .addTo(map);

    // 3. Vehicle / Drone Marker
    const elVeh = document.createElement('div');
    elVeh.className = 'vehicle-marker flex items-center justify-center transition-transform duration-75';
    updateVehicleMarkerIcon(elVeh, navMode);
    vehicleMarkerRef.current = new maplibregl.Marker({ element: elVeh })
      .setLngLat(origin)
      .addTo(map);

    map.on('load', () => {
      const hazards = getActiveHazardFeatures(navMode, groundDangerZones, droneHazards);
      setupMapLayers(
        map,
        hazards,
        getDirectRouteCoords(),
        getBalancedRouteCoords(),
        getSafeRouteCoords(),
        activePathCoordinates,
        activeRouteColor
      );
    });

    map.on('move', () => {
      const center = map.getCenter();
      if (onMapCenterChange) {
        onMapCenterChange([center.lng, center.lat]);
      }
    });

    map.on('click', (e) => {
      const coords: GeoPoint = [e.lngLat.lng, e.lngLat.lat];
      if (pickingModeRef.current === 'PICK_A') {
        onOriginChange(coords);
        onPickingComplete();
      } else if (pickingModeRef.current === 'PICK_B') {
        onDestinationChange(coords);
        onPickingComplete();
      } else if (pickingModeRef.current === 'ADD_HAZARD') {
        onAddCustomHazard(coords);
        onPickingComplete();
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  // Mode updates for markers
  useEffect(() => {
    const isModeOsint = navMode === 'GLOBAL_OSINT';
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.getElement().style.display = isModeOsint ? 'none' : 'flex';
      if (!isModeOsint) updateVehicleMarkerIcon(vehicleMarkerRef.current.getElement(), navMode);
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.getElement().style.display = isModeOsint ? 'none' : 'flex';
      if (!isModeOsint) updateOriginPin(originMarkerRef.current.getElement(), navMode);
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.getElement().style.display = isModeOsint ? 'none' : 'flex';
      if (!isModeOsint) updateDestPin(destMarkerRef.current.getElement(), navMode);
    }

    if (isModeOsint && mapRef.current) {
      mapRef.current.flyTo({
        zoom: 2.8,
        pitch: 35,
        bearing: -10,
        duration: 1800
      });
    }
  }, [navMode]);

  // City / Corridor changes
  useEffect(() => {
    if (!mapRef.current || isOsint) return;
    const target = isDrone ? droneCorridor : city;
    mapRef.current.flyTo({
      center: target.center,
      zoom: target.zoom,
      pitch: cameraMode === 'TOP_DOWN' ? 0 : (target.pitch || 58),
      bearing: target.bearing || -20,
      duration: 1600
    });
  }, [city, droneCorridor, isDrone, isOsint]);

  // Waypoints update
  useEffect(() => {
    if (originMarkerRef.current) originMarkerRef.current.setLngLat(origin);
    if (destMarkerRef.current) destMarkerRef.current.setLngLat(destination);
  }, [origin, destination]);

  // Camera Mode changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (cameraMode === 'QUARTER_VIEW') {
      mapRef.current.easeTo({ pitch: 58, duration: 800 });
    } else if (cameraMode === 'TOP_DOWN') {
      mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    } else if (cameraMode === 'ORBITAL_WIDE') {
      mapRef.current.flyTo({ zoom: 2.2, pitch: 35, bearing: 0, duration: 1500 });
    }
  }, [cameraMode]);

  // Update Hazard GeoJSON Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const src = map.getSource('hazards-src') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: getActiveHazardFeatures(navMode, groundDangerZones, droneHazards)
      });
    }
  }, [groundDangerZones, droneHazards, navMode]);

  // Update Route GeoJSON Sources & Active Highlight
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Safe Route
    const safeSrc = map.getSource('safe-route-src') as maplibregl.GeoJSONSource | undefined;
    if (safeSrc) {
      safeSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: isOsint ? [] : getSafeRouteCoords() }
      });
    }

    // 2. Balanced Route
    const balancedSrc = map.getSource('balanced-route-src') as maplibregl.GeoJSONSource | undefined;
    if (balancedSrc) {
      balancedSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: isOsint ? [] : getBalancedRouteCoords() }
      });
    }

    // 3. Direct Route
    const directSrc = map.getSource('direct-route-src') as maplibregl.GeoJSONSource | undefined;
    if (directSrc) {
      directSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: isOsint ? [] : getDirectRouteCoords() }
      });
    }

    // 4. Active Route Highlight
    const activeSrc = map.getSource('active-route-src') as maplibregl.GeoJSONSource | undefined;
    if (activeSrc) {
      activeSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: isOsint ? [] : activePathCoordinates }
      });

      if (map.getLayer('active-route-glow')) {
        map.setPaintProperty('active-route-glow', 'line-color', activeRouteColor);
      }
      if (map.getLayer('active-route-core')) {
        map.setPaintProperty('active-route-core', 'line-color', activeRouteColor);
      }
    }
  }, [
    groundRoutes, 
    droneRoutes, 
    activePathCoordinates, 
    activeRouteColor, 
    getSafeRouteCoords, 
    getBalancedRouteCoords, 
    getDirectRouteCoords,
    isOsint
  ]);

  // Animate Vehicle / Drone Marker along active route
  useEffect(() => {
    if (!vehicleMarkerRef.current || activePathCoordinates.length < 2 || isOsint) return;

    const coords = activePathCoordinates;
    const totalSegments = coords.length - 1;
    const scaledProgress = Math.min(Math.max(simProgress, 0), 1) * totalSegments;

    const segIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segT = scaledProgress - segIndex;

    const p1 = coords[segIndex];
    const p2 = coords[segIndex + 1];

    const currentLng = p1[0] + (p2[0] - p1[0]) * segT;
    const currentLat = p1[1] + (p2[1] - p1[1]) * segT;
    const currentPos: GeoPoint = [currentLng, currentLat];

    vehicleMarkerRef.current.setLngLat(currentPos);

    // Calculate heading
    const dLng = p2[0] - p1[0];
    const dLat = p2[1] - p1[1];
    const angleRad = Math.atan2(dLng, dLat);
    const angleDeg = (angleRad * 180) / Math.PI;

    const el = vehicleMarkerRef.current.getElement();
    if (el) {
      el.style.transform = `${el.style.transform.split('rotate')[0]} rotate(${angleDeg}deg)`;
    }

    if (cameraMode === 'DRIVER_FOLLOW' && mapRef.current) {
      mapRef.current.easeTo({
        center: currentPos,
        bearing: angleDeg,
        pitch: isDrone ? 62 : 55,
        duration: 80
      });
    }

    const steps = isDrone ? (activeDroneRoute?.steps || []) : (activeGroundRoute?.steps || []);
    if (onVehicleStepChange && steps.length > 0) {
      const stepIdx = Math.min(
        Math.floor(simProgress * steps.length),
        steps.length - 1
      );
      onVehicleStepChange(stepIdx);
    }
  }, [simProgress, activePathCoordinates, cameraMode, isDrone, isOsint, onVehicleStepChange, activeDroneRoute, activeGroundRoute]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Situational OSINT MapLibre Layers */}
      {situationalLayers && (
        <SituationalLayers
          map={mapRef.current}
          layers={situationalLayers}
          satellites={satellites}
          flights={flights}
          earthquakes={earthquakes}
          facilities={facilities}
          cctvCameras={cctvCameras}
          thermalFires={thermalFires}
          onSelectEntity={onSelectTelemetryEntity || (() => {})}
        />
      )}

      {/* Selected Entity Tactical Telemetry Card */}
      {selectedTelemetryEntity && (
        <TacticalEntityCard
          entity={selectedTelemetryEntity}
          onClose={onCloseTelemetryEntity || (() => {})}
          onFocusCoordinates={(coords) => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: coords,
                zoom: 8.0,
                pitch: 45,
                duration: 1600
              });
            }
          }}
        />
      )}
    </div>
  );
};
