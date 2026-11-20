import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CharSpec} from './theme';

/* Sculpted procedural head. Units: metres, head centre at origin, +Z = face, +Y = up. */
const g = (d: number, s: number) => Math.exp(-(d * d) / (s * s));
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Maps a unit-sphere direction to a sculpted head surface point. */
const sculpt = (nx: number, ny: number, nz: number, wide: number): THREE.Vector3 => {
  let x = nx * 0.078 * wide, y = ny * 0.113, z = nz * 0.099;
  // jaw taper + chin
  const low = ss(-0.12, -1, ny);
  x *= 1 - 0.22 * low * (1 - 0.35 * g(ny + 0.95, 0.2));
  if (nz < 0) z *= 1 - 0.28 * low;
  // fuller back of skull, flatter forehead/face plane
  if (nz < 0 && ny > -0.3) z *= 1.07;
  if (nz > 0) z *= 1 - 0.07 * Math.pow(Math.max(0, nz), 6);
  const front = Math.max(0, nz) ** 2;
  // chin
  z += 0.011 * g(ny + 0.86, 0.14) * g(x, 0.025) * front;
  y -= 0.006 * g(ny + 0.9, 0.12) * front;
  // eye sockets
  for (const s of [1, -1]) {
    const d = Math.hypot(x - 0.032 * s, (y - 0.012) * 1.25);
    z -= 0.0105 * g(d, 0.017) * front;
    // brow ridge
    z += 0.0045 * g(y - 0.034, 0.008) * g(Math.abs(x) - 0.03, 0.026) * front;
    // cheekbones
    z += 0.004 * g(Math.hypot(x - 0.052 * s, y + 0.022), 0.02) * front;
    x += 0.003 * s * g(Math.hypot(Math.abs(x) - 0.06, y + 0.02), 0.02);
  }
  // nose: bridge -> tip -> nostrils
  if (nz > 0.3) {
    const tipY = -0.034;
    const h = y > tipY ? 0.0015 + 0.022 * Math.pow(ss(0.016, tipY, y), 1.5) * ss(0.03, 0.012, y) + 0.004 * ss(0.03, 0.014, y) : 0.024 * (1 - ss(tipY, tipY - 0.012, y));
    const w = 0.0048 + 0.0055 * ss(0.01, tipY, y);
    z += h * g(x, w) * front;
    z += 0.0045 * g(Math.hypot(x, y - tipY), 0.0085) * front; // rounded tip
    z += 0.0055 * g(Math.hypot(Math.abs(x) - 0.0125, y + 0.038), 0.0058) * front; // alae
  }
  // lips & mouth line
  z += 0.0068 * g(y + 0.058, 0.0052) * g(x, 0.019) * front;
  z += 0.0075 * g(y + 0.071, 0.006) * g(x, 0.017) * front;
  z -= 0.0045 * g(y + 0.0645, 0.0016) * g(x, 0.022) * front;
  z -= 0.002 * g(y + 0.046, 0.006) * g(x, 0.004) * front; // philtrum
  // mentolabial sulcus
  z -= 0.003 * g(y + 0.083, 0.005) * g(x, 0.02) * front;
  return new THREE.Vector3(x, y, z);
};

type Built = {head: THREE.BufferGeometry; hair: THREE.BufferGeometry; beard: THREE.BufferGeometry | null; eye: (s: number) => THREE.Vector3};
const W = 128, Hs = 96;

const build = (spec: CharSpec): Built => {
  const wide = spec.hairStyle === 'short' ? 1.0 : 1.04;
  const base = new THREE.SphereGeometry(1, W, Hs);
  const pos = base.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const skin = new THREE.Color(spec.skin), lip = skin.clone().lerp(new THREE.Color('#B0473F'), 0.5), blush = skin.clone().lerp(new THREE.Color('#E0705E'), 0.35);
  const shadow = skin.clone().multiplyScalar(0.82), stub = skin.clone().lerp(new THREE.Color('#5A5048'), 0.22);
  const dirs: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) {
    const n = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize(); dirs.push(n);
    const p = sculpt(n.x, n.y, n.z, wide); pos.setXYZ(i, p.x, p.y, p.z);
    const front = Math.max(0, n.z);
    let c = skin.clone();
    c.lerp(blush, 0.6 * g(Math.hypot(Math.abs(p.x) - 0.045, p.y + 0.03), 0.018) * front);
    c.lerp(shadow, 0.55 * g(Math.hypot(Math.abs(p.x) - 0.032, p.y + 0.004), 0.009) * front);
    if (spec.hairStyle === 'short') c.lerp(stub, ss(-0.02, -0.07, p.y) * (1 - g(p.y + 0.064, 0.012) * g(p.x, 0.025)) * (n.z > -0.4 ? 1 : 0));
    c.lerp(lip, Math.min(1, 1.5 * g(p.y + 0.0645, 0.0095) * g(p.x, 0.019)) * (front > 0.6 ? 1 : 0));
    c.lerp(new THREE.Color('#3A1A16'), 0.8 * g(p.y + 0.0645, 0.0016) * g(p.x, 0.02) * (front > 0.6 ? 1 : 0));
    c.lerp(shadow, 0.35 * g(Math.hypot(Math.abs(p.x) - 0.01, p.y + 0.044), 0.004) * (front > 0.6 ? 1 : 0));
    c.lerp(skin.clone().multiplyScalar(0.92), 0.4 * ss(0.2, -0.5, n.z));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  base.setAttribute('color', new THREE.BufferAttribute(col, 3));
  base.computeVertexNormals();
  // ---- hair shell (only triangles above the hairline) ----
  const hairline = (n: THREE.Vector3) => { const fr = ss(0.1, 0.8, n.z), bk = ss(-0.1, -0.8, n.z); return (0.47 + 0.14 * Math.abs(n.x)) * fr + 0.1 * (1 - fr - bk) + -0.5 * bk; };
  const shell = (keep: (n: THREE.Vector3, p: THREE.Vector3) => number, off: (n: THREE.Vector3, k: number) => number) => {
    const geo = base.clone();
    const gp = geo.attributes.position as THREE.BufferAttribute;
    const kv: number[] = [];
    for (let i = 0; i < gp.count; i++) {
      const n = dirs[i]; const p = new THREE.Vector3(gp.getX(i), gp.getY(i), gp.getZ(i)); const k = keep(n, p); kv.push(k);
      const o = off(n, k) - (1 - Math.min(1, k * 1.6)) * 0.004; const nn = new THREE.Vector3(geo.attributes.normal.getX(i), geo.attributes.normal.getY(i), geo.attributes.normal.getZ(i));
      gp.setXYZ(i, p.x + nn.x * o, p.y + nn.y * o, p.z + nn.z * o);
    }
    const idx = geo.index!; const ni: number[] = [];
    for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2); if (kv[a] > 0 || kv[b] > 0 || kv[c] > 0) ni.push(a, b, c); }
    geo.setIndex(ni); geo.deleteAttribute('color'); geo.computeVertexNormals();
    return geo;
  };
  const noise = (n: THREE.Vector3) => 0.0016 * Math.sin(n.x * 90 + n.y * 40) * Math.sin(n.z * 70 - n.y * 55);
  const hair = shell((n) => ss(hairline(n) - 0.04, hairline(n) + 0.06, n.y) * (Math.abs(n.x) > 0.93 && n.y < 0.25 && n.z > -0.3 ? 0 : 1),
    (n, k) => k * (spec.hairStyle === 'short' ? 0.004 + 0.007 * ss(0.2, 0.8, n.y) + noise(n) : 0.004 + noise(n) + 0.028 * g(n.y - 0.78, 0.3) * ss(-0.2, 0.7, n.z))
  );
  const beard = spec.beard ? shell((n, p) => {
    const e = Math.pow(p.x / 0.026, 2) + Math.pow((p.y + 0.065) / 0.0135, 2);
    const lips = n.z > 0.5 ? 1 - ss(0.85, 1.25, e) : 0;
    const startY = -0.03 - 0.032 * g(p.x, 0.03);
    const lower = ss(startY, startY - 0.012, p.y) * ss(-0.5, -0.1, n.z);
    const ring = Math.pow(p.x / 0.03, 2) + Math.pow((p.y + 0.06) / 0.016, 2);
    const stache = n.z > 0.6 && p.y > -0.06 ? ss(1.0, 1.25, ring) * (1 - ss(1.5, 2.2, ring)) : 0;
    return Math.max(lower * (1 - lips), stache);
  }, (n, k) => k * (0.0055 + noise(n) * 0.8)) : null;
  const eye = (s: number) => { const p = sculpt(0.4 * s, 0.1, 0.91, wide); return new THREE.Vector3(0.032 * s, 0.012, p.z - 0.0035); };
  return {head: base, hair, beard, eye};
};

const strandTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d')!;
    x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1600; i++) { const v = Math.floor(90 + Math.random() * 120); x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1; const a = Math.random() * 256, b = Math.random() * 256; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (Math.random() - 0.5) * 6, b + 12 + Math.random() * 14); x.stroke(); }
    t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6);
    return t;
  };
})();

/** Full head: sculpted skull/face, eyes with lids, brows, ears, hair and (optional) beard. */
export const Head: React.FC<{spec: CharSpec; look?: number; blink?: number}> = ({spec, look = 0, blink = 0}) => {
  const B = useMemo(() => build(spec), [spec]);
  const m = useMemo(() => {
    const bump = strandTex();
    return {
      skin: new THREE.MeshPhysicalMaterial({vertexColors: true, roughness: 0.48, sheen: 0.5, sheenRoughness: 0.45, sheenColor: new THREE.Color('#FF9C7A'), clearcoat: 0.12, clearcoatRoughness: 0.55}),
      hair: new THREE.MeshStandardMaterial({color: spec.hair, roughness: 0.78, bumpMap: bump, bumpScale: 2.2}),
      white: new THREE.MeshPhysicalMaterial({color: '#F7F4EE', roughness: 0.05, clearcoat: 1}),
      iris: new THREE.MeshPhysicalMaterial({color: spec.hairStyle === 'short' ? '#5B3A22' : '#3F7AA0', roughness: 0.15, clearcoat: 1}),
      pupil: new THREE.MeshBasicMaterial({color: '#050505'}),
      lash: new THREE.MeshStandardMaterial({color: '#1A120D', roughness: 0.6, side: THREE.DoubleSide}),
      spec: new THREE.MeshBasicMaterial({color: '#FFFFFF'}),
      lid: new THREE.MeshPhysicalMaterial({color: new THREE.Color(spec.skin).multiplyScalar(0.94), roughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color('#FF9C7A')}),
      ear: new THREE.MeshPhysicalMaterial({color: new THREE.Color(spec.skin).lerp(new THREE.Color('#E0806A'), 0.15), roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#FF9C7A')}),
    };
  }, [spec]);
  const brow = (s: number) => {
    const e = B.eye(s);
    const pts = [[-0.019, -0.003], [-0.006, 0.004], [0.008, 0.005], [0.02, 0.0]].map(([dx, dy]) => new THREE.Vector3(e.x + dx * s, e.y + 0.025 + dy, e.z + 0.016 - Math.abs(dx) * 0.25));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, spec.hairStyle === 'short' ? 0.0034 : 0.0028, 8, false);
  };
  const browL = useMemo(() => brow(1), [B]); const browR = useMemo(() => brow(-1), [B]);
  return (
    <group>
      <mesh geometry={B.head} material={m.skin} castShadow receiveShadow />
      <mesh geometry={B.hair} material={m.hair} castShadow />
      {B.beard && <mesh geometry={B.beard} material={m.hair} castShadow />}
      <mesh geometry={browL} material={m.hair} /><mesh geometry={browR} material={m.hair} />
      {[1, -1].map((s) => { const e = B.eye(s); return (
        <group key={s} position={[e.x, e.y, e.z]}>
          <mesh material={m.white}><sphereGeometry args={[0.0118, 32, 24]} /></mesh>
          <group rotation={[0, look * 0.35, 0]}>
            <mesh material={m.iris} position={[0, 0, 0.0098]} scale={[1, 1, 0.45]}><sphereGeometry args={[0.0058, 24, 16]} /></mesh>
            <mesh material={m.pupil} position={[0, 0, 0.0122]} scale={[1, 1, 0.3]}><sphereGeometry args={[0.0026, 16, 12]} /></mesh>
            <mesh material={m.spec} position={[0.0018, 0.0022, 0.0128]}><sphereGeometry args={[0.0009, 8, 6]} /></mesh>
          </group>
          {/* upper & lower lids */}
          <mesh material={m.lid} rotation={[0.12 + blink * 1.4, 0, 0]}><sphereGeometry args={[0.0127, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} /></mesh>
          <mesh material={m.lash} rotation={[0.12 + blink * 1.4, 0, 0]}><sphereGeometry args={[0.01285, 32, 4, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.03]} /></mesh>
          <mesh material={m.lid} rotation={[Math.PI - 0.35, 0, 0]}><sphereGeometry args={[0.0124, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.25]} /></mesh>
        </group>
      ); })}
      {[1, -1].map((s) => (
        <group key={'ear' + s} position={[0.076 * s, -0.004, -0.008]} rotation={[0, s * 0.35, s * 0.12]}>
          <mesh material={m.ear} scale={[0.32, 1, 0.62]} castShadow><sphereGeometry args={[0.026, 24, 18]} /></mesh>
          <mesh material={m.ear} position={[0.004 * s, 0.002, 0.002]} rotation={[0, s * Math.PI / 2, 0]} scale={[0.62, 1, 1]}><torusGeometry args={[0.018, 0.0035, 8, 24, Math.PI * 1.4]} /></mesh>
        </group>
      ))}
    </group>
  );
};
