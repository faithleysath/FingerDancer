import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import {
  finalTimeAtom,
  currentLevelAtom,
  screenAtom,
  levelIndexAtom,
  currentLevelIndexAtom,
  type Level,
} from '../atoms/gameAtoms';
import { useEffect } from 'react';
import { audioManager } from '../lib/audio';

function ResultScreen() {
  const finalTime = useAtomValue(finalTimeAtom);
  const currentLevel = useAtomValue(currentLevelAtom);
  const levelIndex = useAtomValue(levelIndexAtom);
  const [currentLevelIdx, setCurrentLevelIndex] = useAtom(currentLevelIndexAtom);
  const setScreen = useSetAtom(screenAtom);
  const setCurrentLevel = useSetAtom(currentLevelAtom);
  
  const hasNextLevel = currentLevel && currentLevelIdx + 1 < levelIndex.length;

  const handleNextLevel = async () => {
    if (!hasNextLevel) return;
    const nextLevelIndex = currentLevelIdx + 1;
    const nextLevelInfo = levelIndex[nextLevelIndex];
    try {
      const res = await fetch(`/levels/${nextLevelInfo.file}`);
      const levelData: Level = await res.json();
      setCurrentLevel(levelData);
      setCurrentLevelIndex(nextLevelIndex);
      setScreen('game');
    } catch (error) {
      console.error('Failed to load next level:', error);
    }
  };

  // "Any key to continue" effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
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
  }, [hasNextLevel, currentLevelIdx]);

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
  const ranks = currentLevel.ranks;
  let rank = 'C';
  let rankColor = 'text-rank-c';

  if (finalTimeInSeconds <= ranks[0]) {
    rank = 'S';
    rankColor = 'text-rank-s';
  } else if (finalTimeInSeconds <= ranks[1]) {
    rank = 'A';
    rankColor = 'text-rank-a';
  } else if (finalTimeInSeconds <= ranks[2]) {
    rank = 'B';
    rankColor = 'text-rank-b';
  }

  const handleBackToMenu = () => {
    audioManager.releaseAll();
    setScreen('levelSelect');
  };


  return (
    <section className="w-[90%] max-w-xl p-5 rounded-2xl bg-panel backdrop-blur-lg border border-white/20 text-center">
      <h2 className="text-3xl font-black mb-6">Level Complete!</h2>
      <div className={`text-9xl font-black leading-none mb-2.5 ${rankColor}`}>{rank}</div>
      <div className="text-2xl font-bold mb-8">Your Time: {finalTimeInSeconds.toFixed(2)}s</div>
      
      <div className="flex justify-center gap-4">
        {hasNextLevel && (
          <button onClick={handleNextLevel} className="bg-dot text-game-bg text-lg font-bold py-3 px-5 rounded-xl cursor-pointer transition-transform hover:scale-105">
            Next Level (Any Key)
          </button>
        )}
        <button onClick={handleBackToMenu} className="bg-dot text-game-bg text-lg font-bold py-3 px-5 rounded-xl cursor-pointer transition-transform hover:scale-105">
          Back to Menu
        </button>
      </div>
    </section>
  );
}

export default ResultScreen;
