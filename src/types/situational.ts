export interface SatelliteTrack {
  id: string;
  name: string;
  noradId: number;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmS: number;
  orbitalPath: [number, number][]; // [lng, lat]
  category: 'STATION' | 'WEATHER' | 'NAVIGATION' | 'COMMUNICATION' | 'SCIENTIFIC';
}

export interface LiveFlight {
  id: string;
  callsign: string;
  squawk?: string;
  originCountry?: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  velocityKnots: number;
  headingDeg: number;
  isMilitary?: boolean;
}

export interface SeismicHazard {
  id: string;
  place: string;
  magnitude: number;
  depthKm: number;
  time: number;
  latitude: number;
  longitude: number;
  tsunamiAlert: boolean;
}

export interface ThermalHotspot {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number; // Kelvin
  confidence: 'l' | 'n' | 'h' | number;
  acqDate: string;
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: 'datacenter' | 'dam' | 'power_grid' | 'ground_station';
  latitude: number;
  longitude: number;
  operator?: string;
  capacity?: string;
}

export interface TrafficCCTV {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  source: 'austin' | 'caltrans' | 'tfl';
  direction?: string;
}

export interface SituationalLayerConfig {
  satellites: boolean;
  flights: boolean;
  seismic: boolean;
  thermalFires: boolean;
  criticalFacilities: boolean;
  cctvCameras: boolean;
}
