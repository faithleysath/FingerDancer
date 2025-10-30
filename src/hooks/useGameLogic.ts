import { useEffect } from 'react';
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

const KEY_MAP: Record<string, number> = { ' ': 0, 'j': 1, 'k': 2, 'l': 3, ';': 4 };

export function useGameLogic() {
  const setScreen = useSetAtom(screenAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const [playerState, setPlayerState] = useAtom(playerStateAtom);
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [startTime, setStartTime] = useAtom(startTimeAtom);
  const setFinalTime = useSetAtom(finalTimeAtom);

  const resetGameState = () => {
    setPlayerState([0, 0, 0, 0, 0]);
    setCurrentStep(0);
    setStartTime(0);
  };

  const checkWinCondition = (currentState: number[]) => {
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
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyIndex = KEY_MAP[e.key];
      if (keyIndex === undefined || !currentLevel) return;

      e.preventDefault();

      // Start timer on first key press
      if (startTime === 0) {
        setStartTime(Date.now());
      }

      if (playerState[keyIndex] === 1) return; // Key already pressed

      audioManager.playNote(e.key);
      const newState = [...playerState];
      newState[keyIndex] = 1;
      setPlayerState(newState);
      checkWinCondition(newState);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyIndex = KEY_MAP[e.key];
      if (keyIndex === undefined || !currentLevel) return;

      if (playerState[keyIndex] === 0) return; // Key already released

      audioManager.releaseNote(e.key);
      const newState = [...playerState];
      newState[keyIndex] = 0;
      setPlayerState(newState);
      checkWinCondition(newState);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentLevel, playerState, currentStep, startTime, setPlayerState, setCurrentStep, setStartTime, setScreen, setFinalTime]);

  // Effect to reset game state when the level changes (or on mount)
  useEffect(() => {
    resetGameState();
  }, [currentLevel]);
}
