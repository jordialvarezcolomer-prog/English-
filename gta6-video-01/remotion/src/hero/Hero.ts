import * as THREE from 'three';
import {PAL, outlineMat, toonMat} from './toon';

/* ===========================================================================================
   TEAL — the bodybuilder. Fully procedural, imperative rig (no AI generation → identical in every video).
   Space: metres, Y up, faces +Z, character's LEFT side is +X. Floor at y = 0.
   Every muscle is its own named mesh → can be highlighted individually (glow) and always outlined.
   =========================================================================================== */
export type Arm = {x: number; z: number; y: number; elbow: number; foreYaw: number; wrist: number}; // x: flexion (+ forward), z: abduction, y: twist, elbow: flexion rad
export type Leg = {x: number; z: number; knee: number; ankle: number};
export type Pose = {
  root: {y: number; yaw: number; pitch: number}; spine: {lean: number; twist: number; side: number}; chest: {lean: number; twist: number};
  head: {yaw: number; pitch: number}; armL: Arm; armR: Arm; legL: Leg; legR: Leg; flare: number; // lats flare 0..1
};
export const A0: Arm = {x: 0, z: 0.16, y: 0, elbow: 0.12, foreYaw: 0, wrist: 0};
export const REST: Pose = {
  root: {y: 0, yaw: 0, pitch: 0}, spine: {lean: 0, twist: 0, side: 0}, chest: {lean: 0, twist: 0}, head: {yaw: 0, pitch: 0},
  armL: A0, armR: A0, legL: {x: 0, z: 0.06, knee: 0.03, ankle: 0}, legR: {x: 0, z: -0.06, knee: 0.03, ankle: 0}, flare: 0.3,
};
export const MUSCLES = ['delt_front', 'delt_side', 'delt_rear', 'pecs', 'lats', 'traps', 'abs', 'obliques', 'biceps', 'triceps', 'forearms', 'quads', 'hams', 'glutes', 'calves'] as const;
export type Muscle = typeof MUSCLES[number];

const SPH = new THREE.SphereGeometry(1, 30, 22);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 28, 1);
const TAP = (r0: number, r1: number) => new THREE.CylinderGeometry(r1, r0, 1, 28, 1); // r0 at bottom
type V3 = [number, number, number];

export const buildHero = (aspect = 1080 / 1920) => {
  const root = new THREE.Group(); // pelvis centre
  const skin = toonMat(PAL.skin), shorts = toonMat(PAL.shorts, 0.35), white = toonMat(PAL.white, 0.3), ink = outlineMat(0.0042, aspect);
  const glow: Partial<Record<Muscle, THREE.ShaderMaterial[]>> = {};
  const outlines: THREE.ShaderMaterial[] = [];
  const part = (parent: THREE.Object3D, geo: THREE.BufferGeometry, base: THREE.ShaderMaterial, pos: V3, scl: V3, rot: V3 = [0, 0, 0], muscle?: Muscle) => {
    const m = base.clone(); const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...pos); mesh.scale.set(...scl); mesh.rotation.set(...rot);
    const o = ink.clone(); outlines.push(o); mesh.add(new THREE.Mesh(geo, o));
    parent.add(mesh); if (muscle) (glow[muscle] ||= []).push(m);
    return mesh;
  };
  const ell = (parent: THREE.Object3D, mat: THREE.ShaderMaterial, pos: V3, r: V3, rot: V3 = [0, 0, 0], muscle?: Muscle) => part(parent, SPH, mat, pos, r, rot, muscle);
  const grp = (parent: THREE.Object3D, pos: V3) => { const g = new THREE.Group(); g.position.set(...pos); parent.add(g); return g; };
  const sides = [1, -1];

  /* ---------- pelvis, shorts ---------- */
  ell(root, shorts, [0, 0.01, 0], [0.225, 0.17, 0.16]);
  ell(root, shorts, [0, -0.03, -0.075], [0.2, 0.13, 0.11]);
  part(root, CYL, white, [0, 0.16, 0], [0.218, 0.032, 0.158]); // waistband
  sides.forEach((sd) => ell(root, skin, [sd * 0.095, -0.015, -0.1], [0.12, 0.115, 0.1], [0, 0, 0], 'glutes'));

  /* ---------- spine / abdomen ---------- */
  const spine = grp(root, [0, 0.17, 0]);
  ell(spine, skin, [0, 0.12, 0], [0.165, 0.17, 0.115]); // core
  [0, 1, 2].forEach((i) => sides.forEach((sd) => ell(spine, skin, [sd * 0.043, 0.04 + i * 0.064, 0.098 - i * 0.004], [0.047, 0.03, 0.03], [0, 0, 0], 'abs')));
  sides.forEach((sd) => ell(spine, skin, [sd * 0.145, 0.1, 0.02], [0.052, 0.13, 0.085], [0, 0, sd * -0.18], 'obliques'));
  const chest = grp(spine, [0, 0.27, 0]);
  /* ---------- chest, back ---------- */
  ell(chest, skin, [0, 0.03, 0], [0.205, 0.235, 0.14]); // ribcage
  sides.forEach((sd) => ell(chest, skin, [sd * 0.105, 0.115, 0.095], [0.118, 0.085, 0.07], [0.12, sd * -0.1, sd * 0.1], 'pecs'));
  sides.forEach((sd) => ell(chest, skin, [sd * 0.105, 0.04, 0.115], [0.1, 0.045, 0.045], [0.35, 0, sd * 0.08], 'pecs'));
  const lats = sides.map((sd) => ell(chest, skin, [sd * 0.17, -0.015, -0.075], [0.062, 0.2, 0.075], [0, 0, sd * -0.22], 'lats'));
  sides.forEach((sd) => ell(chest, skin, [sd * 0.1, 0.07, -0.115], [0.09, 0.1, 0.05], [0, 0, 0], 'lats')); // mid back
  ell(chest, skin, [0, 0.235, -0.035], [0.18, 0.07, 0.075], [0, 0, 0], 'traps');
  sides.forEach((sd) => ell(chest, skin, [sd * 0.12, 0.215, -0.02], [0.09, 0.05, 0.065], [0, 0, sd * -0.38], 'traps'));

  /* ---------- neck + head ---------- */
  const neck = grp(chest, [0, 0.245, 0.01]);
  part(neck, TAP(0.085, 0.07), skin, [0, 0.05, 0], [1, 0.14, 1]);
  const head = grp(neck, [0, 0.17, 0.012]);
  ell(head, skin, [0, 0, 0], [0.108, 0.13, 0.118]);
  ell(head, skin, [0, -0.07, 0.035], [0.075, 0.06, 0.08]); // jaw
  ell(head, skin, [0, 0.052, 0.074], [0.092, 0.02, 0.05], [0.25, 0, 0]); // brow ridge (menace)
  const eyeShape = (sd: number) => {
    const sh = new THREE.Shape(); const k = sd; // angular slit, inner corner low → outer corner high
    sh.moveTo(k * -0.006, -0.011); sh.lineTo(k * 0.034, 0.004); sh.lineTo(k * 0.03, 0.013); sh.lineTo(k * -0.008, 0.002); sh.closePath(); return new THREE.ShapeGeometry(sh);
  };
  sides.forEach((sd) => {
    const g = eyeShape(sd), m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: PAL.eye, side: THREE.DoubleSide})); const x = sd * 0.047, y = 0.018;
    const z = 0.118 * Math.sqrt(Math.max(0, 1 - (x / 0.108) ** 2 - (y / 0.13) ** 2)) + 0.0025;
    m.position.set(x, y, z); m.rotation.set(0, sd * Math.asin(Math.min(0.95, x / 0.108)), 0); head.add(m);
    const bk = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: PAL.ink, side: THREE.DoubleSide})); bk.scale.set(1.45, 1.8, 1); bk.position.set(x, y, z - 0.0008); bk.rotation.copy(m.rotation); head.add(bk);
  });

  /* ---------- arms ---------- */
  type ArmRig = {sh: THREE.Group; el: THREE.Group; wr: THREE.Group; hand: THREE.Group};
  const arms = sides.map((sd): ArmRig => {
    const sh = grp(chest, [sd * 0.285, 0.185, 0]);
    ell(sh, skin, [sd * -0.02, 0.03, -0.01], [0.1, 0.095, 0.09], [0, 0, 0], 'delt_side'); // shoulder ball / side delt
    ell(sh, skin, [sd * 0.0, 0.0, 0.062], [0.075, 0.1, 0.06], [0.1, 0, 0], 'delt_front');
    ell(sh, skin, [sd * -0.01, 0.0, -0.062], [0.078, 0.095, 0.058], [-0.1, 0, 0], 'delt_rear');
    // upper arm (extends along -Y)
    part(sh, TAP(0.056, 0.072), skin, [0, -0.17, 0], [1, 0.3, 1]);
    ell(sh, skin, [0, -0.145, 0.034], [0.055, 0.105, 0.05], [0, 0, 0], 'biceps');
    ell(sh, skin, [0, -0.12, -0.046], [0.06, 0.13, 0.052], [0, 0, 0], 'triceps'); // long head
    ell(sh, skin, [sd * 0.045, -0.15, -0.025], [0.032, 0.1, 0.04], [0, 0, 0], 'triceps'); // lateral head
    const el = grp(sh, [0, -0.32, 0]);
    ell(el, skin, [0, 0, 0], [0.052, 0.052, 0.05]);
    part(el, TAP(0.043, 0.056), skin, [0, -0.13, 0], [1, 0.26, 0.95]);
    ell(el, skin, [sd * 0.012, -0.06, 0.012], [0.056, 0.105, 0.052], [0, 0, 0], 'forearms');
    ell(el, skin, [0, -0.11, -0.015], [0.042, 0.1, 0.04], [0, 0, 0], 'forearms');
    const wr = grp(el, [0, -0.26, 0]);
    const hand = grp(wr, [0, -0.06, 0.012]);
    ell(hand, skin, [0, 0, 0], [0.048, 0.062, 0.05]);
    [0, 1, 2, 3].forEach((i) => ell(hand, skin, [(i - 1.5) * 0.019, -0.045, 0.026], [0.011, 0.02, 0.013]));
    ell(hand, skin, [sd * -0.046, 0.0, 0.02], [0.02, 0.034, 0.02], [0, 0, sd * 0.3]);
    return {sh, el, wr, hand};
  });

  /* ---------- legs ---------- */
  type LegRig = {hip: THREE.Group; knee: THREE.Group; ank: THREE.Group};
  const legs = sides.map((sd): LegRig => {
    const hip = grp(root, [sd * 0.115, -0.03, 0]);
    // shorts leg tube
    part(hip, TAP(0.132, 0.118), shorts, [0, -0.15, 0.0], [1, 0.34, 1.0]);
    part(hip, TAP(0.095, 0.108), skin, [0, -0.25, 0], [1, 0.4, 0.95]);
    ell(hip, skin, [sd * 0.062, -0.23, 0.0], [0.07, 0.19, 0.075], [0, 0, 0], 'quads'); // vastus lateralis
    ell(hip, skin, [0, -0.22, 0.062], [0.062, 0.2, 0.06], [0, 0, 0], 'quads'); // rectus femoris
    ell(hip, skin, [sd * -0.036, -0.35, 0.05], [0.05, 0.09, 0.05], [0, 0, 0], 'quads'); // vastus medialis (teardrop)
    ell(hip, skin, [0, -0.22, -0.065], [0.075, 0.2, 0.062], [0, 0, 0], 'hams');
    const knee = grp(hip, [0, -0.46, 0]);
    ell(knee, skin, [0, 0, 0.012], [0.063, 0.06, 0.06]);
    part(knee, TAP(0.052, 0.064), skin, [0, -0.2, 0], [1, 0.4, 0.95]);
    [-1, 1].forEach((k) => ell(knee, skin, [k * 0.03, -0.12, -0.05], [0.05, 0.12, 0.052], [0, 0, k * 0.08], 'calves'));
    ell(knee, skin, [sd * 0.0, -0.17, 0.04], [0.035, 0.17, 0.035], [0, 0, 0]);
    part(knee, TAP(0.058, 0.05), white, [0, -0.39, 0], [1, 0.12, 0.95]); // sock
    const ank = grp(knee, [0, -0.46, 0]);
    ell(ank, white, [0, -0.03, 0.05], [0.058, 0.046, 0.125]);
    part(ank, CYL, shorts, [0, -0.072, 0.05], [0.06, 0.012, 0.13]); // sole
    return {hip, knee, ank};
  });
  // ground contact marker (hero is always grounded)
  const E = (g: THREE.Object3D, x: number, y: number, z: number, o: THREE.EulerOrder) => { g.rotation.order = o; g.rotation.set(x, y, z); };
  const setPose = (p: Pose) => {
    root.position.set(0, 0.995 + p.root.y, 0); E(root, p.root.pitch, p.root.yaw, 0, 'YXZ');
    E(spine, p.spine.lean, p.spine.twist, p.spine.side, 'YXZ'); E(chest, p.chest.lean, p.chest.twist, 0, 'YXZ'); E(neck, p.head.pitch * 0.5, p.head.yaw * 0.5, 0, 'YXZ'); E(head, p.head.pitch * 0.5, p.head.yaw * 0.5, 0, 'YXZ');
    [p.armL, p.armR].forEach((a, i) => { const sd = i === 0 ? 1 : -1; E(arms[i].sh, -a.x, a.y * sd, a.z * sd, 'ZXY'); E(arms[i].el, -a.elbow, a.foreYaw * sd, 0, 'YXZ'); E(arms[i].wr, a.wrist, 0, 0, 'XYZ'); });
    [p.legL, p.legR].forEach((l, i) => { const sd = i === 0 ? 1 : -1; E(legs[i].hip, -l.x, 0, l.z * sd, 'ZXY'); E(legs[i].knee, l.knee, 0, 0, 'XYZ'); E(legs[i].ank, l.ankle, 0, 0, 'XYZ'); });
    lats.forEach((m, i) => { const sd = i === 0 ? 1 : -1; m.rotation.z = sd * -(0.12 + 0.35 * p.flare); m.position.x = sd * (0.145 + 0.05 * p.flare); m.scale.x = 0.05 + 0.03 * p.flare; });
    root.updateMatrixWorld(true);
  };
  const setGlow = (g: Partial<Record<Muscle, number>>) => { (Object.keys(glow) as Muscle[]).forEach((k) => glow[k]!.forEach((m) => { m.uniforms.uGlow.value = g[k] ?? 0; })); };
  const setAspect = (a: number) => outlines.forEach((o) => { o.uniforms.uAspect.value = a; });
  const handWorld = (side: 'L' | 'R', local: V3 = [0, 0, 0]) => { const h = arms[side === 'L' ? 0 : 1].hand; return h.localToWorld(new THREE.Vector3(...local)); };
  return {root, setPose, setGlow, setAspect, handWorld, arms, legs, head};
};
