import { useState, useMemo } from 'react';
import { DroneHazardZone, DroneDeliveryMission } from '@/lib/drone-hazards';
import { calculateDroneRoute, DroneRouteOption, DroneRouteProfileType } from '@/lib/drone-routing-engine';
import { GeoPoint } from '@/types/navigation';

export function useDroneRouting(
  origin: GeoPoint,
  destination: GeoPoint,
  hazards: DroneHazardZone[],
  mission: DroneDeliveryMission
) {
  const [activeDroneProfileType, setActiveDroneProfileType] = useState<DroneRouteProfileType>('AEROSAFE_SKYWAY');

  const { safeDroneRoute, rapidDroneRoute, directUnsafeDroneRoute } = useMemo(() => {
    const aeroSafe = calculateDroneRoute(origin, destination, hazards, mission, 'AEROSAFE_SKYWAY');
    const rapid = calculateDroneRoute(origin, destination, hazards, mission, 'RAPID_EXPRESS');
    const unsafe = calculateDroneRoute(origin, destination, hazards, mission, 'DIRECT_UNSAFE_SKYLINE');

    return {
      safeDroneRoute: aeroSafe,
      rapidDroneRoute: rapid,
      directUnsafeDroneRoute: unsafe
    };
  }, [origin, destination, hazards, mission]);

  const activeDroneRoute = useMemo(() => {
    if (activeDroneProfileType === 'AEROSAFE_SKYWAY') return safeDroneRoute;
    if (activeDroneProfileType === 'RAPID_EXPRESS') return rapidDroneRoute;
    return directUnsafeDroneRoute;
  }, [activeDroneProfileType, safeDroneRoute, rapidDroneRoute, directUnsafeDroneRoute]);

  return {
    droneRoutes: {
      safe: safeDroneRoute,
      rapid: rapidDroneRoute,
      unsafe: directUnsafeDroneRoute
    },
    activeDroneProfileType,
    setActiveDroneProfileType,
    activeDroneRoute
  };
}
