import { useState, useEffect, useRef, useCallback } from 'react';
import { NavMode } from '@/types/navigation';
import { RouteOption } from '@/lib/safe-routing-engine';
import { DroneRouteOption } from '@/lib/drone-routing-engine';

export function useVoiceGuidance(
  navMode: NavMode,
  isSimulating: boolean,
  currentStepIndex: number,
  activeGroundRoute: RouteOption | null,
  activeDroneRoute: DroneRouteOption | null
) {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const lastSpokenStepRef = useRef<number>(-1);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Voice speech synthesis triggering
  useEffect(() => {
    if (!isAudioEnabled || !isSimulating) return;

    if (currentStepIndex !== lastSpokenStepRef.current) {
      lastSpokenStepRef.current = currentStepIndex;

      let instruction = '';
      if (navMode === 'DRONE_SKYWAY' && activeDroneRoute && activeDroneRoute.steps[currentStepIndex]) {
        instruction = activeDroneRoute.steps[currentStepIndex].instruction;
      } else if (activeGroundRoute && activeGroundRoute.steps[currentStepIndex]) {
        instruction = activeGroundRoute.steps[currentStepIndex].instruction;
      }

      if (instruction && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(instruction);
        utterance.rate = 1.05;
        utterance.pitch = navMode === 'DRONE_SKYWAY' ? 1.15 : 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentStepIndex, isAudioEnabled, navMode, activeDroneRoute, activeGroundRoute, isSimulating]);

  const resetSpeech = useCallback(() => {
    lastSpokenStepRef.current = -1;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    isAudioEnabled,
    toggleAudio,
    resetSpeech
  };
}
