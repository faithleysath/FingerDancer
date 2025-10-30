import { useAtomValue } from 'jotai';
import { screenAtom } from '../atoms/gameAtoms';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import ResultScreen from './ResultScreen';
import ErrorBoundary from './ErrorBoundary';

const screenComponents = {
  levelSelect: <LevelSelectScreen />,
  game: <GameScreen />,
  result: <ResultScreen />,
};

function GameContainer() {
  const currentScreen = useAtomValue(screenAtom);

  return (
    <main id="game-container" className="flex justify-center content-center">
      <ErrorBoundary
        fallback={
          <div className="text-center p-8 bg-red-500/20 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Loading Failed</h2>
            <p>An error occurred while loading level data. Please refresh the page and try again.</p>
          </div>
        }
      >
        {screenComponents[currentScreen]}
      </ErrorBoundary>
    </main>
  );
}

export default GameContainer;
