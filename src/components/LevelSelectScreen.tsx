import { Suspense, useState } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
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

function LevelList() {
  const levelIndex = useAtomValue(levelIndexAtom);
  const setScreen = useSetAtom(screenAtom);
  const setCurrentLevel = useSetAtom(currentLevelAtom);
  const setCurrentLevelIndex = useSetAtom(currentLevelIndexAtom);
  const { enterFullscreen } = useFullscreen();
  const { lockOrientation } = useScreenOrientation();

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

  return (
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
  );
}

function LevelSelectScreen() {
  useMenuKeyboard(); // Enable keyboard sounds on this screen
  const [currentScale, setCurrentScale] = useAtom(scaleAtom);
  const [customScaleInput, setCustomScaleInput] = useState('C2 D2 E2 G2 A2 C3 D3 E3 G3');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleScaleChange = (newScale: ScaleName) => {
    setCurrentScale(newScale);
    audioManager.setScale(newScale);
    setShowCustomInput(false);
  };

  const handleCustomScaleApply = () => {
    const notes = customScaleInput.trim().split(/\s+/);
    if (notes.length === 9) {
      audioManager.setCustomScale(notes);
      setCurrentScale('Custom');
    } else {
      alert('Please enter exactly 9 notes separated by spaces.');
    }
  };
  
  const handleCustomButtonClick = () => {
    setShowCustomInput(!showCustomInput);
    if (currentScale !== 'Custom') {
      handleCustomScaleApply();
    }
  }

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
          <button
            onClick={handleCustomButtonClick}
            className={`p-2 rounded-md text-sm font-bold transition-colors ${
              currentScale === 'Custom'
                ? 'bg-white text-emerald-600'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Custom
          </button>
        </div>
        {showCustomInput && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={customScaleInput}
              onChange={(e) => setCustomScaleInput(e.target.value)}
              className="grow bg-white/10 p-2 rounded-md text-white placeholder-white/50"
              placeholder="Enter 9 notes (e.g., C4 D4 E4...)"
            />
            <button
              onClick={handleCustomScaleApply}
              className="bg-emerald-500 text-white font-bold p-2 rounded-md hover:bg-emerald-600"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <Suspense fallback={<div className="text-center p-8">Loading levels...</div>}>
        <LevelList />
      </Suspense>
    </section>
  );
}

export default LevelSelectScreen;
