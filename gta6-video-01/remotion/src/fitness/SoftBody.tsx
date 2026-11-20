import {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import type {Pose} from './Character';

/* Organic body built from metaballs (marching cubes), driven by the same FK rig as Character.
   Three independent fields — skin, shirt, shorts — so sleeves and shorts sit ON the body like real clothes,
   while within each field shoulders, chest, arms and legs melt smoothly into one another (no "Lego" joints). */

type Ball = [number, number, number, number]; // local x, y, z, radius (m)
type FieldCfg = {cy: number; s: number; res: number; poly: number};
const SKIN: FieldCfg = {cy: 1.0, s: 1.06, res: 124, poly: 160000};
const SHIRT: FieldCfg = {cy: 1.3, s: 0.64, res: 88, poly: 90000};
const SHORTS: FieldCfg = {cy: 0.8, s: 0.38, res: 56, poly: 40000};
const SUB = 58; // larger = tighter, more local blending

const mkNode = (parent: THREE.Object3D) => { const o = new THREE.Object3D(); parent.add(o); return o; };
const mkField = (cfg: FieldCfg, mat: THREE.Material) => {
  const mc = new MarchingCubes(cfg.res, mat, false, false, cfg.poly);
  mc.isolation = 80; mc.castShadow = true; mc.receiveShadow = true; mc.frustumCulled = false;
  mc.position.set(0, cfg.cy, 0); mc.scale.set(cfg.s, cfg.s, cfg.s);
  return mc;
};
const v = new THREE.Vector3();

export type SoftMats = {skin: THREE.Material; shirt: THREE.Material; shorts: THREE.Material};

export const useSoftBody = (P: Required<Pose>, muscle: number, flexL: number, flexR: number, mats: SoftMats, breath: number, tank = false) => {
  const rig = useMemo(() => {
    const root = new THREE.Object3D();
    const body = mkNode(root), spine = mkNode(body);
    const arm = (sd: number) => { const sh = mkNode(spine), tw = mkNode(sh), el = mkNode(tw); return {sh, tw, el, sd}; };
    const leg = (sd: number) => { const hp = mkNode(body), kn = mkNode(hp); return {hp, kn, sd}; };
    return {root, body, spine, arms: [arm(1), arm(-1)], legs: [leg(1), leg(-1)],
      skin: mkField(SKIN, mats.skin), shirt: mkField(SHIRT, mats.shirt), shorts: mkField(SHORTS, mats.shorts)};
  }, [mats.skin, mats.shirt, mats.shorts]);
  useEffect(() => () => { [rig.skin, rig.shirt, rig.shorts].forEach((mc) => mc.geometry.dispose()); }, [rig]);
  const m = muscle, bi = 1 + m * 0.62, dl = 1 + m * 0.34, ch = 1 + m * 0.2, lg = 1 + m * 0.18, fa = 1 + m * 0.28;
  // ---- forward kinematics (same nesting & numbers as Character) ----
  rig.body.position.set(0, 0.95 + P.bob, 0); rig.body.rotation.set(0, 0, P.side);
  rig.spine.position.set(0, 0.06, 0); rig.spine.rotation.set(P.lean, P.twist, 0);
  rig.arms.forEach((a) => {
    const sh = a.sd === 1 ? P.shL : P.shR, tw = a.sd === 1 ? P.twL : P.twR, el = a.sd === 1 ? P.elL : P.elR;
    a.sh.position.set(0.205 * a.sd * (0.97 + m * 0.05), 0.385, 0); a.sh.rotation.set(sh[0], sh[1], sh[2]);
    a.tw.rotation.set(0, tw, 0); a.el.position.set(0, -0.3, 0); a.el.rotation.set(-el, 0, 0);
  });
  rig.legs.forEach((l) => {
    const hp = l.sd === 1 ? P.hipL : P.hipR, kn = l.sd === 1 ? P.kneeL : P.kneeR;
    l.hp.position.set(0.093 * l.sd, -0.03, 0); l.hp.rotation.set(-hp[0], 0, hp[1]);
    l.kn.position.set(0, -0.44, 0); l.kn.rotation.set(kn, 0, 0);
  });
  rig.root.updateMatrixWorld(true);

  const fill = (mc: MarchingCubes, cfg: FieldCfg, items: [THREE.Object3D, Ball[]][]) => {
    mc.reset();
    const k = 2 * cfg.s;
    for (const [node, balls] of items) for (const b of balls) {
      v.set(b[0], b[1], b[2]).applyMatrix4(node.matrixWorld);
      const rn = b[3] / k;
      mc.addBall(v.x / k + 0.5, (v.y - cfg.cy) / k + 0.5, v.z / k + 0.5, rn * rn * (mc.isolation + SUB), SUB);
    }
    mc.update();
  };
  const br = 1 + breath * 0.025;
  // ---------- SHIRT: torso + short sleeves ----------
  const torso: Ball[] = [];
  for (let i = 0; i <= 6; i++) {
    const y = -0.01 + i * 0.066, top = i === 6;
    const w = top ? 0.05 : 0.046 + 0.052 * Math.sin((i / 6) * Math.PI * 0.8) * ch;
    const r = top ? 0.084 : (0.092 + 0.014 * Math.sin((i / 6) * Math.PI * 0.85)) * (i >= 3 ? br : 1);
    torso.push([w, y, -0.004, r], [-w, y, -0.004, r], [0, y, 0.0, r * 1.02]);
  }
  torso.push(
    [0.072 * ch, 0.305, 0.052, 0.078 * ch * br], [-0.072 * ch, 0.305, 0.052, 0.078 * ch * br], // pecs
    [0.125 * ch, 0.25, -0.03, 0.074 * ch], [-0.125 * ch, 0.25, -0.03, 0.074 * ch],            // lats
    [0.092 * ch, 0.415, -0.025, 0.054 * ch], [-0.092 * ch, 0.415, -0.025, 0.054 * ch],           // traps (sloping shoulders)
    [0, 0.12, 0.035, 0.088], [0, 0.04, 0.03, 0.09],                                             // belly
  );
  const sleeve = (sd: number): Ball[] => [[0.004 * sd, -0.004, 0, 0.06 * dl], [0.002 * sd, -0.055, 0, 0.059 * dl], [0, -0.1, 0.004, 0.057 * dl]];
  fill(rig.shirt, SHIRT, [[rig.spine, torso], ...(tank ? [] : rig.arms.map((a) => [a.tw, sleeve(a.sd)] as [THREE.Object3D, Ball[]]))]);
  // ---------- SHORTS ----------
  fill(rig.shorts, SHORTS, [
    [rig.body, [[0, 0.04, -0.005, 0.118], [0.068, -0.02, 0, 0.104], [-0.068, -0.02, 0, 0.104], [0, -0.01, -0.045, 0.108], [0, 0.0, 0.03, 0.098]]],
    ...rig.legs.map((l) => [l.hp, [[0, -0.08, 0.004, 0.094 * lg], [0, -0.16, 0.008, 0.091 * lg], [0, -0.225, 0.01, 0.089 * lg]]] as [THREE.Object3D, Ball[]]),
  ]);
  // ---------- SKIN: neck, arms, legs ----------
  const skin: [THREE.Object3D, Ball[]][] = [[rig.spine, [[0, 0.45, -0.01, 0.05 * (1 + m * 0.15)], [0, 0.49, -0.006, 0.045 * (1 + m * 0.15)]]]];
  rig.arms.forEach((a) => {
    const fl = a.sd === 1 ? flexL : flexR;
    skin.push([a.tw, [
      ...(tank ? [[0.01 * a.sd, 0.006, 0, 0.056 * dl], [-0.03 * a.sd, 0.03, -0.01, 0.05 * dl]] as Ball[] : []), // bare deltoid cap
      [0.004 * a.sd, -0.02, 0, 0.052 * dl], [0, -0.08, 0, 0.05 * dl],
      [0, -0.14, 0.012 + fl * 0.01, 0.047 * bi * (1 + fl * 0.1)], [0, -0.19, 0.017 + fl * 0.014, 0.045 * bi * (1 + fl * 0.16)], // biceps
      [0, -0.15, -0.016, 0.046 * (1 + m * 0.45)], [0, -0.21, -0.014, 0.042 * (1 + m * 0.35)],                                  // triceps
      [0, -0.255, 0.0, 0.039], [0, -0.295, 0.0, 0.037],
    ]]);
    skin.push([a.el, [
      [0, -0.03, 0.004, 0.04 * fa], [0, -0.075, 0.008, 0.042 * fa], [0, -0.12, 0.004, 0.036 * (1 + m * 0.15)],
      [0, -0.165, 0.0, 0.031], [0, -0.205, 0.0, 0.027], [0, -0.24, 0.0, 0.025],
    ]]);
  });
  rig.legs.forEach((l) => {
    skin.push([l.hp, [[0, -0.2, 0.012, 0.086 * lg], [0, -0.27, 0.02, 0.079 * lg], [0.012 * l.sd, -0.34, 0.024, 0.068 * lg], [0, -0.4, 0.016, 0.058], [0, -0.44, 0.01, 0.052]]]);
    skin.push([l.kn, [[0, -0.03, 0.004, 0.05], [0.006 * l.sd, -0.1, -0.022, 0.056 * (1 + m * 0.12)], [-0.004 * l.sd, -0.15, -0.02, 0.055 * (1 + m * 0.1)],
      [0, -0.21, -0.01, 0.045], [0, -0.27, -0.004, 0.037], [0, -0.33, 0, 0.033], [0, -0.38, 0, 0.032]]]);
  });
  fill(rig.skin, SKIN, skin);
  return rig;
};
