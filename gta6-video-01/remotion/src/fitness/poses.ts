import type {Pose} from './Character';

type V3 = [number, number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Blend two poses (numbers and number tuples); non-numeric fields come from b. */
export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const out: Record<string, unknown> = {...a, ...b};
  for (const key of Object.keys(b) as (keyof Pose)[]) {
    const va = a[key], vb = b[key];
    if (typeof vb === 'number') out[key] = lerp(typeof va === 'number' ? va : 0, vb, k);
    else if (Array.isArray(vb)) { const base = (Array.isArray(va) ? va : (key.startsWith('hip') ? [0, 0] : [0, 0, 0])) as number[]; out[key] = (vb as number[]).map((x, i) => lerp(base[i] ?? 0, x, k)); }
  }
  return out as Pose;
};

/** Olympia pose 1 (Alex): one arm thrown out-and-up, the other in a side biceps; head turned to the flexed arm; wide stance. */
export const OLY_A: Pose = {
  shL: [0, 0, 1.45] as V3, twL: Math.PI / 2, elL: 1.95, gripL: 1.4,
  shR: [-0.22, 0, -2.2] as V3, twR: 0, elR: 0.06, gripR: 0.08, handR: 'stop',
  headY: 0.5, headX: 0.04, hipR: [0.02, -0.2], kneeR: 0.0, hipL: [0.05, 0.13], kneeL: 0.08, side: 0.02, twist: 0.08,
};
/** Olympia pose 2 (Daniel): one arm bent high over the head, the other flexed at shoulder height with an open hand; gaze up; one knee bent in. */
export const OLY_D: Pose = {
  shR: [-0.1, 0, -2.6] as V3, twR: -Math.PI / 2, elR: 1.35, gripR: 0.25,
  shL: [0, 0, 1.28] as V3, twL: Math.PI / 2, elL: 1.6, gripL: 0.3,
  headX: -0.32, headY: -0.32, hipR: [0.32, -0.02], kneeR: 0.5, hipL: [0, 0.09], kneeL: 0.02, side: -0.05, twist: -0.06, bob: -0.015,
};
/** Showing the creatine tub at chest height, gripped from the side. */
export const SHOW_TUB: Pose = {shL: [-0.45, 0.1, 0.22] as V3, elL: 1.55};
/** Daniel's "no thanks": arm straight out, palm to camera. */
export const STOP_R: Pose = {shR: [-1.35, 0, -0.12] as V3, elR: 0.22, handR: 'stop'};
/** Daniel drinking from his bottle. */
export const DRINK_R: Pose = {shR: [-1.35, 0.3, 0.1] as V3, twR: -0.2, elR: 2.0, wrR: 0.2, handR: 'drink', headX: -0.3};
