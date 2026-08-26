import { 
  DroneHazardZone, 
  DroneDeliveryMission, 
  DroneHazardCategory,
  DRONE_MISSION_PRESETS
} from './drone-hazards';
import { calculateHaversineDistanceMeters, formatDistance } from './danger-zones';

export type DroneRouteProfileType = 'AEROSAFE_SKYWAY' | 'RAPID_EXPRESS' | 'DIRECT_UNSAFE_SKYLINE';

export interface AltitudeProfilePoint {
  distanceKm: number;
  altitudeAglMeters: number; // Drone altitude above ground (m)
  terrainElevationMeters: number; // Ground terrain elevation (m)
  safetyClearanceMeters: number; // Clearance above tallest structure
  phase: 'climb' | 'cruise' | 'descent';
}

export interface DroneFlightStep {
  id: string;
  instruction: string;
  waypointName: string;
  altitudeAglMeters: number;
  speedKmh: number;
  distanceMeters: number;
  distanceFormatted: string;
  durationMin: number;
  coord: [number, number]; // [lng, lat]
  safetyStatus: 'optimal_clear' | 'wind_advisory' | 'nfz_clearance' | 'danger_intercept';
  telemetryNotice?: string;
}

export interface DroneRouteOption {
  type: DroneRouteProfileType;
  title: string;
  subtitle: string;
  badge: string;
  safetyScore: number; // 0 to 100
  totalDistanceMeters: number;
  distanceFormatted: string;
  flightTimeMin: number;
  cruisingAltitudeMeters: number;
  verticalClimbRateMs: number;
  batteryConsumedWh: number;
  batteryRemainingPercent: number;
  groundRiskIndexPercent: number;
  acousticComplianceScore: number;
  bypassedHazards: DroneHazardZone[];
  interceptedHazards: DroneHazardZone[];
  pathCoordinates: [number, number][]; // [lng, lat]
  altitudeProfile: AltitudeProfilePoint[];
  steps: DroneFlightStep[];
  color: string;
}

export function calculateDroneRoute(
  origin: [number, number],
  destination: [number, number],
  hazards: DroneHazardZone[],
  mission: DroneDeliveryMission,
  profileType: DroneRouteProfileType
): DroneRouteOption {
  const straightDistanceMeters = calculateHaversineDistanceMeters(origin, destination);
  let path: [number, number][] = [];

  if (profileType === 'DIRECT_UNSAFE_SKYLINE') {
    const samples = 18;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      path.push([
        origin[0] + (destination[0] - origin[0]) * t,
        origin[1] + (destination[1] - origin[1]) * t
      ]);
    }
  } else {
    path = generateDroneAeroPath(origin, destination, hazards, profileType);
  }

  // Calculate Flight Telemetry
  let totalDistanceMeters = 0;
  const interceptedSet = new Set<string>();
  const bypassedSet = new Set<string>();
  const steps: DroneFlightStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segDist = calculateHaversineDistanceMeters(p1, p2);
    totalDistanceMeters += segDist;

    const midPoint: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    
    let segStatus: DroneFlightStep['safetyStatus'] = 'optimal_clear';
    let notice: string | undefined = undefined;

    hazards.forEach(h => {
      const dist = calculateHaversineDistanceMeters(midPoint, h.center);
      if (dist <= h.radiusMeters) {
        interceptedSet.add(h.id);
        if (h.category === 'faa_airspace_nfz') {
          segStatus = 'danger_intercept';
          notice = `⚠️ INTRUSION: Inside ${h.name}`;
        } else if (h.category === 'weather_wind_shear') {
          segStatus = 'wind_advisory';
          notice = `💨 Wind Shear: ${h.impactMetrics.windGustKnots || 35} kts crosswind`;
        }
      }
    });

    const isStart = i === 0;
    const isEnd = i === path.length - 2;

    const instruction = isStart
      ? `Vertical takeoff to ${mission.targetAltitudeAglMeters}m AGL (4.5 m/s climb)`
      : isEnd
      ? `Final descent to landing pad at 3.0 m/s`
      : `Skyway Waypoint #${i + 1} at ${mission.targetAltitudeAglMeters}m AGL cruise (${mission.droneCruiseSpeedKmh} km/h)`;

    const waypointName = isStart
      ? 'Origin SkyPort Dock'
      : isEnd
      ? 'Destination Landing SkyPad'
      : `Aerial Safe Corridor Waypoint ${i + 1}`;

    steps.push({
      id: `drone_step_${i}`,
      instruction,
      waypointName,
      altitudeAglMeters: isStart || isEnd ? 30 : mission.targetAltitudeAglMeters,
      speedKmh: isStart || isEnd ? 25 : mission.droneCruiseSpeedKmh,
      distanceMeters: Math.round(segDist),
      distanceFormatted: formatDistance(segDist, true),
      durationMin: Math.max(0.5, Math.round((segDist / (mission.droneCruiseSpeedKmh * 1000 / 60)) * 10) / 10),
      coord: p1,
      safetyStatus: segStatus,
      telemetryNotice: notice
    });
  }

  // Calculate Bypassed Hazards
  hazards.forEach(h => {
    if (!interceptedSet.has(h.id)) {
      bypassedSet.add(h.id);
    }
  });

  const interceptedHazards = hazards.filter(h => interceptedSet.has(h.id));
  const bypassedHazards = hazards.filter(h => bypassedSet.has(h.id));

  // Compute 3D Altitude Elevation Profile Graph Points
  const totalKm = totalDistanceMeters / 1000;
  const altitudeProfile = generate3DAltitudeProfile(totalKm, mission.targetAltitudeAglMeters);

  // Battery Wh calculation: ~20 Wh per km base + payload weight penalty
  const baseWhPerKm = 22 + mission.payloadWeightKg * 2.8;
  const batteryConsumedWh = Math.round(totalKm * baseWhPerKm * 10) / 10;
  const batteryRemainingPercent = Math.max(15, Math.round(((mission.batteryCapacityWh - batteryConsumedWh) / mission.batteryCapacityWh) * 100));

  const flightTimeMin = Math.max(2, Math.round((totalKm / mission.droneCruiseSpeedKmh) * 60 * 10) / 10);

  if (profileType === 'AEROSAFE_SKYWAY') {
    return {
      type: 'AEROSAFE_SKYWAY',
      title: 'AeroSafe Regional Skyway',
      subtitle: '100% Weather & FAA NFZ Clearance',
      badge: 'RECOMMENDED',
      safetyScore: interceptedHazards.length === 0 ? 99 : 92,
      totalDistanceMeters,
      distanceFormatted: formatDistance(totalDistanceMeters, true),
      flightTimeMin,
      cruisingAltitudeMeters: mission.targetAltitudeAglMeters,
      verticalClimbRateMs: 4.5,
      batteryConsumedWh,
      batteryRemainingPercent,
      groundRiskIndexPercent: 0.00,
      acousticComplianceScore: 98,
      bypassedHazards,
      interceptedHazards,
      pathCoordinates: path,
      altitudeProfile,
      steps,
      color: '#06b6d4' // Cyan neon
    };
  } else if (profileType === 'RAPID_EXPRESS') {
    const rapidDist = Math.round(totalDistanceMeters * 0.92);
    return {
      type: 'RAPID_EXPRESS',
      title: 'Rapid Low-Altitude Express',
      subtitle: 'Low-Altitude River/Canal Channel (75m AGL)',
      badge: 'EXPRESS',
      safetyScore: 88,
      totalDistanceMeters: rapidDist,
      distanceFormatted: formatDistance(rapidDist, true),
      flightTimeMin: Math.max(2, Math.round(flightTimeMin * 0.88 * 10) / 10),
      cruisingAltitudeMeters: 75,
      verticalClimbRateMs: 5.0,
      batteryConsumedWh: Math.round(batteryConsumedWh * 0.9),
      batteryRemainingPercent: Math.min(95, batteryRemainingPercent + 5),
      groundRiskIndexPercent: 0.02,
      acousticComplianceScore: 91,
      bypassedHazards,
      interceptedHazards,
      pathCoordinates: path,
      altitudeProfile: generate3DAltitudeProfile(rapidDist / 1000, 75),
      steps,
      color: '#10b981' // Emerald
    };
  } else {
    const directDist = Math.round(straightDistanceMeters * 1.02);
    return {
      type: 'DIRECT_UNSAFE_SKYLINE',
      title: 'Direct Skyline (High Risk)',
      subtitle: 'Passes Through NFZ, Crowds & Storms',
      badge: 'UNSAFE',
      safetyScore: 24,
      totalDistanceMeters: directDist,
      distanceFormatted: formatDistance(directDist, true),
      flightTimeMin: Math.max(2, Math.round((directDist / 1000 / mission.droneCruiseSpeedKmh) * 60 * 10) / 10),
      cruisingAltitudeMeters: 120,
      verticalClimbRateMs: 3.8,
      batteryConsumedWh: Math.round(batteryConsumedWh * 1.45),
      batteryRemainingPercent: Math.max(5, batteryRemainingPercent - 28),
      groundRiskIndexPercent: 5.2,
      acousticComplianceScore: 30,
      bypassedHazards: [],
      interceptedHazards: hazards.slice(0, 3),
      pathCoordinates: path,
      altitudeProfile: generate3DAltitudeProfile(directDist / 1000, 120),
      steps,
      color: '#ef4444' // Red
    };
  }
}

// Generate Altitude Profile Points (Climb -> Cruise -> Descent)
function generate3DAltitudeProfile(
  totalDistanceKm: number,
  cruisingAltitudeAglMeters: number
): AltitudeProfilePoint[] {
  const points: AltitudeProfilePoint[] = [];
  const samples = 20;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const distKm = Math.round(t * totalDistanceKm * 10) / 10;
    const terrainBase = Math.round(15 + Math.sin(t * Math.PI * 3) * 12 + Math.cos(t * Math.PI) * 8);

    let altAgl = 0;
    let phase: AltitudeProfilePoint['phase'] = 'cruise';

    if (t < 0.15) {
      // Climb Phase
      const climbProgress = t / 0.15;
      altAgl = Math.round(cruisingAltitudeAglMeters * Math.sin((climbProgress * Math.PI) / 2));
      phase = 'climb';
    } else if (t > 0.85) {
      // Descent Phase
      const descentProgress = (1 - t) / 0.15;
      altAgl = Math.round(cruisingAltitudeAglMeters * Math.sin((descentProgress * Math.PI) / 2));
      phase = 'descent';
    } else {
      // Cruise Phase with smooth micro-fluctuations
      altAgl = Math.round(cruisingAltitudeAglMeters + Math.sin(t * 12) * 3);
      phase = 'cruise';
    }

    const clearance = Math.max(25, altAgl - 20);

    points.push({
      distanceKm: distKm,
      altitudeAglMeters: altAgl,
      terrainElevationMeters: terrainBase,
      safetyClearanceMeters: clearance,
      phase
    });
  }

  return points;
}

// Generate smooth aerial path avoiding weather storm cells, FAA NFZs, and crowd polygons
function generateDroneAeroPath(
  start: [number, number],
  dest: [number, number],
  hazards: DroneHazardZone[],
  profileType: DroneRouteProfileType
): [number, number][] {
  const points: [number, number][] = [start];
  const stepsCount = 18;

  const blockingHazards: DroneHazardZone[] = [];
  for (let i = 1; i < stepsCount; i++) {
    const t = i / stepsCount;
    const testPoint: [number, number] = [
      start[0] + (dest[0] - start[0]) * t,
      start[1] + (dest[1] - start[1]) * t
    ];

    hazards.forEach(h => {
      const dist = calculateHaversineDistanceMeters(testPoint, h.center);
      if (dist < h.radiusMeters * 1.35) {
        if (!blockingHazards.some(item => item.id === h.id)) {
          blockingHazards.push(h);
        }
      }
    });
  }

  if (blockingHazards.length === 0 || profileType === 'DIRECT_UNSAFE_SKYLINE') {
    for (let i = 1; i <= stepsCount; i++) {
      const t = i / stepsCount;
      points.push([
        start[0] + (dest[0] - start[0]) * t,
        start[1] + (dest[1] - start[1]) * t
      ]);
    }
    return points;
  }

  for (let i = 1; i < stepsCount; i++) {
    const t = i / stepsCount;
    let baseLng = start[0] + (dest[0] - start[0]) * t;
    let baseLat = start[1] + (dest[1] - start[1]) * t;

    for (const bHazard of blockingHazards) {
      const dist = calculateHaversineDistanceMeters([baseLng, baseLat], bHazard.center);
      const safeBuffer = bHazard.radiusMeters * (profileType === 'AEROSAFE_SKYWAY' ? 1.4 : 1.15);
      if (dist < safeBuffer) {
        const dLng = baseLng - bHazard.center[0];
        const dLat = baseLat - bHazard.center[1];
        const len = Math.sqrt(dLng * dLng + dLat * dLat) || 0.0001;

        const pushOffset = safeBuffer / 111319.9;
        baseLng = bHazard.center[0] + (dLng / len) * pushOffset * 1.35;
        baseLat = bHazard.center[1] + (dLat / len) * pushOffset;
      }
    }

    points.push([baseLng, baseLat]);
  }

  points.push(dest);
  return points;
}
