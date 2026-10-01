import { useState, useEffect, useMemo } from 'react';
import { DangerZone } from '@/lib/danger-zones';
import { fetchPhysicalRoadRoute, RouteOption, RouteType } from '@/lib/safe-routing-engine';
import { GeoPoint } from '@/types/navigation';

export function useGroundRouting(
  origin: GeoPoint,
  destination: GeoPoint,
  dangerZones: DangerZone[]
) {
  const [activeGroundRouteType, setActiveGroundRouteType] = useState<RouteType>('SAFE_GUARDIAN');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groundRoutes, setGroundRoutes] = useState<{
    safe: RouteOption | null;
    balanced: RouteOption | null;
    unsafe: RouteOption | null;
  }>({ safe: null, balanced: null, unsafe: null });

  useEffect(() => {
    let isCancelled = false;

    async function loadPhysicalRoutes() {
      setIsLoading(true);
      try {
        const [safe, balanced, unsafe] = await Promise.all([
          fetchPhysicalRoadRoute(origin, destination, dangerZones, 'SAFE_GUARDIAN'),
          fetchPhysicalRoadRoute(origin, destination, dangerZones, 'BALANCED'),
          fetchPhysicalRoadRoute(origin, destination, dangerZones, 'DIRECT_UNSAFE')
        ]);

        if (!isCancelled) {
          setGroundRoutes({ safe, balanced, unsafe });
        }
      } catch (err) {
        console.error('Failed loading physical road routes:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPhysicalRoutes();

    return () => {
      isCancelled = true;
    };
  }, [origin, destination, dangerZones]);

  const activeGroundRoute = useMemo(() => {
    if (activeGroundRouteType === 'SAFE_GUARDIAN') return groundRoutes.safe;
    if (activeGroundRouteType === 'BALANCED') return groundRoutes.balanced;
    return groundRoutes.unsafe;
  }, [activeGroundRouteType, groundRoutes]);

  return {
    groundRoutes,
    activeGroundRouteType,
    setActiveGroundRouteType,
    activeGroundRoute,
    isLoading
  };
}
