import { useRef, useCallback, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { playerStateAtom } from '../atoms/gameAtoms';

const KEY_MAP: Record<number, string> = {
  0: 'KeyA', 1: 'KeyS', 2: 'KeyD', 3: 'KeyF',
  4: 'KeyJ', 5: 'KeyK', 6: 'KeyL', 7: 'Semicolon',
  8: 'Space',
};

function dispatchKeyEvent(code: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

function TouchOverlay() {
  const playerState = useAtomValue(playerStateAtom);
  const zoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // --- Universal Input State ---
  const touchToZoneMap = useRef<Map<number, number>>(new Map());
  const isMouseDown = useRef(false);

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

    // --- Touch Events ---
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const zoneIndex = getZoneIndexFromCoordinates(touch.clientX, touch.clientY);
        if (zoneIndex !== -1 && !touchToZoneMap.current.has(touch.identifier)) {
          touchToZoneMap.current.set(touch.identifier, zoneIndex);
          dispatchKeyEvent(KEY_MAP[zoneIndex], 'keydown');
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const oldZoneIndex = touchToZoneMap.current.get(touch.identifier);
        const newZoneIndex = getZoneIndexFromCoordinates(touch.clientX, touch.clientY);
        if (oldZoneIndex !== newZoneIndex) {
          if (oldZoneIndex !== undefined) dispatchKeyEvent(KEY_MAP[oldZoneIndex], 'keyup');
          if (newZoneIndex !== -1) {
            touchToZoneMap.current.set(touch.identifier, newZoneIndex);
            dispatchKeyEvent(KEY_MAP[newZoneIndex], 'keydown');
          } else {
            touchToZoneMap.current.delete(touch.identifier);
          }
        }
      }
    };

    const handleTouchEndOrCancel = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const zoneIndex = touchToZoneMap.current.get(touch.identifier);
        if (zoneIndex !== undefined) {
          touchToZoneMap.current.delete(touch.identifier);
          dispatchKeyEvent(KEY_MAP[zoneIndex], 'keyup');
        }
      }
    };

    // --- Mouse Events ---
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isMouseDown.current = true;
      const zoneIndex = getZoneIndexFromCoordinates(e.clientX, e.clientY);
      if (zoneIndex !== -1) {
        dispatchKeyEvent(KEY_MAP[zoneIndex], 'keydown');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      e.preventDefault();
      // This simplistic approach doesn't handle dragging between zones for mouse,
      // as it can feel unnatural. It primarily ensures continuous pressing.
      // A more complex implementation could track the last pressed zone.
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      e.preventDefault();
      isMouseDown.current = false;
      // Release all keys on mouse up to prevent stuck keys
      for (let i = 0; i < playerState.length; i++) {
        if (playerState[i] === 1) {
          dispatchKeyEvent(KEY_MAP[i], 'keyup');
        }
      }
    };

    // Register all event listeners
    overlayNode.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    overlayNode.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    overlayNode.addEventListener('touchend', handleTouchEndOrCancel as EventListener, { passive: false });
    overlayNode.addEventListener('touchcancel', handleTouchEndOrCancel as EventListener, { passive: false });
    overlayNode.addEventListener('mousedown', handleMouseDown as EventListener, { passive: false });
    overlayNode.addEventListener('mousemove', handleMouseMove as EventListener, { passive: false });
    window.addEventListener('mouseup', handleMouseUp as EventListener); // Listen on window to catch mouseup outside the overlay

    return () => {
      overlayNode.removeEventListener('touchstart', handleTouchStart as EventListener);
      overlayNode.removeEventListener('touchmove', handleTouchMove as EventListener);
      overlayNode.removeEventListener('touchend', handleTouchEndOrCancel as EventListener);
      overlayNode.removeEventListener('touchcancel', handleTouchEndOrCancel as EventListener);
      overlayNode.removeEventListener('mousedown', handleMouseDown as EventListener);
      overlayNode.removeEventListener('mousemove', handleMouseMove as EventListener);
      window.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [getZoneIndexFromCoordinates, playerState]);

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
              playerState[i] ? 'bg-white/30' : 'bg-transparent'
            } transition-colors duration-200`}
          />
        ))}
      </div>
      <div
        ref={el => { zoneRefs.current[8] = el; }}
        className={`h-1/4 border-t border-white/10 ${
          playerState[8] ? 'bg-white/30' : 'bg-transparent'
        } transition-colors duration-200`}
      />
    </div>
  );
}

export default TouchOverlay;
