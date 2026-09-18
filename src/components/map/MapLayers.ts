import * as maplibregl from 'maplibre-gl';
import { DangerZone, createDangerZonePolygonGeoJSON } from '@/lib/danger-zones';
import { DroneHazardZone } from '@/lib/drone-hazards';
import { NavMode, GeoPoint } from '@/types/navigation';

export function getActiveHazardFeatures(
  navMode: NavMode,
  groundDangerZones: DangerZone[],
  droneHazards: DroneHazardZone[]
) {
  if (navMode === 'DRONE_SKYWAY') {
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
}

export function setupMapLayers(
  map: maplibregl.Map,
  hazardFeatures: GeoJSON.Feature[],
  directCoords: GeoPoint[],
  balancedCoords: GeoPoint[],
  safeCoords: GeoPoint[],
  activeCoords: GeoPoint[],
  activeColor: string
) {
  // 1. Hazard Polygons
  map.addSource('hazards-src', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: hazardFeatures
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
        coordinates: directCoords
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
        coordinates: balancedCoords
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
        coordinates: safeCoords
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

  // 5. Active Route Highlight Glow Layer
  map.addSource('active-route-src', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: activeCoords
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
      'line-color': activeColor,
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
      'line-color': activeColor,
      'line-width': 6.0,
      'line-opacity': 1.0
    }
  });
}
