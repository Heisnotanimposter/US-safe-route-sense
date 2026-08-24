import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DangerZone, CityPreset, createDangerZonePolygonGeoJSON } from '@/lib/danger-zones';
import { DroneHazardZone, DroneCityCorridor } from '@/lib/drone-hazards';
import { RouteOption, RouteType } from '@/lib/safe-routing-engine';
import { DroneRouteOption, DroneRouteProfileType } from '@/lib/drone-routing-engine';

export type NavMode = 'DRONE_SKYWAY' | 'GROUND_VEHICLE';
export type CameraMode = 'QUARTER_VIEW' | 'DRIVER_FOLLOW' | 'TOP_DOWN';
export type PickingMode = 'NONE' | 'PICK_A' | 'PICK_B' | 'ADD_HAZARD';

interface Props {
  navMode: NavMode;
  city: CityPreset;
  droneCorridor: DroneCityCorridor;
  origin: [number, number]; // [lng, lat]
  destination: [number, number]; // [lng, lat]
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
  onOriginChange: (coords: [number, number]) => void;
  onDestinationChange: (coords: [number, number]) => void;
  onAddCustomHazard: (coords: [number, number]) => void;
  simProgress: number; // 0 to 1
  isSimulating: boolean;
  cameraMode: CameraMode;
  pickingMode: PickingMode;
  onPickingComplete: () => void;
  onVehicleStepChange?: (stepIndex: number) => void;
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
  activeGroundRouteType,
  activeDroneProfileType,
  onOriginChange,
  onDestinationChange,
  onAddCustomHazard,
  simProgress,
  isSimulating,
  cameraMode,
  pickingMode,
  onPickingComplete,
  onVehicleStepChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Markers
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);

  const isDrone = navMode === 'DRONE_SKYWAY';

  const activePathCoordinates = isDrone
    ? (activeDroneRoute?.pathCoordinates || [])
    : (activeGroundRoute?.pathCoordinates || []);

  const activeRouteColor = isDrone
    ? (activeDroneRoute?.color || '#06b6d4')
    : (activeGroundRoute?.color || '#10b981');

  // Initialize Real MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = isDrone ? droneCorridor.center : city.center;
    const initialZoom = isDrone ? droneCorridor.zoom : city.zoom;
    const initialPitch = isDrone ? droneCorridor.pitch : city.pitch;
    const initialBearing = isDrone ? droneCorridor.bearing : city.bearing;

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

    // 1. Origin 3D SkyPad Marker
    const elA = document.createElement('div');
    updateOriginPin(elA, navMode);
    originMarkerRef.current = new maplibregl.Marker({ element: elA })
      .setLngLat(origin)
      .addTo(map);

    // 2. Destination 3D SkyPad Marker
    const elB = document.createElement('div');
    updateDestPin(elB, navMode);
    destMarkerRef.current = new maplibregl.Marker({ element: elB })
      .setLngLat(destination)
      .addTo(map);

    // 3. 3D Quadcopter Drone / Cyber Vehicle Marker
    const elVeh = document.createElement('div');
    elVeh.className = 'vehicle-marker flex items-center justify-center transition-transform duration-75';
    updateVehicleMarkerIcon(elVeh, navMode);
    vehicleMarkerRef.current = new maplibregl.Marker({ element: elVeh })
      .setLngLat(origin)
      .addTo(map);

    map.on('load', () => {
      setupMapLayers(map);
    });

    map.on('click', (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
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

  const updateOriginPin = (el: HTMLElement, mode: NavMode) => {
    if (mode === 'DRONE_SKYWAY') {
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-slate-950/90 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px] shadow-2xl shadow-cyan-500/80">
            H1
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/90 text-white font-mono font-bold text-xs border-2 border-white shadow-xl shadow-cyan-500/50">
          A
        </div>
      `;
    }
  };

  const updateDestPin = (el: HTMLElement, mode: NavMode) => {
    if (mode === 'DRONE_SKYWAY') {
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-slate-950/90 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-mono font-bold text-[11px] shadow-2xl shadow-emerald-500/80">
            H2
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 text-white font-mono font-bold text-xs border-2 border-white shadow-xl shadow-emerald-500/50">
          B
        </div>
      `;
    }
  };

  const updateVehicleMarkerIcon = (el: HTMLElement, mode: NavMode) => {
    if (mode === 'DRONE_SKYWAY') {
      el.innerHTML = `
        <div class="relative flex flex-col items-center justify-center w-14 h-14">
          <!-- Altitude Laser Ground Projection -->
          <div class="absolute -bottom-6 w-1 h-6 bg-gradient-to-b from-cyan-400 to-transparent opacity-80 animate-pulse"></div>
          <!-- 3D Quadcopter Airframe with Spinning Rotors -->
          <div class="relative w-10 h-10 rounded-full bg-slate-950/95 border-2 border-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin duration-700">
              <path d="M12 2v20M2 12h20"/>
              <circle cx="12" cy="12" r="3" fill="#06b6d4"/>
            </svg>
            <div class="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400/80 animate-ping"></div>
            <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400/80 animate-ping"></div>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 border-2 border-white text-white shadow-2xl shadow-emerald-500/80">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="white" stroke="none"/>
          </svg>
        </div>
      `;
    }
  };

  useEffect(() => {
    if (vehicleMarkerRef.current) {
      updateVehicleMarkerIcon(vehicleMarkerRef.current.getElement(), navMode);
    }
    if (originMarkerRef.current) {
      updateOriginPin(originMarkerRef.current.getElement(), navMode);
    }
    if (destMarkerRef.current) {
      updateDestPin(destMarkerRef.current.getElement(), navMode);
    }
  }, [navMode]);

  const pickingModeRef = useRef(pickingMode);
  useEffect(() => {
    pickingModeRef.current = pickingMode;
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = pickingMode !== 'NONE' ? 'crosshair' : 'grab';
    }
  }, [pickingMode]);

  // Fly to location when city or corridor changes
  useEffect(() => {
    if (!mapRef.current) return;
    const target = isDrone ? droneCorridor : city;
    mapRef.current.flyTo({
      center: target.center,
      zoom: target.zoom,
      pitch: cameraMode === 'TOP_DOWN' ? 0 : (target.pitch || 58),
      bearing: target.bearing || -20,
      duration: 1600
    });
  }, [city, droneCorridor, isDrone]);

  useEffect(() => {
    if (originMarkerRef.current) originMarkerRef.current.setLngLat(origin);
    if (destMarkerRef.current) destMarkerRef.current.setLngLat(destination);
  }, [origin, destination]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (cameraMode === 'QUARTER_VIEW') {
      mapRef.current.easeTo({ pitch: 58, duration: 800 });
    } else if (cameraMode === 'TOP_DOWN') {
      mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }
  }, [cameraMode]);

  // Setup Layers for ALL THREE ROUTES Simultaneously
  const setupMapLayers = (map: maplibregl.Map) => {
    // 1. Danger/Hazard Polygons GeoJSON
    const features = getActiveHazardFeatures();
    map.addSource('hazards-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });

    map.addLayer({
      id: 'hazards-fill',
      type: 'fill',
      source: 'hazards-src',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.28
      }
    });

    map.addLayer({
      id: 'hazards-line',
      type: 'line',
      source: 'hazards-src',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2.5,
        'line-opacity': 0.85
      }
    });

    // 2. Direct Unsafe Route Layer (Red)
    map.addSource('direct-route-src', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: getDirectRouteCoords()
        }
      }
    });

    map.addLayer({
      id: 'direct-route-line',
      type: 'line',
      source: 'direct-route-src',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ef4444',
        'line-width': 4.5,
        'line-opacity': 0.75,
        'line-dasharray': [2, 2]
      }
    });

    // 3. Balanced Route Layer (Blue)
    map.addSource('balanced-route-src', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: getBalancedRouteCoords()
        }
      }
    });

    map.addLayer({
      id: 'balanced-route-line',
      type: 'line',
      source: 'balanced-route-src',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4.0,
        'line-opacity': 0.65
      }
    });

    // 4. Safe Guardian Route Layer (Emerald / Cyan)
    map.addSource('safe-route-src', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: getSafeRouteCoords()
        }
      }
    });

    map.addLayer({
      id: 'safe-route-line',
      type: 'line',
      source: 'safe-route-src',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#10b981',
        'line-width': 5.0,
        'line-opacity': 0.7
      }
    });

    // 5. Active Selected Route Primary Glow Layer (On Top)
    map.addSource('active-route-src', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: activePathCoordinates
        }
      }
    });

    map.addLayer({
      id: 'active-route-glow',
      type: 'line',
      source: 'active-route-src',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': activeRouteColor,
        'line-width': 18,
        'line-opacity': 0.5
      }
    });

    map.addLayer({
      id: 'active-route-core',
      type: 'line',
      source: 'active-route-src',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': activeRouteColor,
        'line-width': 6.0,
        'line-opacity': 1.0
      }
    });
  };

  const getSafeRouteCoords = () => {
    if (isDrone) return droneRoutes?.safe?.pathCoordinates || [];
    return groundRoutes?.safe?.pathCoordinates || [];
  };

  const getBalancedRouteCoords = () => {
    if (isDrone) return droneRoutes?.rapid?.pathCoordinates || [];
    return groundRoutes?.balanced?.pathCoordinates || [];
  };

  const getDirectRouteCoords = () => {
    if (isDrone) return droneRoutes?.unsafe?.pathCoordinates || [];
    return groundRoutes?.unsafe?.pathCoordinates || [];
  };

  const getActiveHazardFeatures = () => {
    if (isDrone) {
      return droneHazards.map(h => createDangerZonePolygonGeoJSON({
        id: h.id,
        name: h.name,
        category: 'slum_red_zone',
        severity: h.severity,
        riskScore: h.riskScore,
        center: h.center,
        radiusMeters: h.radiusMeters,
        description: h.description,
        recentIncidentsMonth: 0,
        reportedCrimes: [],
        safetyAdvisory: h.safetyAdvisory,
        color: h.color
      }));
    } else {
      return groundDangerZones.map(z => createDangerZonePolygonGeoJSON(z));
    }
  };

  // Update Hazard GeoJSON Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const src = map.getSource('hazards-src') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: getActiveHazardFeatures()
      });
    }
  }, [groundDangerZones, droneHazards, isDrone]);

  // Update All 3 Route GeoJSON Sources & Active Highlight
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Safe Route
    const safeSrc = map.getSource('safe-route-src') as maplibregl.GeoJSONSource | undefined;
    if (safeSrc) {
      safeSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: getSafeRouteCoords() }
      });
    }

    // 2. Balanced Route
    const balancedSrc = map.getSource('balanced-route-src') as maplibregl.GeoJSONSource | undefined;
    if (balancedSrc) {
      balancedSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: getBalancedRouteCoords() }
      });
    }

    // 3. Direct Route
    const directSrc = map.getSource('direct-route-src') as maplibregl.GeoJSONSource | undefined;
    if (directSrc) {
      directSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: getDirectRouteCoords() }
      });
    }

    // 4. Active Route Highlight
    const activeSrc = map.getSource('active-route-src') as maplibregl.GeoJSONSource | undefined;
    if (activeSrc) {
      activeSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: activePathCoordinates }
      });

      if (map.getLayer('active-route-glow')) {
        map.setPaintProperty('active-route-glow', 'line-color', activeRouteColor);
      }
      if (map.getLayer('active-route-core')) {
        map.setPaintProperty('active-route-core', 'line-color', activeRouteColor);
      }
    }
  }, [groundRoutes, droneRoutes, activePathCoordinates, activeRouteColor, isDrone]);

  // Animate Vehicle / Drone Marker along active route
  useEffect(() => {
    if (!vehicleMarkerRef.current || activePathCoordinates.length < 2) return;

    const coords = activePathCoordinates;
    const totalSegments = coords.length - 1;
    const scaledProgress = Math.min(Math.max(simProgress, 0), 1) * totalSegments;

    const segIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segT = scaledProgress - segIndex;

    const p1 = coords[segIndex];
    const p2 = coords[segIndex + 1];

    const currentLng = p1[0] + (p2[0] - p1[0]) * segT;
    const currentLat = p1[1] + (p2[1] - p1[1]) * segT;
    const currentPos: [number, number] = [currentLng, currentLat];

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
  }, [simProgress, activePathCoordinates, cameraMode, isDrone, onVehicleStepChange]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
