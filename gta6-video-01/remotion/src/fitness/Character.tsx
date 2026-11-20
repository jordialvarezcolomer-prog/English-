import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CharSpec} from './theme';
import {Head} from './Head';

/** Joint rotations (radians). Character faces +Z. */
export type Pose = {
  y?: number; bob?: number; turn?: number; lean?: number; twist?: number; side?: number; headX?: number; headY?: number;
  shL?: [number, number, number]; twL?: number; elL?: number; wrL?: number; shR?: [number, number, number]; twR?: number; elR?: number; wrR?: number;
  hipL?: [number, number]; kneeL?: number; hipR?: [number, number]; kneeR?: number;
};
type Props = {spec: CharSpec; pose?: Pose; position?: [number, number, number]; muscle?: number; flexL?: number; flexR?: number; holdL?: React.ReactNode; holdR?: React.ReactNode; sweat?: number; mouthOpen?: number};

const lathe = (pts: [number, number][], seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

const useKit = (spec: CharSpec) => useMemo(() => {
  const skinC = new THREE.Color(spec.skin);
  const skin = new THREE.MeshPhysicalMaterial({color: skinC, roughness: 0.5, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#FF9A70'), clearcoat: 0.08, clearcoatRoughness: 0.6});
  const fabric = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; g.fillStyle = '#808080'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 2) { g.fillStyle = `rgba(${y % 4 ? 255 : 0},${y % 4 ? 255 : 0},${y % 4 ? 255 : 0},0.08)`; g.fillRect(0, y, 128, 1); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; })();
  return {
    skin,
    shirt: new THREE.MeshPhysicalMaterial({color: spec.shirt, roughness: 0.85, sheen: 0.4, sheenColor: new THREE.Color(spec.shirt).multiplyScalar(1.4), bumpMap: fabric, bumpScale: 0.6, side: THREE.DoubleSide}),
    shorts: new THREE.MeshPhysicalMaterial({color: '#14161B', roughness: 0.7, sheen: 0.3, sheenColor: new THREE.Color('#5A6070'), side: THREE.DoubleSide}),
    shoe: new THREE.MeshStandardMaterial({color: '#F4F4F2', roughness: 0.45}),
    sole: new THREE.MeshStandardMaterial({color: '#1E2026', roughness: 0.6}),
    accent: new THREE.MeshStandardMaterial({color: spec.rim, roughness: 0.4}),
    hair: new THREE.MeshStandardMaterial({color: spec.hair, roughness: 0.85}),
    eyeW: new THREE.MeshPhysicalMaterial({color: '#FBFBF8', roughness: 0.08, clearcoat: 1}),
    iris: new THREE.MeshPhysicalMaterial({color: spec.hairStyle === 'short' ? '#4A2E1A' : '#3C6E8F', roughness: 0.1, clearcoat: 1}),
    pupil: new THREE.MeshStandardMaterial({color: '#060606', roughness: 0.1}),
    lip: new THREE.MeshPhysicalMaterial({color: skinC.clone().lerp(new THREE.Color('#B4544A'), 0.42), roughness: 0.35, clearcoat: 0.3}),
    sock: new THREE.MeshStandardMaterial({color: '#EFEFEF', roughness: 0.9}),
    mouth: new THREE.MeshStandardMaterial({color: '#3A1412', roughness: 0.8}),
    sweat: new THREE.MeshPhysicalMaterial({color: '#E8F6FF', roughness: 0, transmission: 0.6, clearcoat: 1}),
    torso: lathe([[0.001, -0.02], [0.15, -0.01], [0.152, 0.05], [0.158, 0.13], [0.175, 0.22], [0.192, 0.3], [0.196, 0.36], [0.182, 0.41], [0.14, 0.445], [0.085, 0.462], [0.058, 0.468], [0.001, 0.47]]),
    shortsG: lathe([[0.001, 0.08], [0.16, 0.08], [0.168, 0.02], [0.178, -0.06], [0.18, -0.1]]),
    calf: lathe([[0.04, -0.34], [0.046, -0.28], [0.06, -0.16], [0.062, -0.1], [0.056, -0.02], [0.052, 0.02]]),
  };
}, [spec]);

const M: React.FC<{g: React.ReactNode; mat: THREE.Material; p?: [number, number, number]; s?: [number, number, number]; r?: [number, number, number]; shadow?: boolean}> = ({g, mat, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], shadow = true}) => (
  <mesh position={p} scale={s} rotation={r} material={mat} castShadow={shadow} receiveShadow>{g}</mesh>
);
const sph = (r: number) => <sphereGeometry args={[r, 40, 28]} />;
const cyl = (a: number, b: number, h: number, open = false) => <cylinderGeometry args={[a, b, h, 36, 1, open]} />;
const cap = (r: number, l: number) => <capsuleGeometry args={[r, l, 12, 32]} />;

/** Procedural rigged athlete (~1.77 m), forward kinematics. muscle 0..1 thickens arms/shoulders/chest; flex 0..1 peaks the biceps. */
export const Character: React.FC<Props> = ({spec, pose = {}, position = [0, 0, 0], muscle = 0.2, flexL = 0, flexR = 0, holdL, holdR, sweat = 0, mouthOpen = 0}) => {
  const k = useKit(spec);
  const P = {y: 0, bob: 0, turn: 0, lean: 0, twist: 0, side: 0, headX: 0, headY: 0, shL: [0, 0, 0.1], twL: 0, twR: 0, elL: 0.12, wrL: 0, shR: [0, 0, -0.1], elR: 0.12, wrR: 0, hipL: [0, 0.03], kneeL: 0.02, hipR: [0, -0.03], kneeR: 0.02, ...pose} as Required<Pose>;
  const mu = 1 + muscle * 0.42, bi = 1 + muscle * 0.75, dl = 1 + muscle * 0.38, lg = 1 + muscle * 0.22;
  const arm = (sd: 1 | -1) => {
    const tw = sd === 1 ? P.twL : P.twR, sh = sd === 1 ? P.shL : P.shR, el = sd === 1 ? P.elL : P.elR, wr = sd === 1 ? P.wrL : P.wrR, fl = sd === 1 ? flexL : flexR, hold = sd === 1 ? holdL : holdR;
    return (
      <group position={[0.205 * sd * (0.97 + muscle * 0.05), 0.385, 0]} rotation={sh as unknown as THREE.Euler}><group rotation={[0, tw, 0]}>
        <M g={sph(0.062 * dl)} mat={k.shirt} p={[0.004 * sd, -0.01, 0]} s={[1.05, 1, 1]} />
        <M g={cyl(0.062 * dl, 0.058 * mu, 0.12, true)} mat={k.shirt} p={[0.002 * sd, -0.065, 0]} />
        <M g={cyl(0.052 * mu, 0.045 * mu, 0.27)} mat={k.skin} p={[0, -0.165, 0]} />
        <M g={sph(0.046 * bi)} mat={k.skin} p={[0, -0.185, 0.024 + muscle * 0.012]} s={[0.92, 1.45 - fl * 0.35, 0.82 + fl * 0.5]} />
        <M g={sph(0.044 * (1 + muscle * 0.55))} mat={k.skin} p={[0, -0.2, -0.018 - muscle * 0.008]} s={[0.92, 1.5, 0.8]} />
        <group position={[0, -0.3, 0]} rotation={[-el, 0, 0]}>
          <M g={sph(0.045 * mu)} mat={k.skin} />
          <M g={cyl(0.046 * mu, 0.033, 0.25)} mat={k.skin} p={[0, -0.125, 0]} s={[1.05, 1, 0.9]} />
          <M g={sph(0.042 * (1 + muscle * 0.35))} mat={k.skin} p={[0, -0.06, 0.005]} s={[1.05, 1.4, 0.95]} />
          <group position={[0, -0.255, 0]} rotation={[wr, 0, 0]}>
            <M g={cap(0.03, 0.04)} mat={k.skin} p={[0, -0.04, 0.004]} s={[1.25, 1, 0.62]} />
            {[-1.5, -0.5, 0.5, 1.5].map((i) => <M key={i} g={cap(0.0105, 0.035)} mat={k.skin} p={[i * 0.0135 * sd, -0.088, 0.012]} r={[0.5, 0, 0]} />)}
            <M g={cap(0.012, 0.03)} mat={k.skin} p={[-0.034 * sd, -0.04, 0.02]} r={[0.3, 0, 0.6 * sd]} />
            {hold && <group position={[0, -0.075, 0.02]}>{hold}</group>}
          </group>
        </group>
      </group></group>
    );
  };
  const leg = (sd: 1 | -1) => {
    const hp = sd === 1 ? P.hipL : P.hipR, kn = sd === 1 ? P.kneeL : P.kneeR;
    return (
      <group position={[0.093 * sd, -0.03, 0]} rotation={[-hp[0], 0, hp[1]]}>
        <M g={cyl(0.1 * lg + 0.004, 0.09 * lg + 0.004, 0.24, true)} mat={k.shorts} p={[0, -0.1, 0]} />
        <M g={cyl(0.088 * lg, 0.062, 0.42)} mat={k.skin} p={[0, -0.23, 0.004]} />
        <M g={sph(0.068 * lg)} mat={k.skin} p={[0, -0.34, 0.03]} s={[0.95, 1.4, 0.75]} />
        <group position={[0, -0.44, 0]} rotation={[kn, 0, 0]}>
          <M g={sph(0.06)} mat={k.skin} p={[0, 0, 0.004]} />
          <mesh geometry={k.calf} material={k.skin} position={[0, 0, -0.006]} scale={[1 + muscle * 0.18, 1, 1 + muscle * 0.18]} castShadow receiveShadow />
          <M g={cyl(0.043, 0.041, 0.07)} mat={k.sock} p={[0, -0.36, 0]} />
          <group position={[0, -0.41, 0]} rotation={[-kn + hp[0] * 0.25, 0, 0]}>
            <M g={cap(0.052, 0.17)} mat={k.shoe} p={[0, -0.022, 0.055]} r={[Math.PI / 2, 0, 0]} s={[1, 1, 0.78]} />
            <M g={cap(0.054, 0.18)} mat={k.sole} p={[0, -0.055, 0.055]} r={[Math.PI / 2, 0, 0]} s={[1.03, 1.02, 0.3]} />
            <mesh position={[0.05 * sd, -0.02, 0.05]} rotation={[0, sd * Math.PI / 2, 0]} material={k.accent}><planeGeometry args={[0.16, 0.025]} /></mesh>
          </group>
        </group>
      </group>
    );
  };
  const head = (
    <group position={[0, 0.612, 0.008]} rotation={[P.headX, P.headY, 0]}>
      <Head spec={spec} />
      {sweat > 0 && <M g={sph(0.0065)} mat={k.sweat} p={[0.05, 0.05 - sweat * 0.08, 0.085]} s={[1, 1.5, 1]} shadow={false} />}
    </group>
  );
  return (
    <group position={position} rotation={[0, P.turn, 0]}>
      <group position={[0, 0.95 + P.bob, 0]} rotation={[0, 0, P.side]}>
        <mesh geometry={k.shortsG} material={k.shorts} castShadow receiveShadow />
        {leg(1)}{leg(-1)}
        <group position={[0, 0.06, 0]} rotation={[P.lean, P.twist, 0]}>
          <mesh geometry={k.torso} material={k.shirt} scale={[1 + muscle * 0.13, 1, 0.66 + muscle * 0.08]} castShadow receiveShadow />
          <M g={sph(0.09)} mat={k.shirt} p={[0, 0.41, -0.02]} s={[1.5 + muscle * 0.35, 0.5 + muscle * 0.2, 0.8]} />
          <M g={cyl(0.045 * (1 + muscle * 0.22), 0.054 * (1 + muscle * 0.25), 0.12)} mat={k.skin} p={[0, 0.5, -0.008]} />
          <mesh position={[0, 0.466, 0.006]} rotation={[Math.PI / 2 - 0.2, 0, 0]} material={k.shirt}><torusGeometry args={[0.062, 0.007, 10, 40]} /></mesh>
          {arm(1)}{arm(-1)}
          {head}
        </group>
      </group>
    </group>
  );
};
