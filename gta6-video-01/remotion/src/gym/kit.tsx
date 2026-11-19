import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const G = {
  bg: '#E9E9E6', grid: '#D8D8D4', ink: '#17181C', blue: '#2F7BF2', orange: '#F28A1E', skin: '#F0B48C', skinD: '#D29467',
  shorts: '#262B36', cap: '#D9453F', green: '#22A861', red: '#E5383B', yellow: '#FFC93C', grey: '#8A8A86', white: '#FFFFFF',
};
export const FONT = 'Montserrat, "DejaVu Sans", sans-serif';
export type V = [number, number];

/** Two-bone IK: returns the middle joint (knee/elbow). bend=+1 puts it on the "forward-up" side for a limb pointing down-right. */
const ik = (a: V, b: V, l1: number, l2: number, bend: 1 | -1): V => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let d = Math.hypot(dx, dy) || 1;
  const dd = Math.min(d, l1 + l2 - 0.5);
  const x = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(l1 * l1 - x * x, 0));
  const ux = dx / d, uy = dy / d;
  const px = bend === 1 ? uy : -uy, py = bend === 1 ? -ux : ux;
  return [a[0] + ux * x + px * h, a[1] + uy * x + py * h];
};
export type Pose = {hip: V; sh: V; head: V; handL: V; handR: V; footL: V; footR: V; legBend?: 1 | -1; armBend?: 1 | -1};
export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const m = (p: V, q: V): V => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  return {hip: m(a.hip, b.hip), sh: m(a.sh, b.sh), head: m(a.head, b.head), handL: m(a.handL, b.handL), handR: m(a.handR, b.handR), footL: m(a.footL, b.footL), footR: m(a.footR, b.footR), legBend: a.legBend, armBend: a.armBend};
};
export const POSES = {
  sit: {hip: [140, 330], sh: [146, 188], head: [152, 134], handL: [212, 240], handR: [222, 246], footL: [262, 438], footR: [250, 442], legBend: 1, armBend: -1} as Pose,
  stand: {hip: [200, 365], sh: [200, 215], head: [204, 160], handL: [182, 345], handR: [216, 345], footL: [185, 565], footR: [220, 565], legBend: 1, armBend: -1} as Pose,
  squatUp: {hip: [190, 365], sh: [205, 218], head: [212, 164], handL: [216, 190], handR: [226, 196], footL: [180, 565], footR: [215, 565], legBend: 1, armBend: -1} as Pose,
  squatDown: {hip: [140, 462], sh: [195, 330], head: [215, 280], handL: [208, 304], handR: [218, 310], footL: [185, 565], footR: [222, 565], legBend: 1, armBend: -1} as Pose,
  flex: {hip: [200, 365], sh: [200, 215], head: [200, 158], handL: [100, 120], handR: [300, 120], footL: [170, 565], footR: [232, 565], legBend: 1, armBend: -1} as Pose,
  hold: {hip: [200, 365], sh: [200, 215], head: [208, 160], handL: [262, 262], handR: [270, 270], footL: [182, 565], footR: [218, 565], legBend: 1, armBend: -1} as Pose,
  point: {hip: [200, 365], sh: [200, 215], head: [208, 160], handL: [262, 262], handR: [330, 200], footL: [182, 565], footR: [218, 565], legBend: 1, armBend: -1} as Pose,
};

type PersonProps = {pose: Pose; shirt?: string; cap?: boolean; beard?: boolean; flip?: boolean; x?: number; y?: number; s?: number; mood?: 'smile' | 'flat' | 'worry'; phone?: boolean; stopwatch?: boolean; opacity?: number; rot?: number; glowThigh?: number; thighColor?: string};
const Limb: React.FC<{a: V; b: V; w: number; c: string}> = ({a, b, w, c}) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />;
/** Flat-illustration athlete built from IK limbs, drawn in a 400x600 box. */
export const Person: React.FC<PersonProps> = ({pose, shirt = G.blue, cap = false, beard = false, flip = false, x = 0, y = 0, s = 1, mood = 'flat', phone = false, stopwatch = false, opacity = 1, rot = 0, glowThigh = 0, thighColor = G.green}) => {
  const lb = pose.legBend ?? 1, ab = pose.armBend ?? -1;
  const kneeL = ik(pose.hip, pose.footL, 100, 100, lb), kneeR = ik(pose.hip, pose.footR, 100, 100, lb);
  const elbL = ik(pose.sh, pose.handL, 72, 66, ab), elbR = ik(pose.sh, pose.handR, 72, 66, ab);
  const h = pose.head;
  return (
    <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity, transform: `${flip ? 'scaleX(-1)' : ''} rotate(${rot}deg)`}}>
      {/* far limbs */}
      <Limb a={pose.hip} b={kneeR} w={50} c={G.shorts} /><Limb a={kneeR} b={pose.footR} w={30} c={G.skinD} />
      <ellipse cx={pose.footR[0] + 12} cy={pose.footR[1] + 6} rx={30} ry={13} fill="#DADADA" />
      <Limb a={pose.sh} b={elbR} w={34} c={shirt} /><Limb a={elbR} b={pose.handR} w={26} c={G.skinD} />
      {/* torso: chest/back shape along the spine, shoulder cap, short shorts block */}
      {(() => {
        const ux = pose.hip[0] - pose.sh[0], uy = pose.hip[1] - pose.sh[1], L = Math.hypot(ux, uy) || 1; const u: V = [ux / L, uy / L]; const f: V = [u[1], -u[0]];
        const P = (b: V, k: number, m: number): string => `${b[0] + f[0] * k + u[0] * m},${b[1] + f[1] * k + u[1] * m}`;
        const pts = [P(pose.sh, -34, -12), P(pose.sh, 34, -8), P(pose.sh, 44, 40), P(pose.hip, 38, -30), P(pose.hip, 30, 10), P(pose.hip, -32, 10), P(pose.hip, -36, -40), P(pose.sh, -40, 36)].join(' ');
        return <>
          <line x1={pose.sh[0]} y1={pose.sh[1] - 4} x2={h[0]} y2={h[1] + 20} stroke={G.skin} strokeWidth={30} strokeLinecap="round" />
          <polygon points={pts} fill={shirt} stroke={shirt} strokeWidth={22} strokeLinejoin="round" />
          <line x1={pose.hip[0] - u[0] * 26} y1={pose.hip[1] - u[1] * 26} x2={pose.hip[0] + u[0] * 14} y2={pose.hip[1] + u[1] * 14} stroke={G.shorts} strokeWidth={86} strokeLinecap="round" />
          <circle cx={pose.sh[0] + f[0] * 8} cy={pose.sh[1] + u[1] * 14} r={25} fill={shirt} />
        </>;
      })()}
      {/* near leg */}
      <Limb a={pose.hip} b={kneeL} w={50} c={G.shorts} />
      {glowThigh > 0 && <ellipse cx={(pose.hip[0] + kneeL[0]) / 2} cy={(pose.hip[1] + kneeL[1]) / 2} rx={26 + 26 * glowThigh} ry={62 + 22 * glowThigh} fill={thighColor} opacity={0.55} transform={`rotate(${Math.atan2(kneeL[1] - pose.hip[1], kneeL[0] - pose.hip[0]) * 180 / Math.PI - 90} ${(pose.hip[0] + kneeL[0]) / 2} ${(pose.hip[1] + kneeL[1]) / 2})`} />}
      <Limb a={kneeL} b={pose.footL} w={32} c={G.skin} />
      <ellipse cx={pose.footL[0] + 14} cy={pose.footL[1] + 6} rx={32} ry={14} fill="#F2F2F2" /><ellipse cx={pose.footL[0] + 22} cy={pose.footL[1] + 12} rx={14} ry={6} fill={G.cap} />
      {/* near arm */}
      <Limb a={pose.sh} b={elbL} w={36} c={shirt} /><Limb a={elbL} b={pose.handL} w={28} c={G.skin} />
      <circle cx={pose.handL[0]} cy={pose.handL[1]} r={16} fill={G.skin} />
      {phone && <g transform={`translate(${pose.handL[0] + 6} ${pose.handL[1] - 36}) rotate(-12)`}><rect width={42} height={70} rx={8} fill="#1d2230" /><rect x={5} y={6} width={32} height={56} rx={4} fill="#9bd0ff" /></g>}
      {stopwatch && <g transform={`translate(${pose.handL[0] + 4} ${pose.handL[1] - 20})`}><circle r={26} fill="#fff" stroke={G.ink} strokeWidth={5} /><rect x={-6} y={-36} width={12} height={9} fill={G.ink} /><path d="M0 0 L0 -17 M0 0 L12 6" stroke={G.red} strokeWidth={4} /></g>}
      {/* head */}
      <circle cx={h[0]} cy={h[1]} r={40} fill={G.skin} />
      {beard && <path d={`M${h[0] - 36} ${h[1] + 6} Q${h[0] - 30} ${h[1] + 54} ${h[0] + 6} ${h[1] + 50} Q${h[0] + 38} ${h[1] + 46} ${h[0] + 38} ${h[1] + 6} Q${h[0] + 22} ${h[1] + 24} ${h[0]} ${h[1] + 22} Q${h[0] - 22} ${h[1] + 24} ${h[0] - 36} ${h[1] + 6}Z`} fill="#3A2A22" />}
      {cap ? <><path d={`M${h[0] - 42} ${h[1] - 6} A42 42 0 0 1 ${h[0] + 42} ${h[1] - 6}Z`} fill={G.cap} /><path d={`M${h[0] + 4} ${h[1] - 8} L${h[0] + 70} ${h[1] - 4} L${h[0] + 68} ${h[1] + 4} L${h[0] + 4} ${h[1] + 2}Z`} fill="#A83330" /></> : <path d={`M${h[0] - 41} ${h[1] - 4} A41 41 0 0 1 ${h[0] + 41} ${h[1] - 6} Q${h[0] + 10} ${h[1] - 28} ${h[0] - 41} ${h[1] - 4}Z`} fill="#3A2A22" />}
      <circle cx={h[0] + 16} cy={h[1] + 4} r={4.6} fill={G.ink} /><circle cx={h[0] + 32} cy={h[1] + 5} r={4.2} fill={G.ink} />
      <path d={`M${h[0] + 10} ${h[1] - 8} l12 ${mood === 'worry' ? 4 : -2}`} stroke={G.ink} strokeWidth={4} strokeLinecap="round" /><path d={`M${h[0] + 28} ${h[1] - 8} l10 ${mood === 'worry' ? -2 : 2}`} stroke={G.ink} strokeWidth={4} strokeLinecap="round" />
      <path d={mood === 'smile' ? `M${h[0] + 14} ${h[1] + 22} Q${h[0] + 26} ${h[1] + 34} ${h[0] + 38} ${h[1] + 20}` : mood === 'worry' ? `M${h[0] + 14} ${h[1] + 30} Q${h[0] + 26} ${h[1] + 20} ${h[0] + 38} ${h[1] + 30}` : `M${h[0] + 16} ${h[1] + 26} L${h[0] + 36} ${h[1] + 26}`} stroke={beard ? '#fff' : G.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** Pop-in wrapper: spring scale + fade from frame `at` (local). */
export const Pop: React.FC<{at?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'scale' | 'up' | 'left' | 'right'}> = ({at = 0, out, children, style, from = 'scale'}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0 || (out !== undefined && frame > out + 6)) return null;
  const p = spring({frame: t, fps, config: {damping: 13, stiffness: 190, mass: 0.7}});
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tx = from === 'left' ? (1 - p) * -300 : from === 'right' ? (1 - p) * 300 : 0, ty = from === 'up' ? (1 - p) * 120 : 0;
  return <div style={{position: 'absolute', opacity: p * o, transform: `translate(${tx}px,${ty}px) scale(${from === 'scale' ? 0.6 + 0.4 * p : 1})`, ...style}}>{children}</div>;
};
export const Pill: React.FC<{text: string; color?: string; fill?: string; size?: number; bg?: string}> = ({text, color = G.ink, fill = 'transparent', size = 30, bg}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: 1, color, background: bg ?? fill, border: `3px solid ${color}`, borderRadius: 999, padding: '6px 22px', whiteSpace: 'nowrap', textTransform: 'uppercase'}}>{text}</div>
);
export const TimerCard: React.FC<{text: string; color?: string; w?: number; label?: string; shake?: number}> = ({text, color = G.ink, w = 280, label, shake = 0}) => (
  <div style={{width: w, textAlign: 'center', background: '#fff', border: `4px solid ${color}`, borderRadius: 18, padding: '10px 0 ' + (label ? '6px' : '10px'), boxShadow: '0 8px 0 rgba(0,0,0,.12)', transform: `translateX(${shake}px)`}}>
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: w * 0.3, color, lineHeight: 1}}>{text}</div>
    {label && <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 18, color: G.grey, letterSpacing: 2}}>{label}</div>}
  </div>
);
export const Source: React.FC<{text?: string}> = ({text = 'Schoenfeld 2016'}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, color: G.grey, display: 'flex', alignItems: 'center', gap: 8}}><svg width="18" height="22" viewBox="0 0 18 22"><path d="M1 1h11l5 5v15H1z" fill="none" stroke={G.grey} strokeWidth="2" /></svg>{text}</div>
);
export const Bench: React.FC<{x?: number; y?: number; s?: number}> = ({x = 0, y = 0, s = 1}) => (
  <svg width={420 * s} height={300 * s} viewBox="0 0 420 300" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <rect x={40} y={0} width={300} height={38} rx={16} fill="#3A3F4B" /><rect x={60} y={38} width={26} height={150} fill="#2A2E38" /><rect x={290} y={38} width={26} height={150} fill="#2A2E38" /><rect x={30} y={184} width={78} height={14} rx={7} fill="#2A2E38" /><rect x={266} y={184} width={78} height={14} rx={7} fill="#2A2E38" />
  </svg>
);
export const Plate: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 60}) => (
  <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: x - r, top: y - r}} viewBox="-60 -60 120 120"><circle r={58} fill="#2B6BE0" /><circle r={46} fill="none" stroke="#1B4FB0" strokeWidth={5} /><circle r={14} fill="#E9E9E6" /></svg>
);
/** Jerrycan with an animated liquid level (0..1) = the "fast fuel tank". */
export const Tank: React.FC<{level: number; x?: number; y?: number; s?: number; label?: string}> = ({level, x = 0, y = 0, s = 1, label}) => (
  <svg width={190 * s} height={250 * s} viewBox="0 0 190 250" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs><clipPath id={`c${Math.round(x)}${Math.round(y)}`}><rect x={14} y={44} width={150} height={190} rx={22} /></clipPath></defs>
    <rect x={14} y={44} width={150} height={190} rx={22} fill="#fff" stroke={G.ink} strokeWidth={6} />
    <g clipPath={`url(#c${Math.round(x)}${Math.round(y)})`}><rect x={14} y={234 - 190 * level} width={150} height={190 * level + 4} fill={G.yellow} /><rect x={14} y={234 - 190 * level} width={150} height={7} fill="#FFDF7A" /></g>
    {[0.25, 0.5, 0.75].map((t) => <line key={t} x1={14} x2={44} y1={234 - 190 * t} y2={234 - 190 * t} stroke={G.ink} strokeWidth={4} opacity={0.5} />)}
    <rect x={118} y={14} width={42} height={32} rx={6} fill={G.ink} /><path d="M40 44 Q40 8 76 8 L112 8" stroke={G.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
    {label && <text x={89} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={G.ink} opacity={0.0}>{label}</text>}
  </svg>
);
export const Xray: React.FC<{x?: number; y?: number; s?: number; glow?: number}> = ({x = 0, y = 0, s = 1, glow = 1}) => (
  <svg width={360 * s} height={760 * s} viewBox="0 0 360 760" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <g stroke="#6CC4FF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px #3DA8FF)'}}>
      <circle cx={180} cy={70} r={50} /><circle cx={160} cy={62} r={10} /><circle cx={200} cy={62} r={10} /><path d="M165 100 h30" />
      <path d="M180 124 V360" /><path d="M110 150 Q180 130 250 150" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M${120 + i * 6} ${176 + i * 34} Q180 ${196 + i * 34} ${240 - i * 6} ${176 + i * 34}`} />)}
      <path d="M100 340 Q180 400 260 340 L250 400 Q180 430 110 400Z" />
      <path d="M130 400 L120 560 M230 400 L240 560" /><circle cx={118} cy={575} r={18} /><circle cx={242} cy={575} r={18} /><path d="M118 595 L112 730 M242 595 L248 730" />
      <path d="M110 150 L70 300 L60 400 M250 150 L290 300 L300 400" />
    </g>
    <ellipse cx={126} cy={480} rx={40 + 12 * glow} ry={100} fill="#3DFF9A" opacity={0.18 + 0.2 * glow} /><ellipse cx={234} cy={480} rx={40 + 12 * glow} ry={100} fill="#3DFF9A" opacity={0.18 + 0.2 * glow} />
  </svg>
);
export const BG: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', inset: 0, background: dark ? '#0B1E3F' : G.bg, backgroundImage: dark ? 'linear-gradient(rgba(80,160,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(80,160,255,.10) 1px, transparent 1px)' : `linear-gradient(${G.grid} 1px, transparent 1px), linear-gradient(90deg, ${G.grid} 1px, transparent 1px)`, backgroundSize: '60px 60px'}} />
);
export const Floor: React.FC<{y: number}> = ({y}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 6, background: '#B9B9B5'}} />;

const ik2 = (a: V, b: V, l1: number, l2: number): V => { const A = ik(a, b, l1, l2, 1), B = ik(a, b, l1, l2, -1); return Math.abs(A[0] - 200) >= Math.abs(B[0] - 200) ? A : B; };
type FrontProps = {x?: number; y?: number; s?: number; shirt?: string; cap?: boolean; beard?: boolean; mood?: 'smile' | 'flat' | 'worry'; handL?: V; handR?: V; stopwatch?: boolean; glow?: number; opacity?: number};
/** Symmetric front-facing athlete (400x600 box, feet at y~570). Arms use 2-bone IK from broad shoulders. */
export const FrontPerson: React.FC<FrontProps> = ({x = 0, y = 0, s = 1, shirt = G.blue, cap = false, beard = false, mood = 'flat', handL = [112, 372], handR = [288, 372], stopwatch = false, glow = 0, opacity = 1}) => {
  const shL: V = [142, 236], shR: V = [258, 236];
  const eL = ik2(shL, handL, 84, 76), eR = ik2(shR, handR, 84, 76);
  const mouth = mood === 'smile' ? 'M182 176 Q200 194 218 176' : mood === 'worry' ? 'M184 188 Q200 172 216 188' : 'M184 182 L216 182';
  return (
    <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>
      {/* legs */}
      <Limb a={[168, 420]} b={[158, 540]} w={36} c={G.skin} /><Limb a={[232, 420]} b={[242, 540]} w={36} c={G.skin} />
      <ellipse cx={146} cy={558} rx={36} ry={16} fill="#F2F2F2" /><ellipse cx={254} cy={558} rx={36} ry={16} fill="#F2F2F2" /><rect x={112} y={564} width={68} height={6} rx={3} fill={G.cap} /><rect x={220} y={564} width={68} height={6} rx={3} fill={G.cap} />
      <Limb a={[166, 376]} b={[160, 470]} w={64} c={G.shorts} /><Limb a={[234, 376]} b={[240, 470]} w={64} c={G.shorts} />
      {glow > 0 && <><ellipse cx={164} cy={436} rx={26 + 22 * glow} ry={64 + 14 * glow} fill={G.green} opacity={0.55} /><ellipse cx={236} cy={436} rx={26 + 22 * glow} ry={64 + 14 * glow} fill={G.green} opacity={0.55} /></>}
      {/* torso */}
      <path d="M136 226 Q200 206 264 226 L254 384 Q200 398 146 384Z" fill={shirt} stroke={shirt} strokeWidth={16} strokeLinejoin="round" />
      <rect x={140} y={364} width={120} height={36} rx={14} fill={G.shorts} />
      {/* arms */}
      <Limb a={shL} b={eL} w={40} c={shirt} /><Limb a={eL} b={handL} w={30} c={G.skin} /><circle cx={handL[0]} cy={handL[1]} r={17} fill={G.skin} />
      <Limb a={shR} b={eR} w={40} c={shirt} /><Limb a={eR} b={handR} w={30} c={G.skin} /><circle cx={handR[0]} cy={handR[1]} r={17} fill={G.skin} />
      <circle cx={shL[0]} cy={shL[1]} r={26} fill={shirt} /><circle cx={shR[0]} cy={shR[1]} r={26} fill={shirt} />
      {stopwatch && <g transform={`translate(${handL[0]} ${handL[1] - 28})`}><circle r={26} fill="#fff" stroke={G.ink} strokeWidth={5} /><rect x={-6} y={-36} width={12} height={9} fill={G.ink} /><path d="M0 0 L0 -17 M0 0 L12 6" stroke={G.red} strokeWidth={4} /></g>}
      {/* head */}
      <rect x={184} y={190} width={32} height={40} rx={10} fill={G.skin} />
      <circle cx={158} cy={154} r={10} fill={G.skin} /><circle cx={242} cy={154} r={10} fill={G.skin} />
      <circle cx={200} cy={146} r={46} fill={G.skin} />
      {beard && <path d="M156 160 Q158 212 200 214 Q242 212 244 160 Q226 184 200 182 Q174 184 156 160Z" fill="#3A2A22" />}
      {cap ? <><path d="M153 140 A47 47 0 0 1 247 140 Q200 126 153 140Z" fill={G.cap} /><path d="M150 140 Q200 124 250 140 Q250 150 200 146 Q150 150 150 140Z" fill="#A83330" /></> : <path d="M154 136 A46 46 0 0 1 246 136 Q200 114 154 136Z" fill="#3A2A22" />}
      <circle cx={184} cy={158} r={5} fill={G.ink} /><circle cx={216} cy={158} r={5} fill={G.ink} />
      <path d={mood === 'worry' ? 'M174 146 l18 6 M226 146 l-18 6' : 'M174 148 l18 -3 M226 148 l-18 -3'} stroke={G.ink} strokeWidth={4} strokeLinecap="round" />
      <path d={mouth} stroke={beard ? '#fff' : G.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    </svg>
  );
};
