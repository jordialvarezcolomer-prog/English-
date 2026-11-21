import React, {useId} from 'react';
import {FONT, G, OL, V, ik, ik2} from './kit';

/* Primitives for the shoulder video: gym tower + pulley, taut cable, row triangle, golden deltoids, HUD tags. All in screen px (1080x1920). */
export const GOLD = '#F6B93B', GOLD_D = '#C98A10', GOLD_L = '#FFE08A';
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';
const rad = (d: number) => (d * Math.PI) / 180;

/* ---------- geometry helpers (mirror kit.tsx so overlays line up with the characters) ---------- */
export const frontGeom = (o: {x: number; y: number; s: number; handL: V; handR: V; crouch?: number}) => {
  const dy = (o.crouch ?? 0) * 62, P = (v: V): V => [o.x + v[0] * o.s, o.y + v[1] * o.s];
  const shL: V = [140, 226 + dy], shR: V = [260, 226 + dy];
  return {shL: P(shL), shR: P(shR), eL: P(ik2(shL, o.handL, 82, 75)), eR: P(ik2(shR, o.handR, 82, 75)), hL: P(o.handL), hR: P(o.handR), head: P([200, 140 + dy * 0]), P};
};
export const sideGeom = (o: {x: number; y: number; s: number; sh: V; handL: V; handR: V; head: V; flip?: boolean; armBend?: 1 | -1}) => {
  const P = (v: V): V => (o.flip ? [o.x + (400 - v[0]) * o.s, o.y + v[1] * o.s] : [o.x + v[0] * o.s, o.y + v[1] * o.s]);
  const ab = o.armBend ?? -1;
  return {sh: P(o.sh), eL: P(ik(o.sh, o.handL, 74, 68, ab)), eR: P(ik(o.sh, o.handR, 74, 68, ab)), hL: P(o.handL), hR: P(o.handR), head: P(o.head), P};
};

/* ---------- golden deltoid overlay ---------- */
/** Front/back view: one cap per shoulder, oriented along the upper arm. act 0..1 lights it up with pulsing rings. */
export const DeltCap: React.FC<{p: V; q: V; s: number; act: number; t: number; rear?: boolean}> = ({p, q, s, act, t, rear}) => {
  const ang = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
  const c: V = [p[0] + (q[0] - p[0]) * 0.28, p[1] + (q[1] - p[1]) * 0.28];
  const base = 0.5 + 0.5 * act;
  return (
    <g>
      {act > 0.05 && <circle cx={c[0]} cy={c[1]} r={(105 + 14 * Math.sin(t * 9)) * s} fill="url(#goldGlow)" opacity={act} />}
      {act > 0.3 && [0, 1].map((k) => { const ph = (t * 1.6 + k * 0.5) % 1; return <circle key={k} cx={c[0]} cy={c[1]} r={(34 + 70 * ph) * s} fill="none" stroke={GOLD} strokeWidth={5 * (1 - ph)} opacity={0.9 * (1 - ph) * act} />; })}
      <g transform={`translate(${c[0]} ${c[1]}) rotate(${ang})`} opacity={base}>
        <ellipse rx={44 * s} ry={30 * s} fill={act > 0.05 ? GOLD : '#E9CE93'} stroke={OL} strokeWidth={3} />
        {[-18, -6, 6, 18].map((y, i) => <path key={i} d={`M${-34 * s} ${y * s * 0.9} Q0 ${(y - 5) * s} ${34 * s} ${y * s * 0.9}`} fill="none" stroke={GOLD_D} strokeWidth={2.6} opacity={0.8} />)}
        <path d={`M${-30 * s} ${-14 * s} Q0 ${-30 * s} ${30 * s} ${-14 * s}`} fill="none" stroke={GOLD_L} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        {rear && <path d={`M${-34 * s} ${14 * s} Q0 ${30 * s} ${34 * s} ${14 * s}`} fill="none" stroke={GOLD_D} strokeWidth={3} opacity={0.6} />}
      </g>
    </g>
  );
};
/** Profile view: the cap is split into front / side / rear heads; `acts` = [front, side, rear]. dir = +1 facing right. */
export const DeltSide: React.FC<{sh: V; el: V; s: number; acts: [number, number, number]; t: number; dir: 1 | -1}> = ({sh, el, s, acts, t, dir}) => {
  const id = useId().replace(/:/g, '');
  const ang = (Math.atan2(el[1] - sh[1], el[0] - sh[0]) * 180) / Math.PI - 90;
  const any = Math.max(...acts);
  const bands = [[9, 30], [-9, 9], [-30, -9]]; // front, side, rear along the body's forward axis
  return (
    <g>
      {any > 0.05 && <circle cx={sh[0]} cy={sh[1] + 10 * s} r={(100 + 12 * Math.sin(t * 9)) * s} fill="url(#goldGlow)" opacity={any} />}
      {any > 0.3 && [0, 1].map((k) => { const ph = (t * 1.6 + k * 0.5) % 1; return <circle key={k} cx={sh[0]} cy={sh[1] + 10 * s} r={(30 + 70 * ph) * s} fill="none" stroke={GOLD} strokeWidth={5 * (1 - ph)} opacity={0.9 * (1 - ph) * any} />; })}
      <g transform={`translate(${sh[0]} ${sh[1]}) rotate(${ang})`}>
        <clipPath id={id}><ellipse cx={0} cy={16 * s} rx={30 * s} ry={42 * s} /></clipPath>
        {bands.map(([a, b], i) => <rect key={i} clipPath={`url(#${id})`} x={(dir > 0 ? a : -b) * s} y={-30 * s} width={(b - a) * s} height={100 * s} fill={acts[i] > 0.05 ? GOLD : '#E9CE93'} opacity={0.45 + 0.55 * acts[i]} />)}
        <ellipse cx={0} cy={16 * s} rx={30 * s} ry={42 * s} fill="none" stroke={OL} strokeWidth={3} />
        {[-9, 9].map((x, i) => <line key={i} x1={x * s * dir} y1={-26 * s} x2={x * s * dir} y2={58 * s} stroke={OL} strokeWidth={2} opacity={0.5} />)}
        {[-14, 0, 14].map((x, i) => <path key={i} d={`M${x * s} ${-10 * s} Q${(x + 3) * s} ${20 * s} ${x * s} ${50 * s}`} fill="none" stroke={GOLD_D} strokeWidth={2.2} opacity={0.65} />)}
      </g>
    </g>
  );
};
export const GoldDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}><defs><radialGradient id="goldGlow"><stop offset="0" stopColor="#FFD560" stopOpacity={0.75} /><stop offset="0.6" stopColor="#FFC93C" stopOpacity={0.28} /><stop offset="1" stopColor="#FFC93C" stopOpacity={0} /></radialGradient></defs></svg>
);

/* ---------- cable tower ---------- */
/** Tower whose rails span [x, x+w]. `faceRight` = the pulley hangs on the right side (tower on the left of the lifter). Returns nothing; use machinePulley() for the cable end. */
export const machinePulley = (x: number, w: number, carriageY: number, faceRight: boolean, k = 1): V => [faceRight ? x + w + 26 * k : x - 26 * k, carriageY];
export const Machine: React.FC<{x: number; w?: number; floor: number; top: number; carriageY: number; faceRight?: boolean; lift?: number; k?: number; glow?: number; t?: number}> = ({x, w = 230, floor, top, carriageY, faceRight = true, lift = 0, k = 1, glow = 0, t = 0}) => {
  const rows = 15, rh = (floor - 60 - (top + 120)) / rows, pin = 7;
  const px = faceRight ? x + w + 26 * k : x - 26 * k;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {/* base + rails + head */}
      <rect x={x - 20} y={floor - 26} width={w + 40} height={26} rx={8} fill="#3A3F4B" stroke={OL} strokeWidth={4} />
      <rect x={x} y={top} width={26} height={floor - top - 20} rx={6} fill="#4C5260" stroke={OL} strokeWidth={4} /><rect x={x + w - 26} y={top} width={26} height={floor - top - 20} rx={6} fill="#4C5260" stroke={OL} strokeWidth={4} />
      <rect x={x - 6} y={top - 10} width={w + 12} height={46} rx={12} fill="#2F333D" stroke={OL} strokeWidth={4} />
      {/* guide rods */}
      <rect x={x + w * 0.3} y={top + 36} width={8} height={floor - top - 70} fill="#9AA0AA" stroke={OL} strokeWidth={2} /><rect x={x + w * 0.7 - 8} y={top + 36} width={8} height={floor - top - 70} fill="#9AA0AA" stroke={OL} strokeWidth={2} />
      {/* weight stack: plates above the pin rise with the cable */}
      {Array.from({length: rows}).map((_, i) => { const up = i <= pin ? lift : 0; return <g key={i}><rect x={x + 30} y={top + 120 + i * rh - up} width={w - 60} height={rh - 5} rx={5} fill="#2A2D35" stroke={OL} strokeWidth={3} /><rect x={x + 40} y={top + 124 + i * rh - up} width={w - 80} height={4} rx={2} fill="#4A4F5C" /></g>; })}
      <rect x={x + w - 66} y={top + 120 + pin * rh - lift + 4} width={40} height={10} rx={4} fill="#F4C20D" stroke={OL} strokeWidth={2.5} />
      {/* carriage track + pulley */}
      <rect x={faceRight ? x + w - 4 : x - 14} y={top + 40} width={18} height={floor - top - 90} rx={6} fill="#3A3F4B" stroke={OL} strokeWidth={3} />
      <rect x={faceRight ? x + w - 8 : x - 22} y={carriageY - 26} width={26} height={52} rx={8} fill="#E8B923" stroke={OL} strokeWidth={4} />
      {glow > 0 && <circle cx={px} cy={carriageY} r={70 + 12 * Math.sin(t * 10)} fill="url(#goldGlow)" opacity={glow} />}
      <circle cx={px} cy={carriageY} r={22 * k} fill="#2F333D" stroke={OL} strokeWidth={5} /><circle cx={px} cy={carriageY} r={8 * k} fill="#C9CDD4" stroke={OL} strokeWidth={3} />
    </svg>
  );
};

/* ---------- cable + row triangle ---------- */
export const Cable: React.FC<{a: V; b: V; tension?: number; t: number}> = ({a, b, tension = 0, t}) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#5B606C" strokeWidth={4} strokeLinecap="round" />
      {tension > 0.05 && <>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={GOLD} strokeWidth={14} strokeLinecap="round" opacity={0.35 * tension} />
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={GOLD_L} strokeWidth={5} strokeLinecap="round" strokeDasharray="26 38" strokeDashoffset={-(t * 260) % 64} opacity={tension} />
      </>}
      {len < 0 && null}
    </g>
  );
};
/** Row triangle (V-handle). Origin = swivel ring at the apex; apex points at `toward`. grip: where a hand sits along the bar. */
export const triFrame = (apex: V, toward: V) => { const dx = toward[0] - apex[0], dy = toward[1] - apex[1]; return (Math.atan2(dx, -dy) * 180) / Math.PI; };
export const triGrip = (apex: V, ang: number, s: number, gx: number): V => { const a = rad(ang), lx = gx * s, ly = 118 * s; return [apex[0] + lx * Math.cos(a) - ly * Math.sin(a), apex[1] + lx * Math.sin(a) + ly * Math.cos(a)]; };
export const Triangle: React.FC<{apex: V; ang: number; s: number}> = ({apex, ang, s}) => (
  <g transform={`translate(${apex[0]} ${apex[1]}) rotate(${ang}) scale(${s})`}>
    <path d="M0 6 L-66 112 M0 6 L66 112" stroke={OL} strokeWidth={22} strokeLinecap="round" /><path d="M0 6 L-66 112 M0 6 L66 112" stroke="#6B7180" strokeWidth={12} strokeLinecap="round" />
    <rect x={-92} y={100} width={184} height={34} rx={14} fill="#1C1D22" stroke={OL} strokeWidth={5} />
    <rect x={-60} y={104} width={120} height={8} rx={4} fill="#3A3F4B" />
    <rect x={-100} y={104} width={14} height={26} rx={6} fill="#C9CDD4" stroke={OL} strokeWidth={3} /><rect x={86} y={104} width={14} height={26} rx={6} fill="#C9CDD4" stroke={OL} strokeWidth={3} />
    <circle r={14} fill="#C9CDD4" stroke={OL} strokeWidth={5} /><circle r={5} fill="#2F333D" />
  </g>
);

/* ---------- HUD ---------- */
export const BlackTag: React.FC<{text: string; size?: number; dim?: boolean}> = ({text, size = 24, dim}) => (
  <div style={{display: 'inline-block', background: dim ? '#8C8C8C' : '#0F1115', color: '#fff', fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, borderRadius: size * 0.45, padding: `${size * 0.28}px ${size * 0.7}px`, whiteSpace: 'nowrap', textTransform: 'uppercase', boxShadow: '0 6px 0 rgba(0,0,0,.15)'}}>{text}</div>
);
export const RedTag: React.FC<{text: string; size?: number}> = ({text, size = 24}) => (
  <div style={{display: 'inline-block', background: '#FFF1F0', color: G.red, border: `3px solid ${G.red}`, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, borderRadius: 999, padding: `${size * 0.22}px ${size * 0.8}px`, whiteSpace: 'nowrap', textTransform: 'uppercase'}}>{text}</div>
);
export const Badge: React.FC<{n: string | number; size?: number}> = ({n, size = 84}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: G.red, border: `5px solid #fff`, boxShadow: '0 0 0 4px #17181C', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: size * 0.58, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
);
export const DeltPill: React.FC<{text: string; done?: boolean; active?: boolean}> = ({text, done, active}) => (
  <div style={{display: 'inline-flex', gap: 8, alignItems: 'center', background: done ? '#E6F6EC' : '#F3F1EA', color: done ? '#1E9E55' : active ? '#8A6A1A' : '#555', border: `3px solid ${done ? '#1E9E55' : active ? GOLD : '#7A7F8C'}`, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 2, borderRadius: 999, padding: '5px 22px'}}>{text}{done ? ' ✓' : ''}</div>
);
export const Strain: React.FC<{p: V; t: number; color?: string; n?: number; r?: number}> = ({p, t, color = G.red, n = 4, r = 1}) => (
  <g>{Array.from({length: n}).map((_, i) => { const a = -0.9 + (i / (n - 1)) * 1.8 - Math.PI / 2 * 0; const ph = 0.5 + 0.5 * Math.sin(t * 14 + i); const r0 = 44 * r, r1 = (64 + 22 * ph) * r; return <line key={i} x1={p[0] + Math.cos(a - 0.3) * r0} y1={p[1] + Math.sin(a - 0.3) * r0} x2={p[0] + Math.cos(a - 0.3) * r1} y2={p[1] + Math.sin(a - 0.3) * r1} stroke={color} strokeWidth={6 * r} strokeLinecap="round" />; })}</g>
);
export const Arrow: React.FC<{a: V; b: V; color?: string; w?: number}> = ({a, b, color = G.red, w = 9}) => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = 30;
  return <g stroke={color} fill={color}><line x1={a[0]} y1={a[1]} x2={b[0] - Math.cos(ang) * 12} y2={b[1] - Math.sin(ang) * 12} strokeWidth={w} strokeLinecap="round" /><path d={`M${b[0]} ${b[1]} L${b[0] - Math.cos(ang - 0.5) * hl} ${b[1] - Math.sin(ang - 0.5) * hl} L${b[0] - Math.cos(ang + 0.5) * hl} ${b[1] - Math.sin(ang + 0.5) * hl}Z`} strokeWidth={2} strokeLinejoin="round" /></g>;
};
