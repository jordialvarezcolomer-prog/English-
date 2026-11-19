import {FPS} from '../theme';
/** Section boundaries (seconds) measured from the generated narration (public/audio/gym_voice.mp3). */
export const SEC = {
  buddy:   [0, 5.70],
  weeks:   [5.70, 12.69],
  inside:  [12.69, 25.33],
  study:   [25.33, 35.25],
  results: [35.25, 44.05],
  pooling: [44.05, 50.85],
  phone:   [50.85, 56.73],
  cta:     [56.73, 62.6],
} as const;
export type SecKey = keyof typeof SEC;
export const f = (s: number) => Math.round(s * FPS);
export const secFrom = (k: SecKey) => f(SEC[k][0]);
export const secLen = (k: SecKey) => f(SEC[k][1] - SEC[k][0]);
export const GYM_TOTAL = f(SEC.cta[1]);
// caption segments: [start, end, text] in seconds, from the silence-aligned narration
export const SEGMENTS: [number, number, string][] = [
  [0.03, 2.70, "Your gym buddy rests one minute between sets."], [2.91, 3.21, "You?"], [3.59, 3.99, "Three."], [4.28, 5.19, "Scrolling your phone."],
  [5.70, 6.33, "Eight weeks,"], [6.50, 7.25, "same workout:"], [7.67, 9.58, "your legs end up growing more than his."], [10.22, 12.12, "And you're the one who got called lazy."],
  [12.69, 13.97, "Here's what happens inside."], [14.53, 17.21, "Between sets, your muscle refuels its fast fuel."], [17.63, 18.19, "In one minute,"], [18.38, 19.25, "about half a tank."], [19.66, 20.18, "In three,"], [20.50, 21.14, "almost full."], [21.57, 22.74, "And with a half-empty tank,"], [23.03, 24.89, "the next set comes out with fewer reps."],
  [25.33, 27.77, "Researchers tested it on twenty-one trained guys:"], [28.08, 29.96, "same exercises, same sets,"], [30.12, 30.90, "three days a week."], [31.28, 32.35, "Some rested one minute."], [32.62, 33.16, "The others,"], [33.33, 33.65, "three."], [34.12, 34.82, "Eight weeks."],
  [35.25, 38.74, "The three-minute group built more thigh muscle, and got stronger on the squat."], [39.26, 40.73, "And the pump from the one-minute guys?"], [41.06, 41.74, "You feel it more."], [42.15, 43.49, "But a pump isn't growth."],
  [44.05, 44.95, "Pooling the studies:"], [45.40, 47.33, "under a minute tends to work a bit worse."], [47.67, 50.35, "From about a minute and a half on, it's basically the same."],
  [50.85, 53.35, "So the guy on his phone between sets isn't lazy."], [53.76, 56.30, "He's the one who starts every set with a full tank."], [56.73, 60.15, "Send this to that friend who says resting three minutes is for slackers."],
];
