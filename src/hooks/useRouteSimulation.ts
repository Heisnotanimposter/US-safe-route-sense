import { useState, useEffect, useCallback } from 'react';
import { NavMode } from '@/types/navigation';
import { toast } from 'sonner';

export function useRouteSimulation(navMode: NavMode) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Simulation tick loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 1) {
            setIsSimulating(false);
            toast.success(
              navMode === 'DRONE_SKYWAY' 
                ? '🏁 Drone arrived safely at landing SkyPad!' 
                : '🏁 Arrived safely at destination!'
            );
            return 1;
          }
          return prev + 0.0025; // Smooth 50ms progression
        });
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, navMode]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimProgress(0);
    setIsSimulating(false);
    setCurrentStepIndex(0);
  }, []);

  return {
    isSimulating,
    simProgress,
    currentStepIndex,
    setCurrentStepIndex,
    setSimProgress,
    toggleSimulation,
    resetSimulation
  };
}
