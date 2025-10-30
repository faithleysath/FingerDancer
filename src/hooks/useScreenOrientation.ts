import { useCallback } from 'react';

type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/**
 * A React hook to control the screen orientation on supported devices.
 */
export function useScreenOrientation() {
  const lockOrientation = useCallback(async (type: OrientationLockType) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orientation = screen.orientation as any;
    if (!isTouchDevice() || !orientation || typeof orientation.lock !== 'function') {
      return;
    }
    try {
      await orientation.lock(type);
    } catch (error) {
      // This can happen if the user denies the request or the browser doesn't support it.
      // We can safely ignore this error.
      console.warn(`Could not lock screen orientation to ${type}:`, error);
    }
  }, []);

  const unlockOrientation = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orientation = screen.orientation as any;
    if (!isTouchDevice() || !orientation || typeof orientation.unlock !== 'function') {
      return;
    }
    try {
      orientation.unlock();
    } catch (error) {
      console.warn('Could not unlock screen orientation:', error);
    }
  }, []);

  return { lockOrientation, unlockOrientation };
}
