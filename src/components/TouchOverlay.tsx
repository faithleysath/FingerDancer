import { useState, useRef, useCallback, useEffect } from 'react';

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
  const overlayRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const overlayNode = overlayRef.current;
    if (!overlayNode) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setPressedZones(currentPressed => {
        const nextPressed = [...currentPressed];
        for (const touch of Array.from(e.changedTouches)) {
          const zoneIndex = getZoneIndexFromCoordinates(touch.clientX, touch.clientY);
          if (zoneIndex !== -1 && !touchToZoneMap.current.has(touch.identifier)) {
            touchToZoneMap.current.set(touch.identifier, zoneIndex);
            dispatchKeyEvent(KEY_MAP[zoneIndex], 'keydown');
            nextPressed[zoneIndex] = true;
          }
        }
        return nextPressed;
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      setPressedZones(currentPressed => {
        const nextPressed = [...currentPressed];
        for (const touch of Array.from(e.changedTouches)) {
          const oldZoneIndex = touchToZoneMap.current.get(touch.identifier);
          const newZoneIndex = getZoneIndexFromCoordinates(touch.clientX, touch.clientY);

          if (oldZoneIndex !== newZoneIndex) {
            // Release the old key
            if (oldZoneIndex !== undefined) {
              dispatchKeyEvent(KEY_MAP[oldZoneIndex], 'keyup');
              nextPressed[oldZoneIndex] = false;
            }
            // Press the new key
            if (newZoneIndex !== -1) {
              touchToZoneMap.current.set(touch.identifier, newZoneIndex);
              dispatchKeyEvent(KEY_MAP[newZoneIndex], 'keydown');
              nextPressed[newZoneIndex] = true;
            } else {
              // Finger moved out of any valid zone
              touchToZoneMap.current.delete(touch.identifier);
            }
          }
        }
        return nextPressed;
      });
    };

    const handleTouchEndOrCancel = (e: TouchEvent) => {
      e.preventDefault();
      setPressedZones(currentPressed => {
        const nextPressed = [...currentPressed];
        for (const touch of Array.from(e.changedTouches)) {
          const zoneIndex = touchToZoneMap.current.get(touch.identifier);
          if (zoneIndex !== undefined) {
            touchToZoneMap.current.delete(touch.identifier);
            dispatchKeyEvent(KEY_MAP[zoneIndex], 'keyup');
            nextPressed[zoneIndex] = false;
          }
        }
        return nextPressed;
      });
    };

    overlayNode.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    overlayNode.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    overlayNode.addEventListener('touchend', handleTouchEndOrCancel as EventListener, { passive: false });
    overlayNode.addEventListener('touchcancel', handleTouchEndOrCancel as EventListener, { passive: false });

    return () => {
      overlayNode.removeEventListener('touchstart', handleTouchStart as EventListener);
      overlayNode.removeEventListener('touchmove', handleTouchMove as EventListener);
      overlayNode.removeEventListener('touchend', handleTouchEndOrCancel as EventListener);
      overlayNode.removeEventListener('touchcancel', handleTouchEndOrCancel as EventListener);
    };
  }, [getZoneIndexFromCoordinates]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 flex flex-col"
      style={{ touchAction: 'none' }}
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
