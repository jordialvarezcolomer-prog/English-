import {Arm, Muscle, Pose, REST} from './Hero';

export const mix = (a: Pose, b: Pose, k: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * k;
  const arm = (p: Arm, q: Arm): Arm => ({x: m(p.x, q.x), z: m(p.z, q.z), y: m(p.y, q.y), elbow: m(p.elbow, q.elbow), foreYaw: m(p.foreYaw, q.foreYaw), wrist: m(p.wrist, q.wrist)});
  const leg = (p: Pose['legL'], q: Pose['legL']) => ({x: m(p.x, q.x), z: m(p.z, q.z), knee: m(p.knee, q.knee), ankle: m(p.ankle, q.ankle)});
  return {
    root: {y: m(a.root.y, b.root.y), yaw: m(a.root.yaw, b.root.yaw), pitch: m(a.root.pitch, b.root.pitch)},
    spine: {lean: m(a.spine.lean, b.spine.lean), twist: m(a.spine.twist, b.spine.twist), side: m(a.spine.side, b.spine.side)},
    chest: {lean: m(a.chest.lean, b.chest.lean), twist: m(a.chest.twist, b.chest.twist)}, head: {yaw: m(a.head.yaw, b.head.yaw), pitch: m(a.head.pitch, b.head.pitch)},
    armL: arm(a.armL, b.armL), armR: arm(a.armR, b.armR), legL: leg(a.legL, b.legL), legR: leg(a.legR, b.legR), flare: m(a.flare, b.flare),
  };
};
const arm = (o: Partial<Arm>): Arm => ({x: 0, z: 0.16, y: 0, elbow: 0.12, foreYaw: 0, wrist: 0, ...o});
export const STAND: Pose = {...REST, armL: arm({z: 0.3}), armR: arm({z: 0.3}), flare: 0.35};
/** Triceps pushdown, e = elbow flexion rad (1.75 ≈ top, 0.12 ≈ bottom lock-out). Upper arms stay put; only the elbow moves. */
export const pushdown = (e: number): Pose => {
  const a = arm({x: 0.1, z: 0.1, elbow: e, foreYaw: 0.3, wrist: 0.0});
  return {...REST, spine: {lean: 0.22, twist: 0, side: 0}, head: {yaw: 0, pitch: 0.22}, armL: a, armR: a, legL: {x: 0.05, z: 0.08, knee: 0.14, ankle: 0}, legR: {x: 0.05, z: -0.08, knee: 0.14, ankle: 0}, flare: 0.15};
};
export const lateralRaise = (u: number): Pose => { const a = arm({z: 0.2 + 1.2 * u, elbow: 0.22 + 0.1 * u}); return {...REST, armL: a, armR: a, flare: 0.5}; };
export const doubleBiceps: Pose = {...REST, armL: arm({z: 1.38, elbow: 2.35, y: 0.5}), armR: arm({z: 1.38, elbow: 2.35, y: 0.5}), spine: {lean: 0.05, twist: 0, side: 0}, flare: 1, legL: {x: 0, z: 0.14, knee: 0.04, ankle: 0}, legR: {x: 0, z: -0.14, knee: 0.04, ankle: 0}};
export const backLatSpread: Pose = {...REST, armL: arm({z: 0.55, elbow: 0.7, y: 0}), armR: arm({z: 0.55, elbow: 0.7}), flare: 1, root: {y: 0, yaw: Math.PI, pitch: 0}};
export const threeQuarter: Pose = {...REST, root: {y: 0, yaw: 0.65, pitch: 0}, armL: arm({z: 0.28, elbow: 0.3}), armR: arm({z: 0.28, elbow: 0.3}), flare: 0.5, head: {yaw: -0.2, pitch: 0}};
export const Glow = (m: Partial<Record<Muscle, number>>) => m;
