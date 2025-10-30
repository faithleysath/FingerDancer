import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  screenAtom,
  levelIndexAtom,
  currentLevelAtom,
  type LevelIndexInfo,
  type Level,
  currentLevelIndexAtom,
} from '../atoms/gameAtoms';
import { audioManager } from '../lib/audio';

function LevelSelectScreen() {
  const [levelIndex, setLevelIndex] = useAtom(levelIndexAtom);
  const setScreen = useSetAtom(screenAtom);
  const setCurrentLevel = useSetAtom(currentLevelAtom);
  const setCurrentLevelIndex = useSetAtom(currentLevelIndexAtom);

  useEffect(() => {
    // Fetch the level index when the component mounts
    if (levelIndex.length === 0) {
      fetch('/levels/index.json')
        .then((res) => res.json())
        .then((data: LevelIndexInfo[]) => setLevelIndex(data))
        .catch(console.error);
    }
  }, [levelIndex, setLevelIndex]);

  const handleLevelSelect = async (levelInfo: LevelIndexInfo, index: number) => {
    try {
      // Start audio context on first user interaction
      if (!audioManager.isInitialized()) {
        await audioManager.start();
      }
      
      const res = await fetch(`/levels/${levelInfo.file}`);
      const levelData: Level = await res.json();
      setCurrentLevel(levelData);
      setCurrentLevelIndex(index);
      setScreen('game');
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  };

  return (
    <section className="w-[90%] max-w-xl p-5 rounded-2xl bg-black/10 backdrop-blur-lg border border-white/20">
      <h1 className="text-center font-black text-4xl mb-6">Finger Dance</h1>
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {levelIndex.map((level, index) => (
          <button
            key={level.id}
            onClick={() => handleLevelSelect(level, index)}
            className="bg-white text-emerald-600 text-lg font-bold border-none py-4 px-5 rounded-xl cursor-pointer transition-transform duration-100 ease-in-out hover:scale-105"
          >
            {level.name}
          </button>
        ))}
      </div>
    </section>
  );
}

export default LevelSelectScreen;
