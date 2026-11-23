import * as THREE from 'three';
import {FieldOut, Prim, buildField, makePrim} from './Sculpt';
import {PAL, outlineMat, toonMat} from './toon';

/* ===========================================================================================
   TEAL v1 — sculpted bodybuilder. ~230 anatomical blobs → one continuous skinned surface per material.
   Space: metres, +Y up, faces +Z, character's LEFT is +X. Floor y=0.
   =========================================================================================== */
export type Arm = {x: number; z: number; y: number; elbow: number; foreYaw: number; wrist: number};
export type Leg = {x: number; z: number; knee: number; ankle: number};
export type Pose = {
  root: {y: number; yaw: number; pitch: number}; spine: {lean: number; twist: number; side: number}; chest: {lean: number; twist: number};
  head: {yaw: number; pitch: number}; armL: Arm; armR: Arm; legL: Leg; legR: Leg; flare: number;
};
export const A0: Arm = {x: 0, z: 0.16, y: 0, elbow: 0.12, foreYaw: 0, wrist: 0};
export const REST: Pose = {
  root: {y: 0, yaw: 0, pitch: 0}, spine: {lean: 0, twist: 0, side: 0}, chest: {lean: 0, twist: 0}, head: {yaw: 0, pitch: 0},
  armL: A0, armR: A0, legL: {x: 0, z: 0.06, knee: 0.03, ankle: 0}, legR: {x: 0, z: -0.06, knee: 0.03, ankle: 0}, flare: 0.3,
};
const BIND: Pose = {...REST, armL: {...A0, z: 0.62, elbow: 0.2}, armR: {...A0, z: 0.62, elbow: 0.2}, legL: {x: 0, z: 0.07, knee: 0.02, ankle: 0}, legR: {x: 0, z: -0.07, knee: 0.02, ankle: 0}};
export const MUSCLES = ['delt_front', 'delt_side', 'delt_rear', 'pecs', 'lats', 'traps', 'abs', 'obliques', 'biceps', 'triceps', 'forearms', 'quads', 'hams', 'glutes', 'calves'] as const;
export type Muscle = typeof MUSCLES[number];
type V3 = [number, number, number];
const BN = ['root', 'spine', 'chest', 'neck', 'head', 'shL', 'elL', 'wrL', 'shR', 'elR', 'wrR', 'hipL', 'kneeL', 'ankL', 'hipR', 'kneeR', 'ankR'];
const bi = (n: string) => BN.indexOf(n);
const F = {skin: 0, shorts: 1, white: 2, sole: 3};

let CACHE: {fields: (FieldOut | null)[]; eyeZ: (x: number, y: number) => number; bindWorld: THREE.Matrix4[]} | null = null;

export const buildHero = (aspect = 1080 / 1920, voxel = 0.0068) => {
  const root = new THREE.Group(); const grp = (parent: THREE.Object3D, pos: V3) => { const g = new THREE.Group(); g.position.set(...pos); parent.add(g); return g; };
  const spine = grp(root, [0, 0.17, 0]), chest = grp(spine, [0, 0.27, 0]), neck = grp(chest, [0, 0.245, 0.01]), head = grp(neck, [0, 0.17, 0.012]);
  const sh = [grp(chest, [0.285, 0.185, 0]), grp(chest, [-0.285, 0.185, 0])];
  const el = sh.map((s) => grp(s, [0, -0.32, 0])), wr = el.map((e) => grp(e, [0, -0.27, 0])), hand = wr.map((w) => grp(w, [0, -0.04, 0.0]));
  const hip = [grp(root, [0.115, -0.03, 0]), grp(root, [-0.115, -0.03, 0])];
  const knee = hip.map((h) => grp(h, [0, -0.46, 0])), ank = knee.map((k) => grp(k, [0, -0.46, 0]));
  const bones: THREE.Object3D[] = [root, spine, chest, neck, head, sh[0], el[0], wr[0], sh[1], el[1], wr[1], hip[0], knee[0], ank[0], hip[1], knee[1], ank[1]];
  const E = (g: THREE.Object3D, x: number, y: number, z: number, o: THREE.EulerOrder) => { g.rotation.order = o; g.rotation.set(x, y, z); };
  const setPose = (p: Pose) => {
    root.position.set(0, 0.995 + p.root.y, 0); E(root, p.root.pitch, p.root.yaw, 0, 'YXZ');
    E(spine, p.spine.lean, p.spine.twist, p.spine.side, 'YXZ'); E(chest, p.chest.lean, p.chest.twist, 0, 'YXZ'); E(neck, p.head.pitch * 0.5, p.head.yaw * 0.5, 0, 'YXZ'); E(head, p.head.pitch * 0.5, p.head.yaw * 0.5, 0, 'YXZ');
    [p.armL, p.armR].forEach((a, i) => { const sd = i === 0 ? 1 : -1; E(sh[i], -a.x, a.y * sd, a.z * sd, 'ZXY'); E(el[i], -a.elbow, a.foreYaw * sd, 0, 'YXZ'); E(wr[i], a.wrist, 0, 0, 'XYZ'); });
    [p.legL, p.legR].forEach((l, i) => { const sd = i === 0 ? 1 : -1; E(hip[i], -l.x, 0, l.z * sd, 'ZXY'); E(knee[i], l.knee, 0, 0, 'XYZ'); E(ank[i], l.ankle, 0, 0, 'XYZ'); });
    root.updateMatrixWorld(true);
  };
  setPose(BIND);
  const bindWorld = bones.map((b) => b.matrixWorld.clone());

  /* ----------------- anatomy ----------------- */
  const prims: Prim[] = [];
  const tmp = new THREE.Matrix4(), q = new THREE.Quaternion(), S1 = new THREE.Vector3(1, 1, 1);
  const P = (bone: THREE.Object3D, bname: string, field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0], w = 1) => {
    q.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])); tmp.compose(new THREE.Vector3(...pos), q, S1);
    prims.push(makePrim(bi(bname), field, mus ? MUSCLES.indexOf(mus) : -1, bone.matrixWorld.clone().multiply(tmp), r, w));
  };
  const SK = F.skin;
  /** mirrored pair; mirror flips x, and the y/z rotations */
  const pair = (bone: [THREE.Object3D, THREE.Object3D], names: [string, string], field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => {
    P(bone[0], names[0], field, mus, pos, r, rot); P(bone[1], names[1], field, mus, [-pos[0], pos[1], pos[2]], r, [rot[0], -rot[1], -rot[2]]);
  };
  const pc = (b: THREE.Object3D, n: string, field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([b, b], [n, n], field, mus, pos, r, rot);
  const pcv = (b: THREE.Object3D, n: string, pos: V3, r: V3) => { P(b, n, SK, null, pos, r, [0, 0, 0], -1); P(b, n, SK, null, [-pos[0], pos[1], pos[2]], r, [0, 0, 0], -1); };
  const pa = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([sh[0], sh[1]], ['shL', 'shR'], field, mus, pos, r, rot);
  const pe = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([el[0], el[1]], ['elL', 'elR'], field, mus, pos, r, rot);
  const pw = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([hand[0], hand[1]], ['wrL', 'wrR'], field, mus, pos, r, rot);
  const ph = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([hip[0], hip[1]], ['hipL', 'hipR'], field, mus, pos, r, rot);
  const pk = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([knee[0], knee[1]], ['kneeL', 'kneeR'], field, mus, pos, r, rot);
  const pn = (field: number, mus: Muscle | null, pos: V3, r: V3, rot: V3 = [0, 0, 0]) => pair([ank[0], ank[1]], ['ankL', 'ankR'], field, mus, pos, r, rot);

  // ---- abdomen: core + 8-pack + obliques + serratus + erectors
  P(spine, 'spine', SK, null, [0, 0.12, 0], [0.158, 0.172, 0.108]);
  P(spine, 'root', SK, null, [0, -0.02, 0], [0.19, 0.12, 0.13]);
  [0, 1, 2, 3].forEach((i) => pc(spine, 'spine', SK, 'abs', [0.037, 0.03 + i * 0.062, 0.095 - i * 0.003], [0.042, 0.037, 0.034]));
  pc(spine, 'spine', SK, 'obliques', [0.132, 0.1, 0.03], [0.05, 0.125, 0.082], [0, 0, -0.14]);
  pc(spine, 'spine', SK, 'obliques', [0.145, 0.19, 0.0], [0.04, 0.07, 0.07], [0, 0, -0.12]);
  [0, 1, 2].forEach((i) => pc(chest, 'chest', SK, 'obliques', [0.147 - i * 0.004, -0.015 - i * 0.05, 0.065], [0.03, 0.024, 0.04], [0, 0.3, 0]));
  pc(spine, 'spine', SK, null, [0.045, 0.1, -0.075], [0.04, 0.13, 0.04]); // erector spinae
  // ---- chest
  P(chest, 'chest', SK, null, [0, 0.03, 0], [0.2, 0.235, 0.135]);
  pc(chest, 'chest', SK, 'pecs', [0.1, 0.112, 0.094], [0.118, 0.082, 0.07], [0.12, -0.1, 0.1]);
  pc(chest, 'chest', SK, 'pecs', [0.105, 0.04, 0.118], [0.105, 0.05, 0.046], [0.35, 0, 0.08]);
  pc(chest, 'chest', SK, 'pecs', [0.088, 0.172, 0.086], [0.09, 0.043, 0.05], [0.15, 0, 0.1]); // clavicular
  pc(chest, 'chest', SK, null, [0.075, 0.205, 0.04], [0.075, 0.018, 0.045], [0.1, 0, 0.18]); // clavicle ridge
  // ---- back
  pc(chest, 'chest', SK, 'lats', [0.158, -0.02, -0.07], [0.058, 0.2, 0.075], [0, 0, -0.22]);
  pc(chest, 'chest', SK, null, [0.115, 0.06, -0.112], [0.09, 0.105, 0.05]);
  pc(chest, 'chest', SK, null, [0.085, -0.075, -0.1], [0.09, 0.05, 0.05], [0, 0, -0.1]);
  pc(chest, 'chest', SK, 'delt_rear', [0.135, 0.12, -0.105], [0.05, 0.045, 0.035], [0, 0, -0.3]); // infraspinatus
  pc(chest, 'chest', SK, 'lats', [0.16, 0.06, -0.1], [0.046, 0.032, 0.036], [0, 0, 0.5]); // teres major
  P(chest, 'chest', SK, 'traps', [0, 0.235, -0.04], [0.17, 0.062, 0.075]);
  pc(chest, 'chest', SK, 'traps', [0.115, 0.215, -0.02], [0.088, 0.05, 0.065], [0, 0, -0.38]);
  pc(chest, 'chest', SK, 'traps', [0.04, 0.12, -0.12], [0.04, 0.12, 0.03]);
  // ---- neck, head (no ears, no face features)
  P(neck, 'neck', SK, 'traps', [0, 0.05, 0], [0.085, 0.1, 0.082]);
  pc(neck, 'neck', SK, 'traps', [0.055, 0.04, 0.0], [0.04, 0.09, 0.06], [0, 0, -0.18]);
  P(head, 'head', SK, null, [0, 0.0, -0.005], [0.106, 0.128, 0.116]);
  P(head, 'head', SK, null, [0, -0.075, 0.03], [0.074, 0.058, 0.074]); // jaw
  P(head, 'head', SK, null, [0, -0.105, 0.065], [0.04, 0.032, 0.036]); // chin
  pc(head, 'head', SK, null, [0.062, -0.028, 0.06], [0.04, 0.036, 0.034]); // cheekbone
  // ---- face: brow, nose, lips, ears, eye sockets (carved)
  pc(head, 'head', SK, null, [0.036, 0.052, 0.094], [0.044, 0.0135, 0.034], [0.18, 0, 0.12]); // brow ridge
  P(head, 'head', SK, null, [0, 0.036, 0.098], [0.014, 0.02, 0.02]); // glabella
  P(head, 'head', SK, null, [0, 0.0, 0.108], [0.0155, 0.04, 0.02], [0.12, 0, 0]); // nose bridge
  P(head, 'head', SK, null, [0, -0.03, 0.126], [0.0175, 0.0155, 0.02]); // nose tip
  pc(head, 'head', SK, null, [0.0175, -0.033, 0.114], [0.0115, 0.0135, 0.0145], [0, 0, -0.2]); // nostril wings
  P(head, 'head', SK, null, [0, -0.0605, 0.11], [0.026, 0.0085, 0.0145]); // upper lip
  P(head, 'head', SK, null, [0, -0.0775, 0.106], [0.024, 0.0105, 0.0145]); // lower lip
  pc(head, 'head', SK, null, [0.022, -0.069, 0.098], [0.0075, 0.0085, 0.0105]); // mouth corners
  pc(head, 'head', SK, null, [0.026, -0.052, 0.098], [0.011, 0.018, 0.012], [0, 0, 0.35]); // nasolabial fold ridge
  pc(head, 'head', SK, null, [0.1, -0.002, -0.004], [0.0125, 0.034, 0.024], [0, 0.1, -0.12]); // ears
  pc(head, 'head', SK, null, [0.103, 0.018, 0.0], [0.007, 0.018, 0.016]); // helix
  pc(head, 'head', SK, null, [0.043, 0.0245, 0.0855], [0.0215, 0.0105, 0.0125], [0, 0, -0.12]); // upper eyelid (heavy)
  pc(head, 'head', SK, null, [0.043, 0.0085, 0.087], [0.019, 0.006, 0.011], [0, 0, 0.0]); // lower lid
  pcv(head, 'head', [0.043, 0.0185, 0.112], [0.0185, 0.0125, 0.0165]); // eye socket (carve)
  pcv(head, 'head', [0.0065, -0.0425, 0.124], [0.0042, 0.0034, 0.009]); // nostrils (carve)
  const mouthCarve = P; mouthCarve(head, 'head', SK, null, [0, -0.0693, 0.121], [0.0275, 0.0019, 0.0135], [0, 0, 0], -1);
  // ---- shoulders (3 delt heads) + arm
  pa(SK, 'delt_side', [-0.018, 0.02, -0.002], [0.088, 0.098, 0.086]);
  pa(SK, 'delt_front', [0.004, 0.0, 0.058], [0.07, 0.105, 0.056], [0.12, 0, 0]);
  pa(SK, 'delt_rear', [-0.012, 0.0, -0.058], [0.074, 0.098, 0.054], [-0.12, 0, 0]);
  pa(SK, 'delt_side', [-0.024, -0.075, 0.0], [0.05, 0.07, 0.05]); // delt taper
  pa(SK, null, [0, -0.17, 0], [0.058, 0.17, 0.056]);
  pa(SK, 'biceps', [0.002, -0.145, 0.036], [0.05, 0.1, 0.045]); // biceps long head
  pa(SK, 'biceps', [0.02, -0.15, 0.03], [0.034, 0.095, 0.038]); // short head
  pa(SK, 'biceps', [0.0, -0.265, 0.026], [0.032, 0.055, 0.028]); // brachialis / tendon
  pa(SK, 'triceps', [0.0, -0.115, -0.048], [0.056, 0.13, 0.05]); // long head
  pa(SK, 'triceps', [-0.043, -0.15, -0.026], [0.03, 0.1, 0.04]); // lateral head
  pa(SK, 'triceps', [0.02, -0.215, -0.04], [0.03, 0.06, 0.03]); // medial head
  pe(SK, null, [0, 0.0, 0.0], [0.05, 0.05, 0.048]); // elbow
  pe(SK, 'forearms', [0.014, -0.075, 0.016], [0.056, 0.105, 0.054]); // flexor mass
  pe(SK, 'forearms', [-0.026, -0.1, -0.006], [0.04, 0.11, 0.04], [0, 0, 0.04]); // brachioradialis
  pe(SK, 'forearms', [0.004, -0.115, -0.026], [0.04, 0.11, 0.036]); // extensors
  pe(SK, null, [0, -0.215, 0], [0.034, 0.07, 0.03]); // wrist taper
  // ---- hand (relaxed fist: palm, 4 curled fingers, thumb)
  pw(SK, null, [0, -0.02, 0.0], [0.045, 0.058, 0.026]);
  [0, 1, 2, 3].forEach((i) => { const x = (i - 1.5) * 0.019; pw(SK, null, [x, -0.075, 0.026], [0.0105, 0.021, 0.0125]); pw(SK, null, [x, -0.085, 0.045], [0.0105, 0.016, 0.0105], [0.9, 0, 0]); });
  pw(SK, null, [-0.042, -0.03, 0.024], [0.016, 0.03, 0.017], [0.3, 0, 0.25]);
  // ---- pelvis / glutes / legs
  pc(root, 'root', SK, 'glutes', [0.095, -0.015, -0.102], [0.115, 0.115, 0.095]);
  pc(root, 'root', SK, 'glutes', [0.115, 0.055, -0.085], [0.08, 0.06, 0.06]); // glute med
  ph(SK, 'quads', [0.062, -0.235, 0.0], [0.078, 0.2, 0.082], [0, 0, 0]); // vastus lateralis
  ph(SK, 'quads', [0.0, -0.215, 0.07], [0.07, 0.205, 0.062]); // rectus femoris
  ph(SK, 'quads', [-0.04, -0.36, 0.056], [0.056, 0.095, 0.054]); // vastus medialis teardrop
  ph(SK, null, [-0.04, -0.2, 0.01], [0.05, 0.18, 0.06]); // adductors
  ph(SK, 'hams', [0.0, -0.22, -0.072], [0.082, 0.205, 0.066]);
  ph(SK, 'hams', [0.03, -0.25, -0.06], [0.04, 0.19, 0.05]);
  pk(SK, null, [0.0, 0.0, 0.012], [0.06, 0.058, 0.058]); // knee
  pk(SK, null, [0, -0.0, 0.07], [0.034, 0.03, 0.02]); // patella
  pk(SK, 'calves', [0.034, -0.115, -0.058], [0.056, 0.135, 0.058], [0, 0, 0.06]); // gastroc lateral
  pk(SK, 'calves', [-0.034, -0.125, -0.056], [0.056, 0.145, 0.058], [0, 0, -0.06]); // gastroc medial (bigger)
  pk(SK, 'calves', [0.0, -0.21, -0.03], [0.045, 0.14, 0.04]); // soleus
  pk(SK, null, [0.01, -0.17, 0.042], [0.03, 0.15, 0.03]); // tibialis anterior
  pk(SK, null, [0, -0.37, 0.0], [0.036, 0.09, 0.034]); // achilles / ankle
  pn(SK, null, [0, -0.03, 0.045], [0.05, 0.04, 0.09]); // foot (mostly hidden in the shoe)
  // ---- shorts (loose, black, mid-thigh)
  P(root, 'root', F.shorts, null, [0, 0.12, 0], [0.2, 0.07, 0.145]);
  P(root, 'root', F.shorts, null, [0, 0.03, 0], [0.208, 0.1, 0.152]);
  P(root, 'root', F.shorts, null, [0, -0.045, -0.075], [0.2, 0.12, 0.11]);
  ph(F.shorts, null, [0.006, -0.085, 0.0], [0.136, 0.15, 0.13]);
  ph(F.shorts, null, [0.004, -0.16, 0.0], [0.13, 0.09, 0.125]);
  // ---- white: waistband, socks, shoes
  P(root, 'root', F.white, null, [0, 0.158, 0], [0.218, 0.036, 0.157]);
  pk(F.white, null, [0, -0.395, 0.0], [0.05, 0.085, 0.05]); // socks
  pn(F.white, null, [0, -0.048, 0.058], [0.058, 0.05, 0.128]);
  pn(F.white, null, [0, -0.045, 0.14], [0.05, 0.038, 0.06]);
  pn(F.sole, null, [0, -0.088, 0.056], [0.06, 0.016, 0.14]);

  const bounds = [-0.78, -0.03, -0.45, 0.78, 2.06, 0.5];
  if (!CACHE) {
    const fields: (FieldOut | null)[] = [0, 1, 2, 3].map((f) => buildField(prims.filter((p) => p.field === f), voxel, f === 0 ? 0.02 : 0.04, bounds, bones.length));
    CACHE = {fields, eyeZ: (x, y) => fields[0]!.sample(x, y), bindWorld};
  }
  const cache = CACHE;
  const ramps = [PAL.skin, PAL.shorts, PAL.white, PAL.sole];
  const mats = [toonMat(PAL.skin, {spec: 0.55, line: 1, hatch: 1, tex: 1}), toonMat(PAL.shorts, {spec: 0.25, line: 0, tex: 2}), toonMat(PAL.white, {spec: 0.2, line: 0, tex: 3}), toonMat(PAL.sole, {spec: 0.1, line: 0, tex: 4})];
  void ramps;
  const ink = outlineMat(0.0042, aspect);
  const meshes: {geo: THREE.BufferGeometry; f: FieldOut}[] = [];
  const group = new THREE.Group();
  cache.fields.forEach((f, i) => {
    if (!f) return; const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(f.pos.slice(), 3)); geo.setAttribute('normal', new THREE.BufferAttribute(f.nrm.slice(), 3));
    geo.setAttribute('rp', new THREE.BufferAttribute(f.pos.slice(), 3)); geo.setAttribute('cav', new THREE.BufferAttribute(f.cav, 1)); geo.setAttribute('mus', new THREE.BufferAttribute(f.mus, 1)); geo.setAttribute('musW', new THREE.BufferAttribute(f.musW, 1)); geo.setIndex(new THREE.BufferAttribute(f.idx, 1));
    const m = new THREE.Mesh(geo, mats[i]); m.frustumCulled = false; const o = new THREE.Mesh(geo, ink); o.frustumCulled = false; m.add(o); group.add(m); meshes.push({geo, f});
  });
  // eyes: real eyeballs sitting in the carved sockets (sclera, teal-dark iris, pupil, catch-light)
  const eyeGroup = new THREE.Group(); head.add(eyeGroup);
  const headBindInv = bindWorld[bi('head')].clone().invert();
  const scl = new THREE.MeshBasicMaterial({color: '#EEF6F4'}), basic = (c: string) => new THREE.MeshBasicMaterial({color: c});
  [1, -1].forEach((sd) => {
    const eye = new THREE.Group(); eye.position.set(sd * 0.043, 0.0185, 0.0885); eyeGroup.add(eye);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 28, 20), scl); eye.add(ball);
    const gz = 0.0135 - 0.0004, look = new THREE.Group(); look.rotation.y = sd * -0.06; eye.add(look);
    const disc = (r: number, c: string, z: number, x = 0, y = 0) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 28), basic(c)); m.position.set(x, y, z); look.add(m); return m; };
    disc(0.0071, '#0A1F22', gz - 0.0004); disc(0.0064, '#1F7A76', gz); disc(0.0046, '#3FB0A8', gz + 0.0001); disc(0.0031, '#020405', gz + 0.0002); disc(0.0013, '#FFFFFF', gz + 0.0003, sd * 0.0016, 0.0022);
  });
  // comic ink lines drawn on the sculpted face (mouth, nose, eyelids, creases), projected on the real surface
  const inkMat = new THREE.MeshBasicMaterial({color: '#03161A'});
  const faceLine = (pts: [number, number][], r = 0.0011, lift = 0.0012) => {
    const v = pts.map(([x, y]) => { const z = cache.eyeZ(x, 1.85 + y); return new THREE.Vector3(x, 1.85 + y, Number.isNaN(z) ? 0.11 : z + lift).applyMatrix4(headBindInv); });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), 28, r, 6, false), inkMat); eyeGroup.add(tube);
  };
  const mir = (pts: [number, number][]) => pts.map(([x, y]) => [-x, y] as [number, number]);
  const both = (pts: [number, number][], r?: number) => { faceLine(pts, r); faceLine(mir(pts), r); };
  faceLine([[-0.03, -0.0695], [-0.016, -0.0715], [0, -0.0722], [0.016, -0.0715], [0.03, -0.0695]], 0.0013);                // mouth line
  faceLine([[-0.027, -0.0675], [-0.031, -0.0655]], 0.0011); faceLine([[0.027, -0.0675], [0.031, -0.0655]], 0.0011);       // mouth corners
  faceLine([[-0.017, -0.0905], [-0.008, -0.0925], [0.008, -0.0925], [0.017, -0.0905]], 0.001);                           // under lower lip
  faceLine([[-0.01, -0.0455], [-0.006, -0.0485], [0.006, -0.0485], [0.01, -0.0455]], 0.0012);                            // nose base
  both([[0.012, -0.04], [0.018, -0.044], [0.0235, -0.039], [0.022, -0.031]], 0.001);                                     // nostril wing
  both([[0.016, 0.026], [0.0185, 0.008], [0.019, -0.012], [0.0215, -0.03]], 0.0009);                                    // nose bridge sides
  both([[0.029, -0.036], [0.036, -0.05], [0.039, -0.066]], 0.001);                                                        // nasolabial folds
  both([[0.0235, 0.031], [0.038, 0.037], [0.054, 0.034], [0.063, 0.026]], 0.0011);                                       // upper eyelid crease
  both([[0.027, 0.0105], [0.043, 0.006], [0.058, 0.0125]], 0.0008);                                                      // lower eyelid line
  both([[0.014, 0.047], [0.04, 0.058], [0.07, 0.07]], 0.0015);                                                          // brow
  both([[0.05, -0.1], [0.075, -0.07], [0.095, -0.02]], 0.0009);                                                          // jaw line
  group.add(root);
  // CPU skinning
  const bindInv = bindWorld.map((m) => m.clone().invert());
  const skinM = bones.map(() => new THREE.Matrix4());
  const skin = () => {
    bones.forEach((b, i) => skinM[i].multiplyMatrices(b.matrixWorld, bindInv[i]));
    meshes.forEach(({geo, f}) => {
      const pa2 = geo.attributes.position as THREE.BufferAttribute, na = geo.attributes.normal as THREE.BufferAttribute;
      for (let i = 0; i < f.count; i++) {
        const x = f.pos[i * 3], y = f.pos[i * 3 + 1], z = f.pos[i * 3 + 2], nx = f.nrm[i * 3], ny = f.nrm[i * 3 + 1], nz = f.nrm[i * 3 + 2];
        let ox = 0, oy = 0, oz = 0, px = 0, py = 0, pz = 0;
        for (let k = 0; k < 4; k++) { const w = f.skinW[i * 4 + k]; if (w <= 0) continue; const e = skinM[f.skinIdx[i * 4 + k]].elements;
          ox += w * (e[0] * x + e[4] * y + e[8] * z + e[12]); oy += w * (e[1] * x + e[5] * y + e[9] * z + e[13]); oz += w * (e[2] * x + e[6] * y + e[10] * z + e[14]);
          px += w * (e[0] * nx + e[4] * ny + e[8] * nz); py += w * (e[1] * nx + e[5] * ny + e[9] * nz); pz += w * (e[2] * nx + e[6] * ny + e[10] * nz); }
        const l = Math.hypot(px, py, pz) || 1; pa2.setXYZ(i, ox, oy, oz); na.setXYZ(i, px / l, py / l, pz / l);
      }
      pa2.needsUpdate = true; na.needsUpdate = true;
    });
  };
  const fullSetPose = (p: Pose, flare = p.flare) => { void flare; setPose(p); skin(); };
  const setGlow = (g: Partial<Record<Muscle, number>>) => { const arr = new Array(16).fill(0); MUSCLES.forEach((m, i) => { arr[i] = g[m] ?? 0; }); mats[0].uniforms.uGl.value = arr; };
  const setAspect = (a: number) => { ink.uniforms.uAspect.value = a; };
  const handWorld = (side: 'L' | 'R', local: V3 = [0, 0, 0]) => hand[side === 'L' ? 0 : 1].localToWorld(new THREE.Vector3(...local));
  return {root: group, setPose: fullSetPose, setGlow, setAspect, handWorld, arms: sh.map((s, i) => ({sh: s, el: el[i], wr: wr[i], hand: hand[i]})), head};
};
