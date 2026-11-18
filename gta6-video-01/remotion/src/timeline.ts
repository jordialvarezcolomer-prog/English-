import {FPS} from './theme';
// Scene boundaries in SECONDS. These are estimates from the script; once the real
// ElevenLabs narration exists they are replaced by the measured values (captions.json + scene marks).
export const SCENES = {
  intro:   [0, 6.31],
  jetski:  [6.31, 20.22],
  planes:  [20.22, 27.43],
  events:  [27.43, 38.03],
  social:  [38.03, 49.8],
  house:   [49.8, 59.43],
  theft:   [59.43, 70.73],
  games:   [70.73, 82.9],
  outro:   [82.9, 87.3],
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
