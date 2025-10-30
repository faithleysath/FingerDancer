import * as Tone from 'tone';

let polySynth: Tone.PolySynth;
let reverb: Tone.Reverb;
let audioInitialized = false;

const KEY_NOTES: Record<string, string> = {
  ' ': 'C3',
  'j': 'G3',
  'k': 'A3',
  'l': 'C4',
  ';': 'E4',
};

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
  playNote: (key: string) => {
    if (!audioInitialized) return;
    const note = KEY_NOTES[key];
    if (note) {
      polySynth.triggerAttack(note, Tone.now());
    }
  },
  releaseNote: (key: string) => {
    if (!audioInitialized) return;
    const note = KEY_NOTES[key];
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
