import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useId} from 'react';

export const G = {
  bg: '#E9E9E6', grid: '#D8D8D4', ink: '#17181C', blue: '#2F7BF2', orange: '#F28A1E', skin: '#F0B48C', skinD: '#D29467',
  shorts: '#262B36', cap: '#D9453F', green: '#22A861', red: '#E5383B', yellow: '#FFC93C', grey: '#8A8A86', white: '#FFFFFF',
};
export const FONT = 'Montserrat, "DejaVu Sans", sans-serif';
export type V = [number, number];

/** Two-bone IK: returns the middle joint (knee/elbow). bend=+1 puts it on the "forward-up" side for a limb pointing down-right. */
export const ik = (a: V, b: V, l1: number, l2: number, bend: 1 | -1): V => {
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
  squatUp: {hip: [190, 365], sh: [205, 218], head: [214, 163], handL: [190, 208], handR: [182, 212], footL: [180, 565], footR: [215, 565], legBend: 1, armBend: 1} as Pose,
  squatDown: {hip: [140, 462], sh: [195, 330], head: [210, 277], handL: [180, 320], handR: [172, 324], footL: [185, 565], footR: [222, 565], legBend: 1, armBend: 1} as Pose,
  flex: {hip: [200, 365], sh: [200, 215], head: [200, 158], handL: [100, 120], handR: [300, 120], footL: [170, 565], footR: [232, 565], legBend: 1, armBend: -1} as Pose,
  hold: {hip: [200, 365], sh: [200, 215], head: [208, 160], handL: [262, 262], handR: [270, 270], footL: [182, 565], footR: [218, 565], legBend: 1, armBend: -1} as Pose,
  point: {hip: [200, 365], sh: [200, 215], head: [208, 160], handL: [262, 262], handR: [330, 200], footL: [182, 565], footR: [218, 565], legBend: 1, armBend: -1} as Pose,
};


/* ================= character renderer (outlined cartoon style, like the reference) ================= */
export const OL = '#3A2A24'; const SK_ = 0; const SK = '#F3B78E', HAIR = '#3B2A20', MOH = '#E5383B';
const shade = (hex: string, k = 0.82) => { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return `rgb(${r},${g},${b})`; };
const OW = 3.4;
/** Outlined capsule limb. */
const Cap: React.FC<{a: V; b: V; w: number; c: string}> = ({a, b, w, c}) => (
  <><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={OL} strokeWidth={w + OW * 2} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" /></>
);
const Poly: React.FC<{pts: string; c: string; r?: number}> = ({pts, c, r = 14}) => (
  <><polygon points={pts} fill={OL} stroke={OL} strokeWidth={r + OW * 2} strokeLinejoin="round" /><polygon points={pts} fill={c} stroke={c} strokeWidth={r} strokeLinejoin="round" /></>
);
const lp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Tapered, outlined limb from a (width wa) to b (width wb); `bulge` fattens the belly (calf / biceps). */
const Limb: React.FC<{a: V; b: V; wa: number; wb: number; c: string; bulge?: number}> = ({a, b, wa, wb, c, bulge = 0}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const ra = wa / 2, rb = wb / 2, rm = (ra * 0.55 + rb * 0.45) * (1 + bulge);
  const m: V = [a[0] + dx * 0.42, a[1] + dy * 0.42];
  const side = (n: number) => {
    const p0: V = [a[0] + nx * ra * n, a[1] + ny * ra * n], p1: V = [m[0] + nx * rm * n, m[1] + ny * rm * n], p2: V = [b[0] + nx * rb * n, b[1] + ny * rb * n];
    return {p0, p2, c1: [2 * p1[0] - (p0[0] + p2[0]) / 2, 2 * p1[1] - (p0[1] + p2[1]) / 2] as V};
  };
  const A = side(1), Bq = side(-1);
  const d = `M${A.p0[0]} ${A.p0[1]} Q${A.c1[0]} ${A.c1[1]} ${A.p2[0]} ${A.p2[1]} L${Bq.p2[0]} ${Bq.p2[1]} Q${Bq.c1[0]} ${Bq.c1[1]} ${Bq.p0[0]} ${Bq.p0[1]} Z`;
  return (
    <>
      <path d={d} fill={OL} stroke={OL} strokeWidth={OW * 2} strokeLinejoin="round" /><circle cx={a[0]} cy={a[1]} r={ra + OW} fill={OL} /><circle cx={b[0]} cy={b[1]} r={rb + OW} fill={OL} />
      <path d={d} fill={c} /><circle cx={a[0]} cy={a[1]} r={ra} fill={c} /><circle cx={b[0]} cy={b[1]} r={rb} fill={c} />
    </>
  );
};
/** Cartoon hand at p; fingers point along the forearm direction (from `from`). Open (relaxed, fingers curled a bit) or fist. */
const Hand: React.FC<{p: V; from: V; c: string; fist?: boolean; side?: 1 | -1; r?: number}> = ({p, from, c, fist, side = 1, r = 1}) => {
  const ux = p[0] - from[0], uy = p[1] - from[1], th = (Math.atan2(-ux, uy) * 180) / Math.PI;
  return (
    <g transform={`translate(${p[0]} ${p[1]}) rotate(${th}) scale(${r})`} stroke={OL} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
      {fist ? (
        <>
          <rect x={-15} y={-6} width={30} height={30} rx={10} fill={c} />
          <path d="M-8 4 V18 M0 4 V18 M8 4 V18" fill="none" strokeWidth={2.4} />
          <path d={`M${-13 * side} -2 Q${-22 * side} 8 ${-12 * side} 18`} fill={c} strokeWidth={3} />
        </>
      ) : (
        <>
          {[-9, -3, 3, 9].map((x, i) => <path key={i} d={`M${x} 14 Q${x + (i - 1.5) * 0.9} 26 ${x + (i - 1.5) * 1.6} ${32 - (i === 1 || i === 2 ? 0 : 5)}`} fill="none" stroke={OL} strokeWidth={9} />)}
          {[-9, -3, 3, 9].map((x, i) => <path key={'f' + i} d={`M${x} 14 Q${x + (i - 1.5) * 0.9} 26 ${x + (i - 1.5) * 1.6} ${32 - (i === 1 || i === 2 ? 0 : 5)}`} fill="none" stroke={c} strokeWidth={4.6} />)}
          <path d={`M${-11 * side} 6 Q${-24 * side} 12 ${-20 * side} 24`} fill="none" stroke={OL} strokeWidth={10} /><path d={`M${-11 * side} 6 Q${-24 * side} 12 ${-20 * side} 24`} fill="none" stroke={c} strokeWidth={5.6} />
          <rect x={-14} y={-8} width={28} height={28} rx={11} fill={c} />
        </>
      )}
    </g>
  );
};
export type Hair = 'short' | 'mohawk';
/** Cartoon eye with heavy-lid / blink support and tired dark circle. lid 0 = open .. 1 = closed. */
const Eye: React.FC<{cx: number; cy: number; lid: number; look?: number; strain?: boolean; tired?: number}> = ({cx, cy, lid, look = 1, strain, tired = 0}) => {
  const id = useId().replace(/:/g, '');
  if (strain) return <ellipse cx={cx} cy={cy} rx={9} ry={3} fill="#fff" stroke={OL} strokeWidth={OW} />;
  const h = 23 * Math.min(1, Math.max(0, lid));
  return (
    <g>
      {tired > 0 && <ellipse cx={cx + 1} cy={cy + 15} rx={15} ry={8} fill="#6A4890" opacity={0.85 * tired} />}
      <clipPath id={id}><ellipse cx={cx} cy={cy} rx={9} ry={11} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={9} ry={11} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + look} cy={cy + 2} r={5} fill={OL} />
        {h > 0 && <><rect x={cx - 11} y={cy - 12} width={22} height={h} fill={SK} /><line x1={cx - 10} x2={cx + 10} y1={cy - 12 + h} y2={cy - 12 + h} stroke={OL} strokeWidth={3} /></>}
      </g>
      <ellipse cx={cx} cy={cy} rx={9} ry={11} fill="none" stroke={OL} strokeWidth={OW} />
      {tired > 0 && <path d={`M${cx - 10} ${cy + 12} Q${cx} ${cy + 18} ${cx + 10} ${cy + 12}`} stroke="#5E3F7F" strokeWidth={2.4} fill="none" opacity={0.7 * tired} strokeLinecap="round" />}
    </g>
  );
};
const ShoeSide: React.FC<{f: V; dark?: boolean}> = ({f, dark}) => (
  <g><path d={`M${f[0] - 16} ${f[1] - 8} L${f[0] + 10} ${f[1] - 12} Q${f[0] + 40} ${f[1] - 6} ${f[0] + 44} ${f[1] + 10} L${f[0] + 44} ${f[1] + 16} L${f[0] - 18} ${f[1] + 16} Z`} fill={dark ? '#D8D8D8' : '#FFFFFF'} stroke={OL} strokeWidth={OW} strokeLinejoin="round" /><path d={`M${f[0] - 18} ${f[1] + 11} L${f[0] + 44} ${f[1] + 11}`} stroke="#D9453F" strokeWidth={5} /><path d={`M${f[0] - 4} ${f[1] - 10} l8 8 M${f[0] + 4} ${f[1] - 11} l8 8`} stroke={OL} strokeWidth={2.4} strokeLinecap="round" /><path d={`M${f[0] + 24} ${f[1] - 4} Q${f[0] + 36} ${f[1] - 2} ${f[0] + 40} ${f[1] + 8}`} fill="none" stroke={OL} strokeWidth={2.4} /></g>
);
const Mohawk: React.FC<{cx: number; cy: number; a0: number; a1: number; r: number; R: number; n?: number}> = ({cx, cy, a0, a1, r, R, n = 7}) => {
  const outer: string[] = [], inner: string[] = [];
  for (let i = 0; i <= n * 2; i++) { const a = ((a0 + ((a1 - a0) * i) / (n * 2)) * Math.PI) / 180; const rr = i % 2 ? R : r + 4; outer.push(`${cx + rr * Math.cos(a)},${cy - rr * Math.sin(a)}`); }
  for (let i = n * 2; i >= 0; i--) { const a = ((a0 + ((a1 - a0) * i) / (n * 2)) * Math.PI) / 180; inner.push(`${cx + (r - 6) * Math.cos(a)},${cy - (r - 6) * Math.sin(a)}`); }
  return <polygon points={[...outer, ...inner].join(' ')} fill={MOH} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />;
};
type PersonProps = {phones?: boolean; whistle?: boolean; scroll?: number; plate?: number; pose: Pose; shirt?: string; hair?: Hair; beard?: boolean; flip?: boolean; x?: number; y?: number; s?: number; mood?: 'smile' | 'flat' | 'worry' | 'strain'; phone?: boolean; stopwatch?: boolean; opacity?: number; rot?: number; glowThigh?: number; thighColor?: string; sweat?: number; cap?: boolean; tired?: number; blink?: number; fists?: boolean};
/** Side-view (facing right) outlined cartoon athlete in a 400x600 box. */
export const Person: React.FC<PersonProps> = ({phones, whistle = false, scroll = -1, plate = 0, pose, shirt = G.blue, hair = 'short', beard = false, flip = false, x = 0, y = 0, s = 1, mood = 'flat', phone = false, stopwatch = false, opacity = 1, rot = 0, glowThigh = 0, thighColor = G.green, sweat = 0, cap = false, tired = 0, blink = 0, fists}) => {
  if (cap) hair = 'mohawk';
  const hp = phones ?? shirt === G.blue;
  const lb = pose.legBend ?? 1, ab = pose.armBend ?? -1;
  const kneeL = ik(pose.hip, pose.footL, 98, 96, lb), kneeR = ik(pose.hip, pose.footR, 98, 96, lb);
  const elbL = ik(pose.sh, pose.handL, 74, 68, ab), elbR = ik(pose.sh, pose.handR, 74, 68, ab);
  const h = pose.head;
  const ux = pose.hip[0] - pose.sh[0], uy = pose.hip[1] - pose.sh[1], L = Math.hypot(ux, uy) || 1; const u: V = [ux / L, uy / L]; const fw: V = [u[1], -u[0]];
  const P = (b: V, k: number, m: number) => `${b[0] + fw[0] * k + u[0] * m},${b[1] + fw[1] * k + u[1] * m}`;
  const torso = [P(pose.sh, -28, -4), P(pose.sh, 26, -6), P(pose.sh, 36, 36), P(pose.hip, 30, -36), P(pose.hip, 26, 0), P(pose.hip, -28, 0), P(pose.hip, -30, -40), P(pose.sh, -32, 34)].join(' ');
  const shorts = [P(pose.hip, 30, -24), P(pose.hip, 32, 12), P(pose.hip, -32, 12), P(pose.hip, -32, -24)].join(' ');
  const shirtD = shade(shirt, 0.8), skD = shade(SK, 0.86), shortsD = shade(G.shorts, 0.8);
  const leg = (knee: V, foot: V, far: boolean) => (
    <g>
      <Limb a={knee} b={foot} wa={33} wb={22} bulge={0.14} c={far ? skD : SK} />
      <ShoeSide f={foot} dark={far} />
      <Limb a={pose.hip} b={knee} wa={48} wb={35} c={far ? skD : SK} />
      <circle cx={knee[0] + 4} cy={knee[1]} r={13} fill={far ? skD : SK} stroke={OL} strokeWidth={OW} />
      <path d={`M${knee[0] - 1} ${knee[1] - 7} q9 3 9 11`} fill="none" stroke={OL} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      <Limb a={pose.hip} b={lp(pose.hip, knee, 0.7)} wa={58} wb={52} c={far ? shortsD : G.shorts} />
    </g>
  );
  const arm = (elb: V, hand: V, far: boolean) => (
    <g>
      <Limb a={pose.sh} b={elb} wa={33} wb={25} c={far ? skD : SK} /><Limb a={elb} b={hand} wa={25} wb={17} bulge={0.12} c={far ? skD : SK} />
      <Hand p={hand} from={elb} c={far ? skD : SK} fist={fists ?? (plate > 0 || phone || stopwatch)} side={1} r={0.95} />
      <Limb a={pose.sh} b={lp(pose.sh, elb, 0.55)} wa={42} wb={37} c={far ? shirtD : shirt} />
    </g>
  );
  const eyeY = h[1] - 2;
  return (
    <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity, transform: `${flip ? 'scaleX(-1)' : ''} rotate(${rot}deg)`}}>
      {arm(elbR, pose.handR, true)}
      {leg(kneeR, pose.footR, true)}
      <Cap a={[pose.sh[0] + 2, pose.sh[1] - 4]} b={[h[0] - 4, h[1] + 30]} w={26} c={SK} />
      <Poly pts={torso} c={shirt} /><Poly pts={shorts} c={G.shorts} r={10} />
      {leg(kneeL, pose.footL, false)}
      {glowThigh > 0 && (() => { const m = lp(pose.hip, kneeL, 0.5); const ang = (Math.atan2(kneeL[1] - pose.hip[1], kneeL[0] - pose.hip[0]) * 180) / Math.PI - 90; return <ellipse cx={m[0]} cy={m[1]} rx={22 + 16 * glowThigh} ry={52 + 12 * glowThigh} fill={thighColor} opacity={0.62} stroke={OL} strokeWidth={OW} strokeOpacity={0.5} transform={`rotate(${ang} ${m[0]} ${m[1]})`} />; })()}
      {plate > 0 && <g transform={`translate(${pose.sh[0] - 30} ${pose.sh[1] - 6})`}><line x1={-90} y1={0} x2={90} y2={0} stroke={OL} strokeWidth={0} /><circle r={plate} fill="#1C1D22" stroke={OL} strokeWidth={4} /><circle r={plate * 0.86} fill="none" stroke="#34363E" strokeWidth={plate * 0.05} /><circle r={plate * 0.5} fill="#25272D" stroke="#3B3D45" strokeWidth={3} /><circle r={plate * 0.17} fill="#C9CDD4" stroke={OL} strokeWidth={3} /><text y={-plate * 0.68} textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={plate * 0.2}>20 KG</text><text y={plate * 0.68} textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={plate * 0.2}>20 KG</text></g>}
      {/* head */}
      <circle cx={h[0] - 10} cy={h[1] + 6} r={11} fill={SK} stroke={OL} strokeWidth={OW} />
      <circle cx={h[0]} cy={h[1]} r={46} fill={SK} stroke={OL} strokeWidth={OW} />
      <circle cx={h[0] - 10} cy={h[1] + 6} r={10} fill={SK} stroke={OL} strokeWidth={OW} /><path d={`M${h[0] - 13} ${h[1] + 2} q5 4 0 9`} stroke={OL} strokeWidth={2.5} fill="none" />
      <path d={`M${h[0] + 42} ${h[1] - 6} Q${h[0] + 58} ${h[1] + 8} ${h[0] + 43} ${h[1] + 16}`} fill={SK} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      {hair === 'short' ? (
        <path d={`M${h[0] - 46} ${h[1] + 14} Q${h[0] - 54} ${h[1] - 34} ${h[0] - 4} ${h[1] - 47} Q${h[0] + 34} ${h[1] - 52} ${h[0] + 42} ${h[1] - 22} Q${h[0] + 20} ${h[1] - 32} ${h[0] + 2} ${h[1] - 24} Q${h[0] - 16} ${h[1] - 12} ${h[0] - 24} ${h[1] + 16} Z`} fill={HAIR} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      ) : (
        <><path d={`M${h[0] - 44} ${h[1] + 10} Q${h[0] - 50} ${h[1] - 30} ${h[0] - 4} ${h[1] - 44} Q${h[0] + 30} ${h[1] - 48} ${h[0] + 38} ${h[1] - 24} Q${h[0] + 10} ${h[1] - 28} ${h[0] - 20} ${h[1] + 12} Z`} fill="#8C7B70" opacity={0.35} /><Mohawk cx={h[0]} cy={h[1]} a0={58} a1={172} r={44} R={78} /></>
      )}
      {beard && <path d={`M${h[0] - 12} ${h[1] + 4} Q${h[0] - 8} ${h[1] + 52} ${h[0] + 24} ${h[1] + 50} Q${h[0] + 48} ${h[1] + 46} ${h[0] + 47} ${h[1] + 20} Q${h[0] + 34} ${h[1] + 20} ${h[0] + 22} ${h[1] + 20} L${h[0] + 12} ${h[1] + 12} Q${h[0]} ${h[1] + 16} ${h[0] - 12} ${h[1] + 4} Z`} fill={HAIR} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />}
      <circle cx={h[0]} cy={h[1]} r={46} fill="#fff" opacity={0.2 * tired} />
      <Eye cx={h[0] + 22} cy={eyeY} lid={Math.max(blink, tired * 0.5)} look={3} strain={mood === 'strain'} tired={tired} />
      <path d={mood === 'worry' || mood === 'strain' ? `M${h[0] + 10} ${h[1] - 20} L${h[0] + 33} ${h[1] - 14}` : `M${h[0] + 11} ${h[1] - 17} Q${h[0] + 22} ${h[1] - 24} ${h[0] + 33} ${h[1] - 18}`} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d={mood === 'smile' ? `M${h[0] + 22} ${h[1] + 26} Q${h[0] + 32} ${h[1] + 36} ${h[0] + 42} ${h[1] + 26}` : mood === 'worry' ? `M${h[0] + 24} ${h[1] + 32} Q${h[0] + 33} ${h[1] + 24} ${h[0] + 42} ${h[1] + 32}` : mood === 'strain' ? `M${h[0] + 22} ${h[1] + 26} L${h[0] + 44} ${h[1] + 26} L${h[0] + 44} ${h[1] + 33} L${h[0] + 22} ${h[1] + 33}Z` : `M${h[0] + 26} ${h[1] + 29} L${h[0] + 42} ${h[1] + 29}`} stroke={beard ? '#fff' : OL} strokeWidth={4} fill={mood === 'strain' ? '#fff' : 'none'} strokeLinecap="round" strokeLinejoin="round" />
      {whistle && <><rect x={h[0] + 20} y={h[1] + 20} width={26} height={16} fill={SK} /><circle cx={h[0] + 38} cy={h[1] + 28} r={6} fill="#7a2e2a" stroke={OL} strokeWidth={3} /></>}
      {hp && <g><path d={`M${h[0] - 26} ${h[1] + 2} Q${h[0] - 22} ${h[1] - 62} ${h[0] + 10} ${h[1] - 50}`} stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" /><path d={`M${h[0] - 26} ${h[1] + 2} Q${h[0] - 22} ${h[1] - 62} ${h[0] + 10} ${h[1] - 50}`} stroke="#2A2D35" strokeWidth={8} fill="none" strokeLinecap="round" /><rect x={h[0] - 30} y={h[1] - 12} width={34} height={42} rx={14} fill="#2A2D35" stroke={OL} strokeWidth={OW} /><rect x={h[0] - 22} y={h[1] - 4} width={18} height={26} rx={8} fill={G.blue} /></g>}
      {sweat > 0 && <path d={`M${h[0] - 30} ${h[1] - 30 + 20 * sweat} q-7 12 0 15 q7 -3 0 -15z`} fill="#8FD3FF" stroke={OL} strokeWidth={2.5} opacity={1 - sweat * 0.6} />}
      {arm(elbL, pose.handL, false)}
      {phone && <g transform={`translate(${pose.handL[0] - 2} ${pose.handL[1] - 46}) rotate(-14)`}><rect width={40} height={68} rx={8} fill="#1d2230" stroke={OL} strokeWidth={OW} /><rect x={5} y={6} width={30} height={54} rx={4} fill="#9bd0ff" />{scroll >= 0 && <g>{[0, 1, 2, 3, 4].map((i) => { const yy = 10 + ((i * 13 - scroll * 40) % 65 + 65) % 65; return yy < 56 ? <rect key={i} x={8} y={yy} width={i % 2 ? 18 : 24} height={6} rx={3} fill="#fff" opacity={0.9} /> : null; })}</g>}</g>}
      {phone && <circle cx={pose.handL[0]} cy={pose.handL[1]} r={13} fill={SK} stroke={OL} strokeWidth={OW} />}
      {stopwatch && <g transform={`translate(${pose.handL[0] + 4} ${pose.handL[1] - 22})`}><circle r={26} fill="#fff" stroke={OL} strokeWidth={5} /><rect x={-6} y={-36} width={12} height={9} fill={OL} /><path d="M0 0 L0 -17 M0 0 L12 6" stroke={G.red} strokeWidth={4} /></g>}
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


export const ik2 = (a: V, b: V, l1: number, l2: number): V => { const A = ik(a, b, l1, l2, 1), B = ik(a, b, l1, l2, -1); return Math.abs(A[0] - 200) >= Math.abs(B[0] - 200) ? A : B; };
type FrontProps = {phones?: boolean; bicep?: number; pumpGlow?: number; curl?: number; point?: boolean; crouch?: number; barbell?: boolean; x?: number; y?: number; s?: number; shirt?: string; hair?: Hair; beard?: boolean; mood?: 'smile' | 'flat' | 'worry' | 'strain'; handL?: V; handR?: V; stopwatch?: boolean; glow?: number; glowColor?: string; opacity?: number; sweat?: number; cap?: boolean; tired?: number; blink?: number; yawn?: number; look?: number; pale?: number; girth?: number; headTilt?: number; headDy?: number; fists?: boolean; tank?: boolean};
/** Front-facing outlined cartoon athlete (400x600 box, shoe soles at y~570). V-taper torso, tapered limbs with knees/elbows, real hands and sneakers. girth>1 = heavier. */
export const FrontPerson: React.FC<FrontProps> = ({phones, bicep = 0, pumpGlow = 0, curl = -1, point = false, crouch = 0, barbell = false, x = 0, y = 0, s = 1, shirt = G.blue, hair = 'short', beard = false, mood = 'flat', handL = [127, 382], handR = [273, 382], stopwatch = false, glow = 0, glowColor = G.green, opacity = 1, sweat = 0, cap = false, tired = 0, blink = 0, yawn = 0, look = 1, pale = 0, girth = 1, headTilt = 0, headDy = 0, fists, tank = false}) => {
  if (cap) hair = 'mohawk';
  const hp = phones ?? shirt === G.blue;
  const dy = crouch * 62;
  const g = girth, gx = (v: number) => 200 + (v - 200) * g, gw = 1 + (g - 1) * 0.8;
  if (curl >= 0) { const c = curl; handL = [118 + 34 * c, 372 - 150 * c]; handR = [282 - 34 * c, 372 - 150 * c]; }
  if (point) { handR = [290, 262]; }
  if (barbell) { handL = [104, 214 + dy]; handR = [296, 214 + dy]; }
  const fist = fists ?? (curl >= 0 || barbell || bicep > 0.45);
  const shL: V = [gx(140), 226 + dy], shR: V = [gx(260), 226 + dy];
  const eL = ik2(shL, handL, 82, 75), eR = ik2(shR, handR, 82, 75);
  const hipL: V = [gx(172), 380 + dy], hipR: V = [gx(228), 380 + dy];
  const ankL: V = [gx(172) - 2, 538], ankR: V = [gx(228) + 2, 538];
  const kL = ik2(hipL, ankL, 82, 78), kR = ik2(hipR, ankR, 82, 78);
  const legF = (hip: V, knee: V, ank: V, dir: number) => (
    <g>
      <Limb a={knee} b={ank} wa={36 * gw} wb={22} bulge={0.16} c={SK} />
      {/* sock + sneaker seen from the front, toes splayed a little */}
      <rect x={ank[0] - 12} y={ank[1] - 16} width={24} height={16} rx={6} fill="#fff" stroke={OL} strokeWidth={OW} />
      <g transform={`translate(${ank[0]} ${ank[1] - 5}) rotate(${dir * 6})`}>
        <path d="M-21 6 Q-27 28 -20 36 L20 36 Q27 28 21 6 Q10 -4 0 -4 Q-10 -4 -21 6Z" fill="#fff" stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M-19 26 Q0 16 19 26" fill="none" stroke={OL} strokeWidth={2.6} strokeLinecap="round" /><path d="M-8 4 H8 M-9 11 H9" stroke={OL} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M-24 30 L24 30 L24 39 Q0 43 -24 39Z" fill="#D9453F" stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      </g>
      <Limb a={hip} b={knee} wa={50 * gw} wb={37 * gw} c={SK} />
      <circle cx={knee[0]} cy={knee[1]} r={11 * gw} fill={SK} stroke={OL} strokeWidth={OW} /><path d={`M${knee[0] - 6} ${knee[1] - 2} q6 6 12 0`} fill="none" stroke={OL} strokeWidth={2.2} strokeLinecap="round" opacity={0.55} />
    </g>
  );
  const arm = (sh: V, e: V, hd: V, sd: number) => (
    <g>
      <Limb a={sh} b={e} wa={36 * gw} wb={27} bulge={0.05} c={SK} /><Limb a={e} b={hd} wa={27} wb={17} bulge={0.14} c={SK} />
      <Hand p={hd} from={e} c={SK} fist={fist} side={(sd > 0 ? 1 : -1) as 1 | -1} r={1.05} />
      <Limb a={sh} b={lp(sh, e, 0.5)} wa={44 * gw} wb={40 * gw} c={shirt} />
    </g>
  );
  const torso = `M${gx(138)} 224 Q${gx(148)} 204 ${gx(174)} 202 L${gx(226)} 202 Q${gx(252)} 204 ${gx(262)} 224 Q${gx(258) } 262 ${gx(251)} 300 Q${gx(247)} 332 ${gx(254)} 368 Q200 380 ${gx(146)} 368 Q${gx(153)} 332 ${gx(149)} 300 Q${gx(142)} 262 ${gx(138)} 224 Z`;
  const shorts = `M${gx(146)} 350 L${gx(254)} 350 Q${gx(262)} 400 ${gx(272)} 458 L${gx(208)} 464 L200 420 L${gx(192)} 464 L${gx(128)} 458 Q${gx(138)} 400 ${gx(146)} 350Z`;
  return (
    <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>
      {legF(hipL, kL, ankL, -1)}{legF(hipR, kR, ankR, 1)}
      <g transform={`translate(0 ${dy})`}>
      <path d={shorts} fill={G.shorts} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M${gx(150)} 356 L${gx(250)} 356`} stroke="#3A404E" strokeWidth={6} opacity={0.8} />
      {glow > 0 && <><ellipse cx={170} cy={420} rx={20 + 14 * glow} ry={46 + 10 * glow} fill={glowColor} opacity={0.62} stroke={OL} strokeWidth={OW} strokeOpacity={0.5} /><ellipse cx={230} cy={420} rx={20 + 14 * glow} ry={46 + 10 * glow} fill={glowColor} opacity={0.62} stroke={OL} strokeWidth={OW} strokeOpacity={0.5} /></>}
      <Cap a={[200, 186]} b={[200, 214]} w={28} c={SK} />
      <path d={torso} fill={shirt} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      {g > 1.02 && <ellipse cx={200} cy={338} rx={gx(52) - 200 + 4} ry={26 + 22 * (g - 1)} fill={shade(shirt, 0.92)} opacity={0.8} />}
      <path d={`M${gx(165)} 252 Q200 270 ${gx(235)} 252`} fill="none" stroke={shade(shirt, 0.78)} strokeWidth={4} strokeLinecap="round" /><path d={`M${gx(176)} 300 Q200 308 ${gx(224)} 300`} fill="none" stroke={shade(shirt, 0.84)} strokeWidth={3.4} strokeLinecap="round" opacity={0.7} />
      <path d="M184 205 L200 228 L216 205" fill="none" stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      {tank && <path d="M168 210 L232 210 L232 230 L168 230Z" fill="none" />}
      </g>
      {barbell && <g><line x1={20} y1={214 + dy} x2={380} y2={214 + dy} stroke={OL} strokeWidth={14} strokeLinecap="round" /><line x1={20} y1={214 + dy} x2={380} y2={214 + dy} stroke="#9AA0AA" strokeWidth={8} strokeLinecap="round" /><rect x={28} y={150 + dy} width={30} height={128} rx={8} fill="#1C1D22" stroke={OL} strokeWidth={4} /><rect x={342} y={150 + dy} width={30} height={128} rx={8} fill="#1C1D22" stroke={OL} strokeWidth={4} /><rect x={58} y={168 + dy} width={18} height={92} rx={6} fill="#1C1D22" stroke={OL} strokeWidth={4} /><rect x={324} y={168 + dy} width={18} height={92} rx={6} fill="#1C1D22" stroke={OL} strokeWidth={4} /></g>}
      <g transform={`translate(0 ${dy})`}>
      {arm(shL, eL, handL, -1)}{arm(shR, eR, handR, 1)}
      {(bicep > 0 || pumpGlow > 0) && [[shL, eL], [shR, eR]].map(([a, b], i) => { const m = lp(a as V, b as V, 0.62); return <g key={i}>{pumpGlow > 0 && <circle cx={m[0]} cy={m[1]} r={34 + 30 * bicep} fill="#FF5A3C" opacity={0.25 * pumpGlow} />}<circle cx={m[0]} cy={m[1]} r={16 + 22 * bicep} fill={pumpGlow > 0 ? '#F7A27E' : SK} stroke={OL} strokeWidth={OW} />{bicep > 0.5 && <path d={`M${m[0] - 8} ${m[1] - 6} q6 -6 12 0`} stroke="#C0392B" strokeWidth={3} fill="none" opacity={bicep} />}</g>; })}
      {curl >= 0 && [handL, handR].map((hd, i) => <g key={i} transform={`translate(${hd[0]} ${hd[1]})`}><rect x={-30} y={-5} width={60} height={10} rx={4} fill="#9AA0AA" stroke={OL} strokeWidth={3} /><rect x={-40} y={-20} width={16} height={40} rx={5} fill="#1C1D22" stroke={OL} strokeWidth={3} /><rect x={24} y={-20} width={16} height={40} rx={5} fill="#1C1D22" stroke={OL} strokeWidth={3} /><Hand p={[0, 0]} from={[0, -20]} c={SK} fist side={1} r={1.0} /></g>)}
      {point && <g>
        <path d={`M${handR[0] - 30} ${handR[1] - 6} Q${handR[0] - 34} ${handR[1] + 30} ${handR[0]} ${handR[1] + 34} Q${handR[0] + 34} ${handR[1] + 32} ${handR[0] + 32} ${handR[1]} Q${handR[0] + 30} ${handR[1] - 30} ${handR[0]} ${handR[1] - 30} Q${handR[0] - 26} ${handR[1] - 30} ${handR[0] - 30} ${handR[1] - 6}Z`} fill={SK} stroke={OL} strokeWidth={OW} />
        <path d={`M${handR[0] - 22} ${handR[1] + 8} q10 6 20 0 M${handR[0] - 20} ${handR[1] + 20} q10 6 20 0`} stroke={OL} strokeWidth={3} fill="none" />
        <circle cx={handR[0] + 6} cy={handR[1] - 8} r={21} fill={SK} stroke={OL} strokeWidth={OW} />
        <ellipse cx={handR[0] + 8} cy={handR[1] - 12} rx={10} ry={8} fill="#FFE6D8" stroke={OL} strokeWidth={2.5} />
      </g>}
      {stopwatch && <g transform={`translate(${handL[0]} ${handL[1] - 30})`}><circle r={28} fill="#fff" stroke={OL} strokeWidth={5} /><rect x={-6} y={-38} width={12} height={9} fill={OL} /><path d="M0 0 L0 -18 M0 0 L13 6" stroke={G.red} strokeWidth={4} /></g>}
      <g transform={`translate(0 ${headDy}) rotate(${headTilt} 200 190)`}>
      {/* head */}
      <circle cx={152} cy={146} r={11} fill={SK} stroke={OL} strokeWidth={OW} /><circle cx={248} cy={146} r={11} fill={SK} stroke={OL} strokeWidth={OW} />
      <circle cx={200} cy={140} r={48} fill={SK} stroke={OL} strokeWidth={OW} />
      <circle cx={200} cy={140} r={46} fill="#fff" opacity={0.22 * tired + 0.32 * pale} />
      {hair === 'short' ? <path d="M152 142 Q146 90 200 88 Q254 90 248 142 Q240 112 214 110 Q196 120 172 112 Q158 120 152 142 Z" fill={HAIR} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
        : <><path d="M154 132 Q156 96 200 92 Q244 96 246 132 Q230 112 200 110 Q170 112 154 132Z" fill="#8C7B70" opacity={0.35} /><polygon points="182,106 172,64 188,80 190,40 200,64 210,38 212,80 228,62 218,106" fill={MOH} stroke={OL} strokeWidth={OW} strokeLinejoin="round" /></>}
      {hp && <g><path d="M150 150 Q150 74 200 74 Q250 74 250 150" stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M150 150 Q150 74 200 74 Q250 74 250 150" stroke="#2A2D35" strokeWidth={8} fill="none" strokeLinecap="round" /><rect x={134} y={124} width={30} height={46} rx={13} fill="#2A2D35" stroke={OL} strokeWidth={OW} /><rect x={236} y={124} width={30} height={46} rx={13} fill="#2A2D35" stroke={OL} strokeWidth={OW} /><rect x={141} y={134} width={14} height={26} rx={6} fill={G.blue} /><rect x={245} y={134} width={14} height={26} rx={6} fill={G.blue} /></g>}
      {beard && <path d="M154 146 Q154 198 200 200 Q246 198 246 146 Q238 168 214 166 L200 160 L186 166 Q162 168 154 146 Z" fill={HAIR} stroke={OL} strokeWidth={OW} strokeLinejoin="round" />}
      <Eye cx={183} cy={138} lid={Math.max(blink, yawn > 0.2 ? 0.95 : 0, tired * 0.5)} look={look} strain={mood === 'strain'} tired={tired} /><Eye cx={217} cy={138} lid={Math.max(blink, yawn > 0.2 ? 0.95 : 0, tired * 0.5)} look={look} strain={mood === 'strain'} tired={tired} />
      <path d={mood === 'worry' || mood === 'strain' || tired > 0.5 ? 'M172 120 L192 126 M228 120 L208 126' : 'M172 124 Q183 118 194 123 M206 123 Q217 118 228 124'} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M200 142 Q206 156 196 160" stroke={OL} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d={mood === 'smile' ? 'M184 172 Q200 188 216 172' : mood === 'worry' ? 'M186 182 Q200 170 214 182' : mood === 'strain' ? 'M182 172 L218 172 L218 182 L182 182Z' : 'M188 178 L212 178'} stroke={beard ? '#fff' : OL} strokeWidth={4} fill={mood === 'strain' ? '#fff' : 'none'} strokeLinecap="round" strokeLinejoin="round" />
      {yawn > 0 && <g><ellipse cx={200} cy={176 + 6 * yawn} rx={11 + 9 * yawn} ry={4 + 17 * yawn} fill="#7A2E2A" stroke={OL} strokeWidth={OW} /><ellipse cx={200} cy={186 + 10 * yawn} rx={7 + 5 * yawn} ry={3 + 5 * yawn} fill="#D9726A" /></g>}
      {sweat > 0 && <path d={`M${248} ${104 + 24 * sweat} q-7 12 0 15 q7 -3 0 -15z`} fill="#8FD3FF" stroke={OL} strokeWidth={2.5} opacity={1 - sweat * 0.6} />}
      </g>
      </g>
    </svg>
  );
};
