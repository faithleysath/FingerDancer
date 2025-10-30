import { useAtom } from 'jotai';
import { RefreshCw, Home, Maximize, Minimize } from 'lucide-react';
import { audioManager } from './lib/audio';
import { screenAtom } from './atoms/gameAtoms';
import GameContainer from './components/GameContainer';
import { useGameLogic } from './hooks/useGameLogic';
import { useGlobalAudio } from './hooks/useGlobalAudio';
import TouchOverlay from './components/TouchOverlay';
import { useScreenOrientation } from './hooks/useScreenOrientation';
import { useFullscreen } from './hooks/useFullscreen';

function App() {
  useGlobalAudio(); // Mount the global audio handler
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { lockOrientation, unlockOrientation } = useScreenOrientation();
  const [screen, setScreen] = useAtom(screenAtom);
  const { resetGameState } = useGameLogic();

  const handleBackToMenu = () => {
    audioManager.releaseAll();
    unlockOrientation();
    setScreen('levelSelect');
  };

  const handleToggleFullscreen = () => {
    toggleFullscreen();
    lockOrientation('landscape');
  };

  return (
    <div
      className={`font-sans flex justify-center items-center bg-emerald-500 text-white overflow-hidden select-none relative ${
        isFullscreen ? 'h-screen w-screen' : 'h-svh w-svw'
      }`}
    >
      {screen === 'game' && <TouchOverlay />}
      {screen === 'game' && (
        <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
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
