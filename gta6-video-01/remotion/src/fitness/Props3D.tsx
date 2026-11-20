import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random} from 'remotion';

const glass = new THREE.MeshPhysicalMaterial({color: '#E8F2FF', roughness: 0.05, transmission: 0.92, thickness: 0.02, ior: 1.45, transparent: true, opacity: 0.55});
const water = new THREE.MeshPhysicalMaterial({color: '#9FD4FF', roughness: 0.02, transmission: 0.7, transparent: true, opacity: 0.75});
const blackP = new THREE.MeshStandardMaterial({color: '#141519', roughness: 0.5});
const white = new THREE.MeshStandardMaterial({color: '#F4F4F2', roughness: 0.35});
const powder = new THREE.MeshStandardMaterial({color: '#FFFFFF', roughness: 0.9, emissive: '#FFFFFF', emissiveIntensity: 0.15});
const label = (txt: string, color: string) => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d')!; g.fillStyle = color; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.font = '900 64px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText(txt, 256, 120); g.font = '700 34px Montserrat, sans-serif'; g.fillText('MONOHYDRATE · 5 g', 256, 185); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

/** Creatine tub with printed label. */
export const Tub: React.FC<{scale?: number}> = ({scale = 1}) => {
  const tex = useMemo(() => label('CREATINE', '#1F59D6'), []);
  return (
    <group scale={scale}>
      <mesh material={white} castShadow><cylinderGeometry args={[0.075, 0.075, 0.17, 40]} /></mesh>
      <mesh position={[0, 0.005, 0]}><cylinderGeometry args={[0.0755, 0.0755, 0.09, 40, 1, true]} /><meshStandardMaterial map={tex} roughness={0.4} /></mesh>
      <mesh material={blackP} position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.078, 0.078, 0.035, 40]} /></mesh>
    </group>
  );
};
(Tub as unknown as {upright: boolean}).upright = true; // rests upright on an open palm when held
/** Measuring scoop with a heap of powder. */
export const Scoop: React.FC<{tilt?: number; full?: number}> = ({tilt = 0, full = 1}) => (
  <group rotation={[0, 0, tilt]}>
    <mesh material={white} castShadow><cylinderGeometry args={[0.028, 0.022, 0.03, 24, 1, true]} /></mesh>
    <mesh material={white} position={[0, -0.015, 0]}><circleGeometry args={[0.022, 24]} /></mesh>
    <mesh material={white} position={[0.06, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.006, 0.006, 0.08, 10]} /></mesh>
    {full > 0 && <mesh material={powder} position={[0, 0.012, 0]} scale={[1, 0.6 * full, 1]}><sphereGeometry args={[0.026, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>}
  </group>
);
/** Clear shaker with water (and swirling dissolved powder when mix > 0). */
export const Shaker: React.FC<{mix?: number; t?: number; level?: number}> = ({mix = 0, t = 0, level = 0.65}) => (
  <group>
    <mesh material={glass} castShadow><cylinderGeometry args={[0.055, 0.048, 0.2, 40, 1, true]} /></mesh>
    <mesh material={water} position={[0, -0.1 + 0.1 * level, 0]}><cylinderGeometry args={[0.051, 0.047, 0.2 * level, 40]} /></mesh>
    {mix > 0 && Array.from({length: 26}).map((_, i) => { const a = t * 6 + i * 0.9, r = 0.038 * random(`r${i}`), y = -0.09 + 0.2 * level * random(`y${i}`); return <mesh key={i} material={powder} position={[Math.cos(a) * r, y, Math.sin(a) * r]}><sphereGeometry args={[0.004 * mix + 0.001, 6, 6]} /></mesh>; })}
    <mesh material={blackP} position={[0, 0.11, 0]}><cylinderGeometry args={[0.058, 0.058, 0.03, 40]} /></mesh>
  </group>
);
/** Plain water bottle. */
export const Bottle: React.FC = () => (
  <group>
    <mesh material={glass} castShadow><cylinderGeometry args={[0.035, 0.035, 0.2, 32]} /></mesh>
    <mesh material={water} position={[0, -0.02, 0]}><cylinderGeometry args={[0.032, 0.032, 0.15, 32]} /></mesh>
    <mesh material={new THREE.MeshStandardMaterial({color: '#2E8BFF', roughness: 0.4})} position={[0, 0.115, 0]}><cylinderGeometry args={[0.018, 0.02, 0.03, 20]} /></mesh>
  </group>
);
/** Powder stream: particles falling from (0,0,0) down to y=-h, spreading slightly. */
export const PowderStream: React.FC<{t: number; h?: number; on?: number}> = ({t, h = 0.25, on = 1}) => (
  <group>
    {Array.from({length: 90}).map((_, i) => { const p = (t * 1.6 + random(`p${i}`)) % 1; if (on <= 0) return null; const sx = (random(`x${i}`) - 0.5) * 0.02 * (1 + p * 2), sz = (random(`z${i}`) - 0.5) * 0.02 * (1 + p * 2); return <mesh key={i} material={powder} position={[sx, -h * p * p * 1.0 - p * 0.05, sz]}><sphereGeometry args={[0.0016 + random(`s${i}`) * 0.0012, 6, 6]} /></mesh>; })}
  </group>
);
