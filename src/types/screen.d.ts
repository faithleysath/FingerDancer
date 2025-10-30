// This file extends the default TypeScript DOM library definitions.
// The Screen Orientation API's .lock() and .unlock() methods are
// not consistently typed across all TypeScript versions, so we define them here
// to ensure our project compiles without errors.

type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

declare global {
  interface ScreenOrientation {
    lock(orientation: OrientationLockType): Promise<void>;
    unlock(): void;
  }
}
