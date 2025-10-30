import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  screenAtom,
  levelIndexAtom,
  currentLevelAtom,
  scaleAtom,
  type LevelIndexInfo,
  type Level,
  currentLevelIndexAtom,
} from '../atoms/gameAtoms';
import { audioManager, scales, type ScaleName } from '../lib/audio';
import { useMenuKeyboard } from '../hooks/useMenuKeyboard';
import { useFullscreen } from '../hooks/useFullscreen';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

function LevelSelectScreen() {
  useMenuKeyboard(); // Enable keyboard sounds on this screen
  const { enterFullscreen } = useFullscreen();
  const { lockOrientation } = useScreenOrientation();
  const [levelIndex, setLevelIndex] = useAtom(levelIndexAtom);
  const [currentScale, setCurrentScale] = useAtom(scaleAtom);
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
      
      await enterFullscreen();
      await lockOrientation('landscape');
      const res = await fetch(`/levels/${levelInfo.file}`);
      const levelData: Level = await res.json();
      setCurrentLevel(levelData);
      setCurrentLevelIndex(index);
      setScreen('game');
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  };

  const handleScaleChange = (newScale: ScaleName) => {
    setCurrentScale(newScale);
    audioManager.setScale(newScale);
  };

  return (
    <section className="w-[90%] max-w-3xl p-5 rounded-2xl bg-black/10 backdrop-blur-lg border border-white/20">
      <h1 className="text-center font-black text-4xl mb-6">Finger Dance</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-bold mb-3 text-center">
          SELECT MUSICAL SCALE
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(scales) as ScaleName[]).map((scaleName) => (
            <button
              key={scaleName}
              onClick={() => handleScaleChange(scaleName)}
              className={`p-2 rounded-md text-sm font-bold transition-colors ${
                currentScale === scaleName
                  ? 'bg-white text-emerald-600'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {scaleName}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-1 border-t border-white/20 pt-4">
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
