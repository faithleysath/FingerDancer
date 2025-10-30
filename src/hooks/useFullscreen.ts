import { useState, useEffect, useCallback } from 'react';
import screenfull from 'screenfull';

/**
 * A React hook to manage browser fullscreen mode using the `screenfull` library.
 * It provides the current fullscreen state and functions to enter, exit, and toggle fullscreen.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);

  const enterFullscreen = useCallback(async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.request(undefined, { navigationUI: 'hide' });
      } else {
        console.warn('Fullscreen API is not available.');
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.exit();
      } else {
        console.warn('Fullscreen API is not available.');
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.toggle(undefined, { navigationUI: 'hide' });
      } else {
        console.warn('Fullscreen API is not available.');
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  }, []);

  useEffect(() => {
    if (!screenfull.isEnabled) {
      return;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    screenfull.on('change', handleFullscreenChange);

    return () => {
      screenfull.off('change', handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}
