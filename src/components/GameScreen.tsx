import { useAtomValue } from 'jotai';
import { currentLevelAtom, playerStateAtom, currentStepAtom, startTimeAtom } from '../atoms/gameAtoms';
import { useGameLogic } from '../hooks/useGameLogic';
import { useEffect, useState } from 'react';
import Dot from './Dot';

const KEY_LABELS = ['A', 'S', 'D', 'F', 'SPACE', 'J', 'K', 'L', ';'];

function Timer() {
  const startTime = useAtomValue(startTimeAtom);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (startTime === 0) {
      setTime(0);
      return;
    }

    let animationFrameId: number;
    const updateTimer = () => {
      setTime(Date.now() - startTime);
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, [startTime]);

  return <span className="text-2xl font-bold min-w-20 text-right">{(time / 1000).toFixed(2)}s</span>;
}

function GameScreen() {
  useGameLogic(); // Initialize game logic and event listeners
  const currentLevel = useAtomValue(currentLevelAtom);
  const playerState = useAtomValue(playerStateAtom);
  const currentStep = useAtomValue(currentStepAtom);

  if (!currentLevel) {
    return <div>Loading level...</div>;
  }

  const targetPattern = currentLevel.patterns[currentStep];

  const renderDots = (pattern: number[], isPlayer: boolean) => {
    return pattern.map((isPressedValue, index) => (
      <Dot
        key={index}
        variant={index === 4 ? 'space' : 'key'}
        isPressed={isPressedValue === 1}
        isPlayer={isPlayer}
        isTarget={!isPlayer}
      />
    ));
  };

  return (
    <section className="w-[90%] max-w-3xl p-5 rounded-2xl bg-black/10 backdrop-blur-lg border border-white/20">
      <header className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
        <Timer />
      </header>

      {/* Target Pattern */}
      <div className="flex justify-center items-center gap-4 mb-2.5">
        {renderDots(targetPattern, false)}
      </div>

      {/* Player Pattern */}
      <div className="flex justify-center items-center gap-4">
        {renderDots(playerState, true)}
      </div>

      {/* Key Labels */}
      <div className="flex justify-center items-center gap-4 mt-4">
        {KEY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`h-16 flex justify-center items-center text-3xl font-black text-white/30 ${
              index === 4 ? 'w-32 text-2xl' : 'w-16'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="text-center text-lg font-bold mt-5">
        Step {currentStep + 1} / {currentLevel.patterns.length}
      </div>
    </section>
  );
}

export default GameScreen;
