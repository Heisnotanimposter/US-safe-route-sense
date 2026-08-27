export type DroneHazardCategory = 
  | 'weather_wind_shear'
  | 'weather_rain_cell'
  | 'faa_airspace_nfz'
  | 'high_density_crowd'
  | 'noise_sensitive_residential';

export interface DroneHazardZone {
  id: string;
  name: string;
  category: DroneHazardCategory;
  severity: 'critical' | 'high' | 'moderate';
  riskScore: number; // 0 to 100
  center: [number, number]; // [lng, lat]
  radiusMeters: number;
  altitudeFloorMeters: number; // e.g. 0m
  altitudeCeilingMeters: number; // e.g. 150m AGL
  description: string;
  impactMetrics: {
    windGustKnots?: number;
    rainIntensityMm?: number;
    crowdDensityPerSqm?: number;
    noiseLimitDba?: number;
    faaAirspaceClass?: string;
  };
  safetyAdvisory: string;
  color: string;
}

export interface DroneDeliveryMission {
  id: string;
  title: string;
  type: 'medical_transport' | 'ecommerce_parcel' | 'infrastructure_inspection' | 'emergency_first_responder';
  icon: string;
  payloadWeightKg: number;
  priorityLevel: 'CRITICAL' | 'EXPEDITE' | 'STANDARD';
  targetAltitudeAglMeters: number; // Above ground level (60 - 120m)
  droneCruiseSpeedKmh: number;
  batteryCapacityWh: number;
  description: string;
}

export const DRONE_MISSION_PRESETS: DroneDeliveryMission[] = [
  {
    id: 'medical_express',
    title: 'Emergency Medical & Blood Transport',
    type: 'medical_transport',
    icon: 'HeartPulse',
    payloadWeightKg: 2.2,
    priorityLevel: 'CRITICAL',
    targetAltitudeAglMeters: 115,
    droneCruiseSpeedKmh: 80,
    batteryCapacityWh: 550,
    description: 'High-priority regional organ and blood plasma delivery along protected high-altitude skyways.'
  },
  {
    id: 'ecommerce_parcel',
    title: 'Regional Autonomous E-Commerce Parcel',
    type: 'ecommerce_parcel',
    icon: 'Package',
    payloadWeightKg: 4.0,
    priorityLevel: 'EXPEDITE',
    targetAltitudeAglMeters: 95,
    droneCruiseSpeedKmh: 68,
    batteryCapacityWh: 650,
    description: 'Direct regional door-to-hub automated package transport bypassing traffic and noise zones.'
  },
  {
    id: 'infrastructure_scan',
    title: 'Regional Power Grid & Bridge LiDAR Scan',
    type: 'infrastructure_inspection',
    icon: 'Scan',
    payloadWeightKg: 2.5,
    priorityLevel: 'STANDARD',
    targetAltitudeAglMeters: 80,
    droneCruiseSpeedKmh: 50,
    batteryCapacityWh: 700,
    description: 'Long-range thermal and LiDAR structural inspection along utility rights-of-way.'
  }
];

export interface DroneCityCorridor {
  id: string;
  name: string;
  region: string;
  corridorDistanceKm: number;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  defaultOrigin: {
    name: string;
    coords: [number, number];
    address: string;
  };
  defaultDestination: {
    name: string;
    coords: [number, number];
    address: string;
  };
  hazards: DroneHazardZone[];
}

export const DRONE_CITY_CORRIDORS: DroneCityCorridor[] = [
  {
    id: 'chicago_regional',
    name: 'Greater Chicago Lakefront Skyway',
    region: 'IL / Great Lakes Regional Hub',
    corridorDistanceKm: 38.5,
    center: [-87.7200, 41.9000],
    zoom: 11.2,
    pitch: 58,
    bearing: -24,
    defaultOrigin: {
      name: 'O\'Hare Cargo SkyLogistics Port',
      coords: [-87.9050, 41.9750],
      address: 'O\'Hare Aeropark Terminal 4, Chicago'
    },
    defaultDestination: {
      name: 'Northwestern Regional Medical SkyPort',
      coords: [-87.6180, 41.8950],
      address: 'Medical Tower SkyPad 1, Chicago'
    },
    hazards: [
      {
        id: 'chi_drone_1',
        name: 'Lake Michigan Wind Shear Funnel',
        category: 'weather_wind_shear',
        severity: 'critical',
        riskScore: 94,
        center: [-87.6250, 41.9100],
        radiusMeters: 2400,
        altitudeFloorMeters: 30,
        altitudeCeilingMeters: 140,
        description: 'Severe coastal microbursts and wind gusts up to 38 knots causing high battery drain and attitude instability.',
        impactMetrics: { windGustKnots: 38 },
        safetyAdvisory: 'Divert flight path inland through river canal sheltered corridor.',
        color: '#06b6d4'
      },
      {
        id: 'chi_drone_2',
        name: 'Midway / Loop FAA Class B Airspace',
        category: 'faa_airspace_nfz',
        severity: 'critical',
        riskScore: 99,
        center: [-87.7520, 41.7860],
        radiusMeters: 3200,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 300,
        description: 'FAA Controlled Commercial Airspace & HEMS Helicopter Ingress. Strict No-Fly-Zone for uncoordinated UAVs.',
        impactMetrics: { faaAirspaceClass: 'Class B Surface' },
        safetyAdvisory: 'Automatic 100% legal perimeter exclusion enforced to avoid collisions and FAA penalties.',
        color: '#ef4444'
      },
      {
        id: 'chi_drone_3',
        name: 'Millennium & Grant Park Crowd Zone',
        category: 'high_density_crowd',
        severity: 'critical',
        riskScore: 91,
        center: [-87.6220, 41.8820],
        radiusMeters: 1600,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 150,
        description: 'Dense outdoor tourist pedestrian concentration. High ground casualty hazard in event of motor failure.',
        impactMetrics: { crowdDensityPerSqm: 4.8 },
        safetyAdvisory: 'Route over non-populated railway tracks and river easements.',
        color: '#f59e0b'
      },
      {
        id: 'chi_drone_4',
        name: 'Lincoln Park Quiet Residential Abatement',
        category: 'noise_sensitive_residential',
        severity: 'high',
        riskScore: 82,
        center: [-87.6500, 41.9250],
        radiusMeters: 2000,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 100,
        description: 'Noise sensitive residential community. Strict municipal low-altitude acoustic ordinances in effect.',
        impactMetrics: { noiseLimitDba: 45 },
        safetyAdvisory: 'Maintain quiet skyway buffer over industrial arterial roads.',
        color: '#8b5cf6'
      },
      {
        id: 'chi_drone_5',
        name: 'Des Plaines River Rain Storm Front',
        category: 'weather_rain_cell',
        severity: 'high',
        riskScore: 87,
        center: [-87.8200, 41.9300],
        radiusMeters: 1800,
        altitudeFloorMeters: 20,
        altitudeCeilingMeters: 200,
        description: 'Localized convective storm cell with 24mm/hr precipitation rate.',
        impactMetrics: { rainIntensityMm: 24 },
        safetyAdvisory: 'Fly at 115m AGL with sensor de-icing buffer.',
        color: '#3b82f6'
      }
    ]
  },
  {
    id: 'la_regional',
    name: 'Greater LA Basin & Orange County Sky Corridor',
    region: 'CA / Southern Pacific Regional Hub',
    corridorDistanceKm: 44.2,
    center: [-118.3200, 33.9900],
    zoom: 11.0,
    pitch: 58,
    bearing: 16,
    defaultOrigin: {
      name: 'Long Beach Coastal Drone Depot',
      coords: [-118.1937, 33.7701],
      address: 'Pacific SkyPort Terminal 2, Long Beach'
    },
    defaultDestination: {
      name: 'Pasadena Tech Bio-Hub SkyPad',
      coords: [-118.1445, 34.1478],
      address: 'Foothill Medical SkyPad 3, Pasadena'
    },
    hazards: [
      {
        id: 'la_drone_1',
        name: 'LAX Airport Class B Commercial Ingress',
        category: 'faa_airspace_nfz',
        severity: 'critical',
        riskScore: 99,
        center: [-118.4085, 33.9416],
        radiusMeters: 3800,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 400,
        description: 'Primary commercial jet glide slope. Federal exclusion zone.',
        impactMetrics: { faaAirspaceClass: 'Class B Surface' },
        safetyAdvisory: 'Exclusion zone. Divert through Ballona Creek protected sky corridor.',
        color: '#ef4444'
      },
      {
        id: 'la_drone_2',
        name: 'Palos Verdes Thermal Wind Shear',
        category: 'weather_wind_shear',
        severity: 'high',
        riskScore: 88,
        center: [-118.3400, 33.7800],
        radiusMeters: 2200,
        altitudeFloorMeters: 40,
        altitudeCeilingMeters: 180,
        description: 'Coastal thermal shear with crosswind gusts up to 34 knots.',
        impactMetrics: { windGustKnots: 34 },
        safetyAdvisory: 'Maintain steady 110m AGL cruise speed.',
        color: '#06b6d4'
      },
      {
        id: 'la_drone_3',
        name: 'SoFi Stadium & Forum Crowd Zone',
        category: 'high_density_crowd',
        severity: 'critical',
        riskScore: 95,
        center: [-118.3390, 33.9535],
        radiusMeters: 1900,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 150,
        description: 'Major sports entertainment venue with 70,000+ unshielded spectators.',
        impactMetrics: { crowdDensityPerSqm: 6.5 },
        safetyAdvisory: 'Route over I-105 transit corridor easement.',
        color: '#f59e0b'
      },
      {
        id: 'la_drone_4',
        name: 'San Marino Quiet Residential Abatement',
        category: 'noise_sensitive_residential',
        severity: 'high',
        riskScore: 84,
        center: [-118.1150, 34.1200],
        radiusMeters: 1800,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 120,
        description: 'Ultra-low ambient residential district with strict acoustic ordinances.',
        impactMetrics: { noiseLimitDba: 40 },
        safetyAdvisory: 'Align skyway along commercial expressway corridors.',
        color: '#8b5cf6'
      }
    ]
  },
  {
    id: 'sf_regional',
    name: 'San Francisco Bay & Silicon Valley Skyway',
    region: 'CA / Bay Area High-Tech Skyway',
    corridorDistanceKm: 46.8,
    center: [-122.3500, 37.6800],
    zoom: 11.0,
    pitch: 58,
    bearing: -20,
    defaultOrigin: {
      name: 'San Jose Silicon Valley Drone Port',
      coords: [-121.8950, 37.3382],
      address: 'Innovation SkyHub 1, San Jose'
    },
    defaultDestination: {
      name: 'San Francisco Embarcadero SkyPort',
      coords: [-122.3950, 37.7950],
      address: 'Ferry SkyPad Dock 6, San Francisco'
    },
    hazards: [
      {
        id: 'sf_drone_1',
        name: 'SFO International FAA Class B Airspace',
        category: 'faa_airspace_nfz',
        severity: 'critical',
        riskScore: 99,
        center: [-122.3789, 37.6213],
        radiusMeters: 3600,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 350,
        description: 'Heavy airliner traffic. 100% legal perimeter exclusion enforced.',
        impactMetrics: { faaAirspaceClass: 'Class B Surface' },
        safetyAdvisory: 'Fly over San Francisco Bay water corridor buffer.',
        color: '#ef4444'
      },
      {
        id: 'sf_drone_2',
        name: 'San Bruno Gap Wind Funnel',
        category: 'weather_wind_shear',
        severity: 'critical',
        riskScore: 96,
        center: [-122.4200, 37.6500],
        radiusMeters: 2500,
        altitudeFloorMeters: 20,
        altitudeCeilingMeters: 160,
        description: 'Extreme Pacific marine layer wind gusts exceeding 42 knots.',
        impactMetrics: { windGustKnots: 42 },
        safetyAdvisory: 'Divert eastward over Bay waters at 115m AGL.',
        color: '#06b6d4'
      },
      {
        id: 'sf_drone_3',
        name: 'Oracle Park Waterfront Crowd Hotspot',
        category: 'high_density_crowd',
        severity: 'critical',
        riskScore: 92,
        center: [-122.3893, 37.7786],
        radiusMeters: 1400,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 150,
        description: 'Dense stadium and waterfront pedestrian crowd zone.',
        impactMetrics: { crowdDensityPerSqm: 5.0 },
        safetyAdvisory: 'Maintain 500m offshore marine clearance.',
        color: '#f59e0b'
      }
    ]
  },
  {
    id: 'nyc_regional',
    name: 'New York Tri-State Aerial Skyway',
    region: 'NY-NJ / Tri-State Regional Hub',
    corridorDistanceKm: 34.0,
    center: [-73.9800, 40.7300],
    zoom: 11.5,
    pitch: 58,
    bearing: -16,
    defaultOrigin: {
      name: 'Newark Regional SkyPort Hub',
      coords: [-74.1700, 40.6900],
      address: 'Newark Drone Logistics Dock 5, NJ'
    },
    defaultDestination: {
      name: 'Manhattan East River Medical SkyPort',
      coords: [-73.9720, 40.7420],
      address: 'Bellevue SkyPad 3, Manhattan, NY'
    },
    hazards: [
      {
        id: 'nyc_drone_1',
        name: 'Newark & LaGuardia Airspace Overlap',
        category: 'faa_airspace_nfz',
        severity: 'critical',
        riskScore: 99,
        center: [-74.1686, 40.6895],
        radiusMeters: 3400,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 350,
        description: 'EWR commercial departure corridors.',
        impactMetrics: { faaAirspaceClass: 'Class B EWR' },
        safetyAdvisory: 'Route through Kill Van Kull and Upper Bay waterways.',
        color: '#ef4444'
      },
      {
        id: 'nyc_drone_2',
        name: 'Times Square & Midtown Skyscraper Multipath',
        category: 'high_density_crowd',
        severity: 'critical',
        riskScore: 98,
        center: [-73.9850, 40.7580],
        radiusMeters: 1800,
        altitudeFloorMeters: 0,
        altitudeCeilingMeters: 250,
        description: 'Severe pedestrian density and GPS signal multipath reflections.',
        impactMetrics: { crowdDensityPerSqm: 8.5 },
        safetyAdvisory: 'Prohibited airspace. Route strictly along Hudson & East Rivers.',
        color: '#f59e0b'
      },
      {
        id: 'nyc_drone_3',
        name: 'NY Harbor Marine Storm Front',
        category: 'weather_rain_cell',
        severity: 'high',
        riskScore: 86,
        center: [-74.0400, 40.6800],
        radiusMeters: 2000,
        altitudeFloorMeters: 20,
        altitudeCeilingMeters: 180,
        description: 'Maritime squall line with crosswind shears.',
        impactMetrics: { windGustKnots: 32 },
        safetyAdvisory: 'Fly at 115m AGL with autopilot stabilization.',
        color: '#3b82f6'
      }
    ]
  }
];

export function getDroneCategoryBadge(cat: DroneHazardCategory) {
  switch (cat) {
    case 'weather_wind_shear':
      return { label: 'High Wind Shear', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' };
    case 'weather_rain_cell':
      return { label: 'Rain / Storm Cell', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' };
    case 'faa_airspace_nfz':
      return { label: 'FAA No-Fly Airspace', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };
    case 'high_density_crowd':
      return { label: 'Crowd Fall Hazard', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    case 'noise_sensitive_residential':
      return { label: 'Quiet Noise Zone', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/40' };
  }
}
