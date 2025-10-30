import { useAtomValue } from 'jotai';
import { screenAtom } from '../atoms/gameAtoms';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import ResultScreen from './ResultScreen';

const screenComponents = {
  levelSelect: <LevelSelectScreen />,
  game: <GameScreen />,
  result: <ResultScreen />,
};

function GameContainer() {
  const currentScreen = useAtomValue(screenAtom);

  return (
    <main id="game-container">
      {screenComponents[currentScreen]}
    </main>
  );
}

export default GameContainer;
