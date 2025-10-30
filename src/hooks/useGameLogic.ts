import { useEffect, useCallback } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  screenAtom,
  currentLevelAtom,
  playerStateAtom,
  currentStepAtom,
  startTimeAtom,
  finalTimeAtom,
} from '../atoms/gameAtoms';
import { audioManager } from '../lib/audio';

const CODE_MAP: Record<string, { index: number, key: string }> = {
  'KeyA': { index: 0, key: 'a' },
  'KeyS': { index: 1, key: 's' },
  'KeyD': { index: 2, key: 'd' },
  'KeyF': { index: 3, key: 'f' },
  'Space': { index: 4, key: ' ' },
  'KeyJ': { index: 5, key: 'j' },
  'KeyK': { index: 6, key: 'k' },
  'KeyL': { index: 7, key: 'l' },
  'Semicolon': { index: 8, key: ';' },
};

export function useGameLogic() {
  const setScreen = useSetAtom(screenAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const [playerState, setPlayerState] = useAtom(playerStateAtom);
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [startTime, setStartTime] = useAtom(startTimeAtom);
  const setFinalTime = useSetAtom(finalTimeAtom);

  const resetGameState = useCallback(() => {
    setPlayerState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setCurrentStep(0);
    setStartTime(0);
  }, [setPlayerState, setCurrentStep, setStartTime]);

  const checkWinCondition = useCallback((currentState: number[]) => {
    if (!currentLevel) return;

    const targetPattern = currentLevel.patterns[currentStep];
    const match = currentState.every((val, index) => val === targetPattern[index]);

    if (match) {
      if (currentStep < currentLevel.patterns.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Level complete
        audioManager.releaseAll();
        const endTime = Date.now();
        setFinalTime(endTime - startTime);
        setScreen('result');
      }
    }
  }, [currentLevel, currentStep, setCurrentStep, setFinalTime, startTime, setScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined || !currentLevel) return;

      e.preventDefault();

      // Start timer on first key press
      if (startTime === 0) {
        setStartTime(Date.now());
      }

      if (playerState[keyInfo.index] === 1) return; // Key already pressed

      audioManager.playNote(keyInfo.key);
      const newState = [...playerState];
      newState[keyInfo.index] = 1;
      setPlayerState(newState);
      checkWinCondition(newState);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined || !currentLevel) return;

      if (playerState[keyInfo.index] === 0) return; // Key already released

      audioManager.releaseNote(keyInfo.key);
      const newState = [...playerState];
      newState[keyInfo.index] = 0;
      setPlayerState(newState);
      checkWinCondition(newState);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioManager.releaseAll(); // Clean up all sounds on dismount
    };
  }, [currentLevel, playerState, startTime, setPlayerState, setStartTime, checkWinCondition]);

  // Effect to reset game state when the level changes (or on mount)
  useEffect(() => {
    resetGameState();
  }, [currentLevel, resetGameState]);

  return { resetGameState };
}
