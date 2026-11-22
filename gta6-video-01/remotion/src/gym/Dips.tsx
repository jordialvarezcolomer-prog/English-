import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {FONT, FrontPerson, G, OL, Person, Pose, V, ik} from './kit';
import {FPS} from '../theme';
import SEG from './ep04_segments.json';

/* =====================================================================================
   BENCH DIPS vs BAR DIPS — Alex (lime hoodie) vs Daniel (coral tee). UK English pilot.
   Source: McKenzie et al. 2022, IJERPH 19(20):13211 — 13 trained men, surface EMG.
   Plan: docs/PLAN_dips_uk.md
   ===================================================================================== */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const eo = Easing.out(Easing.cubic), eio = Easing.inOut(Easing.cubic);
const useT = () => useCurrentFrame() / FPS;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpV = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sec = SEG as {start: number; end: number; text: string}[];
const T = (i: number) => sec[i].start;
const END = sec[21].end + 1.2;
export const DIPS_TOTAL = Math.round(END * FPS);
const LIME = '#B6F23C', LIME_D = '#7FB51A', CORAL = '#FF6F61', CORAL_D = '#D94A3E', AMBER = '#FFB020', INK = '#17181C';
const MONO = '"DejaVu Sans Mono", monospace';
const FL = 1250; // floor line

/* ---------------- time bounds of each scene ---------------- */
const B = {
  open: [0, T(2)], setup: [T(2), T(5)], study: [T(5), T(6)], result: [T(6), T(9)], rings: [T(9), T(11)],
  shoulder: [T(11), T(12)], scale: [T(12), T(13)], verdict: [T(13), T(17)], grow: [T(17), T(20)], ask: [T(20), END],
} as const;
type BK = keyof typeof B;
const rel = (i: number, k: BK) => T(i) - B[k][0];
/** dip cycle: 0 = arms straight (top), 1 = bottom. ~1.2 s per rep, same tempo for everybody. */
const dipK = (t: number, phase = 0, period = 1.2) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (t / period + phase));

/* ---------------- shared UI ---------------- */
const Pop: React.FC<{at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, out, children, style}) => {
  const t = useT(); const d = t - at;
  if (d < 0 || (out !== undefined && t > out + 0.15)) return null;
  const p = interpolate(d, [0, 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.15], [1, 0], clamp);
  return <div style={{position: 'absolute', opacity: Math.min(1, p * 1.5) * o, transform: `scale(${0.55 + 0.45 * p})`, ...style}}>{children}</div>;
};
const Tag: React.FC<{text: string; color?: string; fg?: string; size?: number; icon?: string}> = ({text, color = INK, fg = '#fff', size = 30, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: color, color: fg, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, borderRadius: size * 0.5, padding: `${size * 0.26}px ${size * 0.8}px`, whiteSpace: 'nowrap', textTransform: 'uppercase', boxShadow: '0 6px 0 rgba(0,0,0,.18)'}}>{icon && <span>{icon}</span>}{text}</div>
);
const Impact: React.FC<{at: number[]; children: React.ReactNode}> = ({at, children}) => {
  const t = useT(); let k = 0, sh = 0, fl = 0;
  for (const a of at) { const d = t - a; if (d >= 0 && d < 0.6) { k += 0.045 * Math.exp(-d * 9); if (d < 0.22) sh += (1 - d / 0.22) * 8; if (d < 0.12) fl = Math.max(fl, 0.35 * (1 - d / 0.12)); } }
  return (<AbsoluteFill><AbsoluteFill style={{transform: `translate(${Math.sin(t * 97) * sh}px,${Math.cos(t * 83) * sh}px) scale(${1 + k})`}}>{children}</AbsoluteFill><AbsoluteFill style={{background: '#fff', opacity: fl}} /></AbsoluteFill>);
};
const MBG: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: '#EEEDE8', backgroundImage: `linear-gradient(#DAD9D2 1px, transparent 1px), linear-gradient(90deg, #DAD9D2 1px, transparent 1px)`, backgroundSize: '60px 60px', backgroundPosition: `${-t * 30}px ${-t * 18}px`}} />;
};
const Zoom: React.FC<{z: number; fx: number; fy: number; cy?: number; cx?: number; children: React.ReactNode}> = ({z, fx, fy, cx = 540, cy = 960, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${cx}px, ${cy}px) scale(${z}) translate(${-fx}px, ${-fy}px)`}}>{children}</div>
);
const Header: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 60, top: 238, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: '#6a6a66'}}>LAB NOTES · PILOT</div>
    <div style={{position: 'absolute', right: 70, top: 226, background: '#FFF6E0', color: '#B7791F', border: `3px solid ${AMBER}`, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 4, borderRadius: 999, padding: '6px 26px'}}>TRICEPS</div>
  </>
);
const Footer: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1335, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: 1.5, color: '#7C7C76'}}>McKenzie et al., 2022 · 13 trained men · EMG</div>
);

/** Game-style HP bar. v 0..1 fills; ghost 0..1 draws a hatched "missing" extension. */
const HP: React.FC<{x: number; y: number; w: number; h?: number; v: number; color: string; dark: string; label: string; val?: string; ghost?: number; flash?: number; t?: number}> = ({x, y, w, h = 54, v, color, dark, label, val, ghost = 0, flash = 0, t = 0}) => {
  const inner = w - 16, fw = Math.max(0, v) * inner;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w}}>
      <div style={{position: 'absolute', left: 0, top: -44, display: 'flex', gap: 10, alignItems: 'center'}}><Tag text={label} color={color} fg={INK} size={24} />{val && <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color: dark, lineHeight: 1, transform: `scale(${1 + 0.18 * flash})`, transformOrigin: 'left center'}}>{val}</div>}</div>
      <div style={{height: h, borderRadius: h / 2, background: INK, padding: 8, boxShadow: '0 8px 0 rgba(0,0,0,.18)', position: 'relative'}}>
        <div style={{position: 'relative', height: '100%', borderRadius: h / 2, background: '#2D3038', overflow: 'hidden'}}>
          {ghost > 0 && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: ghost * inner, background: `repeating-linear-gradient(45deg, ${color}55 0 8px, transparent 8px 16px)`, border: `2px dashed ${color}`}} />}
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: fw, borderRadius: h / 2, background: `linear-gradient(180deg, ${color}, ${dark})`, boxShadow: flash > 0 ? `0 0 ${30 * flash}px ${color}` : undefined}}>
            <div style={{position: 'absolute', left: 8, right: 8, top: 5, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.45)'}} />
          </div>
          {Array.from({length: 11}).map((_, i) => <div key={i} style={{position: 'absolute', left: ((i + 1) * inner) / 12, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,.35)'}} />)}
          {v > 0.02 && <div style={{position: 'absolute', left: fw - 4 + Math.sin(t * 30) * 0, top: -4, width: 8, height: h + 8, background: '#fff', opacity: 0.7 * flash}} />}
        </div>
      </div>
    </div>
  );
};

/* ---------------- characters + equipment (side view, box coords 400x600, floor y=565) ---------------- */
const BoxSvg: React.FC<{x: number; y: number; s: number; children: React.ReactNode; opacity?: number}> = ({x, y, s, children, opacity = 1}) => (
  <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>{children}</svg>
);
const BenchEq: React.FC<{x?: number; y?: number; w?: number}> = ({x = -20, y = 419, w = 170}) => (
  <g>
    <rect x={x + 18} y={y + 24} width={16} height={565 - y - 24} fill="#3A3F4B" stroke={OL} strokeWidth={4} /><rect x={x + w - 34} y={y + 24} width={16} height={565 - y - 24} fill="#3A3F4B" stroke={OL} strokeWidth={4} />
    <rect x={x} y={y} width={w} height={30} rx={13} fill="#4C5260" stroke={OL} strokeWidth={4.5} /><rect x={x + 10} y={y + 5} width={w - 20} height={7} rx={3} fill="#6B7180" />
  </g>
);
const BarsEq: React.FC<{x?: number}> = ({x = 0}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={150} y={558} width={150} height={10} rx={5} fill="#3A3F4B" stroke={OL} strokeWidth={3} />
    <rect x={160} y={330} width={14} height={232} fill="#4C5260" stroke={OL} strokeWidth={4} /><rect x={276} y={330} width={14} height={232} fill="#4C5260" stroke={OL} strokeWidth={4} />
    <rect x={150} y={316} width={150} height={18} rx={9} fill="#9AA0AA" stroke={OL} strokeWidth={4.5} /><rect x={160} y={320} width={130} height={5} rx={2.5} fill="#D5D9E0" />
  </g>
);
const RingsEq: React.FC = () => (
  <g>
    <rect x={120} y={-40} width={200} height={14} rx={7} fill="#4C5260" stroke={OL} strokeWidth={4} />
    {[190, 250].map((rx, i) => <g key={i}><line x1={rx} y1={-26} x2={rx} y2={310} stroke="#E8DFC8" strokeWidth={9} /><line x1={rx} y1={-26} x2={rx} y2={310} stroke={OL} strokeWidth={2} opacity={0.5} /><circle cx={rx} cy={322} r={22} fill="none" stroke={OL} strokeWidth={13} /><circle cx={rx} cy={322} r={22} fill="none" stroke="#C9A36B" strokeWidth={7} /></g>)}
  </g>
);
/** Bench dip pose, facing right, back to the bench. k 0 top .. 1 bottom. ft: 0 feet on floor (straight legs) .. 1 feet on a second bench; kn: knee bend (feet pulled in). */
const benchPose = (k: number, ft = 0, kn = 0): Pose => {
  const sh: V = [132, 276 + 62 * k], hip: V = [150 - 4 * k, 426 + 62 * k];
  const foot: V = ft > 0 ? lerpV([278 - 70 * kn, 565], [300, 410], ft) : [278 - 72 * kn, 565];
  return {hip, sh, head: [sh[0] + 22, sh[1] - 58], handL: [112, 419], handR: [124, 419], footL: foot, footR: [foot[0] - 22, foot[1]], legBend: 1, armBend: -1};
};
/** Parallel-bar dip pose, facing right, body suspended. */
const barPose = (k: number): Pose => {
  const sh: V = [220, 192 + 72 * k], hip: V = [206 - 4 * k, 342 + 72 * k];
  return {hip, sh, head: [sh[0] + 10, sh[1] - 56], handL: [212, 330], handR: [226, 330], footL: [162, 480 + 38 * k], footR: [140, 470 + 38 * k], legBend: 1, armBend: -1};
};
/** Ring dip: same as bars but the hands travel with the rings and body leans a touch. */
const ringPose = (k: number): Pose => ({...barPose(k), handL: [196, 322], handR: [250, 322]});
const Hoodie: React.FC<{p: Pose; s: number; x: number; y: number}> = ({p, s, x, y}) => {
  const P = (v: V): V => [x + v[0] * s, y + v[1] * s];
  const sh = P(p.sh), hip = P(p.hip), hd = P(p.head), mid: V = [(sh[0] + hip[0]) / 2, (sh[1] + hip[1]) / 2];
  const ang = (Math.atan2(hip[1] - sh[1], hip[0] - sh[0]) * 180) / Math.PI - 90;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <path d={`M${sh[0] - 22 * s} ${sh[1] - 8 * s} Q${sh[0] - 14 * s} ${sh[1] - 42 * s} ${sh[0] + 14 * s} ${sh[1] - 30 * s} Q${sh[0] + 22 * s} ${sh[1] - 12 * s} ${sh[0] + 6 * s} ${sh[1] - 6 * s} Q${sh[0] - 8 * s} ${sh[1] - 2 * s} ${sh[0] - 22 * s} ${sh[1] - 8 * s}Z`} fill={LIME} stroke={OL} strokeWidth={3.4} strokeLinejoin="round" transform={`rotate(${ang} ${sh[0]} ${sh[1]})`} />
      <path d={`M${hd[0] - 4} ${hd[1] + 46 * s} L${hd[0] - 6} ${sh[1] + 36 * s} M${hd[0] + 8} ${hd[1] + 46 * s} L${hd[0] + 10} ${sh[1] + 34 * s}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};
const AlexSide: React.FC<{x: number; y: number; s: number; pose: Pose; mood?: 'smile' | 'flat' | 'strain' | 'worry'}> = ({x, y, s, pose, mood = 'flat'}) => (
  <><Person pose={pose} shirt={LIME} phones cap={false} s={s} x={x} y={y} mood={mood} fists={false} /><Hoodie p={pose} s={s} x={x} y={y} /></>
);
const DanSide: React.FC<{x: number; y: number; s: number; pose: Pose; mood?: 'smile' | 'flat' | 'strain' | 'worry'; sweat?: number}> = ({x, y, s, pose, mood = 'flat', sweat = 0}) => (
  <Person pose={pose} shirt={CORAL} phones={false} cap beard s={s} x={x} y={y} mood={mood} fists sweat={sweat} />
);
const AlexBench: React.FC<{x: number; y: number; s: number; k: number; ft?: number; kn?: number}> = ({x, y, s, k, ft = 0, kn = 0}) => (
  <>
    <BoxSvg x={x} y={y} s={s}><BenchEq />{ft > 0.02 && <g opacity={ft}><BenchEq x={285} y={412} w={120} /></g>}</BoxSvg>
    <AlexSide x={x} y={y} s={s} pose={benchPose(k, ft, kn)} mood={k > 0.5 ? 'strain' : 'smile'} />
  </>
);
const DanBars: React.FC<{x: number; y: number; s: number; k: number; t?: number}> = ({x, y, s, k, t = 0}) => (
  <>
    <BoxSvg x={x} y={y} s={s}><BarsEq /></BoxSvg>
    <DanSide x={x} y={y} s={s} pose={barPose(k)} mood={k > 0.5 ? 'strain' : 'flat'} sweat={k > 0.6 ? (t * 1.6) % 1 : 0} />
  </>
);
const sensor = (x: number, y: number, s: number) => (
  <g transform={`translate(${x} ${y})`}><rect x={-9 * s} y={-12 * s} width={18 * s} height={24 * s} rx={5 * s} fill="#fff" stroke={OL} strokeWidth={2.5} /><circle r={4.5 * s} fill={CORAL_D} /></g>
);

/* ---------------- scoreboard ---------------- */
const Scoreboard: React.FC<{t: number; a: number; d: number; aVal?: string; dVal?: string; fa?: number; fd?: number; ghost?: number; y?: number}> = ({t, a, d, aVal, dVal, fa = 0, fd = 0, ghost = 0, y = 330}) => (
  <>
    <HP x={40} y={y} w={440} v={a} color={LIME} dark={LIME_D} label="ALEX · BENCH" val={aVal} ghost={ghost} flash={fa} t={t} />
    <HP x={600} y={y} w={440} v={d} color={CORAL} dark={CORAL_D} label="DANIEL · BARS" val={dVal} flash={fd} t={t} />
    <div style={{position: 'absolute', left: 484, top: y - 6, width: 112, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: INK, transform: `rotate(${Math.sin(t * 6) * 4}deg) scale(${1 + 0.06 * Math.sin(t * 8)})`}}>VS</div>
  </>
);

/* ================================ SCENES ================================ */
/** piecewise eased keyframes: [[t, value], ...] */
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t <= t1) return lerp(v0, v1, eio(c01((t - t0) / (t1 - t0)))); }
  return keys[keys.length - 1][1];
};
const Open: React.FC = () => {
  const t = useT();
  // "Bench dips" -> push in on Alex doing it; "or bar dips" -> slide to Daniel; then the camera pulls far away to show both
  const z = kf(t, [[0, 1.8], [0.8, 1.8], [1.0, 1.8], [1.8, 1.8], [3.1, 1.0], [4.6, 1.05]]);
  const fx = kf(t, [[0, 215], [0.8, 215], [1.0, 830], [1.8, 830], [3.1, 540]]);
  const fy = kf(t, [[0, 960], [1.8, 960], [3.1, 820]]);
  const per = t < 3.1 ? 0.9 : 1.2; // quick reps for the hook, normal tempo once we are wide
  const k = dipK(t, 0, per);
  return (
    <AbsoluteFill>
      <Zoom z={z} fx={fx} fy={fy}>
        <Floor />
        <div style={{position: 'absolute', left: 536, top: 520, width: 8, height: 740, background: INK, opacity: 0.85}} />
        <AlexBench x={10} y={FL - 650} s={1.15} k={k} />
        <DanBars x={560} y={FL - 650} s={1.15} k={k} t={t} />
      </Zoom>
      <Scoreboard t={t} a={0} d={0} />
      <Pop at={0.05} out={0.95} style={{left: 70, top: 470}}><Tag text="BENCH DIPS" color={LIME} fg={INK} size={40} /></Pop>
      <Pop at={1.0} out={1.85} style={{left: 640, top: 470}}><Tag text="BAR DIPS" color={CORAL} fg={INK} size={40} /></Pop>
      {t > 2.0 && <Pop at={2.0} style={{left: 70, top: 560}}><Tag text="BENCH DIPS" color={LIME} fg={INK} size={30} /></Pop>}
      {t > 2.2 && <Pop at={2.2} style={{left: 700, top: 560}}><Tag text="BAR DIPS" color={CORAL} fg={INK} size={30} /></Pop>}
      {t > rel(1, 'open') + 0.9 && <Pop at={rel(1, 'open') + 0.9} style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}><Tag text="TRICEPS · WHICH ONE WINS?" color={INK} size={26} /></Pop>}
    </AbsoluteFill>
  );
};
const Floor: React.FC<{y?: number}> = ({y = FL}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 6, background: INK}} />;

const Setup: React.FC = () => {
  const t = useT();
  const a3 = rel(3, 'setup'), a4 = rel(4, 'setup');
  const focusD = interpolate(t, [a3 - 0.1, a3 + 0.4, a4 - 0.1, a4 + 0.3], [0, 1, 1, 0], {...clamp, easing: eio});
  const z = lerp(1, 1.3, focusD), fx = lerp(540, 800, focusD), fy = lerp(820, 860, focusD);
  const reps = Math.floor(t / 1.2) + 1;
  return (
    <AbsoluteFill>
      <Zoom z={z} fx={fx} fy={fy}>
        <Floor />
        <div style={{position: 'absolute', left: 536, top: 520, width: 8, height: 740, background: INK, opacity: 0.85}} />
        <AlexBench x={10} y={FL - 650} s={1.15} k={dipK(t)} />
        <DanBars x={560} y={FL - 650} s={1.15} k={dipK(t)} t={t} />
        {/* floor arrow for Alex, body-weight arrow for Daniel */}
        {t > rel(2, 'setup') + 0.9 && <Pop at={rel(2, 'setup') + 0.9} style={{left: 250, top: 1180}}><Tag text="FEET ON FLOOR" color={LIME} fg={INK} size={26} icon="👟" /></Pop>}
        {t > a3 + 0.8 && <Pop at={a3 + 0.8} style={{left: 700, top: 1190}}><Tag text="FULL BODYWEIGHT" color={CORAL} fg={INK} size={26} icon="⬇" /></Pop>}
      </Zoom>
      <Scoreboard t={t} a={0} d={0} />
      {[0, 1].map((i) => <Pop key={i} at={0.1 + i * 0.1} style={{left: 40 + i * 560, top: 500}}><Tag text={`REP ${reps}`} color="#fff" fg={INK} size={22} /></Pop>)}
      {t > a4 && <Pop at={a4} style={{left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}><div style={{display: 'flex', gap: 14, alignItems: 'center', background: INK, borderRadius: 18, padding: '10px 28px', boxShadow: '0 8px 0 rgba(0,0,0,.2)'}}><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: LIME}}>SAME REPS</span><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff'}}>=</span><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: CORAL}}>SAME TEMPO</span></div></Pop>}
    </AbsoluteFill>
  );
};

/* ---- 13 figures with sensors ---- */
const SHIRTS = ['#8E6FD1', '#2FA866', '#F28A1E', '#3D8BFF', '#D83A34', '#8A8A86', '#F2C94C'];
const Pictogram: React.FC<{t: number; zoom: number}> = ({t, zoom}) => {
  const rows = [5, 4, 4]; let n = 0;
  return (
    <>
      {rows.map((cnt, r) => Array.from({length: cnt}).map((_, c) => {
        const i = n++, at = 0.15 + i * 0.13, p = interpolate(t, [at, at + 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.4))});
        const x0 = 540 - (cnt * 150) / 2 + c * 150 + 15, y0 = 500 + r * 210;
        const s = 0.42, centre = r === 1 && c === 1;
        const bob = Math.abs(Math.sin(t * 5 + i)) * 6;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: centre && zoom > 0.5 ? 0 : p, transform: `scale(${0.4 + 0.6 * p}) translateY(${-bob}px)`, transformOrigin: `${x0 + 40}px ${y0 + 120}px`}}>
            <FrontPerson shirt={SHIRTS[i % SHIRTS.length]} phones={false} hair="short" mood="smile" s={s} x={x0 - 40} y={y0 - 20} />
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{sensor(x0 - 40 + 122 * s, y0 - 20 + 280 * s, 0.9)}{t > at + 0.2 && <circle cx={x0 - 40 + 122 * s} cy={y0 - 20 + 280 * s} r={14 + 10 * ((t * 2 + i * 0.3) % 1)} fill="none" stroke={CORAL_D} strokeWidth={2.5} opacity={1 - ((t * 2 + i * 0.3) % 1)} />}</svg>
          </div>
        );
      }))}
    </>
  );
};
const Study: React.FC = () => {
  const t = useT(), len = B.study[1] - B.study[0];
  const zoom = interpolate(t, [len - 2.0, len - 1.5], [0, 1], clamp);
  const wave = (w: number, amp: number) => Array.from({length: 60}).map((_, i) => `${i * (w / 59)},${28 + Math.sin(i * 0.9 + t * 14) * amp * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.37 + t * 6))) * (random(`w${i}${Math.floor(t * 12)}`) + 0.3)}`).join(' ');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - zoom}}>
        <Pictogram t={t} zoom={zoom} />
        <Pop at={0.2} style={{left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center'}}><Tag text="13 TRAINED MEN · EMG" color={INK} size={30} icon="📡" /></Pop>
        {t > 1.9 && <Pop at={1.9} style={{left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}><Tag text="SENSORS ON THE TRICEPS" color={CORAL} fg={INK} size={28} /></Pop>}
      </div>
      {zoom > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: zoom, transform: `scale(${1.2 - 0.2 * zoom})`}}>
          <Floor />
          <DanBars x={330} y={FL - 780} s={1.35} k={dipK(t, 0.2)} t={t} />
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {(() => { const p = barPose(dipK(t, 0.2)); const x = 330, y = FL - 780, s = 1.35; const arm = lerpV(p.sh, [p.handL[0] - 36, p.handL[1] - 55], 0.5); return sensor(x + arm[0] * s - 18, y + arm[1] * s, 1.2); })()}
          </svg>
          <div style={{position: 'absolute', left: 90, top: 470, width: 480, background: '#0E1620', border: `5px solid ${INK}`, borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 0 rgba(0,0,0,.2)'}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: 3, color: '#7CF3B4'}}>TRICEPS · EMG</div>
            <svg width={450} height={56} viewBox="0 0 450 56"><polyline points={wave(450, 22)} fill="none" stroke="#7CF3B4" strokeWidth={3} strokeLinejoin="round" /></svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---- the numbers: HP bars fill ---- */
const Result: React.FC = () => {
  const t = useT();
  const a6 = 0.0, a7 = rel(7, 'result'), a8 = rel(8, 'result');
  const MAX = 1.2;
  const va = interpolate(t, [a6 + 0.35, a6 + 1.3], [0, 0.83], {...clamp, easing: eo}), vd = interpolate(t, [a7 + 0.3, a7 + 1.2], [0, 1.04], {...clamp, easing: eo});
  const fa = Math.exp(-Math.max(0, t - (a6 + 1.3)) * 5) * (t > a6 + 1.3 ? 1 : 0), fd = Math.exp(-Math.max(0, t - (a7 + 1.2)) * 5) * (t > a7 + 1.2 ? 1 : 0);
  const z = interpolate(t, [0, a8], [1, 1.12], clamp);
  const diff = t > a8 + 0.1;
  const inner = 424;
  return (
    <AbsoluteFill>
      <Zoom z={z} fx={540} fy={820}>
        <Floor />
        <div style={{position: 'absolute', left: 536, top: 520, width: 8, height: 740, background: INK, opacity: 0.85}} />
        <AlexBench x={10} y={FL - 650} s={1.15} k={dipK(t)} />
        <DanBars x={560} y={FL - 650} s={1.15} k={dipK(t)} t={t} />
      </Zoom>
      <Scoreboard t={t} a={va / MAX} d={vd / MAX} aVal={`${va.toFixed(2)} mV`} dVal={vd > 0.005 ? `${vd.toFixed(2)} mV` : ''} fa={fa} fd={fd} ghost={diff ? 1.04 / MAX : 0} />
      <Pop at={0.1} style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}><Tag text="PEAK TRICEPS ACTIVATION" color={INK} size={24} /></Pop>
      {diff && (
        <>
          <Pop at={a8 + 0.1} style={{left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center'}}><div style={{background: '#fff', border: `6px solid ${INK}`, borderRadius: 16, padding: '4px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 96, color: CORAL_D, transform: 'rotate(-3deg)', boxShadow: '0 10px 0 rgba(0,0,0,.18)'}}>−20%</div></Pop>
          <Pop at={a8 + 0.35} style={{left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center'}}><Tag text="ON THE BENCH" color={LIME} fg={INK} size={28} /></Pop>
        </>
      )}
      {t > a7 - 0.2 && t < a7 + 0.4 && <div style={{position: 'absolute', left: 600 + 8 + (inner * vd) / 1.2 - 20, top: 322, fontSize: 40}}>✨</div>}
    </AbsoluteFill>
  );
};

/* ---- three lanes: bench / bars / rings ---- */
const Lane: React.FC<{y: number; name: string; col: string; dark: string; v: number; val: string; fl?: number; children: React.ReactNode; at: number}> = ({y, name, col, dark, v, val, fl = 0, children, at}) => {
  const t = useT(); const p = interpolate(t, [at, at + 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
      {children}
      <HP x={330} y={y + 130} w={680} h={56} v={v / 1.2} color={col} dark={dark} label={name} val={val} flash={fl} t={t} />
    </div>
  );
};
const Rings: React.FC = () => {
  const t = useT(), a10 = rel(10, 'rings');
  const s = 0.55, base = (y: number) => y;
  const fl = Math.exp(-Math.max(0, t - 0.8) * 5) * (t > 0.8 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Lane y={480} name="BENCH" col={LIME} dark={LIME_D} v={0.83} val="0.83 mV" at={0} fl={0}>
        <AlexBench x={70} y={480 - 120} s={s} k={dipK(t)} />
      </Lane>
      <Lane y={770} name="BARS" col={CORAL} dark={CORAL_D} v={1.04} val="1.04 mV" at={0.1}>
        <DanBars x={70} y={770 - 120} s={s} k={dipK(t)} t={t} />
      </Lane>
      <Lane y={1060} name="RINGS" col="#8E6FD1" dark="#5B3FA0" v={interpolate(t, [0.5, 1.2], [0, 1.05], {...clamp, easing: eo})} val={t > 0.5 ? '1.05 mV' : ''} at={0.3} fl={fl}>
        <BoxSvg x={70} y={1060 - 120} s={s}><RingsEq /></BoxSvg>
        <Person pose={ringPose(dipK(t))} shirt="#8E6FD1" phones={false} hair="short" s={s} x={70} y={1060 - 120} mood="strain" fists />
      </Lane>
      {t > 1.0 && <Pop at={1.0} style={{left: 0, right: 0, top: 322, display: 'flex', justifyContent: 'center'}}><div style={{background: INK, borderRadius: 16, padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff'}}>RINGS <span style={{color: LIME}}>≈</span> BARS</div></Pop>}
      {t > a10 && <><Pop at={a10 + 0.05} style={{left: 60, top: 1262}}><Tag text="CHEST" color={AMBER} fg={INK} size={26} icon="▲" /></Pop><Pop at={a10 + 0.35} style={{left: 280, top: 1262}}><Tag text="BACK" color={AMBER} fg={INK} size={26} icon="▲" /></Pop><Pop at={a10 + 0.65} style={{left: 480, top: 1262}}><Tag text="DIFFER" color="#fff" fg={INK} size={26} /></Pop></>}
    </AbsoluteFill>
  );
};

/* ---- shoulder warning ---- */
const Shoulder: React.FC = () => {
  const t = useT(), len = B.shoulder[1] - B.shoulder[0];
  const k = dipK(t, 0.12), z = interpolate(t, [0, len], [1.0, 1.55], {...clamp, easing: eio});
  const s = 1.35, x = 40, y = FL - 765;
  const pose = benchPose(k);
  const sh: V = [x + pose.sh[0] * s, y + pose.sh[1] * s];
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  const row = (i: number, name: string, deg: number, col: string, at: number) => (
    <div style={{position: 'absolute', left: 560, top: 560 + i * 118, width: 480, opacity: interpolate(t, [at, at + 0.25], [0, 1], clamp), transform: `translateX(${(1 - interpolate(t, [at, at + 0.25], [0, 1], clamp)) * 80}px)`}}>
      <HP x={0} y={46} w={480} h={46} v={interpolate(t, [at, at + 0.6], [0, deg / 100], {...clamp, easing: eo})} color={col} dark={col} label={name} val={`${deg}°`} t={t} />
    </div>
  );
  return (
    <AbsoluteFill>
      <Zoom z={z} fx={lerp(300, 200, c01(t / len))} fy={lerp(900, 800, c01(t / len))} cx={300}>
        <Floor />
        <AlexBench x={x} y={y} s={s} k={k} />
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <circle cx={sh[0] - 6} cy={sh[1] + 4} r={60 + 16 * pulse} fill={AMBER} opacity={0.18 + 0.25 * pulse * k} />
          <circle cx={sh[0] - 6} cy={sh[1] + 4} r={40 + 14 * pulse} fill="none" stroke={AMBER} strokeWidth={6} opacity={0.5 + 0.5 * k} />
        </svg>
      </Zoom>
      <Pop at={0.2} style={{left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}><Tag text="MORE SHOULDER EXTENSION" color={AMBER} fg={INK} size={30} icon="⚠" /></Pop>
      {row(0, 'BENCH', 88, AMBER, 0.6)}{row(1, 'BARS', 78, CORAL, 1.0)}{row(2, 'RINGS', 62, '#8E6FD1', 1.4)}
      {t > 1.9 && <Pop at={1.9} style={{left: 590, top: 975}}><Tag text="PEAK SHOULDER EXTENSION" color="#fff" fg={INK} size={18} /></Pop>}
    </AbsoluteFill>
  );
};

/* ---- scaling the load ---- */
const Scale: React.FC = () => {
  const t = useT(), len = B.scale[1] - B.scale[0];
  const drop = interpolate(t, [1.6, 2.3], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const kn = drop; // feet pulled in, knees bent once they are on the floor
  const k = dipK(t, 0.05);
  const load = lerp(1, 0.62, drop);
  return (
    <AbsoluteFill>
      <Floor />
      <AlexBench x={20} y={FL - 780} s={1.35} k={k} ft={1 - drop} kn={kn} />
      <HP x={560} y={560} w={460} h={64} v={load} color={AMBER} dark="#C98A10" label="LOAD" val={drop > 0.5 ? '↓ EASIER' : 'HARD'} flash={drop > 0.05 && drop < 0.95 ? 1 : 0} t={t} />
      <Pop at={0.1} style={{left: 560, top: 690}}><Tag text={drop > 0.5 ? 'FEET ON FLOOR' : 'FEET ON BENCH'} color={drop > 0.5 ? LIME : CORAL} fg={INK} size={26} /></Pop>
      {t > 0.5 && <Pop at={0.5} style={{left: 560, top: 760}}><Tag text="ILLUSTRATIVE" color="#fff" fg="#777" size={18} /></Pop>}
      {t > 2.4 && <Pop at={2.4} style={{left: 560, top: 820}}><Tag text="START HERE" color={LIME} fg={INK} size={34} icon="✓" /></Pop>}
      {t > len - 0.01 && null}
    </AbsoluteFill>
  );
};

/* ---- verdict ---- */
const Verdict: React.FC = () => {
  const t = useT();
  const a14 = rel(14, 'verdict'), a15 = rel(15, 'verdict'), a16 = rel(16, 'verdict');
  const row = (i: number, ok: boolean, text: string, sub: string | undefined, at: number) => {
    const p = interpolate(t, [at, at + 0.28], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
    return (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 26px', borderRadius: 24, background: ok ? '#F1FBDD' : '#FFF3D6', border: `5px solid ${ok ? LIME_D : AMBER}`, marginTop: 20, opacity: p, transform: `translateX(${(1 - p) * -120}px)`}}>
        <div style={{width: 70, height: 70, borderRadius: 18, background: ok ? LIME : AMBER, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: INK}}>{ok ? '✓' : '⚠'}</div>
        <div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: INK, lineHeight: 1.05}}>{text}</div>{sub && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: '#6a6a66', marginTop: 6}}>{sub}</div>}</div>
      </div>
    );
  };
  const enter = interpolate(t, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const shake = t > a14 + 1.3 && t < a14 + 1.6 ? Math.sin(t * 90) * 6 : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: -30, top: 1010, opacity: enter, transform: `translateY(${Math.abs(Math.sin(t * 5)) * -12}px)`}}><FrontPerson shirt={LIME} phones hair="short" mood={t > a14 ? 'worry' : 'smile'} s={0.55} x={0} y={0} /></div>
      <div style={{position: 'absolute', left: 820, top: 1010, opacity: enter, transform: `translateY(${Math.abs(Math.sin(t * 5 + 1.5)) * -12}px)`}}><FrontPerson shirt={CORAL} cap beard mood={t > a14 ? 'worry' : 'smile'} s={0.55} x={0} y={0} /></div>
      <div style={{position: 'absolute', left: 50, top: 440, width: 980, background: '#fff', border: `6px solid ${INK}`, borderRadius: 36, padding: '26px 34px 34px', boxShadow: '0 16px 0 rgba(0,0,0,.2)', transform: `translateY(${(1 - enter) * 160 + shake}px) scale(${0.94 + 0.06 * enter})`, opacity: enter}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 66, color: INK, letterSpacing: 2}}>VERDICT</div><div style={{display: 'flex', gap: 10}}><div style={{width: 26, height: 26, borderRadius: 13, background: LIME, border: `3px solid ${INK}`}} /><div style={{width: 26, height: 26, borderRadius: 13, background: CORAL, border: `3px solid ${INK}`}} /></div></div>
        {row(0, true, 'Bars ≈ more triceps activation', 'PEAK EMG · BARS 1.04 mV vs BENCH 0.83 mV', 0.25)}
        {row(1, true, 'Bench = easier to scale', 'FEET ON FLOOR · LESS LOAD', 0.65)}
        {row(2, false, 'Growth? Not measured', t > a15 ? '13 MEN · 1 SESSION' : undefined, a14 + 0.9)}
      </div>
      {t > a15 && <><Pop at={a15} style={{left: 280, top: 1150}}><Tag text="13 MEN" color={INK} size={30} /></Pop><Pop at={a15 + 0.4} style={{left: 520, top: 1150}}><Tag text="1 SESSION" color={INK} size={30} /></Pop></>}
      {t > a16 && <Pop at={a16} style={{left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center'}}><Tag text="A CLUE, NOT A PROMISE" color={AMBER} fg={INK} size={34} /></Pop>}
      <div style={{position: 'absolute', left: 20, top: 1130, transform: `translateY(${Math.abs(Math.sin(t * 5)) * -10}px)`, opacity: 0.0}} />
    </AbsoluteFill>
  );
};

/* ---- how a muscle grows ---- */
const Fibres: React.FC<{x: number; y: number; r: number; g: number; tension: number; t: number}> = ({x, y, r, g, tension, t}) => {
  const n = 7, th = 8 + 18 * g;
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill="#fff" stroke={INK} strokeWidth={6} />
      <clipPath id="fibc"><circle cx={x} cy={y} r={r} /></clipPath>
      <g clipPath="url(#fibc)">
        <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#0E1620" />
        {Array.from({length: n}).map((_, i) => { const yy = y - r * 0.7 + (i * r * 1.4) / (n - 1); const wob = tension * Math.sin(t * 22 + i) * 3; return <g key={i}><line x1={x - r} y1={yy + wob} x2={x + r} y2={yy - wob} stroke={CORAL_D} strokeWidth={th + 4} strokeLinecap="round" opacity={0.6} /><line x1={x - r} y1={yy + wob} x2={x + r} y2={yy - wob} stroke={CORAL} strokeWidth={th} strokeLinecap="round" /><line x1={x - r} y1={yy - th * 0.25 + wob} x2={x + r} y2={yy - th * 0.25 - wob} stroke="#fff" strokeWidth={2.5} opacity={0.45} /></g>; })}
        {tension > 0.05 && [0, 1].map((k) => <g key={k}><path d={`M${x - r + 14} ${y + (k ? 40 : -40)} l-0 0`} /><path d={`M${x - r * 0.85} ${y + (k ? 0.5 : -0.5) * 20} L${x - r * 0.45} ${y + (k ? 0.5 : -0.5) * 20}`} stroke="#fff" strokeWidth={5} opacity={tension} strokeLinecap="round" /></g>)}
      </g>
    </g>
  );
};
const Grow: React.FC = () => {
  const t = useT();
  const a17 = 0, a18 = rel(18, 'grow'), a19 = rel(19, 'grow');
  const k = dipK(t, 0, 0.8); // fast reps: this is where the work happens
  const s = 1.3, x = 20, y = FL - 650 * (s / 1.15) * 1.0 + 0;
  const bx = 20, by = FL - 565 * s;
  const pose = barPose(k);
  const P = (v: V): V => [bx + 120 + v[0] * s, by + v[1] * s];
  // triceps teardrop along the back of the upper arm
  const sh = P(pose.sh), el = P(ik(pose.sh, pose.handL, 74, 68, -1));
  const ang = (Math.atan2(el[1] - sh[1], el[0] - sh[0]) * 180) / Math.PI, len = Math.hypot(el[0] - sh[0], el[1] - sh[1]);
  const growth = interpolate(t, [a19 + 0.5, a19 + 5.0], [0, 1], {...clamp, easing: eio});
  const act = 0.55 + 0.45 * k;
  const tension = t >= a18 ? Math.min(1, (t - a18) / 0.4) * (0.5 + 0.5 * k) : 0;
  const weeks = Math.round(interpolate(t, [a19 + 0.4, a19 + 5.2], [0, 12], clamp));
  const step = t < a18 ? 0 : t < a19 ? 1 : 2;
  const chip = (n: number, text: string, at: number, col: string) => <Pop at={at} style={{left: 60, top: 1100 + n * 0}}><div /></Pop>;
  void chip;
  return (
    <AbsoluteFill>
      <Floor />
      <BoxSvg x={bx + 120} y={by} s={s}><BarsEq /></BoxSvg>
      <DanSide x={bx + 120} y={by} s={s} pose={pose} mood={k > 0.5 ? 'strain' : 'flat'} sweat={k > 0.6 ? (t * 1.6) % 1 : 0} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={(sh[0] + el[0]) / 2} cy={(sh[1] + el[1]) / 2} r={70 + 12 * Math.sin(t * 9)} fill={CORAL} opacity={0.18 * act} />
        <g transform={`translate(${(sh[0] + el[0]) / 2} ${(sh[1] + el[1]) / 2}) rotate(${ang}) translate(${-10 * s} ${-12 * s})`}>
          <ellipse rx={len * 0.55} ry={(15 + 12 * growth) * s} fill={CORAL} fillOpacity={0.55 + 0.4 * act} stroke={INK} strokeWidth={3.4} />
          {[-8, 0, 8].map((yy, i) => <path key={i} d={`M${-len * 0.45} ${yy * s * (1 + growth * 0.5)} Q0 ${yy * s * (1 + growth * 0.5) - 3} ${len * 0.45} ${yy * s * (1 + growth * 0.5)}`} fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.6} />)}
        </g>
        {t < a18 && <circle cx={(sh[0] + el[0]) / 2} cy={(sh[1] + el[1]) / 2} r={40 + 50 * ((t * 1.4) % 1)} fill="none" stroke={CORAL_D} strokeWidth={5 * (1 - ((t * 1.4) % 1))} />}
        {t >= a18 && <Fibres x={800} y={640} r={150} g={growth} tension={tension} t={t} />}
        {t >= a18 && <line x1={(sh[0] + el[0]) / 2 + 30} y1={(sh[1] + el[1]) / 2 - 12} x2={650} y2={600} stroke={INK} strokeWidth={4} strokeDasharray="10 8" />}
      </svg>
      <Pop at={0.1} style={{left: 60, top: 470}}><Tag text="TRICEPS" color={CORAL} fg={INK} size={36} /></Pop>
      {t < a18 && <Pop at={0.5} style={{left: 640, top: 540}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 200, color: CORAL_D, transform: `rotate(${Math.sin(t * 6) * 8}deg)`}}>?</div></Pop>}
      {t >= a18 && <Pop at={a18 + 0.1} style={{left: 590, top: 830}}><Tag text="① TENSION" color={CORAL} fg={INK} size={34} /></Pop>}
      {t >= a19 && (
        <>
          <Pop at={a19 + 0.05} style={{left: 590, top: 900}}><Tag text="② FOOD + SLEEP" color={LIME} fg={INK} size={30} /></Pop>
          <Pop at={a19 + 1.6} style={{left: 590, top: 970}}><Tag text="③ THICKER FIBRES" color={AMBER} fg={INK} size={30} /></Pop>
          <Pop at={a19 + 0.6} style={{left: 60, top: 1060}}><div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 18, padding: '4px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,.15)'}}>WEEK {weeks}</div></Pop>
          <HP x={60} y={1200} w={470} h={50} v={growth} color={LIME} dark={LIME_D} label="MUSCLE SIZE" t={t} flash={growth > 0.98 ? 1 : 0} />
          <Pop at={a19 + 0.9} style={{left: 560, top: 1040}}><Tag text="ILLUSTRATIVE" color="#fff" fg="#777" size={18} /></Pop>
          {[0, 1, 2].map((i) => { const at = a19 + 0.4 + i * 0.5; const p = interpolate(t, [at, at + 0.7], [0, 1], clamp); return p > 0 && p < 1 ? <div key={i} style={{position: 'absolute', left: 120 + i * 70, top: 1120 - p * 160, fontSize: 56, opacity: 1 - p}}>{['🍗', '😴', '🥚'][i]}</div> : null; })}
        </>
      )}
      {step === 0 && null}
    </AbsoluteFill>
  );
};

/* ---- ask: fast reps, buttons, comments ---- */
const Ask: React.FC = () => {
  const t = useT();
  const a21 = rel(21, 'ask');
  const pulse = 1 + 0.05 * Math.sin(t * 9);
  const k = dipK(t, 0, 0.55); // double-speed reps
  const z = 1 + 0.06 * Math.min(1, t / 1.5);
  return (
    <AbsoluteFill>
      <Zoom z={z} fx={540} fy={820}>
        <Floor />
        <div style={{position: 'absolute', left: 536, top: 520, width: 8, height: 740, background: INK, opacity: 0.85}} />
        <AlexBench x={10} y={FL - 650} s={1.15} k={k} />
        <DanBars x={560} y={FL - 650} s={1.15} k={k} t={t} />
      </Zoom>
      <Pop at={0.05} style={{left: 80, top: 440}}><div style={{background: LIME, border: `6px solid ${INK}`, borderRadius: 22, padding: '12px 36px', fontFamily: FONT, fontWeight: 900, fontSize: 62, color: INK, transform: `scale(${pulse}) rotate(-3deg)`, boxShadow: '0 10px 0 rgba(0,0,0,.2)'}}>BENCH</div></Pop>
      <Pop at={0.25} style={{left: 650, top: 440}}><div style={{background: CORAL, border: `6px solid ${INK}`, borderRadius: 22, padding: '12px 36px', fontFamily: FONT, fontWeight: 900, fontSize: 62, color: INK, transform: `scale(${2 - pulse}) rotate(3deg)`, boxShadow: '0 10px 0 rgba(0,0,0,.2)'}}>BARS</div></Pop>
      <Pop at={0.45} style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 50, color: INK}}>OR</div></Pop>
      <Pop at={0.6} style={{left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center'}}><Tag text="2× SPEED" color={INK} size={26} icon="⏩" /></Pop>
      {t > a21 && (
        <>
          <Pop at={a21} style={{left: 90, top: 700}}><div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 26, padding: '14px 26px', width: 620, boxShadow: '0 10px 0 rgba(0,0,0,.18)'}}><div style={{display: 'flex', gap: 14, alignItems: 'center'}}><div style={{width: 54, height: 54, borderRadius: 27, background: LIME, border: `4px solid ${INK}`}} /><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: INK}}>Bars! 💪</div></div></div></Pop>
          <Pop at={a21 + 0.5} style={{left: 330, top: 840}}><div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 26, padding: '14px 26px', width: 620, boxShadow: '0 10px 0 rgba(0,0,0,.18)'}}><div style={{display: 'flex', gap: 14, alignItems: 'center'}}><div style={{width: 54, height: 54, borderRadius: 27, background: CORAL, border: `4px solid ${INK}`}} /><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: INK}}>Bench, feet down 🙌</div></div></div></Pop>
          {[0, 1, 2, 3, 4].map((i) => { const ph = (t * 0.9 + i / 5) % 1; return <div key={i} style={{position: 'absolute', left: 120 + i * 170 + Math.sin(ph * 6 + i) * 20, top: 1220 - ph * 260, fontSize: 56, opacity: Math.sin(ph * Math.PI)}}>{['❤️', '👍', '🔥', '❤️', '💬'][i]}</div>; })}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- word-by-word captions: black box, active word lime ---------------- */
type Card = {t0: number; t1: number; words: {w: string; a: number; b: number}[]};
const cards: Card[] = [];
for (const sg of sec) {
  const w = sg.text.split(' '); const n = w.length; const k = Math.ceil(n / 4); const size = Math.ceil(n / k);
  const chunks: string[][] = []; for (let i = 0; i < n; i += size) chunks.push(w.slice(i, i + size));
  const tot = chunks.reduce((s2, c) => s2 + c.join(' ').length + 1, 0); let tt = sg.start;
  for (const c of chunks) {
    const d = ((sg.end - sg.start) * (c.join(' ').length + 1)) / tot; const L = c.reduce((s2, x) => s2 + x.length + 1, 0); let acc = tt;
    cards.push({t0: tt, t1: tt + d, words: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st, b: acc}; })}); tt += d;
  }
}
const Subs: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const c = cards.find((x) => s >= x.t0 && s < x.t1 + 0.04);
  if (!c || s > sec[21].end + 0.5) return null;
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: 1400, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', borderRadius: 16, padding: '10px 28px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: -1, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,.18)'}}>
        {c.words.map((x, i) => { const act = s >= x.a - 0.02 && s < x.b; return <span key={i} style={{color: act ? LIME : s >= x.b ? '#fff' : '#888', marginRight: i < c.words.length - 1 ? 22 : 0, display: 'inline-block', transform: act ? 'translateY(-3px) scale(1.04)' : undefined}}>{x.w}</span>; })}
      </div>
    </div>
  );
};

/* ---------------- wipes + scene wrapper ---------------- */
const Wipe: React.FC<{k: number}> = ({k}) => {
  const t = useT(), p = t / 0.3; if (p >= 1) return null;
  const x = interpolate(p, [0, 1], [-640, 1220], {easing: Easing.inOut(Easing.quad)});
  return <div style={{position: 'absolute', left: k % 2 ? x : 1080 - x - 520, top: -40, width: 520, height: 2000, transform: 'skewX(-12deg)', background: `linear-gradient(90deg, ${INK} 0 10%, ${k % 2 ? LIME : CORAL} 10% 90%, ${INK} 90%)`, opacity: 0.96}} />;
};
const SC: React.FC<{k: BK; children: React.ReactNode; hits?: number[]; noWipe?: boolean; noFooter?: boolean}> = ({k, children, hits = [0], noWipe, noFooter}) => {
  const from = Math.round(B[k][0] * FPS), len = Math.round(B[k][1] * FPS) - from, idx = Object.keys(B).indexOf(k);
  return (
    <Sequence from={from} durationInFrames={len}>
      <AbsoluteFill>
        <Impact at={hits}>
          <MBG />
          {children}
          <Header />
          
        </Impact>
        {!noWipe && <Wipe k={idx} />}
      </AbsoluteFill>
    </Sequence>
  );
};
export const DipsUK: React.FC = () => (
  <AbsoluteFill style={{background: '#EEEDE8'}}>
    <SC k="open" hits={[0.02]} noWipe><Open /></SC>
    <SC k="setup" hits={[rel(3, 'setup'), rel(4, 'setup')]}><Setup /></SC>
    <SC k="study" hits={[0, rel(5, 'study') + 2.9]}><Study /></SC>
    <SC k="result" hits={[0.0, rel(7, 'result') + 1.2, rel(8, 'result') + 0.1]}><Result /></SC>
    <SC k="rings" hits={[0, 0.8]}><Rings /></SC>
    <SC k="shoulder" hits={[0.2]}><Shoulder /></SC>
    <SC k="scale" hits={[0, 1.6, 2.4]}><Scale /></SC>
    <SC k="verdict" hits={[0.1, rel(14, 'verdict') + 0.9]} noFooter><Verdict /></SC>
    <SC k="grow" hits={[0.05, rel(18, 'grow'), rel(19, 'grow') + 1.6]} noFooter><Grow /></SC>
    <SC k="ask" hits={[0.05, rel(21, 'ask')]} noFooter><Ask /></SC>
    <Subs />
    <Audio src={staticFile('audio/dips_voice.wav')} />
    <Audio src={staticFile('audio/gym_music.wav')} loop volume={(f) => { const t = f / FPS; const duck = interpolate(t, [T(12) + 3.6, T(12) + 4.0, T(13) + 0.05, T(13) + 0.5], [1, 0.2, 0.2, 1], clamp); return 0.1 * duck * interpolate(f, [0, 10, DIPS_TOTAL - 70, DIPS_TOTAL], [0, 1, 1, 0], clamp); }} />
    <Audio src={staticFile('audio/dips_sfx.wav')} volume={0.28} />
  </AbsoluteFill>
);
export const DIPS_BOUNDS = B;
export const _u = [G, lerpV];
