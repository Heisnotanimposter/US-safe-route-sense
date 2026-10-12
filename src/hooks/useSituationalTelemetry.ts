import { useState, useEffect, useCallback } from 'react';
import {
  SatelliteTrack,
  LiveFlight,
  SeismicHazard,
  CriticalFacility,
  TrafficCCTV,
  ThermalHotspot,
  SituationalLayerConfig
} from '@/types/situational';
import {
  calculateSatellitePositions,
  fetchUSGSEarthquakes,
  fetchLiveFlights,
  CRITICAL_FACILITIES,
  SAMPLE_CCTV_CAMERAS,
  SAMPLE_THERMAL_FIRES
} from '@/lib/situationalServices';

export function useSituationalTelemetry(centerLng: number, centerLat: number) {
  // Layer visibility state
  const [layers, setLayers] = useState<SituationalLayerConfig>({
    satellites: true,
    flights: true,
    seismic: true,
    thermalFires: true,
    criticalFacilities: true,
    cctvCameras: false
  });

  const [satellites, setSatellites] = useState<SatelliteTrack[]>([]);
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [earthquakes, setEarthquakes] = useState<SeismicHazard[]>([]);
  const [facilities] = useState<CriticalFacility[]>(CRITICAL_FACILITIES);
  const [cctvCameras] = useState<TrafficCCTV[]>(SAMPLE_CCTV_CAMERAS);
  const [thermalFires] = useState<ThermalHotspot[]>(SAMPLE_THERMAL_FIRES);

  // Selected telemetry entity for tactical inspection card
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'SATELLITE' | 'FLIGHT' | 'EARTHQUAKE' | 'FACILITY' | 'CCTV';
    data: SatelliteTrack | LiveFlight | SeismicHazard | CriticalFacility | TrafficCCTV;
  } | null>(null);

  // Toggle individual layers
  const toggleLayer = useCallback((layerKey: keyof SituationalLayerConfig) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  // Update satellite positions every 3 seconds via SGP4 propagation
  useEffect(() => {
    const updateSatellites = () => {
      const current = calculateSatellitePositions(new Date());
      setSatellites(current);
    };
    updateSatellites();
    const interval = setInterval(updateSatellites, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time USGS earthquakes once on mount and every 2 minutes
  useEffect(() => {
    let isMounted = true;
    const loadEarthquakes = async () => {
      const quakes = await fetchUSGSEarthquakes();
      if (isMounted) setEarthquakes(quakes);
    };
    loadEarthquakes();
    const interval = setInterval(loadEarthquakes, 120000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch live aircraft around current coordinates every 10 seconds
  useEffect(() => {
    let isMounted = true;
    const loadFlights = async () => {
      const craft = await fetchLiveFlights(centerLng, centerLat);
      if (isMounted) setFlights(craft);
    };
    loadFlights();
    const interval = setInterval(loadFlights, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [centerLng, centerLat]);

  return {
    layers,
    toggleLayer,
    satellites,
    flights,
    earthquakes,
    facilities,
    cctvCameras,
    thermalFires,
    selectedEntity,
    setSelectedEntity
  };
}
