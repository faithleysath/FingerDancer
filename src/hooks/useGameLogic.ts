import { useEffect, useCallback, useRef } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  screenAtom,
  currentLevelAtom,
  playerStateAtom,
  currentStepAtom,
  startTimeAtom,
  finalTimeAtom,
  gameActiveAtom,
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
  const pressedKeys = useRef(new Set<string>());
  const setScreen = useSetAtom(screenAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const setPlayerState = useSetAtom(playerStateAtom);
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [startTime, setStartTime] = useAtom(startTimeAtom);
  const setFinalTime = useSetAtom(finalTimeAtom);
  const gameActive = useAtomValue(gameActiveAtom);

  // Use refs to hold the latest state for use in event handlers
  // This avoids re-creating handlers on every state change
  const stateRef = useRef({
    currentLevel,
    currentStep,
    startTime,
    gameActive,
  });

  useEffect(() => {
    stateRef.current = {
      currentLevel,
      currentStep,
      startTime,
      gameActive,
    };
  }, [currentLevel, currentStep, startTime, gameActive]);

  const resetGameState = useCallback(() => {
    audioManager.releaseAll();
    pressedKeys.current.clear();
    setPlayerState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setCurrentStep(0);
    setStartTime(0);
  }, [setPlayerState, setCurrentStep, setStartTime]);

  const checkWinCondition = useCallback((currentState: number[]) => {
    const { currentLevel: level, currentStep: step, startTime: time } = stateRef.current;
    if (!level) return;

    const targetPattern = level.patterns[step];
    const match = currentState.every((val, index) => val === targetPattern[index]);

    if (match) {
      if (step < level.patterns.length - 1) {
        setCurrentStep(step + 1);
      } else {
        audioManager.releaseAll();
        const endTime = Date.now();
        setFinalTime(endTime - time);
        setScreen('result');
      }
    }
  }, [setCurrentStep, setFinalTime, setScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined || !stateRef.current.gameActive || pressedKeys.current.has(e.code)) return;

      e.preventDefault();
      pressedKeys.current.add(e.code);

      setStartTime((prevStartTime) => {
        if (prevStartTime === 0) {
          return Date.now();
        }
        return prevStartTime;
      });
      
      setPlayerState(prevPlayerState => {
        const newState = [...prevPlayerState];
        newState[keyInfo.index] = 1;
        checkWinCondition(newState);
        return newState;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined || !stateRef.current.gameActive) return;

      e.preventDefault();
      pressedKeys.current.delete(e.code);

      setPlayerState(prevPlayerState => {
        const newState = [...prevPlayerState];
        newState[keyInfo.index] = 0;
        checkWinCondition(newState);
        return newState;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [checkWinCondition, setPlayerState, setStartTime]); // Dependencies are now stable

  useEffect(() => {
    resetGameState();
  }, [currentLevel, resetGameState]);

  return { resetGameState };
}
