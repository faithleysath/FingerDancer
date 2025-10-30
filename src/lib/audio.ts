import * as Tone from 'tone';

let polySynth: Tone.PolySynth;
let reverb: Tone.Reverb;
let audioInitialized = false;

export const scales = {
  'C Major Chord': {
    'a': 'C2', 's': 'E2', 'd': 'G2', 'f': 'A2',
    ' ': 'C3',
    'j': 'G3', 'k': 'A3', 'l': 'C4', ';': 'E4',
  },
  'C Major Scale': {
    'a': 'C2', 's': 'D2', 'd': 'E2', 'f': 'F2',
    ' ': 'G2',
    'j': 'A2', 'k': 'B2', 'l': 'C3', ';': 'D3',
  },
  'Pentatonic': {
    'a': 'C2', 's': 'D2', 'd': 'E2', 'f': 'G2',
    ' ': 'A2',
    'j': 'C3', 'k': 'D3', 'l': 'E3', ';': 'G3',
  },
  'Harmonic Minor': {
    'a': 'C2', 's': 'D2', 'd': 'Eb2', 'f': 'F2',
    ' ': 'G2',
    'j': 'Ab2', 'k': 'B2', 'l': 'C3', ';': 'D3',
  },
  'Blues': {
    'a': 'C2', 's': 'Eb2', 'd': 'F2', 'f': 'F#2',
    ' ': 'G2',
    'j': 'Bb2', 'k': 'C3', 'l': 'Eb3', ';': 'F3',
  },
};

export type ScaleName = keyof typeof scales;

let currentScale: Record<string, string> = scales['C Major Chord'];

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
    currentScale = scales[scaleName];
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
