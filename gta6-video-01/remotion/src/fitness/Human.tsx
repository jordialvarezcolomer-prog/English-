import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {CharSpec} from './theme';

/* Realistic head from the Ready Player Me avatar shipped with the three.js examples (models/rpm.glb). */
let cache: Promise<THREE.Group> | null = null;
let BASE: THREE.Group | null = null;
const loadRpm = () => {
  if (!cache) cache = new Promise((res, rej) => new GLTFLoader().load(staticFile('models/rpm.glb'), (g) => { BASE = g.scene; res(g.scene); }, undefined, rej));
  return cache;
};
/** Mount once OUTSIDE any ThreeCanvas: Remotion waits until the model is loaded. */
export const useRpmBase = () => {
  const [ok, setOk] = useState(!!BASE);
  const [handle] = useState(() => (BASE ? null : delayRender('load rpm')));
  useEffect(() => { if (handle === null) return; loadRpm().then(() => { setOk(true); continueRender(handle); }).catch(() => continueRender(handle)); }, [handle]);
  return ok;
};

const EYE_Y = 1.716; // eye level in model space
const C = new THREE.Vector3(0, 1.7, 0.012);
const R = new THREE.Vector3(0.096, 0.135, 0.118);
const g = (d: number, s: number) => Math.exp(-(d * d) / (s * s));
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const strand = (() => { let t: THREE.CanvasTexture | null = null; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d')!; x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2200; i++) { const v = Math.floor(70 + Math.random() * 150); x.strokeStyle = `rgb(${v},${v},${v})`; const a = Math.random() * 256, b = Math.random() * 256; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (Math.random() - 0.5) * 5, b + 10 + Math.random() * 16); x.stroke(); } t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 8); return t; }; })();

/** Builds a shell (hair / beard) from the head mesh: keeps triangles where keep()>0 and pushes them out along the normal. */
const shell = (src: THREE.BufferGeometry, keep: (n: THREE.Vector3, p: THREE.Vector3) => number, off: (n: THREE.Vector3, k: number) => number) => {
  const geo = src.clone(); geo.deleteAttribute('skinIndex'); geo.deleteAttribute('skinWeight'); geo.morphAttributes = {position: src.morphAttributes.position ?? []}; // keep mouth morphs so beard/hair follow the jaw
  geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute, nor = geo.attributes.normal as THREE.BufferAttribute;
  const kv: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const p = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const n = p.clone().sub(C).divide(R).normalize();
    const k = keep(n, p); kv.push(k);
    const o = off(n, k) - (1 - Math.min(1, k * 1.6)) * 0.004;
    pos.setXYZ(i, p.x + nor.getX(i) * o, p.y + nor.getY(i) * o, p.z + nor.getZ(i) * o);
  }
  const idx = geo.index!; const ni: number[] = [];
  for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2); if (kv[a] > 0 || kv[b] > 0 || kv[c] > 0) ni.push(a, b, c); }
  geo.setIndex(ni); geo.computeVertexNormals();
  return geo;
};

/** Under-eye dark circles: a thin translucent patch that follows the head surface, alpha fading out from each eye bag. */
const circles = (src: THREE.BufferGeometry) => {
  const geo = src.clone(); geo.deleteAttribute('skinIndex'); geo.deleteAttribute('skinWeight'); geo.morphAttributes = {}; geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute, nor = geo.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 4); const keep: boolean[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    // elliptical bag under each eye, strongest near the inner corner, fading toward the cheek
    const dx = (Math.abs(x) - 0.028) / 0.022, dy = (y - 1.7105) / (y > 1.7105 ? 0.0035 : 0.008);
    const a = Math.exp(-(dx * dx + dy * dy) * 1.6) * (y < 1.7175 ? 1 : 0) * (z > 0.06 ? 1 : 0) * (1 + 0.35 * Math.exp(-((Math.abs(x) - 0.016) ** 2) / 0.00012));
    col.set([1, 1, 1, Math.min(1, a)], i * 4); keep.push(a > 0.02);
    pos.setXYZ(i, x + nor.getX(i) * 0.0006, y + nor.getY(i) * 0.0006, z + nor.getZ(i) * 0.0006);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const idx = geo.index!; const ni: number[] = [];
  for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2); if (keep[a] || keep[b] || keep[c]) ni.push(a, b, c); }
  geo.setIndex(ni); return geo;
};

/** Realistic head with per-character skin tone, hair, beard and expressions. Origin = eye level, model faces +Z. */
export const RpmHead: React.FC<{spec: CharSpec; smile?: number; open?: number; look?: [number, number]; blink?: number; tongue?: number; tired?: number}> = ({spec, smile = 0, open = 0, look = [0, 0], blink = 0, tongue = 0, tired = 0}) => {
  const built = useMemo(() => {
    if (!BASE) return null;
    const c = SkeletonUtils.clone(BASE) as THREE.Group;
    const morphs: THREE.Mesh[] = [];
    let headMatRef: THREE.MeshStandardMaterial | null = null;
    let headGeo: THREE.BufferGeometry | null = null; let headDict: {[k: string]: number} | undefined; let lidMat: THREE.Material | null = null;
    const tint = new THREE.Color('#ffffff').lerp(new THREE.Color(spec.skin).multiply(new THREE.Color(1 / 0.94, 1 / 0.78, 1 / 0.7)), 0.55);
    c.traverse((o) => {
      const m = o as THREE.Mesh; o.frustumCulled = false;
      if (!m.isMesh) return;
      m.castShadow = true; m.receiveShadow = true;
      const keepVis = /^(Wolf3D_Head|EyeLeft|EyeRight|Wolf3D_Teeth)$/.test(o.name);
      m.visible = keepVis;
      if (o.name === 'Wolf3D_Head') { headGeo = m.geometry; headDict = m.morphTargetDictionary; const mat = (m.material as THREE.MeshStandardMaterial).clone(); mat.color = tint.clone(); mat.roughness = 0.62; m.material = mat; headMatRef = mat;
        // dark circles painted per-pixel in model space, hugging the lower lid
        const tiredU = {value: 0}; mat.userData.tired = tiredU;
        mat.onBeforeCompile = (sh) => {
          sh.uniforms.tired = tiredU;
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMP = position;');
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vMP; uniform float tired;').replace('#include <map_fragment>', `#include <map_fragment>
          { float ax = abs(vMP.x); float dx = (ax - 0.028) / 0.019; float dy = (vMP.y - 1.7135) / (vMP.y > 1.7135 ? 0.003 : 0.011);
            float a = exp(-(dx * dx + dy * dy) * 1.0) * step(0.06, vMP.z) * (1.0 + 0.4 * exp(-pow(ax - 0.016, 2.0) / 0.00012));
            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.4, 0.28, 0.36), clamp(a * tired * 1.6, 0.0, 0.85)); }`);
        };
        mat.customProgramCacheKey = () => 'rpmhead-tired'; lidMat = new THREE.MeshStandardMaterial({color: tint.clone().multiply(new THREE.Color('#D9A493')), roughness: 0.6}); }
      if (/Eye(Left|Right)/.test(o.name) && spec.beard) { const mat = (m.material as THREE.MeshStandardMaterial).clone(); mat.color = new THREE.Color('#9CC7FF'); m.material = mat; }
      if (m.morphTargetDictionary) morphs.push(m);
    });
    const hairMat = new THREE.MeshStandardMaterial({color: spec.hair, roughness: 0.8, bumpMap: strand(), bumpScale: 2.5});
    const hairline = (n: THREE.Vector3) => { const fr = ss(0.1, 0.8, n.z), bk = ss(-0.1, -0.8, n.z); return (0.66 + 0.14 * Math.abs(n.x)) * fr + 0.3 * (1 - fr - bk) + -0.3 * bk; };
    const noise = (n: THREE.Vector3) => 0.0015 * Math.sin(n.x * 90 + n.y * 40) * Math.sin(n.z * 70 - n.y * 55);
    const mohawk = spec.hairStyle === 'mohawk';
    const strip = (n: THREE.Vector3) => 1 - ss(0.1, 0.17, Math.abs(n.x)); // central crest band
    const crown = (n: THREE.Vector3) => ss(hairline(n) - 0.05, hairline(n) + 0.07, n.y) * (Math.abs(n.x) > 0.9 && n.y < 0.3 && n.z > -0.35 ? 0 : 1);
    const hair = headGeo ? (mohawk
      ? shell(headGeo, (n) => crown(n) * strip(n) * ss(-0.75, -0.45, n.z) * (n.y > 0.1 ? 1 : 0),
        // tall crest, highest over the crown, with comb-like spikes running front-to-back
        (n, k) => k * (0.004 + 0.006 * ss(0.2, 0.8, n.y)))
      : shell(headGeo, crown,
        (n, k) => k * (spec.hairStyle === 'short' ? 0.004 + 0.008 * ss(0.2, 0.85, n.y) + noise(n) : 0.004 + noise(n) + 0.016 * g(n.y - 0.82, 0.3) * ss(-0.2, 0.7, n.z)))) : null;
    // shaved sides of the mohawk: very short dark stubble that follows the scalp
    const sides = headGeo && mohawk ? shell(headGeo, (n) => crown(n) * (1 - strip(n) * (n.y > 0.1 ? 1 : 0)) * 0.9, (n, k) => k * 0.0012) : null;
    const beard = headGeo && spec.beard ? shell(headGeo, (n, p) => {
      const mouth = Math.pow(p.x / 0.028, 2) + Math.pow((p.y - 1.659) / 0.016, 2);
      const lips = n.z > 0.4 ? 1 - ss(0.85, 1.25, mouth) : 0;
      const top = 1.678 - 0.014 * g(p.x, 0.035); const lower = ss(top + 0.006, top - 0.008, p.y) * ss(-0.3, 0.05, n.z) * ss(1.604, 1.615, p.y);
      const stache = n.z > 0.5 && p.y > 1.662 && p.y < 1.684 ? ss(1.0, 1.3, mouth) * (1 - ss(1.6, 2.4, mouth)) : 0;
      return Math.max(lower * (1 - lips), stache);
    }, (n, k) => k * (0.005 + noise(n))) : null;
    // crest tufts: tapered cones rooted on the scalp midline, swept slightly back, with varied length
    const spikes: {p: THREE.Vector3; q: THREE.Quaternion; h: number; r: number}[] = [];
    if (mohawk) for (let i = 0; i < 28; i++) {
      const a = 0.55 - (i / 27) * 1.8; // over the scalp midline: front hairline (0.55) → back of the head (-1.25)
      const n = new THREE.Vector3((i % 2 ? 1 : -1) * 0.05, Math.cos(a), Math.sin(a)).normalize();
      const root = C.clone().add(n.clone().multiply(R));
      const dir = n.clone().add(new THREE.Vector3(0, 0.25, -0.3)).normalize(); // swept up and back
      const h = (0.05 + 0.022 * Math.sin(i * 1.7) ** 2) * (1 - 0.5 * ss(-0.4, -1.25, a)) * (0.8 + 0.2 * ss(0.55, 0.2, a));
      spikes.push({p: root.add(dir.clone().multiplyScalar(h / 2 - 0.008)), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), h, r: 0.011 + 0.003 * Math.cos(i * 2.3)});
    }
    const beardMat = new THREE.MeshStandardMaterial({color: spec.beardColor ?? spec.hair, roughness: 0.85, bumpMap: strand(), bumpScale: 2.5});
    const sideMat = new THREE.MeshStandardMaterial({color: new THREE.Color(spec.skin).multiplyScalar(0.62).lerp(new THREE.Color('#2A1E18'), 0.35), roughness: 0.95, bumpMap: strand(), bumpScale: 1.2});
    const tongueMat = new THREE.MeshPhysicalMaterial({color: '#C9474B', roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.3});
    const mk = (geo: THREE.BufferGeometry | null, mat: THREE.Material) => { if (!geo) return null; const me = new THREE.Mesh(geo, mat); me.castShadow = true; me.frustumCulled = false; if (me.morphTargetDictionary === undefined && headDict) { me.morphTargetDictionary = headDict; me.morphTargetInfluences = new Array(Object.keys(headDict).length).fill(0); } morphs.push(me); return me; };
    const hairMesh = mk(hair, hairMat), beardMesh = mk(beard, beardMat), sidesMesh = mk(sides, sideMat);
    const circleMat = new THREE.MeshStandardMaterial({color: '#3E2A33', roughness: 0.75, transparent: true, vertexColors: true, depthWrite: false, opacity: 0});
    const circleMesh = headGeo ? new THREE.Mesh(circles(headGeo), circleMat) : null; if (circleMesh) circleMesh.frustumCulled = false;
    const headMat = headMatRef as THREE.MeshStandardMaterial | null;
    return {c, morphs, circleMesh, circleMat, headMat, baseTint: tint.clone(), hairMesh, beardMesh, sidesMesh, spikes, hairMat, beardMat, sideMat, tongueMat, lidMat: lidMat as THREE.Material | null, lash: new THREE.MeshStandardMaterial({color: '#2A1A14', roughness: 0.9})};
  }, [spec]);
  if (!built) return null;
  // tiredness: dark circles fade in, skin goes a little paler/greyer, upper lids sit lower
  if (built.headMat?.userData.tired) built.headMat.userData.tired.value = tired;
  if (built.headMat) built.headMat.color.copy(built.baseTint).lerp(new THREE.Color('#E9E2E2'), tired * 0.28);
  built.morphs.forEach((m) => {
    const d = m.morphTargetDictionary!; const inf = m.morphTargetInfluences!;
    if (d.mouthSmile !== undefined) inf[d.mouthSmile] = smile;
    if (d.mouthOpen !== undefined) inf[d.mouthOpen] = open;
  });
  ['LeftEye', 'RightEye'].forEach((n) => { const e = built.c.getObjectByName(n); if (e) e.rotation.set(look[1], look[0], 0); });
  return (
    <group position={[0, -EYE_Y, -0.006]}>
      <primitive object={built.c} />
      {built.hairMesh && <primitive object={built.hairMesh} />}
      {built.beardMesh && <primitive object={built.beardMesh} />}
      {built.sidesMesh && <primitive object={built.sidesMesh} />}
      {built.spikes.map((sp, i) => <mesh key={i} position={sp.p} quaternion={sp.q} material={built.hairMat} castShadow><coneGeometry args={[sp.r, sp.h, 10, 1, false]} /></mesh>)}
      {tongue > 0 && (
        // tongue sticking out of the open mouth (capsule along local Y, turned to point forward and a bit down)
        <group position={[0, 1.6535 - 0.003 * open, 0.106]} rotation={[Math.PI / 2 + 0.42, 0, 0]}>
          <mesh material={built.tongueMat} position={[0, 0.004 + 0.016 * tongue, 0]} scale={[1.45, 1, 0.5]}><capsuleGeometry args={[0.0115, 0.022, 8, 20]} /></mesh>
        </group>
      )}
      {built.lidMat && [1, -1].map((sd) => {
        // eyelids: sphere caps just outside the eyeball. Open = only the very top is covered (alert, not sleepy); blink = upper lid sweeps down.
        const up = Math.PI * (0.29 + 0.1 * tired + (0.33 - 0.1 * tired) * blink + 0.04 * look[1]), lo = Math.PI * (0.76 - 0.1 * blink);
        return (
          <group key={sd} position={[0.0304 * sd, 1.726, 0.0876]}>
            <mesh material={built.lidMat!}><sphereGeometry args={[0.0201, 32, 16, -0.25, Math.PI + 0.5, 0, up]} /></mesh>
            <mesh material={built.lash} position={[0, 0.0201 * Math.cos(up), 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.0201 * Math.sin(up), 0.0011, 6, 32, Math.PI]} /></mesh>
            <mesh material={built.lidMat!}><sphereGeometry args={[0.0201, 32, 16, -0.25, Math.PI + 0.5, lo, Math.PI - lo]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};
