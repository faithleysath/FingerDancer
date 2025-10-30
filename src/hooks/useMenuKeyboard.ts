import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { screenAtom } from '../atoms/gameAtoms';
import { audioManager } from '../lib/audio';

const KEY_MAP: Record<string, number> = {
  'a': 0, 's': 1, 'd': 2, 'f': 3,
  ' ': 4,
  'j': 5, 'k': 6, 'l': 7, ';': 8
};

export function useMenuKeyboard() {
  const currentScreen = useAtomValue(screenAtom);

  useEffect(() => {
    // This effect should only run when on the level select screen
    if (currentScreen !== 'levelSelect') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key] === undefined) return;
      e.preventDefault();
      
      // Initialize audio on first key press if not already done
      if (!audioManager.isInitialized()) {
        audioManager.start();
      }
      
      audioManager.playNote(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key] === undefined) return;
      e.preventDefault();
      audioManager.releaseNote(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioManager.releaseAll(); // Stop any sound when leaving the screen
    };
  }, [currentScreen]);
}
