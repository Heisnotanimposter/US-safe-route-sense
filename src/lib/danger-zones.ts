export type DangerCategory = 'violent_crime' | 'slum_red_zone' | 'low_illumination' | 'carjacking_theft' | 'civil_unrest';
export type RiskSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface DangerZone {
  id: string;
  name: string;
  category: DangerCategory;
  severity: RiskSeverity;
  riskScore: number; // 0 to 100
  center: [number, number]; // [lng, lat] (Standard GeoJSON format)
  radiusMeters: number; // in meters
  description: string;
  recentIncidentsMonth: number;
  reportedCrimes: string[];
  safetyAdvisory: string;
  color: string;
}

export interface CityPreset {
  id: string;
  name: string;
  state: string;
  country: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  safetyRating: number; // 0 - 100
  violentCrimePer1k: number;
  defaultOrigin: {
    name: string;
    coords: [number, number]; // [lng, lat]
    address: string;
  };
  defaultDestination: {
    name: string;
    coords: [number, number]; // [lng, lat]
    address: string;
  };
  dangerZones: DangerZone[];
}

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'chicago',
    name: 'Chicago',
    state: 'IL',
    country: 'USA',
    center: [-87.6800, 41.8700],
    zoom: 11.8,
    pitch: 52,
    bearing: -18,
    safetyRating: 54,
    violentCrimePer1k: 9.8,
    defaultOrigin: {
      name: 'O\'Hare International Gateway',
      coords: [-87.8900, 41.9680],
      address: 'I-90 / I-190 Junction, Chicago'
    },
    defaultDestination: {
      name: 'Millennium Park / Downtown Loop',
      coords: [-87.6226, 41.8826],
      address: '201 E Randolph St, Chicago'
    },
    dangerZones: [
      {
        id: 'chi_1',
        name: 'West Garfield Park Violent Corridor',
        category: 'violent_crime',
        severity: 'critical',
        riskScore: 95,
        center: [-87.7250, 41.8810],
        radiusMeters: 1800,
        description: 'Highest violent assault and gun incident density in city corridor.',
        recentIncidentsMonth: 48,
        reportedCrimes: ['Armed Robbery', 'Aggravated Assault', 'Homicide Hotspot'],
        safetyAdvisory: 'Avoid surface streets; use expressways I-290 / I-90 perimeter bypass only.',
        color: '#ef4444'
      },
      {
        id: 'chi_2',
        name: 'Englewood Slum & Red Zone',
        category: 'slum_red_zone',
        severity: 'critical',
        riskScore: 92,
        center: [-87.6410, 41.7750],
        radiusMeters: 2200,
        description: 'High frequency gang perimeter, abandoned industrial parcels.',
        recentIncidentsMonth: 42,
        reportedCrimes: ['Gang Activity', 'Narcotics Trafficking', 'Weapon Discharge'],
        safetyAdvisory: 'Night traversal strictly prohibited by SafeRoute Sense.',
        color: '#dc2626'
      },
      {
        id: 'chi_3',
        name: 'Austin Dark Corridor',
        category: 'low_illumination',
        severity: 'high',
        riskScore: 79,
        center: [-87.7650, 41.8900],
        radiusMeters: 1400,
        description: 'Under-lit residential backstreets with blind corners and unmonitored intersections.',
        recentIncidentsMonth: 27,
        reportedCrimes: ['Ambush Mugging', 'Vehicle Break-in', 'Poor Lighting Hazard'],
        safetyAdvisory: 'Rerouting to illuminated state arterial roads.',
        color: '#f97316'
      },
      {
        id: 'chi_4',
        name: 'South Shore Carjacking Belt',
        category: 'carjacking_theft',
        severity: 'high',
        riskScore: 83,
        center: [-87.5750, 41.7600],
        radiusMeters: 1600,
        description: 'Staging ground for vehicle theft rings and intersection ambushes.',
        recentIncidentsMonth: 34,
        reportedCrimes: ['Armed Carjacking', 'Staged Collision Theft'],
        safetyAdvisory: 'Keep doors locked, navigate via Lake Shore Drive corridor.',
        color: '#eab308'
      }
    ]
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    center: [-118.2800, 34.0150],
    zoom: 11.6,
    pitch: 50,
    bearing: 22,
    safetyRating: 62,
    violentCrimePer1k: 7.4,
    defaultOrigin: {
      name: 'LAX International Terminal',
      coords: [-118.4085, 33.9416],
      address: '1 World Way, Los Angeles'
    },
    defaultDestination: {
      name: 'Crypto.com Arena / Downtown LA',
      coords: [-118.2673, 34.0430],
      address: '1111 S Figueroa St, Los Angeles'
    },
    dangerZones: [
      {
        id: 'la_1',
        name: 'Skid Row Encampment Sector',
        category: 'slum_red_zone',
        severity: 'critical',
        riskScore: 94,
        center: [-118.2430, 34.0440],
        radiusMeters: 1200,
        description: 'Dense high-risk zone with severe street violence and unpredictable situations.',
        recentIncidentsMonth: 64,
        reportedCrimes: ['Aggravated Assault', 'Open Drug Markets', 'Random Attacks'],
        safetyAdvisory: 'SafeRoute diverts around downtown core to Grand Ave & I-110 express.',
        color: '#ef4444'
      },
      {
        id: 'la_2',
        name: 'South Central Gang Corridor',
        category: 'violent_crime',
        severity: 'critical',
        riskScore: 89,
        center: [-118.2750, 33.9890],
        radiusMeters: 2200,
        description: 'Active territorial conflicts between rival syndicates.',
        recentIncidentsMonth: 45,
        reportedCrimes: ['Drive-by Shootings', 'Armed Robbery', 'Gang Intimidation'],
        safetyAdvisory: 'Utilize I-405 or I-105 freeway lighted express lanes.',
        color: '#dc2626'
      },
      {
        id: 'la_3',
        name: 'Florence-Graham Theft Sector',
        category: 'carjacking_theft',
        severity: 'high',
        riskScore: 80,
        center: [-118.2450, 33.9680],
        radiusMeters: 1500,
        description: 'Elevated vehicle hijackings at red lights and gas stations.',
        recentIncidentsMonth: 38,
        reportedCrimes: ['Carjacking', 'Catalytic Converter Theft', 'Robbery'],
        safetyAdvisory: 'SafeRoute navigates along monitored coastal corridors.',
        color: '#eab308'
      }
    ]
  },
  {
    id: 'new_york',
    name: 'New York City',
    state: 'NY',
    country: 'USA',
    center: [-73.9400, 40.7100],
    zoom: 11.7,
    pitch: 54,
    bearing: -12,
    safetyRating: 71,
    violentCrimePer1k: 5.6,
    defaultOrigin: {
      name: 'JFK International Airport',
      coords: [-73.7781, 40.6413],
      address: 'Queens, NY'
    },
    defaultDestination: {
      name: 'Times Square / Midtown Manhattan',
      coords: [-73.9855, 40.7580],
      address: 'Manhattan, NY'
    },
    dangerZones: [
      {
        id: 'nyc_1',
        name: 'Brownsville Violent Sector',
        category: 'violent_crime',
        severity: 'critical',
        riskScore: 93,
        center: [-73.9120, 40.6650],
        radiusMeters: 1700,
        description: 'Concentrated violent incidents and street muggings.',
        recentIncidentsMonth: 51,
        reportedCrimes: ['Assault with Weapon', 'Armed Robbery', 'Shooting Incidents'],
        safetyAdvisory: 'Bypass using Belt Parkway or Queens Blvd safe corridor.',
        color: '#ef4444'
      },
      {
        id: 'nyc_2',
        name: 'South Bronx Transit Red Zone',
        category: 'slum_red_zone',
        severity: 'high',
        riskScore: 84,
        center: [-73.9200, 40.8150],
        radiusMeters: 1500,
        description: 'Frequent street level altercations and pedestrian risk zones.',
        recentIncidentsMonth: 39,
        reportedCrimes: ['Robbery', 'Grand Larceny', 'Assault'],
        safetyAdvisory: 'SafeRoute routes via Major Deegan Expressway bypass.',
        color: '#dc2626'
      },
      {
        id: 'nyc_3',
        name: 'East New York Car Theft Belt',
        category: 'carjacking_theft',
        severity: 'high',
        riskScore: 81,
        center: [-73.8850, 40.6720],
        radiusMeters: 1400,
        description: 'Elevated vehicle break-in and road dispute rates.',
        recentIncidentsMonth: 29,
        reportedCrimes: ['Grand Larceny Auto', 'Street Holdups'],
        safetyAdvisory: 'Stick to Grand Central Parkway illuminated lanes.',
        color: '#eab308'
      }
    ]
  },
  {
    id: 'detroit',
    name: 'Detroit',
    state: 'MI',
    country: 'USA',
    center: [-83.1200, 42.3100],
    zoom: 11.5,
    pitch: 50,
    bearing: 15,
    safetyRating: 46,
    violentCrimePer1k: 19.5,
    defaultOrigin: {
      name: 'Detroit Metro Airport (DTW)',
      coords: [-83.3534, 42.2162],
      address: 'Romulus, MI'
    },
    defaultDestination: {
      name: 'Detroit Riverfront & Downtown',
      coords: [-83.0410, 42.3290],
      address: 'Jefferson Ave, Detroit, MI'
    },
    dangerZones: [
      {
        id: 'det_1',
        name: 'Belmont & Dexter Violent Zone',
        category: 'violent_crime',
        severity: 'critical',
        riskScore: 97,
        center: [-83.1190, 42.3830],
        radiusMeters: 2000,
        description: 'Extreme crime index. Unpatrolled arterial intersections.',
        recentIncidentsMonth: 56,
        reportedCrimes: ['Armed Robbery', 'Homicide', 'Shooting Incidents'],
        safetyAdvisory: 'Complete exclusion zone. Bypass through I-94 / Lodge Fwy.',
        color: '#ef4444'
      },
      {
        id: 'det_2',
        name: 'Lower East Side Abandoned Slum',
        category: 'slum_red_zone',
        severity: 'critical',
        riskScore: 89,
        center: [-82.9850, 42.3680],
        radiusMeters: 1800,
        description: 'Widespread vacant structures, limited cellular reception.',
        recentIncidentsMonth: 31,
        reportedCrimes: ['Vagrancy Threats', 'Narcotics Warehousing', 'Arson'],
        safetyAdvisory: 'Rerouting through Woodward Avenue safe corridor.',
        color: '#dc2626'
      }
    ]
  },
  {
    id: 'san_francisco',
    name: 'San Francisco',
    state: 'CA',
    country: 'USA',
    center: [-122.4200, 37.7650],
    zoom: 12.2,
    pitch: 52,
    bearing: -24,
    safetyRating: 68,
    violentCrimePer1k: 6.2,
    defaultOrigin: {
      name: 'SFO International Airport',
      coords: [-122.3789, 37.6213],
      address: 'San Francisco, CA'
    },
    defaultDestination: {
      name: 'Union Square & Financial District',
      coords: [-122.4074, 37.7879],
      address: 'Post St, San Francisco'
    },
    dangerZones: [
      {
        id: 'sf_1',
        name: 'Tenderloin High Crime Sector',
        category: 'slum_red_zone',
        severity: 'critical',
        riskScore: 92,
        center: [-122.4140, 37.7840],
        radiusMeters: 900,
        description: 'Dense concentration of open street crime, narcotics, and weapon offenses.',
        recentIncidentsMonth: 58,
        reportedCrimes: ['Assault', 'Robbery', 'Open Narcotic Dealing'],
        safetyAdvisory: 'SafeRoute diverts to Embarcadero / Market St arterial route.',
        color: '#ef4444'
      },
      {
        id: 'sf_2',
        name: 'East Oakland Gang Corridor',
        category: 'violent_crime',
        severity: 'critical',
        riskScore: 94,
        center: [-122.1850, 37.7520],
        radiusMeters: 2400,
        description: 'High violent altercation frequency along international Blvd.',
        recentIncidentsMonth: 49,
        reportedCrimes: ['Armed Carjacking', 'Gun Violence'],
        safetyAdvisory: 'Bypass via I-880 or I-580 freeway express lanes.',
        color: '#dc2626'
      }
    ]
  }
];

// Haversine distance formula in meters between two [lng, lat] coordinates
export function calculateHaversineDistanceMeters(
  p1: [number, number],
  p2: [number, number]
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLon = ((p2[0] - p1[0]) * Math.PI) / 180;
  const lat1 = (p1[1] * Math.PI) / 180;
  const lat2 = (p2[1] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert meters to formatted miles or km
export function formatDistance(meters: number, useMiles = true): string {
  if (useMiles) {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

// Spatial check for real geographic point against danger zones
export function evaluateGeographicDanger(
  point: [number, number], // [lng, lat]
  dangerZones: DangerZone[]
): {
  inDanger: boolean;
  maxScore: number;
  nearestZone: DangerZone | null;
  distanceMeters: number;
} {
  let inDanger = false;
  let maxScore = 0;
  let nearestZone: DangerZone | null = null;
  let minDistance = Infinity;

  for (const zone of dangerZones) {
    const dist = calculateHaversineDistanceMeters(point, zone.center);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zone;
    }
    if (dist <= zone.radiusMeters) {
      inDanger = true;
      if (zone.riskScore > maxScore) {
        maxScore = zone.riskScore;
      }
    }
  }

  return {
    inDanger,
    maxScore,
    nearestZone,
    distanceMeters: minDistance
  };
}

// Generate GeoJSON circular polygon for a danger zone
export function createDangerZonePolygonGeoJSON(zone: DangerZone, pointsCount = 36) {
  const [lng, lat] = zone.center;
  const radius = zone.radiusMeters;
  const coordinates: [number, number][] = [];

  const latR = radius / 111319.9;
  const lngR = radius / (111319.9 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i <= pointsCount; i++) {
    const angle = (i / pointsCount) * (2 * Math.PI);
    const pLng = lng + lngR * Math.cos(angle);
    const pLat = lat + latR * Math.sin(angle);
    coordinates.push([pLng, pLat]);
  }

  return {
    type: 'Feature' as const,
    properties: {
      id: zone.id,
      name: zone.name,
      severity: zone.severity,
      riskScore: zone.riskScore,
      category: zone.category,
      color: zone.color
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coordinates]
    }
  };
}
