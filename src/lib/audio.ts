import * as Tone from 'tone';

let polySynth: Tone.PolySynth;
let reverb: Tone.Reverb;
let audioInitialized = false;

const KEYS = ['a', 's', 'd', 'f', ' ', 'j', 'k', 'l', ';'];

export const scales = {
  'C Major Chord': ['C2', 'E2', 'G2', 'A2', 'C3', 'G3', 'A3', 'C4', 'E4'],
  'C Major Scale': ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3'],
  'Pentatonic':    ['C2', 'D2', 'E2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3'],
  'Harmonic Minor':['C2', 'D2', 'Eb2', 'F2', 'G2', 'Ab2', 'B2', 'C3', 'D3'],
  'Blues':         ['C2', 'Eb2', 'F2', 'F#2', 'G2', 'Bb2', 'C3', 'Eb3', 'F3'],
};

export type ScaleName = keyof typeof scales;

let currentScale: Record<string, string> = {};

function buildScaleMap(scaleName: ScaleName): Record<string, string> {
  const notes = scales[scaleName];
  const scaleMap: Record<string, string> = {};
  KEYS.forEach((key, index) => {
    scaleMap[key] = notes[index];
  });
  return scaleMap;
}

currentScale = buildScaleMap('C Major Chord');

async function initializeAudio() {
  if (audioInitialized) return;
  
  await Tone.start();
  reverb = new Tone.Reverb(0.7).toDestination();
  polySynth = new Tone.PolySynth(Tone.Synth).connect(reverb);
  audioInitialized = true;
  console.log('Audio context started and initialized.');
}

export const audioManager = {
  start: initializeAudio,
  setScale: (scaleName: ScaleName) => {
    currentScale = buildScaleMap(scaleName);
  },
  setCustomScale: (notes: string[]) => {
    const scaleMap: Record<string, string> = {};
    KEYS.forEach((key, index) => {
      scaleMap[key] = notes[index];
    });
    currentScale = scaleMap;
  },
  playNote: (key: string) => {
    if (!audioInitialized) return;
    const note = currentScale[key];
    if (note) {
      polySynth.triggerAttack(note, Tone.now());
    }
  },
  releaseNote: (key: string) => {
    if (!audioInitialized) return;
    const note = currentScale[key];
    if (note) {
      polySynth.triggerRelease(note, Tone.now());
    }
  },
  releaseAll: () => {
    if (!audioInitialized) return;
    polySynth.releaseAll();
  },
  isInitialized: () => audioInitialized,
};
