import * as THREE from 'three';
import {PAL, outlineMat, toonMat} from './toon';

/** Cable tower + rope attachment, same toon/outline language as the hero. */
export const buildMachine = (aspect = 1080 / 1920, z = 0.62) => {
  const g = new THREE.Group();
  const metal = toonMat(PAL.metal, 0.5), rope = toonMat(PAL.rope, 0.2), ink = outlineMat(0.0038, aspect);
  const BOX = new THREE.BoxGeometry(1, 1, 1), CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
  const add = (geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial, pos: [number, number, number], s: [number, number, number]) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.scale.set(...s); m.add(new THREE.Mesh(geo, ink)); g.add(m); return m; };
  add(BOX, metal, [-0.05, 1.15, z], [0.07, 2.3, 0.11]); add(BOX, metal, [0.07, 1.15, z], [0.05, 2.3, 0.08]); // rails
  add(BOX, metal, [0.0, 2.32, z], [0.34, 0.09, 0.15]); add(BOX, metal, [0.0, 0.03, z], [0.5, 0.06, 0.34]);
  const pul = add(CYL, metal, [0, 2.22, z - 0.1], [0.09, 0.03, 0.09]); pul.rotation.z = Math.PI / 2;
  for (let i = 0; i < 10; i++) add(BOX, metal, [0.0, 0.2 + i * 0.12, z + 0.2], [0.34, 0.1, 0.3]);
  const cable = add(CYL, rope, [0, 1, z], [0.007, 1, 0.007]);
  const rope1 = add(CYL, rope, [0, 0, 0], [0.013, 0.34, 0.013]), rope2 = add(CYL, rope, [0, 0, 0], [0.013, 0.34, 0.013]);
  const knob1 = add(CYL, rope, [0, 0, 0], [0.024, 0.03, 0.024]), knob2 = add(CYL, rope, [0, 0, 0], [0.024, 0.03, 0.024]);
  const pulleyPos = new THREE.Vector3(0, 2.22, z - 0.1);
  const update = (hand: THREE.Vector3, showRope = true) => {
    const top = hand.clone().add(new THREE.Vector3(0, 0.2, 0));
    const dir = top.clone().sub(pulleyPos), len = dir.length();
    cable.position.copy(pulleyPos).addScaledVector(dir, 0.5); cable.scale.set(0.007, len, 0.007); cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    [rope1, rope2].forEach((r, i) => { r.visible = showRope; r.position.copy(top).add(new THREE.Vector3((i ? 1 : -1) * 0.012, -0.17, 0)); });
    [knob1, knob2].forEach((k, i) => { k.visible = showRope; k.position.copy(top).add(new THREE.Vector3((i ? 1 : -1) * 0.012, -0.355, 0)); });
  };
  return {group: g, update, pulleyPos};
};
