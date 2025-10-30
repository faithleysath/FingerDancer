import { useState, type TouchEvent } from 'react';

// Maps the index of the touch area to a keyboard event code
const KEY_MAP: Record<number, string> = {
  0: 'KeyA', 1: 'KeyS', 2: 'KeyD', 3: 'KeyF',
  4: 'KeyJ', 5: 'KeyK', 6: 'KeyL', 7: 'Semicolon',
  8: 'Space',
};

// Dispatches a synthetic keyboard event
function dispatchKeyEvent(code: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

function TouchOverlay() {
  // State to track which zones are currently being pressed for visual feedback
  const [pressedZones, setPressedZones] = useState<boolean[]>(Array(9).fill(false));

  const handleTouchStart = (_: TouchEvent<HTMLDivElement>, index: number) => {
    const code = KEY_MAP[index];
    if (code) {
      dispatchKeyEvent(code, 'keydown');
      setPressedZones(prev => {
        const newPressed = [...prev];
        newPressed[index] = true;
        return newPressed;
      });
    }
  };

  const handleTouchEnd = (_: TouchEvent<HTMLDivElement>, index: number) => {
    const code = KEY_MAP[index];
    if (code) {
      dispatchKeyEvent(code, 'keyup');
      setPressedZones(prev => {
        const newPressed = [...prev];
        newPressed[index] = false;
        return newPressed;
      });
    }
  };

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col"
      style={{ touchAction: 'none' }}
    >
      {/* Top 8 keys */}
      <div className="grow flex">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full border border-white/10 ${
              pressedZones[i] ? 'bg-white/30' : 'bg-transparent'
            } transition-colors duration-200`}
            onTouchStart={(e) => handleTouchStart(e, i)}
            onTouchEnd={(e) => handleTouchEnd(e, i)}
          />
        ))}
      </div>
      {/* Bottom space key */}
      <div
        className={`h-1/4 border border-white/10 ${
          pressedZones[8] ? 'bg-white/30' : 'bg-transparent'
        } transition-colors duration-200`}
        onTouchStart={(e) => handleTouchStart(e, 8)}
        onTouchEnd={(e) => handleTouchEnd(e, 8)}
      />
    </div>
  );
}

export default TouchOverlay;
