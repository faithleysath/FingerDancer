import { useState, useRef, useCallback, type TouchEvent } from 'react';

const KEY_MAP: Record<number, string> = {
  0: 'KeyA', 1: 'KeyS', 2: 'KeyD', 3: 'KeyF',
  4: 'KeyJ', 5: 'KeyK', 6: 'KeyL', 7: 'Semicolon',
  8: 'Space',
};

function dispatchKeyEvent(code: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

function TouchOverlay() {
  const [pressedZones, setPressedZones] = useState(Array(9).fill(false));
  const zoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchToZoneMap = useRef<Map<number, number>>(new Map());

  const getZoneIndexFromCoordinates = useCallback((x: number, y: number) => {
    for (let i = 0; i < zoneRefs.current.length; i++) {
      const node = zoneRefs.current[i];
      if (node) {
        const rect = node.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return i;
        }
      }
    }
    return -1;
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    for (const touch of Array.from(e.changedTouches)) {
      const zoneIndex = getZoneIndexFromCoordinates(touch.clientX, touch.clientY);
      if (zoneIndex !== -1 && !touchToZoneMap.current.has(touch.identifier)) {
        touchToZoneMap.current.set(touch.identifier, zoneIndex);
        dispatchKeyEvent(KEY_MAP[zoneIndex], 'keydown');
        setPressedZones(prev => {
          const next = [...prev];
          next[zoneIndex] = true;
          return next;
        });
      }
    }
  };

  const handleTouchEndOrCancel = (e: TouchEvent<HTMLDivElement>) => {
    for (const touch of Array.from(e.changedTouches)) {
      const zoneIndex = touchToZoneMap.current.get(touch.identifier);
      if (zoneIndex !== undefined) {
        touchToZoneMap.current.delete(touch.identifier);
        dispatchKeyEvent(KEY_MAP[zoneIndex], 'keyup');
        setPressedZones(prev => {
          const next = [...prev];
          next[zoneIndex] = false;
          return next;
        });
      }
    }
  };

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
    >
      <div className="grow flex">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            ref={el => { zoneRefs.current[i] = el; }}
            className={`flex-1 h-full border-r border-white/10 ${
              pressedZones[i] ? 'bg-white/30' : 'bg-transparent'
            } transition-colors duration-200`}
          />
        ))}
      </div>
      <div
        ref={el => { zoneRefs.current[8] = el; }}
        className={`h-1/4 border-t border-white/10 ${
          pressedZones[8] ? 'bg-white/30' : 'bg-transparent'
        } transition-colors duration-200`}
      />
    </div>
  );
}

export default TouchOverlay;
