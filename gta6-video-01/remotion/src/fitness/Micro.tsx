import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random} from 'remotion';
import {Cam} from './Gym';

/** Striated skeletal-muscle texture (sarcomere bands). */
const useStriation = () => useMemo(() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d')!;
  for (let y = 0; y < 256; y++) { const b = Math.sin((y / 256) * Math.PI * 16); const v = Math.round(150 + 70 * Math.sign(b) * Math.pow(Math.abs(b), 0.4)); g.fillStyle = `rgb(${v},${Math.round(v * 0.32)},${Math.round(v * 0.36)})`; g.fillRect(0, y, 64, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 18); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}, []);

const HEX: [number, number][] = (() => { const out: [number, number][] = []; for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) { const x = (q + r / 2) * 1.0, y = r * 0.866; if (Math.hypot(x, y) < 3.1) out.push([x, y]); } return out; })();

/** Flying through a bundle of muscle fibres; gold phosphocreatine particles fill the fibres as `fill` goes 0→1. */
export const FiberWorld: React.FC<{t: number; fill: number; camZ: number; glow?: number}> = ({t, fill, camZ, glow = 1}) => {
  const tex = useStriation();
  const fiber = useMemo(() => new THREE.MeshPhysicalMaterial({map: tex, color: '#FF6B6B', roughness: 0.45, sheen: 0.8, sheenColor: new THREE.Color('#FFB3A8'), transmission: 0.25, transparent: true, opacity: 0.78, emissive: '#3A0508', emissiveIntensity: 0.6}), [tex]);
  const sheath = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#FFE4DC', roughness: 0.2, transparent: true, opacity: 0.12, side: THREE.DoubleSide}), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({color: '#FFD45E', emissive: '#FFB020', emissiveIntensity: 2.2 * glow, roughness: 0.3}), [glow]);
  const halo = useMemo(() => new THREE.MeshBasicMaterial({color: '#FFC23D', transparent: true, opacity: 0.18 * glow, depthWrite: false}), [glow]);
  const N = Math.round(260 * fill);
  return (
    <>
      <color attach="background" args={['#14030A']} />
      <fog attach="fog" args={['#14030A', 4, 18]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.5, camZ - 2]} intensity={40} color="#FFD0C0" />
      <pointLight position={[-2, -2, camZ - 6]} intensity={30} color="#FF5A7A" />
      <pointLight position={[2, 1, camZ - 9]} intensity={30 * fill + 5} color="#FFC23D" />
      <Cam pos={[Math.sin(t * 0.4) * 0.35, Math.cos(t * 0.3) * 0.25, camZ]} look={[0, 0, camZ - 6]} fov={55} />
      {HEX.map(([x, y], i) => (
        <group key={i} position={[x, y, -10]}>
          <mesh material={fiber} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 34, 40, 1, true]} /></mesh>
          <mesh material={sheath} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.47, 0.47, 34, 40, 1, true]} /></mesh>
        </group>
      ))}
      {Array.from({length: N}).map((_, i) => {
        const f = HEX[Math.floor(random(`f${i}`) * HEX.length)];
        const a = random(`a${i}`) * Math.PI * 2, r = 0.32 * Math.sqrt(random(`r${i}`));
        const z = -26 + random(`z${i}`) * 32 + Math.sin(t * 2 + i) * 0.08;
        const s = 0.035 + random(`s${i}`) * 0.03;
        return <group key={i} position={[f[0] + Math.cos(a) * r, f[1] + Math.sin(a) * r, z]}><mesh material={gold}><sphereGeometry args={[s, 10, 8]} /></mesh><mesh material={halo}><sphereGeometry args={[s * 3, 10, 8]} /></mesh></group>;
      })}
    </>
  );
};

/** Cross-section of muscle cells; `swell` 0..1 enlarges cells and fills them with water droplets. */
export const Cells: React.FC<{swell: number; t: number; tint: string; x: number}> = ({swell, t, tint, x}) => {
  const membrane = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#FF8C8C', roughness: 0.3, sheen: 1, sheenColor: new THREE.Color('#FFD6D6'), clearcoat: 0.6}), []);
  const plasma = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#C2303F', roughness: 0.5, transparent: true, opacity: 0.85, emissive: '#2A0006', emissiveIntensity: 0.5}), []);
  const drop = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#7FD3FF', roughness: 0.02, transmission: 0.5, clearcoat: 1, emissive: '#0A5A9A', emissiveIntensity: 0.5}), []);
  const rim = useMemo(() => new THREE.MeshBasicMaterial({color: tint}), [tint]);
  const cells: [number, number][] = [[0, 0], [1, 0], [-1, 0], [0.5, 0.87], [-0.5, 0.87], [0.5, -0.87], [-0.5, -0.87]];
  const sc = 1 + 0.14 * swell;
  return (
    <group position={[x, 0, 0]}>
      {cells.map(([cx, cy], i) => (
        <group key={i} position={[cx * 0.95 * sc, cy * 0.95 * sc, 0]} scale={[sc, sc, 1]}>
          <mesh material={membrane}><torusGeometry args={[0.43, 0.035, 16, 48]} /></mesh>
          <mesh material={plasma} position={[0, 0, -0.02]}><circleGeometry args={[0.43, 48]} /></mesh>
          {Array.from({length: Math.round(4 + 16 * swell)}).map((_, k) => { const a = random(`c${i}${k}`) * Math.PI * 2 + t * 0.4, r = 0.32 * Math.sqrt(random(`d${i}${k}`)); return <mesh key={k} material={drop} position={[Math.cos(a) * r, Math.sin(a) * r, 0.03]}><sphereGeometry args={[0.035 + 0.02 * random(`e${i}${k}`), 14, 10]} /></mesh>; })}
        </group>
      ))}
      <mesh material={rim} position={[0, -1.85, 0]}><boxGeometry args={[1.6, 0.04, 0.01]} /></mesh>
    </group>
  );
};
