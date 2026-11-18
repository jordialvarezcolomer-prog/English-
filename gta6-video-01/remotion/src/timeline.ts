import {FPS} from './theme';
// Scene boundaries in SECONDS. These are estimates from the script; once the real
// ElevenLabs narration exists they are replaced by the measured values (captions.json + scene marks).
export const SCENES = {
  intro:   [0, 6.15],
  jetski:  [6.15, 17.77],
  events:  [17.77, 29.85],
  social:  [29.85, 41.35],
  house:   [41.35, 50.78],
  theft:   [50.78, 61.61],
  games:   [61.61, 72.93],
  outro:   [72.93, 77],
} as const;
export type SceneKey = keyof typeof SCENES;
export const f = (s: number) => Math.round(s * FPS);
export const sceneFrom = (k: SceneKey) => f(SCENES[k][0]);
export const sceneLen = (k: SceneKey) => f(SCENES[k][1] - SCENES[k][0]);
export const TOTAL_FRAMES = f(SCENES.outro[1]);
// Optional real assets. Set to a path inside /public when available.
export const ASSETS = {
  voice: 'audio/voice.mp3' as string | null,
  music: 'audio/music.wav' as string | null,
  sfx: 'audio/sfx.wav' as string | null,
  clips: {jetski: null, events: null, social: null, house: null, theft: null, games: null} as Record<string, string | null>,
};
