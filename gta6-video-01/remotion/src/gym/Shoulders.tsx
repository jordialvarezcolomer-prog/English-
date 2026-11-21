import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {BG, FONT, FrontPerson, G, OL, Person, Pose, V} from './kit';
import {Arrow, Badge, BlackTag, Cable, DeltCap, DeltPill, DeltSide, GOLD, GOLD_D, GOLD_L, GoldDefs, Grip, Inset, Machine, RedTag, Sparks, Strain, Triangle, frontGeom, machinePulley, sideGeom, triFrame, triGrip} from './ShoulderKit';
import {FPS} from '../theme';
import SEG from './ep03_segments.json';

/* =====================================================================================
   "FULL SHOULDERS WITH ONE PULLEY" — UK English adaptation of a Spanish explainer structure.
   Branding is neutral: edit SERIES / HANDLE / GUIDE below. Plan: docs/PLAN_shoulders_uk.md
   ===================================================================================== */
export const SERIES = 'GYM FACTS · Nº 01';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const eo = Easing.out(Easing.cubic), eio = Easing.inOut(Easing.cubic);
const useT = () => useCurrentFrame() / FPS;
const tri = (x: number) => 0.5 - 0.5 * Math.cos(x * Math.PI * 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpV = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const sec = SEG as {start: number; end: number; text: string}[];
const T = (i: number) => sec[i].start;
const END = sec[21].end + 1.8;
export const SHOULDERS_TOTAL = Math.round(END * FPS);
const B = {
  hook: [0, T(1)], nodumb: [T(1), T(2)], grid: [T(2), T(4)], blue: [T(4), T(5) + 2.3], press: [T(5) + 2.3, T(6)],
  ex1: [T(6), T(9)], ex2: [T(9), T(11)], ex3: [T(11), T(12)], ex4: [T(12), T(13)], sum: [T(13), T(14)], mate: [T(14), T(15)], grow: [T(15), T(21)], end: [T(21), END],
} as const;
type BK = keyof typeof B;
const FLOOR = 1290;
const BLUE = '#2F7BF2', ORANGE = '#F28A1E';
const SKIN = '#F3B78E';

/* ---------------- camera + shared UI ---------------- */
const Zoom: React.FC<{z: number; fx: number; fy: number; cy?: number; children: React.ReactNode}> = ({z, fx, fy, cy = 960, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(540px, ${cy}px) scale(${z}) translate(${-fx}px, ${-fy}px)`}}>{children}</div>
);
const Impact: React.FC<{at: number[]; children: React.ReactNode}> = ({at, children}) => {
  const t = useT(); let k = 0, sh = 0, fl = 0;
  for (const a of at) { const d = t - a; if (d >= 0 && d < 0.7) { k += 0.05 * Math.exp(-d * 8); if (d < 0.25) sh += (1 - d / 0.25) * 9; if (d < 0.14) fl = Math.max(fl, 0.4 * (1 - d / 0.14)); } }
  return (<AbsoluteFill><AbsoluteFill style={{transform: `translate(${Math.sin(t * 97) * sh}px,${Math.cos(t * 83) * sh}px) scale(${1 + k})`}}>{children}</AbsoluteFill><AbsoluteFill style={{background: '#fff', opacity: fl}} /></AbsoluteFill>);
};
const Pop: React.FC<{at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'scale' | 'up' | 'left' | 'right'}> = ({at, out, children, style, from = 'scale'}) => {
  const t = useT(); const d = t - at;
  if (d < 0 || (out !== undefined && t > out + 0.2)) return null;
  const p = interpolate(d, [0, 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.2], [1, 0], clamp);
  const tx = from === 'left' ? (1 - p) * -260 : from === 'right' ? (1 - p) * 260 : 0, ty = from === 'up' ? (1 - p) * 100 : 0;
  return <div style={{position: 'absolute', opacity: Math.min(1, p * 1.4) * o, transform: `translate(${tx}px,${ty}px) scale(${from === 'scale' ? 0.6 + 0.4 * p : 1})`, ...style}}>{children}</div>;
};
const Header: React.FC<{dark?: boolean}> = ({dark}) => (
  <>
    <div style={{position: 'absolute', left: 60, top: 238, fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 22, letterSpacing: 3, color: dark ? '#7FB6FF' : '#6a6a66'}}>{SERIES}</div>
    <div style={{position: 'absolute', right: 70, top: 226, background: dark ? '#0B1E3F' : '#FFF6E0', color: '#C98A10', border: '3px solid #F6B93B', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 22, letterSpacing: 4, borderRadius: 999, padding: '6px 26px'}}>SHOULDERS</div>
  </>
);
const PillRow: React.FC<{done: [boolean, boolean, boolean]; active?: number}> = ({done, active = -1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 322, display: 'flex', justifyContent: 'center', gap: 34}}>
    {['FRONT', 'SIDE', 'REAR'].map((n, i) => <DeltPill key={n} text={n} done={done[i]} active={active === i} />)}
  </div>
);
const Floor: React.FC<{y?: number}> = ({y = FLOOR}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 6, background: '#17181C'}} />;

/* ---------------- character helpers ---------------- */
const ALEX = {shirt: BLUE, hair: 'short' as const};
/** The hero: red mohawk, beard, royal-blue tee. Breathes a little so he is never frozen. */
const AlexF: React.FC<{x: number; y: number; s: number; handL: V; handR: V; mood?: 'smile' | 'flat' | 'worry' | 'strain'; crouch?: number; fists?: boolean; blink?: number; sweat?: number; straight?: 'L' | 'R' | 'B'; vtaper?: number; bicep?: number; pump?: number; point?: boolean; girth?: number}> = ({x, y, s, handL, handR, mood = 'flat', crouch, fists, blink, sweat, straight, vtaper, bicep, pump, point, girth}) => {
  const t = useT();
  return <FrontPerson shirt={ALEX.shirt} cap beard phones={false} mood={mood} s={s} x={x} y={y} handL={handL} handR={handR} crouch={(crouch ?? 0) + 0.02 * Math.sin(t * 3.4)} fists={fists} blink={blink} sweat={sweat} straight={straight} vtaper={vtaper} bicep={bicep} pumpGlow={pump} point={point} girth={girth} />;
};
/** Back of the head: shaved scalp + red crest (no face). */
const BackHead: React.FC<{head: V; s: number}> = ({head, s}) => (
  <g>
    
    <circle cx={head[0]} cy={head[1]} r={48 * s} fill="#E2AA84" stroke={OL} strokeWidth={4.5} />
    <polygon points={[[182, 106], [172, 64], [188, 80], [190, 40], [200, 64], [210, 38], [212, 80], [228, 62], [218, 106]].map(([x, y]) => `${head[0] + (x - 200) * s},${head[1] + (y - 140) * s}`).join(' ')} fill="#E5383B" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M${head[0] - 40 * s} ${head[1] + 18 * s} Q${head[0]} ${head[1] + 46 * s} ${head[0] + 40 * s} ${head[1] + 18 * s}`} fill="none" stroke="#3B2A20" strokeWidth={5 * s} opacity={0.6} />
  </g>
);
const holdTri = (pulley: V, hand: V, gx: number, s: number) => {
  let apex: V = [hand[0], hand[1] - 100 * s], ang = 0;
  for (let i = 0; i < 3; i++) { ang = triFrame(apex, pulley); const g = triGrip([0, 0], ang, s, gx); apex = [hand[0] - g[0], hand[1] - g[1]]; }
  return {apex, ang};
};
/** Triangle held by two hands, centre of the grip bar at c; returns apex, angle and the two grip points. */
const holdTri2 = (pulley: V, c: V, s: number, spread = 34) => {
  let apex: V = [c[0], c[1] - 118 * s], ang = 0;
  for (let i = 0; i < 3; i++) { ang = triFrame(apex, pulley); const g = triGrip([0, 0], ang, s, 0); apex = [c[0] - g[0], c[1] - g[1]]; }
  return {apex, ang, g1: triGrip(apex, ang, s, -spread), g2: triGrip(apex, ang, s, spread)};
};

/* ============================ EXERCISE RIGS ============================ */
/** 1 — lateral raise, front view, tower left, pulley low. u: 0 rest .. 1 arm at shoulder height. */
const Rig1: React.FC<{u: number; t: number; strain?: number; delt?: number; arrow?: boolean; both?: boolean; mood?: 'smile' | 'strain' | 'flat'}> = ({u, t, strain = 0, delt, arrow, both, mood}) => {
  const s = 1.4, x = 360, y = FLOOR - 572 * s;
  const phi = (lerp(14, 90, u) * Math.PI) / 180;
  const handR: V = [260 + 155 * Math.sin(phi), 226 + 155 * Math.cos(phi)], handL: V = [118, 378];
  const g = frontGeom({x, y, s, handL, handR});
  const pulley = machinePulley(30, 230, FLOOR - 90, true);
  const {apex, ang} = holdTri(pulley, g.hR, 46, 0.8);
  const len = Math.hypot(apex[0] - pulley[0], apex[1] - pulley[1]), len0 = 520;
  const act = delt ?? u;
  const tension = 0.25 + 0.75 * act;
  return (
    <>
      <Machine x={30} floor={FLOOR} top={420} carriageY={FLOOR - 90} faceRight lift={Math.max(0, (len - len0) * 0.45)} t={t} glow={act > 0.6 ? 0.8 : 0} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Cable a={pulley} b={apex} tension={tension} t={t} /></svg>
      <AlexF x={x} y={y} s={s} handL={handL} handR={handR} straight="R" mood={mood ?? (u > 0.35 ? 'strain' : 'flat')} fists blink={u > 0.35 ? 0 : undefined} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltCap p={g.shL} q={g.eL} s={s} act={both ? act : 0} t={t} /><DeltCap p={g.shR} q={g.eR} s={s} act={act} t={t} />
        <Triangle apex={apex} ang={ang} s={0.8} /><Grip p={g.hR} ang={ang} s={0.8} thumb={-1} />
        {strain > 0 && <Strain p={g.hR} t={t} r={strain} />}
        {u > 0.82 && <Sparks p={g.hR} t={t} n={8} />}
        {arrow && <Arrow a={[470, 1236]} b={[400, 1190]} />}
      </svg>
    </>
  );
};

/** 2 — face pull, profile facing LEFT, tower left, pulley at eye level. u: 0 arms forward .. 1 hands at the face. */
const reachClamp = (sh: V, h: V, r = 138): V => { const dx = h[0] - sh[0], dy = h[1] - sh[1], d = Math.hypot(dx, dy); return d > r ? [sh[0] + (dx * r) / d, sh[1] + (dy * r) / d] : h; };
const SIDE_STAND: Pose = {hip: [200, 365], sh: [206, 215], head: [214, 160], handL: [330, 205], handR: [330, 205], footL: [214, 565], footR: [188, 565], legBend: 1, armBend: -1};
const Rig2: React.FC<{u: number; t: number; strain?: number; delt?: number}> = ({u, t, strain = 0, delt}) => {
  const s = 1.5, x0 = 380, y0 = FLOOR - 585 * s;
  const P = (v: V): V => [x0 + (400 - v[0]) * s, y0 + v[1] * s], inv = (p: V): V => [400 - (p[0] - x0) / s, (p[1] - y0) / s];
  const pulley = machinePulley(30, 230, y0 + 158 * s, true);
  const c = lerpV(P([335, 196]), P([268, 168]), u);
  const ts = 0.8, h0 = holdTri2(pulley, c, ts, 32);
  const hl = reachClamp(SIDE_STAND.sh, inv(h0.g1)), hr = reachClamp(SIDE_STAND.sh, inv(h0.g2));
  const cc = lerpV(P(hl), P(hr), 0.5), h = holdTri2(pulley, cc, ts, 32); // re-seat the triangle on the (reach-limited) hands
  const pose: Pose = {...SIDE_STAND, handL: hl, handR: hr, head: [214 - 4 * u, 160]};
  const geo = sideGeom({x: x0, y: y0, s, sh: pose.sh, handL: pose.handL, handR: pose.handR, head: pose.head, flip: true});
  const act = delt ?? u, len = Math.hypot(h.apex[0] - pulley[0], h.apex[1] - pulley[1]);
  return (
    <>
      <Machine x={30} floor={FLOOR} top={420} carriageY={pulley[1]} faceRight lift={Math.max(0, (len - 430) * 0.4)} t={t} glow={0.5 + 0.4 * act} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Cable a={pulley} b={h.apex} tension={0.3 + 0.7 * act} t={t} /></svg>
      <Person pose={pose} shirt={BLUE} cap beard phones={false} flip s={s} x={x0} y={y0} mood={u > 0.3 ? 'strain' : 'flat'} fists />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltSide sh={geo.sh} el={geo.eL} s={s} acts={[0.1 * act, 0.5 * act, act]} t={t} dir={-1} />
        <Triangle apex={h.apex} ang={h.ang} s={ts} /><Grip p={h.g1} ang={h.ang} s={ts} thumb={1} /><Grip p={h.g2} ang={h.ang} s={ts} thumb={-1} />
        {strain > 0 && <Strain p={cc} t={t} r={strain} />}
      </svg>
    </>
  );
};

/** 3 — front raise, profile facing right, tower left, pulley low. u: 0 hands at thighs .. 1 hands at eye level. */
const Rig3: React.FC<{u: number; t: number; strain?: number}> = ({u, t, strain = 0}) => {
  const s = 1.5, x0 = 420, y0 = FLOOR - 585 * s;
  const P = (v: V): V => [x0 + v[0] * s, y0 + v[1] * s], inv = (p: V): V => [(p[0] - x0) / s, (p[1] - y0) / s];
  const pulley = machinePulley(30, 230, FLOOR - 90, true);
  const c = lerpV(P([262, 338]), P([336, 172]), u);
  const ts = 0.8, h0 = holdTri2(pulley, c, ts, 32);
  const hl = reachClamp(SIDE_STAND.sh, inv(h0.g1), 140), hr = reachClamp(SIDE_STAND.sh, inv(h0.g2), 140);
  const cc = lerpV(P(hl), P(hr), 0.5), h = holdTri2(pulley, cc, ts, 32);
  const pose: Pose = {...SIDE_STAND, handL: hl, handR: hr, head: [214, 160]};
  const geo = sideGeom({x: x0, y: y0, s, sh: pose.sh, handL: pose.handL, handR: pose.handR, head: pose.head});
  const len = Math.hypot(h.apex[0] - pulley[0], h.apex[1] - pulley[1]);
  return (
    <>
      <Machine x={30} floor={FLOOR} top={420} carriageY={FLOOR - 90} faceRight lift={Math.max(0, (len - 470) * 0.45)} t={t} glow={0.3 + 0.5 * u} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Cable a={pulley} b={h.apex} tension={0.25 + 0.75 * u} t={t} /></svg>
      <Person pose={pose} shirt={BLUE} cap beard phones={false} s={s} x={x0} y={y0} mood={u > 0.4 ? 'strain' : 'flat'} fists straightArm />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltSide sh={geo.sh} el={geo.eL} s={s} acts={[u, 0.4 * u, 0]} t={t} dir={1} />
        <Triangle apex={h.apex} ang={h.ang} s={ts} /><Grip p={h.g1} ang={h.ang} s={ts} thumb={1} /><Grip p={h.g2} ang={h.ang} s={ts} thumb={-1} />
        {strain > 0 && <Strain p={cc} t={t} r={strain} />}
      </svg>
    </>
  );
};

/** 4 — cross-body rear-delt pull. phase A (front, side-on), B (arm across), C (back view, tower right, arm opened out). */
const Rig4: React.FC<{phase: 'A' | 'B' | 'C'; u: number; t: number; strain?: number}> = ({phase, u, t, strain = 0}) => {
  const s = 1.4;
  if (phase !== 'C') {
    const x = 360, y = FLOOR - 572 * s;
    const phiB = (lerp(14, -58, u) * Math.PI) / 180;
    const handR: V = phase === 'A' ? [260 + 155 * Math.sin((14 * Math.PI) / 180), 226 + 155 * Math.cos((14 * Math.PI) / 180)] : [260 + 155 * Math.sin(phiB), 226 + 155 * Math.cos(phiB)], handL: V = [127, 382];
    const g = frontGeom({x, y, s, handL, handR});
    const pulley = machinePulley(30, 230, FLOOR - 90, true);
    const {apex, ang} = holdTri(pulley, g.hR, -40, 0.8);
    return (
      <>
        <Machine x={30} floor={FLOOR} top={420} carriageY={FLOOR - 90} faceRight lift={phase === 'B' ? 6 + 20 * u : 0} t={t} />
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Cable a={pulley} b={apex} tension={phase === 'B' ? 0.6 : 0.2} t={t} /></svg>
        <AlexF x={x} y={y} s={s} handL={handL} handR={handR} straight="R" mood={phase === 'B' ? 'strain' : 'flat'} fists />
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <DeltCap p={g.shL} q={g.eL} s={s} act={0} t={t} /><DeltCap p={g.shR} q={g.eR} s={s} act={phase === 'B' ? 0.5 : 0} t={t} />
          <Triangle apex={apex} ang={ang} s={0.8} /><Grip p={g.hR} ang={ang} s={0.8} thumb={-1} />
          {strain > 0 && <Strain p={g.hR} t={t} r={strain} />}
        </svg>
      </>
    );
  }
  // back view: tower on the RIGHT, working arm = screen-left, swings out to the side
  const x = 230, y = FLOOR - 572 * s;
  const phiC = (lerp(14, 88, u) * Math.PI) / 180;
  const handL: V = [140 - 155 * Math.sin(phiC), 226 + 155 * Math.cos(phiC)], handR: V = [282, 378];
  const g = frontGeom({x, y, s, handL, handR});
  const pulley = machinePulley(780, 230, FLOOR - 90, false);
  const {apex, ang} = holdTri(pulley, g.hL, 46, 0.8);
  const len = Math.hypot(apex[0] - pulley[0], apex[1] - pulley[1]);
  const head = g.P([200, 140]);
  return (
    <>
      <Machine x={780} floor={FLOOR} top={420} carriageY={FLOOR - 90} faceRight={false} lift={Math.max(0, (len - 380) * 0.45)} t={t} glow={u > 0.5 ? 0.8 : 0} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Cable a={pulley} b={apex} tension={0.25 + 0.75 * u} t={t} /></svg>
      <AlexF x={x} y={y} s={s} handL={handL} handR={handR} straight="L" fists />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* back of the head + collar: hide the face and neckline */}
        <BackHead head={head} s={s} />
        
        <path d={`M${g.P([184, 205])[0]} ${g.P([184, 205])[1]} Q${g.P([200, 214])[0]} ${g.P([200, 214])[1]} ${g.P([216, 205])[0]} ${g.P([216, 205])[1]}`} fill="none" stroke={BLUE} strokeWidth={8} />
        <DeltCap p={g.shL} q={g.eL} s={s} act={u} t={t} rear /><DeltCap p={g.shR} q={g.eR} s={s} act={0} t={t} rear />
        <Triangle apex={apex} ang={ang} s={0.8} /><Grip p={g.hL} ang={ang} s={0.8} thumb={1} />
        {strain > 0 && <Strain p={g.hL} t={t} r={strain} />}
      </svg>
    </>
  );
};

/* =============================== SCENES =============================== */
const rel = (i: number, s0: number) => T(i) - s0;
const rep = (t: number, period: number, phase = 0) => { const x = ((t / period + phase) % 1 + 1) % 1; return x < 0.38 ? eo(x / 0.38) : 1 - eio((x - 0.38) / 0.62); };

/* ---- hook: lateral raise → "1 PULLEY" pull-back → triangle close-up ---- */
const Triangle2: React.FC<{x: number; y: number; s: number; sway?: number}> = ({x, y, s, sway = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <g transform={`rotate(${sway} ${x} 0)`}><line x1={x} y1={0} x2={x} y2={y} stroke={OL} strokeWidth={9 * s} /><line x1={x} y1={0} x2={x} y2={y} stroke="#5B606C" strokeWidth={4 * s} /><Triangle apex={[x, y]} ang={0} s={s} /></g>
  </svg>
);
const Hook: React.FC = () => {
  const t = useT(), end = T(1);
  const u = rep(t, 0.95, 0.5);
  // 0-0.5 extreme close-up (grimace) | 0.5-1.3 pull back, rings + both deltoids ignite | 1.3-2.1 reps | 2.1-2.9 whip-pan to the pulley | 2.9+ triangle swings in
  const zoom = t < 0.5 ? lerp(2.3, 2.1, t / 0.5) : t < 1.3 ? lerp(2.1, 1, eio((t - 0.5) / 0.8)) : t < 2.1 ? 1 : t < 2.9 ? lerp(1, 1.75, eio((t - 2.1) / 0.8)) : 1.75;
  const fxx = t < 1.3 ? lerp(560, 540, clamp01((t - 0.5) / 0.8)) : t < 2.1 ? 540 : lerp(540, 250, eio(clamp01((t - 2.1) / 0.8)));
  const fyy = t < 0.5 ? 640 : t < 1.3 ? lerp(640, 880, eio(clamp01((t - 0.5) / 0.8))) : t < 2.1 ? 880 : lerp(880, 1050, eio(clamp01((t - 2.1) / 0.8)));
  const ig = clamp01((t - 0.55) / 0.5);
  const toTri = interpolate(t, [2.95, 3.12], [0, 1], clamp);
  const arm = t < 0.5 ? 0.78 : t < 1.3 ? lerp(0.78, 0.9, clamp01((t - 0.5) / 0.8)) : 0.18 + 0.82 * u;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toTri}}>
        <Zoom z={zoom} fx={fxx} fy={fyy} cy={t < 0.5 ? 760 : 900}>
          <Floor />
          <Rig1 u={arm} t={t} both delt={ig} strain={arm > 0.85 ? 1 : 0} mood={t < 0.5 || (t > 1.3 && t < 2.1 && u > 0.5) ? 'strain' : 'smile'} />
        </Zoom>
        <div style={{position: 'absolute', left: 0, right: 0, top: 296, display: 'flex', justifyContent: 'center', transform: `scale(${t < 0.12 ? 1.3 - 0.3 * t / 0.12 : 1})`}}><BlackTag text="FULL SHOULDERS" size={40} /></div>
        {t >= 2.2 && <Pop at={2.2} style={{left: 70, top: 380}}><div style={{background: '#fff', border: '6px solid #17181C', borderRadius: 14, padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 84, color: '#17181C', boxShadow: '0 8px 0 rgba(0,0,0,.15)'}}>1 PULLEY</div></Pop>}
        {t >= 2.25 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Sparks p={[286, 1200]} t={t} n={12} spread={130} /></svg>}
      </div>
      {toTri > 0 && <div style={{position: 'absolute', inset: 0, opacity: toTri, background: '#ECECE8'}}><MBG /><Triangle2 x={540} y={760 + 14 * Math.sin(t * 3)} s={interpolate(t, [2.95, 3.4], [1.6, 2.6], {...clamp, easing: Easing.out(Easing.back(1.6))})} sway={Math.sin(t * 3) * 1.4 + Math.max(0, 14 - (t - 2.95) * 40)} /><svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Sparks p={[540, 776]} t={t} n={12} spread={150} /></svg><div style={{position: 'absolute', left: 0, right: 0, top: 1215, display: 'flex', justifyContent: 'center'}}><BlackTag text="THE CABLE ROW TRIANGLE" size={30} /></div></div>}
      {end > 0 && null}
    </AbsoluteFill>
  );
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/* ---- no dumbbells / no waiting ---- */
const Cross: React.FC<{x: number; y: number; w: number; at: number}> = ({x, y, w, at}) => {
  const t = useT(); const p = interpolate(t, [at, at + 0.18], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.5))}); if (t < at) return null;
  return <svg width={w} height={w} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y, transform: `scale(${1.5 - 0.5 * p})`, opacity: p}}><path d="M12 12 L88 88 M88 12 L12 88" stroke={G.red} strokeWidth={14} strokeLinecap="round" style={{filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.25))'}} /></svg>;
};
const Dumbbell: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 360}) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 200 110" style={{position: 'absolute', left: x, top: y}}>
    <rect x={56} y={46} width={88} height={18} rx={6} fill="#9AA0AA" stroke={OL} strokeWidth={5} /><rect x={12} y={14} width={34} height={82} rx={10} fill="#1C1D22" stroke={OL} strokeWidth={5} /><rect x={154} y={14} width={34} height={82} rx={10} fill="#1C1D22" stroke={OL} strokeWidth={5} /><rect x={40} y={26} width={18} height={58} rx={6} fill="#25272D" stroke={OL} strokeWidth={4} /><rect x={142} y={26} width={18} height={58} rx={6} fill="#25272D" stroke={OL} strokeWidth={4} />
  </svg>
);
const Stopwatch: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <svg width={260} height={300} viewBox="0 0 130 150" style={{position: 'absolute', left: x, top: y}}>
    <rect x={54} y={4} width={22} height={14} rx={4} fill="#17181C" /><rect x={96} y={20} width={14} height={12} rx={3} fill="#17181C" transform="rotate(40 100 26)" />
    <circle cx={65} cy={84} r={56} fill="#fff" stroke="#17181C" strokeWidth={9} />{Array.from({length: 12}).map((_, i) => <line key={i} x1={65 + Math.cos(i * Math.PI / 6) * 44} y1={84 + Math.sin(i * Math.PI / 6) * 44} x2={65 + Math.cos(i * Math.PI / 6) * 50} y2={84 + Math.sin(i * Math.PI / 6) * 50} stroke="#17181C" strokeWidth={3} />)}
    <line x1={65} y1={84} x2={65 + Math.cos(t * 5) * 38} y2={84 + Math.sin(t * 5) * 38} stroke={G.red} strokeWidth={5} strokeLinecap="round" /><circle cx={65} cy={84} r={5} fill="#17181C" />
  </svg>
);
const NoDumb: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Triangle2 x={540} y={560 + 6 * Math.sin(t * 3)} s={1.0} sway={Math.sin(t * 3)} />
      <Pop at={0.05} style={{left: 0, right: 0, top: 706, display: 'flex', justifyContent: 'center'}}><div style={{background: '#FFF6E0', color: '#C98A10', border: '4px solid #F6B93B', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 28, letterSpacing: 3, borderRadius: 999, padding: '4px 30px'}}>JUST THIS</div></Pop>
      <Pop at={0.4} style={{left: 0, top: 0}}><Dumbbell x={60} y={880} w={430} /></Pop>
      <Cross x={60} y={810} w={430} at={0.7} />
      <Pop at={0.95} style={{left: 90, top: 1160}}><RedTag text="NO DUMBBELLS" size={30} /></Pop>
      <Pop at={1.4} style={{left: 0, top: 0}}><Stopwatch x={680} y={860} t={t} /></Pop>
      <Cross x={640} y={810} w={340} at={1.7} />
      <Pop at={1.95} style={{left: 690, top: 1160}}><RedTag text="NO WAITING" size={30} /></Pop>
    </AbsoluteFill>
  );
};

/* ---- 4 cards + 3 x 12 ---- */
const CARDS: {n: number; label: string; pill: string; at: number; Mini: React.FC<{t: number}>}[] = [
  {n: 1, label: 'LATERAL RAISE', pill: 'SIDE', at: 0.15, Mini: ({t}) => <Rig1 u={rep(t, 1.6)} t={t} />},
  {n: 2, label: 'FACE PULL', pill: 'REAR', at: 0.95, Mini: ({t}) => <Rig2 u={rep(t, 1.6, 0.25)} t={t} />},
  {n: 3, label: 'FRONT RAISE', pill: 'FRONT', at: 1.75, Mini: ({t}) => <Rig3 u={rep(t, 1.6, 0.5)} t={t} />},
  {n: 4, label: 'REAR DELT FLY', pill: 'REAR', at: 2.55, Mini: ({t}) => <Rig4 phase="C" u={rep(t, 1.6, 0.75)} t={t} />},
];
const Grid: React.FC = () => {
  const t = useT(); const s3 = rel(3, B.grid[0]);
  const pos: V[] = [[40, 450], [560, 450], [40, 905], [560, 905]];
  return (
    <AbsoluteFill>
      {CARDS.map((c, i) => {
        const d = t - c.at; if (d < 0) return null;
        const p = interpolate(d, [0, 0.28], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
        const rot = (i % 2 ? 1 : -1) * (1 - p) * 8;
        const lit = d > 0.35 && d < 1.0;
        return (
          <div key={i} style={{position: 'absolute', left: pos[i][0], top: pos[i][1], width: 480, height: 430, transform: `translateY(${(1 - p) * 120}px) rotate(${rot}deg) scale(${0.85 + 0.15 * p})`, opacity: p, background: '#fff', border: '4px solid #2A2D35', borderRadius: 18, boxShadow: '0 10px 0 rgba(0,0,0,.13)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(-15px, -170px) scale(0.46)`}}><Floor /><c.Mini t={t} /></div>
            {lit && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, rgba(255,201,60,.45), transparent 60%)'}} />}
            <div style={{position: 'absolute', left: 14, bottom: 12, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '3px solid #2A2D35', borderRadius: 999, padding: '4px 16px 4px 6px', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 20, letterSpacing: 2}}><span style={{width: 30, height: 30, borderRadius: 15, background: G.red, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>{c.n}</span>{c.label}</div>
            {d > 0.4 && <div style={{position: 'absolute', left: 16, top: 12}}><DeltPill text={c.pill} active /></div>}
            {t > s3 + 0.5 && <div style={{position: 'absolute', right: 14, top: 12, background: '#fff', border: '3px solid #1E9E55', color: '#1E9E55', borderRadius: 10, padding: '2px 12px', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 24}}>3×12</div>}
          </div>
        );
      })}
      {t < 0.9 && <Pop at={0.0} style={{left: 360, top: 560}}><div style={{background: '#fff', border: '4px solid #2A2D35', borderRadius: 18, width: 300, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 340, color: G.red, transform: 'rotate(3deg)'}}>4</div></Pop>}
      {t > s3 && <Pop at={s3} style={{left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: '5px solid #17181C', borderRadius: 16, padding: '10px 40px 8px', textAlign: 'center', boxShadow: '0 10px 0 rgba(0,0,0,.18)'}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: G.red, lineHeight: 1}}>3 × 12</div><div style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 20, letterSpacing: 3, color: '#777'}}>SETS × REPS</div></div></Pop>}
    </AbsoluteFill>
  );
};

/* ---- the three heads: exploded blueprint ---- */
const HEADS = [
  {key: 'front', name: 'FRONT', sub: 'PRESS · FRONT RAISE', a0: -38, a1: 42, col: '#FFC93C', at: 0.9, lx: 800, ly: 900, tx: 720, ty: 830},
  {key: 'side', name: 'SIDE', sub: 'LATERAL RAISE', a0: -118, a1: -42, col: '#FF8A2A', at: 1.55, lx: 760, ly: 480, tx: 660, ty: 600},
  {key: 'rear', name: 'REAR', sub: 'FACE PULL · REAR FLY', a0: 140, a1: 222, col: '#FF5A6E', at: 2.2, lx: 150, ly: 760, tx: 380, ty: 800},
] as const;
const Blueprint: React.FC<{t: number; focus: number}> = ({t, focus}) => {
  const C = '#6CC4FF', cx = 540, cy = 790, R0 = 40, R1 = 250;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const wedge = (a0: number, a1: number, r0: number, r1: number) => {
    const p = (a: number, r: number) => `${cx + Math.cos((a * Math.PI) / 180) * r} ${cy + Math.sin((a * Math.PI) / 180) * r}`;
    return `M${p(a0, r0)} L${p(a0, r1)} A${r1} ${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0} ${r0} 0 0 0 ${p(a0, r0)}Z`;
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g style={{filter: 'drop-shadow(0 0 12px #3DA8FF)'}} stroke={C} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
          {/* head in profile facing right + spine + ribs + clavicle + scapula + humerus */}
          <path d="M440 330 Q440 220 540 214 Q650 214 656 306 Q666 340 692 372 Q676 384 662 382 L662 430 Q636 476 586 462 L548 462 L526 478" />
          <circle cx={596} cy={330} r={22} /><path d="M590 392 Q624 404 650 388" />
          <path d="M520 478 L520 1000" strokeWidth={16} />{Array.from({length: 10}).map((_, i) => <rect key={i} x={500} y={500 + i * 44} width={40} height={28} rx={9} fill="#0F2A55" strokeWidth={5} />)}
          {Array.from({length: 6}).map((_, i) => <path key={i} d={`M530 ${620 + i * 46} Q650 ${610 + i * 46} ${690 - i * 10} ${690 + i * 48}`} strokeWidth={6} />)}
          <path d="M520 600 Q420 600 350 690" strokeWidth={10} /><path d="M430 690 Q380 800 430 900 Q500 880 520 780" strokeWidth={7} />
          <circle cx={cx} cy={cy} r={34} fill="#DDF2FF" /><path d={`M${cx} ${cy} L${cx + 16} ${cy + 360}`} strokeWidth={22} /><circle cx={cx + 16} cy={cy + 366} r={24} fill="#DDF2FF" /><path d={`M${cx + 16} ${cy + 366} L${cx + 40} ${cy + 620}`} strokeWidth={15} />
        </g>
        {HEADS.map((h, i) => {
          const k = interpolate(t, [h.at, h.at + 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
          if (k <= 0) return null;
          const lit = focus === 0 ? 1 : focus === 1 ? (i === 0 ? 1 : 0.18) : 0.18;
          const amid = ((h.a0 + h.a1) / 2 * Math.PI) / 180, out = (focus >= 1 && i === 0 ? 30 : 14) * k;
          const gold = focus >= 1 && i === 0;
          return (
            <g key={h.key} transform={`translate(${Math.cos(amid) * out} ${Math.sin(amid) * out})`} opacity={lit}>
              <path d={wedge(h.a0, h.a1, R0, R1 * (0.35 + 0.65 * k))} fill={h.col} fillOpacity={gold ? 0.7 + 0.15 * pulse : 0.5} stroke={gold ? '#FFF2B8' : h.col} strokeWidth={gold ? 8 : 5} strokeLinejoin="round" style={{filter: gold ? `drop-shadow(0 0 ${16 + 14 * pulse}px #FFC93C)` : `drop-shadow(0 0 10px ${h.col})`}} />
              {Array.from({length: 7}).map((_, f) => { const a = ((h.a0 + ((h.a1 - h.a0) * (f + 0.5)) / 7) * Math.PI) / 180; return <line key={f} x1={cx + Math.cos(a) * (R0 + 6)} y1={cy + Math.sin(a) * (R0 + 6)} x2={cx + Math.cos(a) * R1 * (0.3 + 0.62 * k)} y2={cy + Math.sin(a) * R1 * (0.3 + 0.62 * k)} stroke="#fff" strokeWidth={3} opacity={0.55} />; })}
            </g>
          );
        })}
        {HEADS.map((h) => { const k = interpolate(t, [h.at + 0.2, h.at + 0.55], [0, 1], clamp); return k > 0 ? <g key={'l' + h.key}><line x1={h.lx} y1={h.ly + 40} x2={h.lx + (h.tx - h.lx) * k} y2={h.ly + 40 + (h.ty - h.ly - 40) * k} stroke="#fff" strokeWidth={4} opacity={0.8} /><circle cx={h.tx} cy={h.ty} r={9 * k} fill="#fff" /></g> : null; })}
      </svg>
      {HEADS.map((h, i) => (
        <Pop key={h.key} at={h.at + 0.15} style={{left: h.lx - 90, top: h.ly - 24, opacity: focus >= 1 && i > 0 ? 0.35 : 1}}>
          <div><BlackTag text={h.name} size={34} /><div style={{marginTop: 8, fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 18, letterSpacing: 2, color: '#BFE3FF'}}>{h.sub}</div></div>
        </Pop>
      ))}
    </div>
  );
};
const Blue: React.FC = () => {
  const t = useT(); const s5 = T(5) - B.blue[0];
  const reveal = interpolate(t, [0, 0.7], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const focus = t > s5 ? 1 : 0;
  const spin = interpolate(t, [2.2, 2.9], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#0B1E3F'}}>
      <BG dark />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, clipPath: `inset(${reveal * 100}% 0 0 0)`, background: '#ECECE8'}}><BG /><div style={{position: 'absolute', left: 300, top: 560, transform: 'scale(1.7)', transformOrigin: '0 0'}}><AlexF x={0} y={0} s={1.4} handL={[127, 382]} handR={[273, 382]} /></div></div>
      {reveal < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: reveal * 1920 - 4, height: 8, background: '#9BE2FF', boxShadow: '0 0 40px 10px rgba(80,200,255,.8)'}} />}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`}}><Blueprint t={t} focus={focus} /></div>
      {t > 0.6 && t < s5 && <Pop at={0.9} style={{left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: '5px solid #17181C', borderRadius: 12, padding: '4px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 80, color: '#17181C', transform: `scale(${1 + 0.06 * Math.sin(spin * 9)})`}}>3 PIECES</div></Pop>}
      {t > s5 && <Pop at={s5} style={{left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: '5px solid #17181C', borderRadius: 12, padding: '4px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: G.red}}>1 OF 3 GETS ALL THE LOVE</div></Pop>}
      {t > s5 + 0.3 && <Pop at={s5 + 0.3} style={{left: 90, top: 1010}}><RedTag text="MOST PEOPLE" size={28} /></Pop>}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>{t > s5 + 0.3 && <Arrow a={[330, 1030]} b={[690, 880]} color="#FFC93C" />}</svg>
    </AbsoluteFill>
  );
};

/* ---- press = mostly front ---- */
const Barbell: React.FC<{y: number; x0?: number; x1?: number}> = ({y, x0 = 60, x1 = 1020}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={OL} strokeWidth={22} strokeLinecap="round" /><line x1={x0} y1={y} x2={x1} y2={y} stroke="#A9AFBA" strokeWidth={12} strokeLinecap="round" />
    {[[x0 + 30, 64, 16], [x0 + 84, 52, 10], [x1 - 74, 52, 10], [x1 - 30 - 35, 64, 16]].map(([x, h, w], i) => <rect key={i} x={x} y={y - h} width={w * 2.2} height={h * 2} rx={8} fill={i % 3 === 0 ? '#2FA866' : '#25965A'} stroke={OL} strokeWidth={5} />)}
  </svg>
);
const Press: React.FC = () => {
  const t = useT(); const s = 1.3, fl = FLOOR;
  const u = rep(t, 1.35, 0.15);
  const x = 540 - 200 * s, y = fl - 572 * s, crouch = 0.9;
  const hl: V = lerpV([96, 232], [135, 62], u), hr: V = lerpV([304, 232], [265, 62], u);
  const g = frontGeom({x, y, s, handL: hl, handR: hr, crouch});
  const hipY = y + (380 + crouch * 62) * s;
  const lift = u * 86;
  return (
    <AbsoluteFill>
      <Floor />
      {/* machine: base, rails, backrest, weight stack */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <rect x={250} y={fl - 24} width={580} height={24} rx={8} fill="#3A3F4B" stroke={OL} strokeWidth={4} />
        <rect x={812} y={520} width={150} height={fl - 540} rx={8} fill="#4C5260" stroke={OL} strokeWidth={4} />
        {Array.from({length: 12}).map((_, i) => <rect key={i} x={822} y={560 + i * 56 - (i <= 6 ? lift * 0.6 : 0)} width={130} height={48} rx={6} fill="#2A2D35" stroke={OL} strokeWidth={3} />)}
        <rect x={822} y={560 + 6 * 56 + 22 - lift * 0.6} width={44} height={10} rx={4} fill="#F4C20D" stroke={OL} strokeWidth={2} />
        {[g.shL[0] - 150, g.shR[0] + 150].map((px, i) => <g key={i}><rect x={px - 16} y={380} width={32} height={hipY - 340} rx={8} fill="#4C5260" stroke={OL} strokeWidth={4} /></g>)}
        <rect x={g.shL[0] - 160} y={360} width={g.shR[0] - g.shL[0] + 320} height={38} rx={14} fill="#2F333D" stroke={OL} strokeWidth={4} />
        <rect x={540 - 110} y={g.shL[1] - 60} width={220} height={hipY - g.shL[1] + 90} rx={34} fill="#3A3F4B" stroke={OL} strokeWidth={5} />
        <rect x={540 - 190} y={hipY + 8} width={380} height={46} rx={20} fill="#2F333D" stroke={OL} strokeWidth={5} />
        <rect x={540 - 18} y={hipY + 54} width={36} height={fl - hipY - 78} fill="#4C5260" stroke={OL} strokeWidth={4} />
        {/* lever arms from the rails to the handles */}
        {[g.hL, g.hR].map((h, i) => { const px = i ? g.shR[0] + 150 : g.shL[0] - 150; return <g key={i}><line x1={px} y1={h[1] - 6} x2={h[0]} y2={h[1] - 6} stroke={OL} strokeWidth={22} strokeLinecap="round" /><line x1={px} y1={h[1] - 6} x2={h[0]} y2={h[1] - 6} stroke="#6B7180" strokeWidth={12} strokeLinecap="round" /></g>; })}
      </svg>
      <AlexF x={x} y={y} s={s} handL={hl} handR={hr} crouch={crouch} mood={u > 0.5 ? 'strain' : 'flat'} fists />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltCap p={g.shL} q={g.eL} s={s} act={0.5 + 0.5 * u} t={t} /><DeltCap p={g.shR} q={g.eR} s={s} act={0.5 + 0.5 * u} t={t} />
        {[g.hL, g.hR].map((h, i) => <g key={i}><rect x={h[0] - 44} y={h[1] - 13} width={88} height={26} rx={12} fill="#1C1D22" stroke={OL} strokeWidth={4} /><Grip p={h} ang={0} s={0.62} thumb={i ? -1 : 1} /></g>)}
        {u > 0.8 && <Sparks p={[540, g.hL[1] - 30]} t={t} n={8} />}
      </svg>
      <Pop at={0.05} style={{left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}><BlackTag text="SEATED SHOULDER PRESS" size={28} /></Pop>
      <Pop at={0.3} style={{left: 0, right: 0, top: 510, display: 'flex', justifyContent: 'center'}}><RedTag text="PRESS = MOSTLY FRONT" size={32} /></Pop>
    </AbsoluteFill>
  );
};

/* ---- exercise scenes ---- */
const ExFrame: React.FC<{n: number; tag: string; pills: [boolean, boolean, boolean]; active?: number; banner?: boolean; children: React.ReactNode}> = ({n, tag, pills, active, banner, children}) => (
  <AbsoluteFill>
    <Floor />
    {children}
    <PillRow done={pills} active={active} />
    <div style={{position: 'absolute', left: 40, top: 410}}><Badge n={n} /></div>
    <Pop at={0.05} style={{left: 150, right: 0, top: 420, display: 'flex', justifyContent: 'center'}}><BlackTag text={tag} size={28} /></Pop>
    {banner && <Pop at={0.1} style={{left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center'}}><BlackTag text="COMMENT “ROUTINE” AND I’LL SEND THE GUIDE" size={20} /></Pop>}
  </AbsoluteFill>
);
const Ex1: React.FC = () => {
  const t = useT(), s0 = B.ex1[0];
  const a7 = rel(7, s0), a8 = rel(8, s0);
  // phases: rest (0..a7+1.15) | pulley zoom | grip zoom | raise (slow) | reps with tension
  const zP = interpolate(t, [a7 + 0.1, a7 + 0.5, a7 + 1.15, a7 + 1.45], [1, 2.3, 2.3, 2.1], {...clamp, easing: eio});
  const toG = interpolate(t, [a7 + 1.15, a7 + 1.45], [0, 1], clamp);
  const zOut = interpolate(t, [a7 + 2.7, a7 + 3.2], [1, 0], {...clamp, easing: eio});
  let z = 1, fx = 540, fy = 900, cy = 900;
  if (t >= a7 + 0.1 && t < a7 + 1.15) { z = zP; fx = 286; fy = 1180; cy = 1000; }
  else if (t >= a7 + 1.15 && t < a7 + 3.2) { z = lerp(1, 2.1, zOut + 0 * toG); fx = lerp(540, 740, zOut); fy = lerp(900, 1040, zOut); cy = lerp(900, 1000, zOut); }
  else if (t >= a7 + 3.2) { z = 1 + 0.12 * Math.min(1, (t - a7 - 3.2) / 4.5); fx = 600; fy = 880; cy = 900; }
  const raise = interpolate(t, [a7 + 3.0, a7 + 4.5], [0, 1], {...clamp, easing: eio});
  const reps = t >= a8 ? rep(t - a8, 1.25) : raise;
  const u = t < a7 + 1.6 ? 0 : reps;
  const done = t > a8 + 4.4;
  const grip = t >= a7 + 1.15 && t < a7 + 3.0;
  return (
    <ExFrame n={1} tag="LATERAL RAISE" pills={[false, done, false]} active={done ? -1 : 1}>
      <Zoom z={z} fx={fx} fy={fy} cy={cy}><Rig1 u={u} t={t} strain={grip ? 0.8 : u > 0.85 ? 1 : 0} arrow={t > a8 + 0.2 && t < a8 + 2.2} /></Zoom>
      {t >= a8 - 0.4 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Inset x={925} y={725} r={105} act={u} t={t} label="SIDE DELT" /></svg>}
      {t >= a7 + 0.5 && t < a7 + 1.4 && <Pop at={a7 + 0.5} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><BlackTag text="LOW PULLEY" size={28} /></Pop>}
      {t >= a7 + 1.4 && t < a7 + 3.0 && <Pop at={a7 + 1.4} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><BlackTag text="ONE SIDE OF THE TRIANGLE" size={26} /></Pop>}
      {t >= a7 + 3.3 && t < a8 && <Pop at={a7 + 3.3} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><RedTag text="UP TO SHOULDER HEIGHT" size={26} /></Pop>}
      {t >= a8 + 0.1 && t < a8 + 2.3 && <Pop at={a8 + 0.1} style={{left: 420, top: 1180}}><RedTag text="PULLS FROM BELOW" size={24} /></Pop>}
      {t >= a8 + 2.4 && <Pop at={a8 + 2.4} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><div style={{background: '#FFF1D6', color: '#C98A10', border: '4px solid #F6B93B', borderRadius: 14, fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 40, letterSpacing: 3, padding: '6px 28px', boxShadow: '0 0 36px rgba(246,185,59,.8)'}}>FROM CM 1</div></Pop>}
    </ExFrame>
  );
};
const Ex2: React.FC = () => {
  const t = useT(), s0 = B.ex2[0];
  const a10 = rel(10, s0);
  const back = t >= a10 + 2.15;
  const zH = interpolate(t, [a10 + 0.5, a10 + 0.8, a10 + 1.7, a10 + 2.1], [1, 1.75, 1.75, 1], {...clamp, easing: eio});
  const u = back ? 0 : t < a10 ? 0.2 + 0.8 * tri(Math.min(1, t / 2.4)) * 0 + 0.1 : rep(t - a10, 1.15, 0.0);
  const bu = interpolate(t, [a10 + 2.15, a10 + 2.6], [0, 1], {...clamp, easing: eo});
  return (
    <ExFrame n={2} tag="FACE PULL" pills={[false, true, back && t > a10 + 3.3]} active={2}>
      {!back && <Zoom z={zH} fx={t < a10 + 0.5 ? 540 : 610} fy={t < a10 + 0.5 ? 880 : 740} cy={880}><Rig2 u={Math.max(0.1, u)} t={t} strain={zH > 1.5 ? 0.8 : u > 0.85 ? 1 : 0} /></Zoom>}
      {back && <BackElbows t={t - (a10 + 2.15)} u={bu} />}
      {t >= a10 - 0.3 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Inset x={925} y={725} r={105} act={back ? bu : Math.max(0.1, u)} t={t} label="REAR DELT" /></svg>}
      {!back && t >= a10 && t < a10 + 0.6 && <Pop at={a10} style={{left: 560, top: 560}}><RedTag text="EYE LEVEL" size={24} /></Pop>}
      {!back && t >= a10 + 0.8 && t < a10 + 1.9 && <Pop at={a10 + 0.8} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><BlackTag text="BOTH HANDS" size={30} /></Pop>}
      {back && <Pop at={a10 + 2.3} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><RedTag text="ELBOWS OUT WIDE" size={28} /></Pop>}
    </ExFrame>
  );
};
/** Back view: hands by the ears, elbows flaring out with red arrows, rear/side delts glowing. */
const BackElbows: React.FC<{t: number; u: number}> = ({t, u}) => {
  const s = 1.4, x = 340, y = FLOOR - 572 * s;
  const handL: V = lerpV([140, 300], [124, 176], u), handR: V = lerpV([260, 300], [276, 176], u);
  const g = frontGeom({x, y, s, handL, handR});
  const head = g.P([200, 140]);
  return (
    <>
      <AlexF x={x} y={y} s={s} handL={handL} handR={handR} fists mood="flat" />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <BackHead head={head} s={s} />
        <DeltCap p={g.shL} q={g.eL} s={s} act={u} t={t} rear /><DeltCap p={g.shR} q={g.eR} s={s} act={u} t={t} rear />
        <Arrow a={[g.eL[0] + 20, g.eL[1]]} b={[g.eL[0] - 140 - 30 * Math.sin(t * 6), g.eL[1]]} /><Arrow a={[g.eR[0] - 20, g.eR[1]]} b={[g.eR[0] + 140 + 30 * Math.sin(t * 6), g.eR[1]]} />
      </svg>
    </>
  );
};
const Ex3: React.FC = () => {
  const t = useT();
  const z = interpolate(t, [0.2, 0.55, 1.2, 1.6], [1, 1.65, 1.65, 1], {...clamp, easing: eio});
  const u = t < 1.6 ? 0.2 + 0.8 * interpolate(t, [0.2, 1.6], [0, 1], clamp) : 0.55 + 0.45 * rep(t - 1.6, 1.1);
  const done = t > 2.6;
  return (
    <ExFrame n={3} tag="FRONT RAISE" pills={[done, true, true]} active={done ? -1 : 0}>
      <Zoom z={z} fx={t < 0.2 ? 540 : 690} fy={t < 0.2 ? 880 : 730} cy={870}><Rig3 u={u} t={t} strain={z > 1.5 ? 0.9 : u > 0.9 ? 1 : 0} /></Zoom>
      {t > 0.2 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Inset x={925} y={725} r={105} act={u} t={t} label="FRONT DELT" /></svg>}
      {t > 0.3 && t < 1.3 && <Pop at={0.3} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><BlackTag text="BOTH HANDS" size={30} /></Pop>}
      {t > 1.5 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><line x1={760} y1={650} x2={1040} y2={650} stroke={G.red} strokeWidth={5} strokeDasharray="14 12" /></svg>}
      {t > 1.5 && <Pop at={1.5} style={{left: 780, top: 580}}><RedTag text="TO EYE LEVEL" size={24} /></Pop>}
    </ExFrame>
  );
};
const Ex4: React.FC = () => {
  const t = useT();
  const phase: 'A' | 'B' | 'C' = t < 1.7 ? 'A' : t < 3.3 ? 'B' : 'C';
  const u = phase === 'A' ? 0 : phase === 'B' ? interpolate(t, [1.9, 2.9], [0, 1], {...clamp, easing: eio}) : rep(t - 3.3, 1.15, 0.0) * 0.8 + 0.2;
  return (
    <ExFrame n={4} tag="REAR DELT FLY" pills={[true, true, phase === 'C' && t > 5.0]} active={phase === 'C' ? 2 : -1}>
      <Rig4 phase={phase} u={u} t={t} strain={phase === 'B' ? 0.9 : phase === 'C' && u > 0.8 ? 1 : 0} />
      {phase === 'C' && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Inset x={925} y={725} r={105} act={u} t={t} label="REAR DELT" /></svg>}
      {phase === 'A' && <><Pop at={0.2} style={{left: 640, top: 660}}><RedTag text="SIDE-ON" size={28} /></Pop><svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Arrow a={[760, 760]} b={[890, 760]} /></svg></>}
      {phase === 'B' && <Pop at={1.75} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><BlackTag text="ARM ACROSS THE FRONT" size={26} /></Pop>}
      {phase === 'C' && <Pop at={3.4} style={{left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center'}}><RedTag text="OPEN IT OUT BEHIND YOU" size={26} /></Pop>}
    </ExFrame>
  );
};

/* ---- summary + comparison + guide + outro ---- */
const Sum: React.FC = () => {
  const t = useT(); const s = 1.4, x = 340, y = FLOOR - 572 * s;
  const sway = Math.sin(t * 3) * 0.04;
  const hl: V = [118 - 6 * sway, 382], hr: V = [282, 382];
  const g = frontGeom({x, y, s, handL: hl, handR: hr});
  const k = interpolate(t, [0, 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Floor />
      <AlexF x={x} y={y} s={s} handL={hl} handR={hr} mood="smile" />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltCap p={g.shL} q={g.eL} s={s} act={k} t={t} /><DeltCap p={g.shR} q={g.eR} s={s} act={k} t={t} />
        {[g.shL, g.shR].map((p, i) => <circle key={i} cx={p[0] + (i ? 20 : -20)} cy={p[1] + 10} r={(120 + 8 * Math.sin(t * 5)) * 1} fill="none" stroke="#C98A4A" strokeWidth={5} opacity={0.8 * k} />)}
      </svg>
      <PillRow done={[t > 0.1, t > 0.55, t > 1.0]} />
    </AbsoluteFill>
  );
};
const DanielF: React.FC<{x: number; y: number; s: number; handL: V; handR: V; mood?: 'smile' | 'flat' | 'worry' | 'strain'; blink?: number}> = ({x, y, s, handL, handR, mood, blink}) => (
  <FrontPerson shirt={ORANGE} hair="short" phones={false} mood={mood} s={s} x={x} y={y} handL={handL} handR={handR} fists blink={blink} />
);
const Mate: React.FC = () => {
  const t = useT(); const s = 1.05, fl = 1180, y = fl - 572 * s;
  const press = tri(t * 0.45 % 1);
  const dl: V = lerpV([127, 330], [124, 214], 0.2 + 0.2 * press), dr: V = lerpV([273, 330], [276, 214], 0.2 + 0.2 * press);
  const gD = frontGeom({x: 560, y, s, handL: dl, handR: dr});
  const gA = frontGeom({x: 20, y, s, handL: [127, 382], handR: [273, 382]});
  const bar = gD.hL[1] - 6;
  return (
    <AbsoluteFill>
      <Floor y={fl} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={gA.shL[0] + 10} cy={gA.shL[1] + 20} r={150} fill="url(#goldGlow)" /><circle cx={gA.shR[0] - 10} cy={gA.shR[1] + 20} r={150} fill="url(#goldGlow)" />
      </svg>
      <AlexF x={20} y={y} s={s} handL={[127, 382]} handR={[273, 382]} mood="smile" />
      <DanielF x={560} y={y} s={s} handL={dl} handR={dr} mood="smile" />
      <Barbell y={bar} x0={470} x1={1070} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DeltCap p={gA.shL} q={gA.eL} s={s} act={1} t={t} /><DeltCap p={gA.shR} q={gA.eR} s={s} act={1} t={t} />
        <DeltCap p={gD.shL} q={gD.eL} s={s} act={0.9} t={t} /><DeltCap p={gD.shR} q={gD.eR} s={s} act={0.9} t={t} />
      </svg>
      <Pop at={0.7} style={{left: 100, top: 600}}><div style={{background: '#fff', border: '4px solid #1E9E55', color: '#1E9E55', fontFamily: FONT, fontWeight: 900, fontSize: 60, padding: '4px 20px', borderRadius: 12}}>3 OF 3</div></Pop>
      <Pop at={1.1} style={{left: 700, top: 600}}><div style={{background: '#fff', border: '4px solid #D83A34', color: '#D83A34', fontFamily: FONT, fontWeight: 900, fontSize: 60, padding: '4px 20px', borderRadius: 12}}>1 OF 3</div></Pop>
      {t > 1.7 && <Pop at={1.7} style={{left: 300, top: 470}}><div style={{border: '8px solid #D83A34', color: '#D83A34', fontFamily: FONT, fontWeight: 900, fontSize: 96, padding: '0 34px', borderRadius: 10, transform: 'rotate(-6deg)', letterSpacing: 3, background: 'rgba(255,255,255,.85)'}}>BUSTED</div></Pop>}
    </AbsoluteFill>
  );
};
/* ---- twelve weeks: how the shoulders would fill out (illustrative) ---- */
const Grow: React.FC = () => {
  const t = useT(), s0 = B.grow[0];
  const w = (i: number) => rel(i, s0);
  const s = 1.5, x = 540 - 200 * s, y = FLOOR - 572 * s;
  const vt = interpolate(t, [w(17) - 0.3, w(17) + 1.6, w(18) + 1.8, w(19) + 2.2], [0, 0.05, 0.11, 0.19], {...clamp, easing: eio});
  const week = Math.round(interpolate(t, [w(17), w(17) + 0.8, w(18), w(18) + 0.8, w(19), w(19) + 0.8], [0, 4, 4, 8, 8, 12], clamp));
  const lifting = t >= w(16) && t < w(17) + 0.2;
  const k = lifting ? rep(t - w(16), 1.1) : 0;
  const phi = (lerp(14, 90, k) * Math.PI) / 180;
  const flex = t >= w(19) + 0.8 && t < w(20);
  const fl = interpolate(t, [w(19) + 0.8, w(19) + 1.4], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const idleL: V = [118, 378], idleR: V = [282, 378];
  const hl: V = flex ? lerpV(idleL, [128, 142], fl) : lifting ? [140 - 155 * Math.sin(phi), 226 + 155 * Math.cos(phi)] : idleL;
  const hr: V = flex ? lerpV(idleR, [272, 142], fl) : lifting ? [260 + 155 * Math.sin(phi), 226 + 155 * Math.cos(phi)] : idleR;
  const capAct = t < w(16) ? 0 : lifting ? 0.35 + 0.65 * k : t < w(19) + 2 ? 0.55 : 0.9;
  const sc = 1 + vt * 2.6;
  const sh = (sd: number): V => [x + (200 + sd * 60 * (1 + vt)) * s, y + 226 * s];
  const stage = t < w(17) ? 0 : t < w(18) ? 1 : t < w(19) ? 2 : 3;
  const geo = (hand: V, sd: number) => { const S = sh(sd); const e: V = flex ? [S[0] + sd * 70 * s * 0.8, S[1] + 4 * s] : lifting ? [S[0] + (hand[0] - 200 - sd * 60) * s * 0.52 * 0 + 0, S[1] + 0] : [S[0], S[1] + 80 * s]; return {S, e}; };
  const L = geo(hl, -1), R = geo(hr, 1);
  const qL: V = flex ? [L.S[0] - 80, L.S[1] + 6] : lifting ? [L.S[0] - 80 * Math.sin(phi) - 0.1, L.S[1] + 80 * Math.cos(phi)] : [L.S[0] - 6, L.S[1] + 80];
  const qR: V = flex ? [R.S[0] + 80, R.S[1] + 6] : lifting ? [R.S[0] + 80 * Math.sin(phi), R.S[1] + 80 * Math.cos(phi)] : [R.S[0] + 6, R.S[1] + 80];
  const edgeL = x + (200 - (60 * (1 + vt) + 46)) * s, edgeR = x + (200 + (60 * (1 + vt) + 46)) * s;
  const showWidth = t >= w(18) - 0.1 && t < w(20);
  const compare = t >= w(20);
  const tops = [0.08, 0.15, 0.22];
  return (
    <AbsoluteFill>
      <Floor />
      {!compare && <>
        <AlexF x={x} y={y} s={s} handL={hl} handR={hr} fists={lifting || flex} straight={lifting ? 'B' : undefined} vtaper={vt} bicep={flex ? fl : 0} mood={flex ? 'smile' : lifting ? 'strain' : 'flat'} />
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <DeltCap p={L.S} q={qL} s={s * sc} act={capAct} t={t} /><DeltCap p={R.S} q={qR} s={s * sc} act={capAct} t={t} />
          {showWidth && <g><line x1={edgeL} y1={y + 150 * s} x2={edgeL} y2={y + 250 * s} stroke={G.red} strokeWidth={4} strokeDasharray="10 8" /><line x1={edgeR} y1={y + 150 * s} x2={edgeR} y2={y + 250 * s} stroke={G.red} strokeWidth={4} strokeDasharray="10 8" /><Arrow a={[540 - 10, y + 150 * s]} b={[edgeL, y + 150 * s]} /><Arrow a={[540 + 10, y + 150 * s]} b={[edgeR, y + 150 * s]} /></g>}
          {t >= w(19) + 0.6 && t < w(20) && <polygon points={`${edgeL},${y + 232 * s} ${edgeR},${y + 232 * s} ${540 + 52 * s},${y + 374 * s} ${540 - 52 * s},${y + 374 * s}`} fill="rgba(246,185,59,.18)" stroke={GOLD} strokeWidth={5} strokeDasharray="14 10" />}
        </svg>
      </>}
      {t < w(16) && <Pop at={0.05} style={{left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: '5px solid #17181C', borderRadius: 18, padding: '8px 40px', fontFamily: FONT, fontWeight: 900, fontSize: 76, color: '#17181C', boxShadow: '0 10px 0 rgba(0,0,0,.15)'}}>12 WEEKS</div></Pop>}
      {t >= w(16) && !compare && <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 24}}>
        {['FRONT', 'SIDE', 'REAR'].map((n, i) => <Pop key={n} at={w(16) + 0.3 + i * 0.5} style={{position: 'relative'}}><DeltPill text={n} done={t > w(16) + 1.4 + i * 0.7} active /></Pop>)}
        {t > w(16) + 2.6 && <Pop at={w(16) + 2.6} style={{position: 'relative'}}><BlackTag text="2× A WEEK" size={22} /></Pop>}
      </div>}
      {t >= w(17) - 0.05 && !compare && <Pop at={w(17)} style={{left: 60, top: 500}}><div style={{background: '#fff', border: '5px solid #17181C', borderRadius: 16, padding: '4px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#17181C', boxShadow: '0 8px 0 rgba(0,0,0,.15)'}}>WEEK {week}</div></Pop>}
      {showWidth && !compare && <Pop at={w(18) + 0.2} style={{right: 60, top: 500}}><RedTag text="WIDER ↔" size={30} /></Pop>}
      {t >= w(19) + 0.6 && t < w(20) && <Pop at={w(19) + 0.6} style={{right: 60, top: 580}}><BlackTag text="V-TAPER" size={30} /></Pop>}
      {compare && <>
        <Pop at={w(20) + 0.1} style={{left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center'}}><BlackTag text="EVERYONE GROWS DIFFERENTLY" size={26} /></Pop>
        {tops.map((v, i) => { const s2 = 0.82, x2 = 40 + i * 340, y2 = FLOOR - 572 * s2; return (
          <React.Fragment key={i}>
            <Pop at={w(20) + 0.3 + i * 0.35} style={{left: 0, top: 0}}><AlexF x={x2} y={y2} s={s2} handL={[118, 378]} handR={[282, 378]} vtaper={v} mood="smile" /></Pop>
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><DeltCap p={[x2 + (140 - 60 * v) * s2 + 24 * s2, y2 + 226 * s2]} q={[x2 + (140 - 60 * v) * s2 + 24 * s2, y2 + 226 * s2 + 70]} s={s2 * (1 + v * 2.6)} act={0.55 + 0.1 * i} t={t} /></svg>
          </React.Fragment>); })}
        {/* progressive overload: bars stepping up */}
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[0, 1, 2, 3, 4].map((i) => { const k2 = interpolate(t, [w(20) + 1.6 + i * 0.25, w(20) + 2.0 + i * 0.25], [0, 1], clamp); return <rect key={i} x={250 + i * 120} y={700 - (60 + i * 40) * k2} width={90} height={(60 + i * 40) * k2} rx={10} fill={GOLD} stroke={OL} strokeWidth={4} />; })}
          <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#17181C" letterSpacing={3}>STEADY PROGRESS ↑</text>
        </svg>
      </>}
      <SrcLine text="Illustrative · results vary" top={1318} />
    </AbsoluteFill>
  );
};
const End: React.FC = () => {
  const t = useT(); const s = 1.5, x = 540 - 200 * s, y = FLOOR - 572 * s;
  const lit = Math.floor(t * 1.8) % 3;
  const bob = Math.abs(Math.sin(t * 5)) * 20;
  return (
    <AbsoluteFill>
      <Floor />
      <div style={{transform: `translateY(${-bob}px)`}}><AlexF x={x} y={y} s={s} handL={[118, 378]} handR={[290, 262]} point mood="smile" vtaper={0.19} straight="R" /></div>
      <PillRow done={[false, false, false]} active={lit} />
      <Pop at={0.1} style={{left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: '6px solid #17181C', borderRadius: 18, padding: '10px 36px', fontFamily: FONT, fontWeight: 900, fontSize: 62, color: '#17181C', boxShadow: '0 10px 0 rgba(0,0,0,.15)', transform: 'rotate(-2deg)'}}>WHICH HEAD?</div></Pop>
    </AbsoluteFill>
  );
};

const SrcLine: React.FC<{text: string; top?: number}> = ({text, top = 1262}) => <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 22, letterSpacing: 2, color: '#8A8A86'}}>{text}</div>;

/* ---------------- captions (same black bars) ---------------- */
type Card = {t0: number; t1: number; words: {w: string; a: number}[]};
const cards: Card[] = [];
for (const sg of sec) {
  const w = sg.text.split(' '); const n = w.length; const k = Math.ceil(n / 4); const size = Math.ceil(n / k);
  const chunks: string[][] = []; for (let i = 0; i < n; i += size) chunks.push(w.slice(i, i + size));
  const tot = chunks.reduce((s2, c) => s2 + c.join(' ').length + 1, 0); let tt = sg.start;
  for (const c of chunks) {
    const d = ((sg.end - sg.start) * (c.join(' ').length + 1)) / tot; const L = c.reduce((s2, x) => s2 + x.length + 1, 0); let acc = tt;
    cards.push({t0: tt, t1: tt + d, words: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st}; })}); tt += d;
  }
}
const SubsBar: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const c = cards.find((x) => s >= x.t0 && s < x.t1 + 0.04);
  if (!c || s > sec[21].end + 0.4) return null;
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top: 1400, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', borderRadius: 16, padding: '10px 28px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 56, letterSpacing: -1, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,.18)'}}>
        {c.words.map((x, i) => <span key={i} style={{color: s >= x.a - 0.02 ? '#fff' : '#7d7d7d', marginRight: i < c.words.length - 1 ? 16 : 0}}>{x.w}</span>)}
      </div>
    </div>
  );
};

const MBG: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: G.bg, backgroundImage: `linear-gradient(${G.grid} 1px, transparent 1px), linear-gradient(90deg, ${G.grid} 1px, transparent 1px)`, backgroundSize: '60px 60px', backgroundPosition: `${-t * 24}px ${-t * 14}px`}} />;
};
const Drift: React.FC<{len: number; k: number; children: React.ReactNode}> = ({len, k, children}) => {
  const t = useT();
  return <AbsoluteFill style={{transform: `scale(${1 + 0.045 * Math.min(1, t / len)}) rotate(${Math.sin(t * 0.8 + k) * 0.3}deg)`}}>{children}</AbsoluteFill>;
};
/** Quick diagonal bar that sweeps across at every cut. */
const Slash: React.FC<{k: number}> = ({k}) => {
  const t = useT(), p = t / 0.34; if (p >= 1) return null;
  const x = interpolate(p, [0, 1], [-640, 1220], {easing: Easing.inOut(Easing.quad)}), left = k % 2 ? x : 1080 - x - 560;
  return <div style={{position: 'absolute', left, top: -40, width: 560, height: 2000, transform: 'skewX(-14deg)', background: 'linear-gradient(90deg, #17181C 0 12%, #F6B93B 12% 88%, #17181C 88%)', opacity: 0.95, pointerEvents: 'none'}} />;
};
const SC: React.FC<{k: BK; children: React.ReactNode; hits?: number[]; dark?: boolean; noHeader?: boolean; bg?: boolean; noSlash?: boolean}> = ({k, children, hits = [0], dark, noHeader, bg = true, noSlash}) => {
  const from = Math.round(B[k][0] * FPS), len = Math.round(B[k][1] * FPS) - from, idx = Object.keys(B).indexOf(k);
  return (
    <Sequence from={from} durationInFrames={len}>
      <AbsoluteFill>
        <Impact at={hits}>
          {bg && !dark && <MBG />}
          <Drift len={len / FPS} k={idx}>{children}</Drift>
          {!noHeader && <Header dark={dark} />}
          {!noSlash && <Slash k={idx} />}
        </Impact>
      </AbsoluteFill>
    </Sequence>
  );
};
export const ShouldersUK: React.FC = () => (
  <AbsoluteFill style={{background: G.bg}}>
    <GoldDefs />
    <SC k="hook" hits={[0.02, 2.0, 3.0]} noSlash><Hook /></SC>
    <SC k="nodumb" hits={[0.7, 1.7]}><NoDumb /></SC>
    <SC k="grid" hits={[0.15, rel(3, B.grid[0])]}><Grid /></SC>
    <SC k="blue" dark hits={[0.05]}><Blue /></SC>
    <SC k="press" hits={[0.05]}><Press /></SC>
    <SC k="ex1" hits={[0.0, rel(8, B.ex1[0]) + 2.4]}><Ex1 /></SC>
    <SC k="ex2" hits={[0.0]}><Ex2 /></SC>
    <SC k="ex3" hits={[0.0]}><Ex3 /></SC>
    <SC k="ex4" hits={[0.0, 1.7, 3.3]}><Ex4 /></SC>
    <SC k="sum" hits={[0.0]}><Sum /></SC>
    <SC k="mate" hits={[0.0, 1.7]}><Mate /></SC>
    <SC k="grow" hits={[0.0, rel(17, B.grow[0]), rel(18, B.grow[0]), rel(19, B.grow[0]), rel(20, B.grow[0])]}><Grow /></SC>
    <SC k="end" hits={[0.0]}><End /></SC>
    <SubsBar />
    <Audio src={staticFile('audio/shoulders_voice.wav')} />
    <Audio src={staticFile('audio/gym_music.wav')} loop volume={(f) => 0.11 * interpolate(f, [0, 10, SHOULDERS_TOTAL - 50, SHOULDERS_TOTAL], [0, 1, 1, 0], clamp)} />
    <Audio src={staticFile('audio/shoulders_sfx.wav')} volume={0.28} />
  </AbsoluteFill>
);
export const SHOULDERS_BOUNDS = B;
export const _unused = [random, GOLD, GOLD_D, DeltSide, Cable];
