import { useAtom } from 'jotai';
import { RefreshCw, Home } from 'lucide-react';
import { audioManager } from './lib/audio';
import { screenAtom } from './atoms/gameAtoms';
import GameContainer from './components/GameContainer';
import { useGameLogic } from './hooks/useGameLogic';
import { useGlobalAudio } from './hooks/useGlobalAudio';
import { useEffect, useState } from 'react';
import TouchOverlay from './components/TouchOverlay';
import { useScreenOrientation } from './hooks/useScreenOrientation';

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function App() {
  useGlobalAudio(); // Mount the global audio handler
  const { unlockOrientation } = useScreenOrientation();
  const [screen, setScreen] = useAtom(screenAtom);
  const { resetGameState } = useGameLogic();
  const [showTouchOverlay, setShowTouchOverlay] = useState(false);

  useEffect(() => {
    setShowTouchOverlay(isTouchDevice());
  }, []);

  const handleBackToMenu = () => {
    audioManager.releaseAll();
    unlockOrientation();
    setScreen('levelSelect');
  };

  return (
    <div className="font-sans flex justify-center items-center h-screen bg-emerald-500 text-white overflow-hidden select-none relative">
      {screen === 'game' && showTouchOverlay && <TouchOverlay />}
      {screen === 'game' && (
        <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
          <button
            onClick={resetGameState}
            className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Restart Level"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleBackToMenu}
            className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Back to Menu"
          >
            <Home size={20} />
          </button>
        </div>
      )}
      <GameContainer />
    </div>
  );
}

export default App;
