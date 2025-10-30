import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { screenAtom } from '../atoms/gameAtoms';

const CODE_MAP: Record<string, { index: number, key: string }> = {
  'KeyA': { index: 0, key: 'a' },
  'KeyS': { index: 1, key: 's' },
  'KeyD': { index: 2, key: 'd' },
  'KeyF': { index: 3, key: 'f' },
  'Space': { index: 4, key: ' ' },
  'KeyJ': { index: 5, key: 'j' },
  'KeyK': { index: 6, key: 'k' },
  'KeyL': { index: 7, key: 'l' },
  'Semicolon': { index: 8, key: ';' },
};

export function useMenuKeyboard() {
  const currentScreen = useAtomValue(screenAtom);
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    // This effect should only run when on the level select screen
    if (currentScreen !== 'levelSelect') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined || pressedKeys.current.has(e.code)) return;
      
      e.preventDefault();
      pressedKeys.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyInfo = CODE_MAP[e.code];
      if (keyInfo === undefined) return;

      e.preventDefault();
      pressedKeys.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentScreen]);
}
