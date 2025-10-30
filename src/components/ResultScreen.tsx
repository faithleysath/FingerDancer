import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import {
  finalTimeAtom,
  currentLevelAtom,
  screenAtom,
  levelIndexAtom,
  currentLevelIndexAtom,
  playerStateAtom,
  currentStepAtom,
  startTimeAtom,
  type Level,
} from '../atoms/gameAtoms';
import { useEffect, useCallback } from 'react';
import { audioManager } from '../lib/audio';
import { useFullscreen } from '../hooks/useFullscreen';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

function ResultScreen() {
  const { enterFullscreen } = useFullscreen();
  const { lockOrientation, unlockOrientation } = useScreenOrientation();
  const finalTime = useAtomValue(finalTimeAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const levelIndex = useAtomValue(levelIndexAtom);
  const [currentLevelIdx, setCurrentLevelIndex] = useAtom(currentLevelIndexAtom);
  const setScreen = useSetAtom(screenAtom);
  const setCurrentLevel = useSetAtom(currentLevelAtom);
  const setPlayerState = useSetAtom(playerStateAtom);
  const setCurrentStep = useSetAtom(currentStepAtom);
  const setStartTime = useSetAtom(startTimeAtom);

  // Ensure all sounds are stopped when the result screen appears.
  useEffect(() => {
    audioManager.releaseAll();
  }, []);
  
  const hasNextLevel = currentLevel && currentLevelIdx + 1 < levelIndex.length;

  const handleNextLevel = useCallback(async () => {
    if (!hasNextLevel) return;
    const nextLevelIndex = currentLevelIdx + 1;
    const nextLevelInfo = levelIndex[nextLevelIndex];
    try {
      await enterFullscreen();
      await lockOrientation('landscape');
      const res = await fetch(`/levels/${nextLevelInfo.file}`);
      const levelData: Level = await res.json();
      
      // Atomically update all state before switching screens
      setCurrentLevel(levelData);
      setCurrentLevelIndex(nextLevelIndex);
      setPlayerState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      setCurrentStep(0);
      setStartTime(0);
      setScreen('game');
    } catch (error) {
      console.error('Failed to load next level:', error);
    }
  }, [hasNextLevel, currentLevelIdx, levelIndex, setCurrentLevel, setCurrentLevelIndex, setScreen, setPlayerState, setCurrentStep, setStartTime, enterFullscreen, lockOrientation]);

  // "Any key to continue" effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      // Stop any lingering sounds before proceeding
      audioManager.releaseAll();
      handleNextLevel();
    };
    if (hasNextLevel) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (hasNextLevel) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [hasNextLevel, handleNextLevel]);

  if (!currentLevel) {
    // Should not happen, but as a fallback
    return (
      <div className="text-center">
        <p>Error: No level data found.</p>
        <button onClick={() => setScreen('levelSelect')}>Back to Menu</button>
      </div>
    );
  }

  const finalTimeInSeconds = finalTime / 1000;
  const levelId = levelIndex[currentLevelIdx]?.id;
  const ranks = currentLevel.ranks;
  let rank = 'C';
  let rankColor = 'text-slate-500';

  if (finalTimeInSeconds <= ranks[0]) {
    rank = 'S';
    rankColor = 'text-yellow-400';
  } else if (finalTimeInSeconds <= ranks[1]) {
    rank = 'A';
    rankColor = 'text-slate-400';
  } else if (finalTimeInSeconds <= ranks[2]) {
    rank = 'B';
    rankColor = 'text-amber-700';
  }

  const handleBackToMenu = () => {
    audioManager.releaseAll();
    unlockOrientation();
    setScreen('levelSelect');
  };


  return (
    <section className="w-[90%] max-w-3xl p-5 rounded-2xl bg-black/10 backdrop-blur-lg border border-white/20 text-center">
      <h2 className="text-3xl font-black mb-6">Level {levelId} Complete!</h2>
      <div className={`text-9xl font-black leading-none mb-2.5 ${rankColor}`}>{rank}</div>
      <div className="text-2xl font-bold mb-8">Your Time: {finalTimeInSeconds.toFixed(2)}s</div>
      
      <div className="flex justify-center gap-4">
        {hasNextLevel && (
          <button onClick={handleNextLevel} className="bg-white text-emerald-600 text-lg font-bold py-3 px-5 rounded-xl cursor-pointer transition-transform hover:scale-105">
            Next Level (Any Key)
          </button>
        )}
        <button onClick={handleBackToMenu} className="bg-white text-emerald-600 text-lg font-bold py-3 px-5 rounded-xl cursor-pointer transition-transform hover:scale-105">
          Back to Menu
        </button>
      </div>
    </section>
  );
}

export default ResultScreen;
