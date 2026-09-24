import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility,
  TrafficCCTV,
  ThermalHotspot,
  SituationalLayerConfig
} from '@/types/situational';

interface SituationalLayersProps {
  map: maplibregl.Map | null;
  layers: SituationalLayerConfig;
  satellites: SatelliteTrack[];
  flights: LiveFlight[];
  earthquakes: SeismicHazard[];
  facilities: CriticalFacility[];
  cctvCameras: TrafficCCTV[];
  thermalFires: ThermalHotspot[];
  onSelectEntity: (entity: {
    type: 'SATELLITE' | 'FLIGHT' | 'EARTHQUAKE' | 'FACILITY' | 'CCTV';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }) => void;
}

export const SituationalLayers: React.FC<SituationalLayersProps> = ({
  map,
  layers,
  satellites,
  flights,
  earthquakes,
  facilities,
  cctvCameras,
  thermalFires,
  onSelectEntity
}) => {
  // Store active marker refs so we can clean up & re-render smoothly
  const satelliteMarkersRef = useRef<maplibregl.Marker[]>([]);
  const flightMarkersRef = useRef<maplibregl.Marker[]>([]);
  const facilityMarkersRef = useRef<maplibregl.Marker[]>([]);
  const cctvMarkersRef = useRef<maplibregl.Marker[]>([]);
  const thermalMarkersRef = useRef<maplibregl.Marker[]>([]);

  // 1. Satellite Orbital Tracks GeoJSON Layer
  useEffect(() => {
    if (!map) return;

    const setupSatTracks = () => {
      const trackFeatures: GeoJSON.Feature[] = layers.satellites
        ? satellites.map((sat) => ({
            type: 'Feature',
            properties: { id: sat.id, name: sat.name },
            geometry: {
              type: 'LineString',
              coordinates: sat.orbitalPath
            }
          }))
        : [];

      const src = map.getSource('sat-tracks-src') as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData({ type: 'FeatureCollection', features: trackFeatures });
      } else if (map.isStyleLoaded()) {
        map.addSource('sat-tracks-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: trackFeatures }
        });

        map.addLayer({
          id: 'sat-tracks-glow',
          type: 'line',
          source: 'sat-tracks-src',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 4,
            'line-opacity': 0.35,
            'line-blur': 3
          }
        });

        map.addLayer({
          id: 'sat-tracks-line',
          type: 'line',
          source: 'sat-tracks-src',
          paint: {
            'line-color': '#7dd3fc',
            'line-width': 1.8,
            'line-opacity': 0.85,
            'line-dasharray': [3, 2]
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      setupSatTracks();
    } else {
      map.once('load', setupSatTracks);
    }
  }, [map, satellites, layers.satellites]);

  // 2. Satellite Position DOM Markers
  useEffect(() => {
    satelliteMarkersRef.current.forEach((m) => m.remove());
    satelliteMarkersRef.current = [];

    if (!map || !layers.satellites) return;

    satellites.forEach((sat) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center pointer-events-auto';
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-7 h-7">
          <div class="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full bg-slate-950 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/80">
            <div class="w-2 h-2 rounded-full bg-cyan-300"></div>
          </div>
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 whitespace-nowrap shadow-md">
          ${sat.name} · ${sat.altitudeKm}km
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'SATELLITE', data: sat });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([sat.longitude, sat.latitude])
        .addTo(map);

      satelliteMarkersRef.current.push(marker);
    });
  }, [map, satellites, layers.satellites, onSelectEntity]);

  // 3. Live Aircraft Radar Markers
  useEffect(() => {
    flightMarkersRef.current.forEach((m) => m.remove());
    flightMarkersRef.current = [];

    if (!map || !layers.flights) return;

    flights.forEach((craft) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center pointer-events-auto';
      const isMil = craft.isMilitary;
      const colorClass = isMil ? 'text-amber-400 border-amber-400' : 'text-emerald-400 border-emerald-400';
      const bgGlow = isMil ? 'bg-amber-500/30' : 'bg-emerald-500/30';

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute inset-0 rounded-full ${bgGlow} animate-pulse"></div>
          <div style="transform: rotate(${craft.headingDeg}deg);" class="relative w-5 h-5 flex items-center justify-center transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="${isMil ? 'text-amber-400' : 'text-emerald-400'}">
              <path d="M12 2L15 9L22 13L15 14L14 20L12 18L10 20L9 14L2 13L9 9L12 2Z" />
            </svg>
          </div>
        </div>
        <div class="mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 border ${colorClass} text-[8px] font-mono ${isMil ? 'text-amber-300' : 'text-emerald-300'} whitespace-nowrap shadow">
          ${craft.callsign} · FL${Math.round(craft.altitudeFt / 100)}
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'FLIGHT', data: craft });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([craft.longitude, craft.latitude])
        .addTo(map);

      flightMarkersRef.current.push(marker);
    });
  }, [map, flights, layers.flights, onSelectEntity]);

  // 4. USGS Earthquakes Markers
  useEffect(() => {
    if (!map) return;

    const setupSeismic = () => {
      const features: GeoJSON.Feature[] = layers.seismic
        ? earthquakes.map((eq) => ({
            type: 'Feature',
            properties: {
              id: eq.id,
              place: eq.place,
              mag: eq.magnitude,
              depth: eq.depthKm
            },
            geometry: {
              type: 'Point',
              coordinates: [eq.longitude, eq.latitude]
            }
          }))
        : [];

      const src = map.getSource('seismic-src') as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData({ type: 'FeatureCollection', features });
      } else if (map.isStyleLoaded()) {
        map.addSource('seismic-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features }
        });

        map.addLayer({
          id: 'seismic-heat-glow',
          type: 'circle',
          source: 'seismic-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2, 12, 7, 45],
            'circle-color': '#f43f5e',
            'circle-opacity': 0.35,
            'circle-blur': 0.8
          }
        });

        map.addLayer({
          id: 'seismic-core-circle',
          type: 'circle',
          source: 'seismic-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2, 5, 7, 18],
            'circle-color': '#e11d48',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fda4af'
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      setupSeismic();
    } else {
      map.once('load', setupSeismic);
    }
  }, [map, earthquakes, layers.seismic]);

  // 5. Critical Infrastructure (Datacenters & Dams)
  useEffect(() => {
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    if (!map || !layers.criticalFacilities) return;

    facilities.forEach((fac) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center pointer-events-auto';
      const isDam = fac.type === 'dam';
      const badgeColor = isDam ? 'border-sky-500 text-sky-300' : 'border-purple-500 text-purple-300';
      const iconSvg = isDam
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;

      el.innerHTML = `
        <div class="relative w-6 h-6 rounded-lg bg-slate-950/90 border ${badgeColor} flex items-center justify-center shadow-lg">
          ${iconSvg}
        </div>
        <div class="mt-0.5 px-1.5 py-0.5 rounded bg-slate-950/95 border border-slate-700 text-[8px] font-mono text-slate-300 whitespace-nowrap shadow hidden group-hover:block">
          ${fac.name}
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'FACILITY', data: fac });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([fac.longitude, fac.latitude])
        .addTo(map);

      facilityMarkersRef.current.push(marker);
    });
  }, [map, facilities, layers.criticalFacilities, onSelectEntity]);

  // 6. NASA FIRMS Thermal Fires
  useEffect(() => {
    thermalMarkersRef.current.forEach((m) => m.remove());
    thermalMarkersRef.current = [];

    if (!map || !layers.thermalFires) return;

    thermalFires.forEach((fire) => {
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center w-5 h-5 pointer-events-none';
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-5 h-5">
          <div class="absolute inset-0 rounded-full bg-orange-500/50 animate-ping"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border border-yellow-200 flex items-center justify-center shadow-lg shadow-orange-600/80">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([fire.longitude, fire.latitude])
        .addTo(map);

      thermalMarkersRef.current.push(marker);
    });
  }, [map, thermalFires, layers.thermalFires]);

  // 7. CCTV Cameras
  useEffect(() => {
    cctvMarkersRef.current.forEach((m) => m.remove());
    cctvMarkersRef.current = [];

    if (!map || !layers.cctvCameras) return;

    cctvCameras.forEach((cam) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center pointer-events-auto';
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-slate-950/90 border border-blue-400 flex items-center justify-center shadow-lg">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'CCTV', data: cam });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.longitude, cam.latitude])
        .addTo(map);

      cctvMarkersRef.current.push(marker);
    });
  }, [map, cctvCameras, layers.cctvCameras, onSelectEntity]);

  return null;
};
