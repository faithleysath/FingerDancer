import { useEffect, useRef } from 'react';
import { audioManager } from '../lib/audio';

const CODE_MAP: Record<string, { key: string }> = {
  'KeyA': { key: 'a' },
  'KeyS': { key: 's' },
  'KeyD': { key: 'd' },
  'KeyF': { key: 'f' },
  'Space': { key: ' ' },
  'KeyJ': { key: 'j' },
  'KeyK': { key: 'k' },
  'KeyL': { key: 'l' },
  'Semicolon': { key: ';' },
};

/**
 * A global hook to handle keyboard audio feedback for the 9 game keys.
 * This should be mounted once at the root of the application.
 */
export function useGlobalAudio() {
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      // Ignore repeated events from holding a key down
      if (keyInfo === undefined || pressedKeys.current.has(e.code)) return;
      
      e.preventDefault();
      pressedKeys.current.add(e.code);
      
      // Initialize audio on first key press if not already done
      if (!audioManager.isInitialized()) {
        audioManager.start();
      }
      
      audioManager.playNote(keyInfo.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined) return;

      e.preventDefault();
      pressedKeys.current.delete(e.code);
      audioManager.releaseNote(keyInfo.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioManager.releaseAll(); // Stop any sound when the app unmounts
    };
  }, []); // Empty dependency array ensures this runs only once
}
