import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import D from './cpsegments.json';
import {Defs, Ex, Fx} from './Macaque';
import {CoupleScene} from './Couple';

/* "Los dos monos" (UK English). Timeline is driven by cpsegments.json (sentence + event times of the user's narration). */
const FPS = 30, F = 'DejaVu Sans, sans-serif';
const SEG = D.segs as {start: number; end: number; text: string}[];
const EV = D.events as Record<string, number>;
const A = (i: number) => SEG[i].start;
const END = D.dur + 0.9;
export const COUPLE_TOTAL = Math.round(END * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (u: number) => u * u * (3 - 2 * u);
const eo = (u: number) => 1 - Math.pow(1 - u, 3);
const back = (u: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
/** piecewise-linear value over time */
const kf = (t: number, keys: [number, number][]) => { const k = [...keys].sort((a, b) => a[0] - b[0]); if (t <= k[0][0]) return k[0][1]; for (let i = 0; i < k.length - 1; i++) { if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], (t - k[i][0]) / Math.max(1e-6, k[i + 1][0] - k[i][0])); } return k[k.length - 1][1]; };
const pulse = (t: number, at: number, dur = 0.5, amp = 0.12) => (t >= at && t < at + dur ? amp * (1 - (t - at) / dur) : 0);

/* ---------------- camera ---------------- */
type CK = [number, number, number, number];
const CAM: CK[] = ([
  [0, 2.6, 380, 790], [0.45, 2.6, 380, 790], [0.95, 1.05, 540, 960], [A(1) - 0.1, 1.15, 440, 900],
  [EV.thump1 - 0.08, 1.15, 440, 900], [EV.thump1 + 0.04, 1.7, 340, 1060], [EV.thump2 - 0.08, 1.7, 340, 1060], [EV.thump2 + 0.04, 2.0, 330, 1090],
  [EV.thump3 - 0.08, 2.0, 330, 1090], [EV.thump3 + 0.04, 2.3, 330, 700], [EV.thump3 + 0.9, 1.3, 540, 820], [EV.asleep - 0.3, 1.8, 760, 740], [EV.asleep + 0.5, 2.4, 770, 720],
  [EV.att1, 1.05, 540, 960], [EV.louder - 0.4, 1.1, 540, 900], [EV.louder - 0.1, 1.9, 770, 740], [EV.five - 0.2, 1.9, 770, 740], [EV.five, 1.3, 330, 760],
  [EV.att2 - 0.1, 1.2, 330, 760], [EV.att2 + 0.1, 1.05, 540, 960], [EV.shoulder - 0.3, 1.9, 590, 880], [EV.mumble1 - 0.9, 1.9, 590, 880], [EV.mumble1 - 0.4, 2.3, 770, 730],
  [EV.att3 - 0.05, 2.3, 770, 730], [EV.att3 + 0.1, 1.1, 540, 900], [EV.candles - 0.05, 1.7, 540, 520], [EV.perfume - 0.1, 1.7, 540, 520], [EV.perfume, 1.5, 540, 1120],
  [EV.mask - 0.2, 1.5, 540, 1120], [EV.mask + 0.05, 2.3, 770, 730], [EV.mask + 0.9, 2.3, 770, 730], [A(5), 1.2, 540, 900], [SEG[5].end, 1.0, 540, 960],
  [EV.att4, 1.05, 540, 960], [EV.sigh - 0.1, 2.0, 330, 720], [EV.roll - 0.1, 2.0, 330, 720], [EV.roll + 0.3, 1.5, 760, 820], [EV.one - 0.1, 1.5, 760, 820], [EV.one, 1.6, 200, 640], [EV.one + 0.9, 1.6, 200, 640],
  [EV.heat, 1.1, 540, 960], [EV.thirty - 0.6, 1.8, 340, 1000], [EV.thirty, 1.9, 880, 560], [EV.thirty + 0.6, 1.3, 540, 960], [EV.keep + 0.2, 1.7, 340, 1060], [SEG[7].end, 1.7, 340, 1060],
  [EV.att5, 1.05, 540, 960], [EV.shuffle - 0.2, 1.3, 540, 900], [EV.fling - 0.1, 1.3, 540, 900], [EV.fling + 0.05, 1.8, 540, 1100], [EV.fling + 0.8, 1.1, 540, 960],
  [EV.att6, 1.05, 540, 960], [EV.whisper - 0.2, 1.6, 700, 720], [EV.mumble2 - 1.0, 1.6, 700, 720], [EV.mumble2 - 0.4, 2.2, 770, 730],
  [EV.att7, 1.05, 540, 960], [EV.sleepw - 0.2, 1.25, 500, 900], [SEG[10].end, 1.25, 540, 900], [EV.closer, 1.1, 540, 900], [EV.alarm - 0.3, 3.0, 380, 740],
  [EV.alarm, 1.1, 540, 960], [SEG[12].end, 1.1, 540, 960], [EV.wakes - 0.05, 1.1, 540, 960], [EV.wakes + 0.1, 1.9, 770, 700], [EV.mumble3 - 0.2, 1.9, 770, 700],
  [A(14), 2.4, 330, 720], [EV.noreason - 0.2, 2.4, 330, 720], [EV.noreason + 0.4, 1.3, 540, 820], [A(15), 1.2, 540, 900], [SEG[15].end, 1.6, 540, 820],
  [A(16), 1.6, 330, 760], [SEG[16].end, 2.5, 330, 720], [A(17), 1.3, 540, 900], [END, 1.0, 540, 960]] as CK[]).sort((a, b) => a[0] - b[0]);
const camAt = (t: number): [number, number, number] => {
  let i = 0; while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], u = a === b ? 0 : sm(c01((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
  const z = lerp(a[1], b[1], u) * (1 + pulse(t, EV.hard, 0.4, 0.1));
  return [z, lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
};

/* ---------------- state ---------------- */
const shakeAt = (t: number) => kf(t, [[0, 6], [EV.thump3 + 0.3, 6], [EV.asleep - 0.2, 1.5], [EV.asleep, 0.5], [A(2), 1.8], [A(3), 1.2], [A(4), 1], [A(5), 0.6], [A(6), 0], [A(7) - 0.1, 0], [A(7) + 0.3, 8], [EV.thirty, 13], [EV.keep + 0.2, 14], [SEG[7].end, 14], [A(8) - 0.02, 2], [EV.shuffle, 4], [EV.fling, 6], [EV.fling + 0.5, 0], [A(9), 0.8], [A(10), 1.5], [EV.sleepw, 3], [A(11), 3], [EV.closer, 4], [EV.alarm - 0.3, 9], [EV.alarm, 0]]);
const exAt = (t: number): Ex => {
  const i = SEG.findIndex((s, k) => t < (SEG[k + 1]?.start ?? 1e9));
  const o = (mouth: Ex['mouth'], eye: number, pupil: number, brow: number, sweat: number, blush = 0.8): Ex => ({mouth, eye, pupil, brow, sweat, blush});
  switch (Math.max(0, i)) {
    case 0: return o('o', 1.15, 0.8, -0.5, 0.3);
    case 1: return t < EV.asleep - 0.2 ? o('o', 1.15, 0.8, -0.5, 0.3) : o('flat', 0.95, 1.1, 0.3, 0.2);
    case 2: return o('grin', 0.9, 1, 0.3, 0.2);
    case 3: return o('smile', 0.9, 1, 0.1, 0.1);
    case 4: return o('grin', 1, 1, 0.2, 0.1, 0.9);
    case 5: return o('flat', 0.55, 1, 0.5, 0);
    case 6: return o('worry', 0.9, 1, 0.5, 0.2);
    case 7: return o('scream', 1.1, 0.6, -0.9, 1, 1);
    case 8: return o('grin', 1, 0.8, -0.3, 0.7, 0.9);
    case 9: return o('smile', 0.95, 1, 0.2, 0.2, 0.9);
    case 10: return o('smile', 0.06, 1, 0.1, 0, 0.9);
    case 11: return o('worry', 1.2, 0.55, -0.7, 1, 1);
    case 12: return o('scream', 1.25, 0.5, -1, 0.8, 1);
    case 13: return o('grin', 1.1, 0.7, -0.3, 0.6, 0.9);
    case 14: return o('grin', 0.9, 0.8, 0.2, 0.9, 1);
    case 15: return o('smile', 0.06, 1, 0.1, 0, 0.9);
    case 16: return o('flat', 0.85, 1, 0.4, 0.2, 0.7);
    default: return o('sleep', 0.06, 1, 0.1, 0, 0.9);
  }
};
const tries = (t: number) => ['att1', 'att2', 'att3', 'att4', 'att5', 'att6', 'att7'].filter((k) => t >= EV[k]).length;
const cracksAt = (t: number) => (t >= A(15) ? 0 : Math.min(6, [EV.att2, EV.att3, EV.att4, EV.one, EV.att5, EV.att6].filter((x) => t >= x).length));
const hearts = (t: number, n: number, x0: number, y0: number) => Array.from({length: n}).map((_, i) => { const ph = (t * 0.6 + i / n) % 1; return <path key={i} transform={`translate(${x0 + (random(`hx${i}`) - 0.5) * 220 + Math.sin(ph * 8 + i) * 18} ${y0 - ph * 300}) scale(${0.5 + random(`hs${i}`) * 0.5})`} d="M0 18 C-40 -8 -26 -36 0 -18 C26 -36 40 -8 0 18Z" fill="#FF6B9A" stroke="#C23C6E" strokeWidth={2} opacity={1 - ph} />; });

/* ---------------- overlays ---------------- */
const Stamp: React.FC<{t: number}> = ({t}) => {
  const idx = ['att1', 'att2', 'att3', 'att4', 'att5', 'att6', 'att7'].map((k, i) => ({n: i + 1, at: EV[k] - 0.05})).filter((x) => t >= x.at && t < x.at + 1.1)[0];
  if (!idx) return null;
  const lt = t - idx.at, k = lt < 0.3 ? back(lt / 0.3) : 1, o = lt > 0.85 ? 1 - (lt - 0.85) / 0.25 : 1;
  return (
    <g transform={`translate(540 ${580 - 40 * c01((lt - 0.7) / 0.4)}) rotate(-6) scale(${k * 1.05})`} opacity={o}>
      <rect x={-330} y={-70} width={660} height={140} rx={26} fill="#E8263A" stroke="#fff" strokeWidth={8} /><text textAnchor="middle" y={28} fontFamily={F} fontWeight={900} fontSize={84} fill="#fff" stroke="#6E0E1A" strokeWidth={7} paintOrder="stroke" letterSpacing={2}>ATTEMPT #{idx.n}</text>
    </g>
  );
};
const FurArm: React.FC<{x0: number; y0: number; x1: number; y1: number; w?: number}> = ({x0, y0, x1, y1, w = 46}) => {
  const a = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + 22;
  return (
    <g>
      <path d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#5E3A1B" strokeWidth={w + 8} strokeLinecap="round" /><path d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="url(#mArm)" strokeWidth={w} strokeLinecap="round" />
      <g transform={`translate(${x1} ${y1}) rotate(${a})`}><ellipse cx={22} rx={30} ry={26} fill="#C38E6C" stroke="#5E3A1B" strokeWidth={3} />{[-16, -5, 6, 17].map((o, i) => <ellipse key={i} cx={46} cy={o} rx={14} ry={7} fill="#C38E6C" stroke="#5E3A1B" strokeWidth={2.5} />)}</g>
    </g>
  );
};
const Zz: React.FC<{x: number; y: number; t: number; s?: number; col?: string}> = ({x, y, t, s = 1, col = '#CFE0FF'}) => <g>{[0, 1, 2].map((i) => { const ph = (t * 0.7 + i / 3) % 1; return <text key={i} x={x + ph * 90} y={y - ph * 170} fontFamily={F} fontWeight={900} fontSize={(46 + i * 14) * s} fill={col} stroke="#33407A" strokeWidth={2} paintOrder="stroke" opacity={1 - ph}>Z</text>; })}</g>;
const Sheep: React.FC<{x: number; y: number; r: number; n: number}> = ({x, y, r, n}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(1.5)`}>
    {[[-30, 0], [0, -14], [30, 0], [-14, 12], [16, 12]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={26} fill="#fff" stroke="#C9D2E6" strokeWidth={3} />)}
    <ellipse cx={46} cy={6} rx={16} ry={14} fill="#3A3A44" /><circle cx={50} cy={2} r={3} fill="#fff" />{[-26, -6, 14, 30].map((a, i) => <rect key={i} x={a} y={26} width={6} height={20} rx={3} fill="#3A3A44" />)}
    <text x={0} y={-58} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill="#FFE27A" stroke="#33407A" strokeWidth={3} paintOrder="stroke">{n}</text>
  </g>
);
const Alarm: React.FC<{t: number}> = ({t}) => {
  const lt = t - EV.alarm; if (lt < 0 || t > SEG[12].end + 0.15) return null;
  const sh = Math.sin(t * 90) * 9, sc = 1 + 0.04 * Math.sin(t * 40) + 0.3 * (1 - c01(lt / 0.25));
  return (
    <g transform={`translate(540 800) rotate(${sh}) scale(${sc * 1.4})`}>
      {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 70} cy={-120} r={40} fill="#F2C94C" stroke="#8A6A10" strokeWidth={6} /><line x1={sd * 52} y1={-90} x2={sd * 36} y2={-70} stroke="#8A6A10" strokeWidth={8} /><line x1={sd * 70} y1={110} x2={sd * 100} y2={160} stroke="#222" strokeWidth={12} strokeLinecap="round" /></g>)}
      <circle r={118} fill="#E8263A" stroke="#7A1018" strokeWidth={8} /><circle r={94} fill="#fff" />{Array.from({length: 12}).map((_, i) => <line key={i} y1={-82} y2={-70} stroke="#222" strokeWidth={5} transform={`rotate(${i * 30})`} />)}
      <line y2={-50} stroke="#222" strokeWidth={9} strokeLinecap="round" transform="rotate(180)" /><line y2={-72} stroke="#E8263A" strokeWidth={5} strokeLinecap="round" /><circle r={8} fill="#222" />
      {Array.from({length: 6}).map((_, i) => { const a = -Math.PI / 2 + (i - 2.5) * 0.4; return <g key={i} opacity={0.5 + 0.5 * Math.sin(t * 30 + i)}><line x1={Math.cos(a) * 160} y1={Math.sin(a) * 160 - 50} x2={Math.cos(a) * 215} y2={Math.sin(a) * 215 - 50} stroke="#FFE27A" strokeWidth={8} strokeLinecap="round" /></g>; })}
    </g>
  );
};
const Candle: React.FC<{x: number; y: number; t: number; k: number}> = ({x, y, t, k}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}><circle cy={-40} r={70 + 6 * Math.sin(t * 23)} fill="url(#cLamp)" opacity={0.9} /><rect x={-14} y={-30} width={28} height={64} rx={4} fill="#F7EBD2" stroke="#BBA77A" strokeWidth={3} /><path d={`M0 -34 Q${-14 + 3 * Math.sin(t * 19)} -58 0 -84 Q${14 + 3 * Math.sin(t * 17)} -58 0 -34Z`} fill="#FFB02E" /><path d="M0 -38 Q-6 -52 0 -66 Q6 -52 0 -38Z" fill="#FFF3B0" /></g>
);
const Subs: React.FC = () => {
  const s = useCurrentFrame() / FPS, i = SEG.findIndex((x) => s >= x.start - 0.05 && s <= x.end + 0.12);
  if (i < 0) return null;
  const sg = SEG[i], words = sg.text.split(/\s+/); const n = words.length, k = Math.ceil(n / 3), size = Math.ceil(n / k);
  const chunks: string[][] = []; for (let j = 0; j < n; j += size) chunks.push(words.slice(j, j + size));
  const tot = chunks.reduce((a, c) => a + c.join(' ').length + 1, 0); let tt = sg.start; const cards: {t0: number; t1: number; w: {w: string; a: number}[]}[] = [];
  for (const c of chunks) { const d = ((sg.end - sg.start) * (c.join(' ').length + 1)) / tot, L = c.reduce((a, x) => a + x.length + 1, 0); let acc = tt; cards.push({t0: tt, t1: tt + d, w: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st}; })}); tt += d; }
  const card = cards.find((c) => s >= c.t0 && s < c.t1 + 0.04) ?? cards[cards.length - 1];
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: 300, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', textAlign: 'center'}}>
      {card.w.map((x, j) => { const act = s >= x.a - 0.02, key = KEYS.has(x.w.toLowerCase().replace(/[^a-z']/g, '')); return <span key={j} style={{fontFamily: F, fontWeight: act ? 900 : 600, fontSize: 56, color: act ? '#fff' : 'rgba(255,255,255,.55)', textShadow: '0 3px 10px rgba(0,0,0,.85), 0 0 3px #000', padding: key && act ? '0 10px' : 0, border: key && act ? '3px solid #4DA3FF' : '3px solid transparent', background: key && act ? 'rgba(46,108,200,.4)' : 'transparent', borderRadius: 6}}>{x.w}</span>; })}
    </div>
  );
};
const KEYS = new Set(['eleven', 'macaque', 'ever', 'asleep', 'louder', 'tomorrow', 'mask', 'sigh', 'up', 'thirty', 'might', 'minutes', 'sleepwalker', 'almost', 'alarm', 'six', 'awake', 'hard', 'partner', 'bloody']);

/* ---------------- composition ---------------- */
export const CoupleFaster: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, sh = shakeAt(t), ex = exAt(t);
  let [z, cx, cy] = camAt(t); cx += Math.sin(t * 53) * sh * 0.9; cy += Math.cos(t * 47) * sh * 0.9;
  { const hx = 540 / z, hy = 960 / z; cx = Math.min(1080 - hx, Math.max(hx, cx)); cy = Math.min(1920 - hy, Math.max(hy, cy)); }
  const heat = c01((t - EV.heat) / (EV.thirty - EV.heat)), afterHeat = t >= EV.heat && t < A(8);
  const her: 'front' | 'mask' | 'back' | 'awake' = t >= A(15) ? 'front' : t >= EV.wakes - 0.05 ? 'awake' : t >= EV.roll ? 'back' : t >= EV.mask ? 'mask' : 'front';
  const lights = t >= EV.alarm ? 1 : t >= EV.candles + 0.4 ? 0.62 : kf(t, [[EV.candles - 0.2, 1], [EV.candles + 0.4, 0.62]]);
  const sleepwalk = t >= EV.sleepw && t < EV.alarm - 0.4, hisDx = kf(t, [[EV.att1 + 0.8, 0], [EV.att1 + 1.4, 50], [EV.louder + 0.5, 50], [A(3), 0], [EV.shuffle - 0.2, 0], [EV.shuffle + 1, 110], [EV.fling, 110], [EV.fling + 0.3, 40], [A(9), 0], [EV.sleepw - 0.3, 0], [EV.sleepw + 0.8, 80], [A(11), 120], [EV.alarm - 0.5, 230], [EV.alarm - 0.01, 230], [EV.alarm + 0.1, 0]]);
  const hisRot = kf(t, [[EV.sigh - 0.1, 0], [EV.sigh + 0.2, -4], [EV.sigh + 1, 0], [A(11), 0], [EV.alarm - 0.4, 5], [EV.alarm - 0.01, 5], [EV.alarm + 0.1, 0]]);
  const herRot = (t > EV.louder && t < EV.louder + 1.2 ? Math.sin(t * 38) * 1.6 : 0) + kf(t, [[EV.roll, 0], [EV.roll + 0.2, -14], [EV.roll + 0.5, 0]]);
  const herUp = kf(t, [[EV.wakes - 0.05, 0], [EV.wakes + 0.18, 110], [EV.wakes + 0.35, 90], [A(15) - 0.1, 90], [A(15), 0], [A(15) + 0.9, -90]]);
  const herDx = kf(t, [[A(15) - 0.1, 0], [A(15) + 0.9, -250]]);
  const blanketDx = kf(t, [[EV.fling - 0.05, 0], [EV.fling + 0.15, -260], [EV.fling + 0.6, -260], [EV.fling + 1.3, 0]]), blanketRot = kf(t, [[EV.fling - 0.05, 0], [EV.fling + 0.15, -7], [EV.fling + 0.6, -7], [EV.fling + 1.3, 0]]);
  const bubble = t > EV.mumble1 - 0.3 && t < EV.mumble1 + 1.4 ? 'Mmmf… tomorrow…' : t > EV.mumble2 - 1.4 && t < EV.mumble2 + 1.2 ? 'Mmmf… five more minutes…' : t > EV.mumble3 - 1.6 && t < EV.mumble3 + 1.2 ? 'Why are you awake?' : undefined;
  const hisBubble = t > EV.noreason - 0.1 && t < EV.noreason + 2.2 ? 'No reason… hee hee.' : undefined;
  const pct = t >= A(15) ? 100 : t >= EV.one ? 1 : 5;
  const extra = (
    <g>
      {t > EV.louder - 0.1 && t < EV.louder + 1.5 && [0, 1, 2].map((i) => <circle key={i} cx={770} cy={745} r={70 + ((t * 2 + i / 3) % 1) * 220} fill="none" stroke="#fff" strokeWidth={6} opacity={0.5 * (1 - ((t * 2 + i / 3) % 1))} />)}
      {t > EV.asleep - 0.2 && t < A(3) && <Zz x={800} y={640} t={t} s={t > EV.louder - 0.1 ? 1.6 : 1} />}
      {t > EV.shoulder - 0.3 && t < EV.shoulder + 1.4 && (() => { const k = sm(c01((t - (EV.shoulder - 0.3)) / 0.7)), back2 = c01((t - (EV.shoulder + 0.9)) / 0.5); const kk = k * (1 - back2); return <FurArm x0={430} y0={890} x1={lerp(440, 650, kk)} y1={lerp(890, 880, kk)} w={44} />; })()}
      {t > EV.candles && t < A(5) + 0.4 && <><Candle x={430} y={412} t={t} k={c01((t - EV.candles) / 0.3)} /><Candle x={650} y={412} t={t} k={c01((t - EV.candles - 0.15) / 0.3)} /></>}
      {t > EV.music && t < EV.mask && [0, 1, 2, 3].map((i) => { const ph = ((t - EV.music) * 0.8 + i / 4) % 1; return <text key={i} x={300 + i * 130 + Math.sin(ph * 9) * 20} y={620 - ph * 220} fontFamily={F} fontWeight={900} fontSize={54} fill="#FFE27A" stroke="#7A5A10" strokeWidth={2} paintOrder="stroke" opacity={1 - ph}>{i % 2 ? '♫' : '♪'}</text>; })}
      {t > EV.perfume && t < EV.perfume + 1.6 && Array.from({length: 18}).map((_, i) => { const ph = c01((t - EV.perfume) / 1.4); return <g key={i} transform={`translate(${220 + random(`pf${i}`) * 600} ${1250 - random(`pg${i}`) * 200 - ph * 120}) rotate(${i * 20})`} opacity={Math.sin(ph * Math.PI)} stroke="#fff" strokeWidth={4} strokeLinecap="round"><line x1={-12} x2={12} /><line y1={-12} y2={12} /></g>; })}
      {t > A(5) + 0.3 && t < SEG[5].end && [0, 1, 2, 3].map((i) => { const lt = t - (A(5) + 0.3 + i * 0.7), u = c01(lt / 1.0); return lt > 0 && lt < 1 ? <Sheep key={i} x={lerp(120, 960, u)} y={380 - 120 * Math.sin(u * Math.PI)} r={-18 * Math.cos(u * Math.PI)} n={i + 1} /> : null; })}
      {t > EV.sigh && t < EV.sigh + 1.3 && [0, 1, 2, 3].map((i) => { const ph = c01((t - EV.sigh - i * 0.12) / 1.0); return <circle key={i} cx={400 + ph * 240} cy={780 - ph * 40 + i * 6} r={26 + ph * 40} fill="#fff" opacity={0.7 * (1 - ph)} />; })}
      {afterHeat && [0, 1, 2, 3, 4].map((i) => { const ph = (t * 0.8 + i / 5) % 1; return <path key={i} d={`M${180 + i * 170} ${1090 - ph * 200} q22 -30 0 -60 q-22 -30 0 -60`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - ph) * 0.6 * heat} />; })}
      {t > EV.fling && t < EV.fling + 0.8 && <g transform={`translate(540 1000) rotate(-8) scale(${back(c01((t - EV.fling) / 0.25))})`} opacity={1 - c01((t - EV.fling - 0.5) / 0.3)}><text textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={170} fill="#FFD34D" stroke="#7A2A0A" strokeWidth={14} paintOrder="stroke">WHAM!</text></g>}
      {t > EV.whisper && t < EV.whisper + 2 && <g transform={`translate(690 ${640 - 30 * c01((t - EV.whisper) / 2)}) rotate(-6)`} opacity={Math.sin(c01((t - EV.whisper) / 2) * Math.PI)}><text fontFamily={F} fontWeight={800} fontStyle="italic" fontSize={44} fill="#fff" stroke="#33407A" strokeWidth={5} paintOrder="stroke">psst… psst…</text></g>}
      {sleepwalk && <g><Zz x={hisDx + 340} y={560} t={t} s={1} col="#FFE9A8" />{[0, 1].map((i) => { const bob = Math.sin(t * 5 + i) * 10, x0 = 320 + hisDx + (i ? 70 : -70), y0 = 900 + i * 36 + bob; return <FurArm key={i} x0={x0} y0={y0} x1={x0 + 230} y1={y0 - 20 + bob} w={40} />; })}</g>}
      {t > EV.sleepw + 1.5 && t < EV.sleepw + 3.1 && <g transform={`translate(780 560) rotate(8) scale(${back(c01((t - EV.sleepw - 1.5) / 0.25))})`}><rect x={-120} y={-44} width={240} height={88} rx={14} fill="#fff" stroke="#E8263A" strokeWidth={8} /><text textAnchor="middle" y={22} fontFamily={F} fontWeight={900} fontSize={60} fill="#E8263A">NOPE.</text></g>}
      {t >= A(15) && t < A(17) && hearts(t, 7, 540, 760)}
      {t >= EV.closer && t < EV.alarm - 0.2 && <rect width={1080} height={1920} fill="#000" opacity={0.12 + 0.38 * c01((t - EV.closer) / (EV.alarm - EV.closer)) + 0.1 * Math.max(0, Math.sin(t * 9))} />}
    </g>
  );
  const over = (
    <g>
      <Stamp t={t} /><Alarm t={t} />
      {t > A(17) + 0.1 && <g transform={`translate(540 1540) scale(${back(c01((t - A(17) - 0.1) / 0.35)) * (1 + 0.03 * Math.sin(t * 6))})`}><rect x={-480} y={-62} width={960} height={124} rx={62} fill="#fff" stroke="#E8263A" strokeWidth={8} /><text textAnchor="middle" y={20} fontFamily={F} fontWeight={900} fontSize={50} fill="#E8263A">SEND IT TO YOUR PARTNER</text></g>}
      <Fx t={t} shake={sh} spark={false} />
    </g>
  );
  const flash = Math.max(0, ...['att1', 'att2', 'att3', 'att4', 'att5', 'att6', 'att7', 'alarm', 'fling'].map((k) => 1 - (t - (EV[k] - 0.05)) / (k === 'alarm' ? 0.5 : 0.14)).filter((v) => v < 1)) * (t >= EV.alarm && t < EV.alarm + 0.5 ? 0.85 : 0.22);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Defs />
      <CoupleScene t={t} shake={sh} ex={{...ex, sweat: Math.max(ex.sweat, afterHeat ? heat : 0)}} her={her} pct={pct} cracks={cracksAt(t)} tries={tries(t)} deg={kf(t, [[EV.heat, 21], [EV.thirty, 30], [A(15), 30], [A(16), 22]])} hour={kf(t, [[0, 11], [EV.oclock1, 11], [EV.oclock1 + 0.5, 13], [EV.oclock2, 13], [EV.oclock2 + 0.5, 14], [EV.alarm - 0.01, 14], [EV.alarm, 18]])} zoom={[z, cx, cy]} bubble={bubble} hisBubble={hisBubble} lights={lights} hisDx={hisDx} hisRot={hisRot} herDx={herDx} herRot={herRot} herUp={herUp} blanketDx={blanketDx} blanketRot={blanketRot} bags={kf(t, [[A(14), 0], [A(14) + 0.4, 1]])} dawn={kf(t, [[EV.alarm - 0.01, 0], [EV.alarm + 0.25, 1]])} tint={afterHeat ? heat : kf(t, [[A(8), 1], [A(8) + 1.5, 0]])} hideMeter={1 - c01((t - (EV.five - 0.15)) / 0.25)} hideThermo={1 - c01((t - (EV.heat - 0.2)) / 0.3)} hideTally={1 - c01((t - (EV.att1 - 0.1)) / 0.2)} extra={extra} over={over} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Subs />
      <Audio src={staticFile('audio/cp_voice.wav')} />
      <Audio src={staticFile('audio/cp_sfx.wav')} volume={0.3} />
      <Audio src={staticFile('audio/cp_mumble.wav')} volume={0.45} />
      <Audio src={staticFile('audio/cp_music.wav')} volume={0.1} />
    </AbsoluteFill>
  );
};
