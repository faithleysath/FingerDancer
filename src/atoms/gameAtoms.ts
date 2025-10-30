import { atom } from 'jotai';
import { type ScaleName } from '../lib/audio';

// --- Types ---
export type Screen = 'levelSelect' | 'game' | 'result';

export interface Level {
  name: string;
  patterns: number[][];
  ranks: number[];
}

export interface LevelIndexInfo {
  id: number;
  name: string;
  file: string;
}

// --- Atoms ---

// Controls which screen is currently visible
export const screenAtom = atom<Screen>('levelSelect');

// Holds the list of all available levels (from index.json)
export const levelIndexAtom = atom<LevelIndexInfo[]>([]);

// Controls the currently selected musical scale
export const scaleAtom = atom<ScaleName>('C Major Chord');

// Holds the data for the currently selected level
export const currentLevelAtom = atom<Level | null>(null);

// Holds the index of the current level being played
export const currentLevelIndexAtom = atom<number>(-1);

// Represents the player's current key presses [A, S, D, F, Space, J, K, L, ;]
export const playerStateAtom = atom<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);

// The current step/pattern the player is on within a level
export const currentStepAtom = atom<number>(0);

// Tracks the start time of the game (in milliseconds)
export const startTimeAtom = atom<number>(0);

// Holds the final time when a level is completed
export const finalTimeAtom = atom<number>(0);

// A derived atom to check if the game is currently active
export const gameActiveAtom = atom(
  (get) => get(screenAtom) === 'game' && get(currentLevelAtom) !== null
);
