import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {CharSpec} from './theme';
import {RpmHead} from './Human';
import {useSoftBody} from './SoftBody';

/* ---- natural face life: blinks, eye saccades, micro head motion (deterministic per character) ---- */
const blinkAt = (seed: string, t: number) => {
  let ts = -1, i = 0, x = 0.4 + random(seed + 'b0') * 1.5;
  while (x <= t && i < 400) { ts = x; i++; const r = random(seed + 'b' + i); x += r < 0.12 ? 0.32 : 1.7 + r * 3.2; } // occasional double blink
  const d = t - ts; if (ts < 0 || d > 0.2) return 0;
  return d < 0.075 ? Math.sin((d / 0.075) * Math.PI / 2) : Math.cos(((d - 0.075) / 0.125) * Math.PI / 2) ** 1.4;
};
const gazeAt = (seed: string, t: number): [number, number] => {
  let x = 0, i = 0, start = 0, prev: [number, number] = [0, 0], cur: [number, number] = [0, 0];
  while (x <= t && i < 400) {
    prev = cur; start = x; i++;
    const toCam = random(seed + 'gc' + i) < 0.55;
    cur = toCam ? [0, 0] : [(random(seed + 'gx' + i) - 0.5) * 0.3, (random(seed + 'gy' + i) - 0.5) * 0.12];
    x += 0.5 + random(seed + 'gt' + i) * 1.4;
  }
  const k = Math.min(1, (t - start) / 0.05); // saccades are fast (~50 ms)
  return [prev[0] + (cur[0] - prev[0]) * k, prev[1] + (cur[1] - prev[1]) * k];
};

/** Rotates its children so they stay upright in world space (e.g. a tub resting on an open palm). */
const Upright: React.FC<{children: React.ReactNode; lift: number; yaw?: number}> = ({children, lift, yaw = 0}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = ref.current; if (!g || !g.parent) return;
    g.parent.updateWorldMatrix(true, false);
    const inv = new THREE.Quaternion(); g.parent.getWorldQuaternion(inv); inv.invert();
    g.quaternion.copy(inv).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
    g.position.set(0, lift, 0).applyQuaternion(inv); // sit on top of the palm, measured in world "up"
  });
  return <group ref={ref}>{children}</group>;
};

/** Joint rotations (radians). Character faces +Z. */
export type Pose = {
  y?: number; bob?: number; turn?: number; lean?: number; twist?: number; side?: number; headX?: number; headY?: number;
  shL?: [number, number, number]; twL?: number; elL?: number; wrL?: number; rlL?: number; shR?: [number, number, number]; twR?: number; elR?: number; wrR?: number; rlR?: number;
  hipL?: [number, number]; kneeL?: number; hipR?: [number, number]; kneeR?: number;
};
type Props = {smile?: number; talk?: number; spec: CharSpec; pose?: Pose; position?: [number, number, number]; muscle?: number; flexL?: number; flexR?: number; holdL?: React.ReactNode; holdR?: React.ReactNode; sweat?: number; mouthOpen?: number; soft?: boolean};

const lathe = (pts: [number, number][], seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const limbCache = new Map<string, THREE.LatheGeometry>();
/** Anatomical limb profiles (top at y=0, extending to negative y). m = muscle 0..1 (quantised for caching). */
const limb = (kind: 'upper' | 'fore' | 'thigh', m: number) => {
  const q = Math.round(m * 40) / 40; const key = kind + q;
  if (limbCache.has(key)) return limbCache.get(key)!;
  const a = 1 + q * 0.45;
  const prof: [number, number][] = kind === 'upper'
    ? [[0.001, 0.02], [0.05 * a, 0.0], [0.052 * a, -0.06], [0.054 * a, -0.13], [0.05 * a, -0.2], [0.043, -0.27], [0.041, -0.3], [0.001, -0.31]]
    : kind === 'fore'
    ? [[0.001, 0.015], [0.043, 0.0], [0.049 * (1 + q * 0.3), -0.05], [0.045 * (1 + q * 0.25), -0.1], [0.036, -0.18], [0.029, -0.245], [0.027, -0.26], [0.001, -0.27]]
    : [[0.001, 0.02], [0.092 * (1 + q * 0.2), 0.0], [0.094 * (1 + q * 0.22), -0.08], [0.088 * (1 + q * 0.2), -0.18], [0.074, -0.3], [0.062, -0.4], [0.058, -0.44], [0.001, -0.46]];
  const geo = lathe(prof, 36); limbCache.set(key, geo); return geo;
};

const useKit = (spec: CharSpec) => useMemo(() => {
  const skinC = new THREE.Color(spec.skin);
  const skin = new THREE.MeshPhysicalMaterial({color: skinC.clone().multiply(new THREE.Color(0.9, 0.84, 0.82)), roughness: 0.52, sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color('#FF9A70'), clearcoat: 0.08, clearcoatRoughness: 0.6});
  const fabric = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; g.fillStyle = '#808080'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 2) { g.fillStyle = `rgba(${y % 4 ? 255 : 0},${y % 4 ? 255 : 0},${y % 4 ? 255 : 0},0.08)`; g.fillRect(0, y, 128, 1); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; })();
  return {
    skin,
    shirtSoft: new THREE.MeshPhysicalMaterial({color: spec.shirt, roughness: 0.88, sheen: 0.55, sheenRoughness: 0.6, sheenColor: new THREE.Color(spec.shirt).lerp(new THREE.Color('#ffffff'), 0.35)}),
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

/** Realistic hand: palm + knuckle-jointed fingers (2 phalanges each) + opposable thumb. grip 0 = relaxed, ~1.4 = closed around a handle. */
const Hand: React.FC<{k: ReturnType<typeof useKit>; sd: number; grip: number}> = ({k, sd, grip}) => (
  <group>
    <M g={cap(0.029, 0.045)} mat={k.skin} p={[0, -0.045, -0.002]} s={[1.28, 1, 0.6]} />
    {[-1.5, -0.5, 0.5, 1.5].map((i) => {
      const len = i === -1.5 || i === 1.5 ? 0.82 : 1; const x = i * 0.0145 * sd;
      return (
        <group key={i} position={[x, -0.083, 0.0]} rotation={[grip * 0.55, 0, i * 0.04 * sd]}>
          <M g={cap(0.0098, 0.026 * len)} mat={k.skin} p={[0, -0.018 * len, 0]} />
          <group position={[0, -0.036 * len, 0]} rotation={[grip * 0.75, 0, 0]}>
            <M g={cap(0.0088, 0.02 * len)} mat={k.skin} p={[0, -0.014 * len, 0]} />
          </group>
        </group>
      );
    })}
    <group position={[-0.03 * sd, -0.028, -0.008]} rotation={[0.35 + grip * 0.35, 0, 0.75 * sd]}>
      <M g={cap(0.0115, 0.026)} mat={k.skin} p={[0, -0.02, 0]} />
      <group position={[0, -0.04, 0]} rotation={[grip * 0.4, 0, -0.2 * sd]}><M g={cap(0.0102, 0.018)} mat={k.skin} p={[0, -0.014, 0]} /></group>
    </group>
  </group>
);

const isUpright = (n: React.ReactNode) => React.isValidElement(n) && !!(n.type as {upright?: boolean}).upright;
/** Finds the forearm roll that turns the palm (hand −Z) to face the sky, so an object can rest on it. */
const solveRoll = (P: Required<Pose>, sd: number, m: number) => {
  const body = new THREE.Object3D(), spine = new THREE.Object3D(), sh = new THREE.Object3D(), tw = new THREE.Object3D(), el = new THREE.Object3D(), rl = new THREE.Object3D(), wr = new THREE.Object3D();
  body.add(spine); spine.add(sh); sh.add(tw); tw.add(el); el.add(rl); rl.add(wr);
  body.rotation.set(0, 0, P.side); spine.rotation.set(P.lean, P.twist, 0);
  const s = sd === 1 ? P.shL : P.shR; sh.position.set(0.205 * sd * (0.97 + m * 0.05), 0.385, 0); sh.rotation.set(s[0], s[1], s[2]);
  tw.rotation.set(0, sd === 1 ? P.twL : P.twR, 0); el.position.set(0, -0.3, 0); el.rotation.set(-(sd === 1 ? P.elL : P.elR), 0, 0);
  wr.rotation.set(sd === 1 ? P.wrL : P.wrR, 0, 0);
  const n = new THREE.Vector3(); let best = 0, bv = -9;
  for (let a = -Math.PI; a < Math.PI; a += Math.PI / 90) {
    rl.rotation.set(0, a, 0); body.updateMatrixWorld(true);
    n.set(0, 0, -1).transformDirection(wr.matrixWorld);
    if (n.y > bv) { bv = n.y; best = a; }
  }
  return best;
};

/** Procedural rigged athlete (~1.77 m), forward kinematics. muscle 0..1 thickens arms/shoulders/chest; flex 0..1 peaks the biceps. */
export const Character: React.FC<Props> = ({smile = 0.15, talk = 0, spec, pose = {}, position = [0, 0, 0], muscle = 0.2, flexL = 0, flexR = 0, holdL, holdR, sweat = 0, mouthOpen = 0, soft = true}) => {
  const k = useKit(spec);
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const tt = frame / fps;
  const seed = spec.name;
  const ph = random(seed + 'ph') * 10;
  // micro head motion + breathing so nobody ever stands frozen
  const breath = Math.sin(tt * 1.7 + ph);
  const P0 = {y: 0, bob: 0, turn: 0, lean: 0, twist: 0, side: 0, headX: 0, headY: 0, shL: [0, 0, 0.1], twL: 0, twR: 0, elL: 0.12, wrL: 0, shR: [0, 0, -0.1], elR: 0.12, wrR: 0, hipL: [0, 0.03], kneeL: 0.02, hipR: [0, -0.03], kneeR: 0.02, ...pose} as Required<Pose>;
  const P = {...P0, headX: P0.headX + 0.022 * Math.sin(tt * 1.1 + ph) + 0.01 * Math.sin(tt * 2.7 + ph * 2), headY: P0.headY + 0.035 * Math.sin(tt * 0.77 + ph * 3) + 0.012 * Math.sin(tt * 2.1)} as Required<Pose>;
  const blink = blinkAt(seed, tt + ph);
  const look = gazeAt(seed, tt + ph);
  const smileLive = Math.max(0, smile + 0.07 * Math.sin(tt * 0.9 + ph) + 0.03 * Math.sin(tt * 2.3));
  const openLive = Math.max(talk, mouthOpen) + 0.035 * (0.5 + 0.5 * breath);
  const upL = isUpright(holdL), upR = isUpright(holdR);
  if (upL) P.rlL = solveRoll(P, 1, muscle); if (upR) P.rlR = solveRoll(P, -1, muscle);
  const rig = useSoftBody(P, muscle, flexL, flexR, {skin: k.skin, shirt: k.shirtSoft, shorts: k.shorts}, breath);
  const mu = 1 + muscle * 0.42, bi = 1 + muscle * 0.75, dl = 1 + muscle * 0.38, lg = 1 + muscle * 0.22;
  const V = !soft; // primitive body parts only in legacy mode
  const arm = (sd: 1 | -1) => {
    const tw = sd === 1 ? P.twL : P.twR, sh = sd === 1 ? P.shL : P.shR, el = sd === 1 ? P.elL : P.elR, wr = sd === 1 ? P.wrL : P.wrR, rl0 = sd === 1 ? P.rlL : P.rlR, fl = sd === 1 ? flexL : flexR, hold = sd === 1 ? holdL : holdR, up = sd === 1 ? upL : upR;
    // relaxed arms: palms turn toward the thighs; bent / holding arms keep the curl orientation
    const rl = rl0 ?? (hold ? 0 : -sd * 1.3 * Math.max(0, 1 - el / 1.1));
    return (
      <group position={[0.205 * sd * (0.97 + muscle * 0.05), 0.385, 0]} rotation={sh as unknown as THREE.Euler}><group rotation={[0, tw, 0]}>
        {soft && <mesh material={k.shirtSoft} position={[0, -0.122, 0.004]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.051 * dl + 0.002, 0.0085, 10, 40]} /></mesh>}
        {V && <M g={sph(0.062 * dl)} mat={k.shirt} p={[0.004 * sd, -0.01, 0]} s={[1.05, 1, 1]} />}
        {V && <M g={cyl(0.062 * dl, 0.058 * mu, 0.12, true)} mat={k.shirt} p={[0.002 * sd, -0.065, 0]} />}
        {V && <mesh geometry={limb('upper', muscle)} material={k.skin} castShadow receiveShadow />}
        {V && <M g={sph(0.046 * bi)} mat={k.skin} p={[0, -0.185, 0.024 + muscle * 0.012]} s={[0.92, 1.45 - fl * 0.35, 0.82 + fl * 0.5]} />}
        {V && <M g={sph(0.044 * (1 + muscle * 0.55))} mat={k.skin} p={[0, -0.2, -0.018 - muscle * 0.008]} s={[0.92, 1.5, 0.8]} />}
        <group position={[0, -0.3, 0]} rotation={[-el, 0, 0]}>
          {V && <M g={sph(0.042)} mat={k.skin} />}
          {V && <mesh geometry={limb('fore', muscle)} material={k.skin} scale={[1.05, 1, 0.92]} castShadow receiveShadow />}
          {V && <M g={sph(0.042 * (1 + muscle * 0.35))} mat={k.skin} p={[0, -0.06, 0.005]} s={[1.05, 1.4, 0.95]} />}
          <group position={[0, -0.248, 0]} rotation={[0, rl, 0]}><group rotation={[wr, 0, 0]}>
            <Hand k={k} sd={sd} grip={hold ? (up ? 0.38 : 1.35) : 0.45 + fl * 1.25} />
            {hold && (up
              ? <group position={[0, -0.05, -0.016]}><Upright lift={(hold as React.ReactElement<{scale?: number}>).props.scale ? 0.1 * ((hold as React.ReactElement<{scale?: number}>).props.scale ?? 1) + 0.006 : 0.1} yaw={0.5 * sd}>{hold}</Upright></group>
              : <group position={[0, -0.075, 0.02]}>{hold}</group>)}
          </group></group>
        </group>
      </group></group>
    );
  };
  const leg = (sd: 1 | -1) => {
    const hp = sd === 1 ? P.hipL : P.hipR, kn = sd === 1 ? P.kneeL : P.kneeR;
    return (
      <group position={[0.093 * sd, -0.03, 0]} rotation={[-hp[0], 0, hp[1]]}>
        {soft && <mesh material={k.shorts} position={[0, -0.236, 0.012]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.091 * lg + 0.004, 0.012, 10, 44]} /></mesh>}
        {V && <M g={cyl(0.1 * lg + 0.004, 0.09 * lg + 0.004, 0.24, true)} mat={k.shorts} p={[0, -0.1, 0]} />}
        {V && <mesh geometry={limb('thigh', muscle)} material={k.skin} position={[0, 0.0, 0.004]} castShadow receiveShadow />}
        {V && <M g={sph(0.068 * lg)} mat={k.skin} p={[0, -0.34, 0.03]} s={[0.95, 1.4, 0.75]} />}
        <group position={[0, -0.44, 0]} rotation={[kn, 0, 0]}>
          {V && <M g={sph(0.058)} mat={k.skin} p={[0, 0.0, 0.006]} s={[1, 0.9, 1]} />}
          {V && <mesh geometry={k.calf} material={k.skin} position={[0, 0, -0.006]} scale={[1 + muscle * 0.18, 1, 1 + muscle * 0.18]} castShadow receiveShadow />}
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
    <group position={[0, 0.628, 0.01]} rotation={[P.headX, P.headY, 0]} scale={[spec.beard ? 1.04 : 1, 1, 1]}>
      <RpmHead spec={spec} smile={smileLive} open={openLive} look={look} blink={blink} />
      {sweat > 0 && <M g={sph(0.0065)} mat={k.sweat} p={[0.05, 0.05 - sweat * 0.08, 0.085]} s={[1, 1.5, 1]} shadow={false} />}
    </group>
  );
  return (
    <group position={position} rotation={[0, P.turn, 0]}>
      {soft && <><primitive object={rig.skin} /><primitive object={rig.shirt} /><primitive object={rig.shorts} /></>}
      <group position={[0, 0.95 + P.bob, 0]} rotation={[0, 0, P.side]}>
        {V && <mesh geometry={k.shortsG} material={k.shorts} castShadow receiveShadow />}
        {leg(1)}{leg(-1)}
        <group position={[0, 0.06, 0]} rotation={[P.lean, P.twist, 0]}>
          {V && <mesh geometry={k.torso} material={k.shirt} scale={[1 + muscle * 0.13, 1, 0.66 + muscle * 0.08]} castShadow receiveShadow />}
          {V && <M g={sph(0.09)} mat={k.shirt} p={[0, 0.41, -0.02]} s={[1.5 + muscle * 0.35, 0.5 + muscle * 0.2, 0.8]} />}
          {V && <M g={cyl(0.045 * (1 + muscle * 0.22), 0.054 * (1 + muscle * 0.25), 0.12)} mat={k.skin} p={[0, 0.5, -0.008]} />}
          {V && <mesh position={[0, 0.466, 0.006]} rotation={[Math.PI / 2 - 0.2, 0, 0]} material={k.shirt}><torusGeometry args={[0.062, 0.007, 10, 40]} /></mesh>}
          {arm(1)}{arm(-1)}
          {head}
        </group>
      </group>
    </group>
  );
};
