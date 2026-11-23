import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import SEG from './segments.json';
import {Fx, Hummingbird, TopArm, Blanket, Burst, CALM, Defs, Ex, Fire, Gauge, Head, Macaque, Room} from './Macaque';

/* "What if you did it faster and faster?" — British-English replica of the reference structure. No brands, logos or handles. */
const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const eio = Easing.inOut(Easing.cubic), eo = Easing.out(Easing.cubic);
const sec = SEG as {start: number; end: number; text: string}[];
const T = (i: number) => sec[i].start;
const END = sec[22].end + 0.9;
export const MACAQUE_TOTAL = Math.round(END * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
/** piecewise value over absolute time: [[t, v], ...] linear between keys */
const kf = (t: number, keys: [number, number][]) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t <= t1) return lerp(v0, v1, (t - t0) / (t1 - t0)); } return keys[keys.length - 1][1]; };
const punch = (t: number, at: number[]) => 1 + at.reduce((m, a) => Math.max(m, t >= a && t < a + 0.5 ? 0.12 * (1 - (t - a) / 0.5) : 0), 0);
const F = 'DejaVu Sans, Montserrat, sans-serif';

/* ---------------- scenes (absolute-time windows) ---------------- */
const W = {
  room1: [0, T(4)], fbi: [T(4), T(6)], room2: [T(6), T(10)], news: [T(10), T(12)], relat: [T(12), T(14)], atoms: [T(14), T(16)],
  cern: [T(16), T(19)], star: [T(19), T(20)], hole: [T(20), T(22)], end: [T(22), END],
} as const;
type WK = keyof typeof W;

/* ---------------- expression + shake timeline ---------------- */
const exAt = (t: number): Ex => {
  if (t < T(2)) return {...CALM, mouth: 'smile', eye: 0.9, blush: 0.7};
  if (t < T(3)) return {mouth: 'flat', eye: 0.9, pupil: 1.1, brow: 0.2, sweat: 0, blush: 0.6};
  if (t < T(6)) return {mouth: 'o', eye: 1, pupil: 0.8, brow: -0.6, sweat: 0.4, blush: 0.7};
  if (t < T(8)) return {mouth: 'o', eye: 1.1, pupil: 0.7, brow: -0.8, sweat: 0.8, blush: 0.8};
  if (t < T(10)) return {mouth: 'scream', eye: 1.15, pupil: 0.55, brow: -1, sweat: 1, blush: 0.9};
  if (t < T(12)) return {mouth: 'grin', eye: 1, pupil: 0.8, brow: 0.2, sweat: 0.6, blush: 0.9};
  if (t < T(14)) return {mouth: 'o', eye: 1.1, pupil: 0.7, brow: -0.7, sweat: 0.7, blush: 0.8};
  if (t < T(16)) return {mouth: 'scream', eye: 1.1, pupil: 0.55, brow: -1, sweat: 1, blush: 0.9};
  if (t < T(18)) return {mouth: 'scream', eye: 1, pupil: 0.5, brow: -1, sweat: 0.4, blush: 1};
  if (t < T(19)) return {mouth: 'grin', eye: 0.8, pupil: 0.8, brow: 0.4, sweat: 0, blush: 0.9};
  if (t >= W.end[0]) return t < W.end[0] + 1.2 ? {mouth: 'flat', eye: 0.5, pupil: 1, brow: 0.2, sweat: 0.2, blush: 0.9} : {mouth: 'sleep', eye: 0.06, pupil: 1, brow: 0.3, sweat: 0, blush: 0.9};
  return {mouth: 'scream', eye: 1, pupil: 0.5, brow: -1, sweat: 0.5, blush: 1};
};
const shakeAt = (t: number) => (t < T(1) ? 2.2 : t < T(2) ? 3.2 : t < T(3) ? 1.6 : t < T(6) ? 5 : t < T(9) ? 9 : t < W.end[0] ? 13 : 0);
const hudAt = (t: number): {v: number; max: number; label: string; unit: string} | null => {
  if (t < T(2)) return null;
  if (t < T(3)) return {v: 5, max: 1400, label: '5', unit: 'KM/H'};
  if (t < T(6)) return {v: 50, max: 1400, label: '50', unit: 'KM/H'};
  if (t < T(9)) return {v: 300, max: 1400, label: '300', unit: 'KM/H'};
  if (t < T(12)) return {v: 1300, max: 1400, label: '1,300', unit: 'KM/H'};
  if (t < T(14)) return {v: 50, max: 100, label: '50 %', unit: 'LIGHT SPEED'};
  if (t < T(16)) return {v: 90, max: 100, label: '90 %', unit: 'LIGHT SPEED'};
  if (t < T(19)) return {v: 99.9, max: 100, label: '99.9 %', unit: 'LIGHT SPEED'};
  if (t < W.end[0]) return {v: 100, max: 100, label: 'MAX', unit: 'LIGHT SPEED'};
  const k = c01((t - W.end[0]) / 2.2); return {v: lerp(47, 0, k), max: 100, label: `${Math.round(lerp(47, 0, k))}`, unit: 'KM/H'};
};

/* ---------------- bedroom scene (used many times) ---------------- */
const Bedroom: React.FC<{t: number; zoom?: [number, number, number]; fire?: number; burnt?: number; bare?: boolean; bigClock?: number; night?: number; scene?: 'night' | 'day' | 'volcano'; clock?: number; extra?: React.ReactNode; hud?: boolean; dark?: number; fx?: boolean}> = ({t, zoom = [1, 540, 900], fire = 0, burnt = 0, bare = false, bigClock = 0, night = 1, scene = 'night', clock = 1, extra, hud = true, dark = 0, fx = true}) => {
  const sh = shakeAt(t), ex = exAt(t), h = hudAt(t);
  const handsY = 590 + Math.sin(t * 33) * sh * 0.5;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(540 960) scale(${zoom[0]}) translate(${-zoom[1]} ${-zoom[2]})`}>
        <Room t={t} bare={bare} bigClock={bigClock} night={night} scene={scene} clock={clock} lamp={night > 0.4 ? 1 : 0.3}>
          <Macaque ex={ex} shake={sh} t={t} y={640} tilt={Math.sin(t * 25) * sh * 0.25} />
        </Room>
        <Blanket shake={sh} t={t} dark={dark} burnt={burnt} />
        <TopArm shake={sh} t={t} />
        {fire > 0 && <Fire k={fire} t={t} />}
        {t > T(3) - 0.2 && t < T(4) + 0.6 && <Hummingbird x={kf(t, [[T(3) - 0.2, -200], [T(3) + 0.6, 170], [T(4), 170], [T(4) + 0.6, -260]])} y={kf(t, [[T(3) - 0.2, 700], [T(3) + 0.6, 840]])} t={t} s={1.7} />}
        {extra}
      </g>
      {fx && <Fx t={t} shake={sh} />}
      {hud && h && <Gauge value={h.v} max={h.max} label={h.label} unit={h.unit} shake={sh * 0.4} t={t} />}
    </svg>
  );
};

/* ---------------- FBI room ---------------- */
const Agent: React.FC<{x: number; y: number; s: number; cap?: boolean; shock: number; t: number; hair?: string}> = ({x, y, s, cap, shock, t, hair = '#1A1A22'}) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 40) * shock * 3}) scale(${s})`}>
    <path d="M-170 500 L-120 190 Q0 130 120 190 L170 500Z" fill="#14192B" stroke="#0A0D18" strokeWidth={4} /><path d="M-30 180 L0 280 L30 180Z" fill="#F3F5FA" /><path d="M0 200 L-10 240 L0 330 L10 240Z" fill="#9B1B30" />
    <path d="M-40 150 L-40 190 Q0 215 40 190 L40 150Z" fill="#E6BE9A" />
    <path d="M-86 40 Q-90 -90 0 -96 Q94 -96 96 -10 Q112 10 128 40 Q112 52 100 52 Q104 78 80 96 Q40 130 -20 120 Q-90 110 -86 40Z" fill="#EBC49E" stroke="#B28866" strokeWidth={3} />
    <path d="M96 -10 Q126 6 128 40 L110 46" fill="none" stroke="#B28866" strokeWidth={3} />
    <ellipse cx={-34} cy={10} rx={22} ry={30} fill="#D7AB84" />
    {!cap && <path d="M-90 10 Q-100 -100 0 -108 Q70 -106 92 -50 Q40 -60 -20 -52 Q-70 -44 -90 10Z" fill={hair} />}
    {cap && <><path d="M-96 -20 Q-100 -118 10 -122 Q100 -120 100 -30Z" fill="#14192B" stroke="#0A0D18" strokeWidth={3} /><path d="M80 -34 L150 -26 L146 -10 L84 -16Z" fill="#14192B" /><text x={20} y={-62} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill="#F2C94C">FBI</text></>}
    <path d={`M${44} ${shock > 0.4 ? 6 : 12} Q${70} 0 ${84} ${shock > 0.4 ? 4 : 14}`} fill="none" stroke="#3A2A20" strokeWidth={6} strokeLinecap="round" transform={shock > 0.4 ? 'translate(0 -6)' : ''} />
    <ellipse cx={62} cy={22} rx={shock > 0.4 ? 14 : 9} ry={shock > 0.4 ? 17 : 8} fill="#fff" stroke="#3A2A20" strokeWidth={2.5} /><circle cx={68} cy={22} r={shock > 0.4 ? 4 : 5} fill="#111" />
    <path d={shock > 0.4 ? 'M76 78 Q92 90 84 100 Q70 98 70 86Z' : 'M70 86 Q90 90 100 82'} fill={shock > 0.4 ? '#5A2020' : 'none'} stroke="#8A4A3A" strokeWidth={4} strokeLinecap="round" />
    <path d="M-60 -30 Q-110 20 -50 90" fill="none" stroke="#2A2A33" strokeWidth={10} strokeLinecap="round" /><rect x={-76} y={-4} width={34} height={56} rx={14} fill="#2A2A33" /><path d="M-60 80 Q10 120 70 96" fill="none" stroke="#2A2A33" strokeWidth={6} strokeLinecap="round" /><circle cx={72} cy={96} r={7} fill="#2A2A33" />
  </g>
);
const Fbi: React.FC<{t: number}> = ({t}) => {
  const sh = c01((t - W.fbi[0] - 0.4) / 1.5), mugT = c01((t - T(5) + 0.2) / 1.2);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <defs><linearGradient id="fbBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A1328" /><stop offset="1" stopColor="#1B2B4A" /></linearGradient><clipPath id="scr"><rect x={540} y={560} width={460} height={560} rx={14} /></clipPath></defs>
      <rect width={1080} height={1920} fill="url(#fbBg)" />
      {Array.from({length: 18}).map((_, i) => <rect key={i} x={i * 64} y={0} width={4} height={1920} fill="#fff" opacity={0.03} />)}
      <rect x={520} y={540} width={500} height={600} rx={22} fill="#05070E" stroke="#26334F" strokeWidth={8} />
      <g clipPath="url(#scr)"><g transform="translate(540 560) scale(0.43)"><svg width={1080} height={1920} viewBox="0 0 1080 1920" overflow="visible">
        <g style={{filter: 'saturate(0.5) hue-rotate(160deg) brightness(1.15)'}}><Room t={t} lamp={1}><Macaque ex={exAt(t)} shake={shakeAt(t)} t={t} y={640} /></Room><Blanket shake={shakeAt(t)} t={t} /></g>
      </svg></g><rect x={540} y={560} width={460} height={560} fill="#58E0FF" opacity={0.1} />{Array.from({length: 40}).map((_, i) => <rect key={i} x={540} y={560 + i * 14} width={460} height={2} fill="#000" opacity={0.18} />)}</g>
      <text x={560} y={600} fontFamily={F} fontWeight={800} fontSize={22} fill="#FF4D4D">● REC  CAM 3</text><text x={560} y={1100} fontFamily={F} fontWeight={800} fontSize={20} fill="#9FD8FF">SUBJECT: MACAQUE</text>
      <rect x={430} y={1150} width={680} height={40} rx={8} fill="#0A0F1E" /><g>{Array.from({length: 22}).map((_, i) => <rect key={i} x={450 + i * 28} y={1160} width={20} height={18} rx={3} fill="#1B2744" />)}</g>
      <Agent x={150} y={700} s={0.9} cap shock={sh} t={t} /><Agent x={250} y={1090} s={1.35} shock={sh} t={t} hair="#14121A" />
      <g transform={`translate(${420 + mugT * 380} ${1220 + mugT * mugT * 500 - Math.sin(mugT * Math.PI) * 220}) rotate(${mugT * 520})`} opacity={mugT > 0 ? 1 : 1}><rect x={-24} y={-26} width={48} height={52} rx={6} fill="#fff" stroke="#999" strokeWidth={2} /><rect x={-24} y={-8} width={48} height={10} fill="#D8352A" /><path d="M24 -14 Q42 -8 24 8" fill="none" stroke="#fff" strokeWidth={6} /></g>
      {mugT > 0.2 && Array.from({length: 12}).map((_, i) => <circle key={i} cx={560 + mugT * 420 + (random(`cx${i}`) - 0.5) * 100 * mugT} cy={1260 + mugT * mugT * 420 - random(`cy${i}`) * 140 * mugT} r={5} fill="#6B3A1E" />)}
    </svg>
  );
};

/* ---------------- news ---------------- */
const Mk: React.FC<{x: number; y: number; s: number; sign?: string; t: number; i: number}> = ({x, y, s, sign, t, i}) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 6 + i)) * -10}) scale(${s})`}>
    {sign && <g transform={`translate(0 -160) rotate(${Math.sin(t * 5 + i) * 4})`}><rect x={-92} y={-50} width={184} height={90} rx={4} fill="#F7E6C0" stroke="#8A6A30" strokeWidth={3} /><text x={0} y={-4} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={22} fill="#C21F1F">{sign}</text><rect x={-4} y={40} width={8} height={90} fill="#6B4A1E" /></g>}
    <g transform="scale(0.7)"><Head ex={{mouth: 'scream', eye: 1, pupil: 0.6, brow: -0.8, sweat: 0, blush: 0.8}} t={t} /></g>
  </g>
);
const News: React.FC<{t: number}> = ({t}) => {
  const lt = t - W.news[0], ban = c01((lt - 1.0) / 0.9);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <rect width={1080} height={1920} fill="#0A1224" /><rect y={1330} width={1080} height={590} fill="#1A1008" />
      <g transform={`translate(${-lerp(0, 40, c01(lt / 3))} ${620}) scale(${1 + 0.05 * c01(lt / 3)})`}>
        <rect x={20} y={-30} width={1080} height={660} rx={16} fill="#090909" stroke="#222" strokeWidth={8} />
        <rect x={50} y={0} width={1020} height={600} fill="#7FA5D8" />
        {Array.from({length: 12}).map((_, i) => <rect key={i} x={50 + i * 90} y={170 + (i % 4) * 40} width={80} height={430 - (i % 4) * 40} fill={['#C58A5A', '#B07A52', '#D4A070', '#A8714A'][i % 4]} />)}
        <rect x={50} y={0} width={1020} height={170} fill="#F0B070" opacity={0.55} />
        <Mk x={210} y={470} s={1.15} sign="NOT IN OUR NAME!" t={t} i={0} /><Mk x={540} y={480} s={1.05} t={t} i={1} /><Mk x={860} y={460} s={1.2} sign="MACAQUE PRIDE" t={t} i={2} />
        <rect x={880} y={20} width={150} height={40} rx={6} fill="#D8201A" /><text x={955} y={48} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={22} fill="#fff">● LIVE</text>
        {lt > 0.8 && <><rect x={50} y={470} width={1020} height={130} fill="#fff" /><rect x={50} y={470} width={300} height={44} fill="#D8201A" /><text x={64} y={502} fontFamily={F} fontWeight={900} fontSize={26} fill="#fff">BREAKING NEWS</text><text x={64} y={552} fontFamily={F} fontWeight={800} fontSize={30} fill="#111">Macaques outraged: "he's making us look terrible"</text></>}
        {ban > 0 && <g transform={`translate(${lerp(120, 1000, ban)} ${lerp(300, 120, Math.sin(ban * Math.PI))}) rotate(${ban * 900})`}><path d="M-70 0 Q-10 -70 70 -10 Q10 -20 -70 0Z" fill="#F7D547" stroke="#A8841A" strokeWidth={4} /><path d="M-70 0 Q-60 30 -10 24" fill="none" stroke="#7A5A10" strokeWidth={4} /></g>}
      </g>
      <rect x={380} y={1290} width={320} height={26} rx={8} fill="#111" /><rect x={500} y={1256} width={80} height={44} fill="#111" />
    </svg>
  );
};

/* ---------------- atoms, CERN, star, black hole ---------------- */
const Atoms: React.FC<{t: number}> = ({t}) => {
  const lt = t - W.atoms[0], len = W.atoms[1] - W.atoms[0], flash = kf(lt, [[0, 0], [1.4, 0], [1.9, 1], [2.4, 0]]), rb = c01((lt - 1.5) / (len - 1.5));
  return (
    <AbsoluteFill>
      {lt < 2.0 && <Bedroom t={t} night={0.85} scene="volcano" clock={0.3} dark={0.0} zoom={[1 + 0.25 * c01(lt / 2), 540, 900]} />}
      {lt >= 1.7 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
          <defs><radialGradient id="atBg"><stop offset="0" stopColor="#1A2B5A" /><stop offset="1" stopColor="#02030A" /></radialGradient></defs><rect width={1080} height={1920} fill="#02030A" />
          <circle cx={540} cy={960} r={500} fill="url(#atBg)" stroke="#2F5FA8" strokeWidth={10} />
          {Array.from({length: 120}).map((_, i) => { const a = random(`aa${i}`) * 6.283, r0 = 140 + random(`ar${i}`) * 340, sp = 0.4 + random(`as${i}`) * 0.8, k = ((lt * sp * 0.4 + random(`ap${i}`)) % 1), r = r0 * (1 - 0.35 * k) + 10 + rb * 40; return <circle key={i} cx={540 + Math.cos(a + lt * 0.5 * sp) * r} cy={960 + Math.sin(a + lt * 0.5 * sp) * r} r={2 + random(`az${i}`) * 4} fill={i % 4 ? '#FFFFFF' : '#FFD166'} opacity={0.5 + 0.5 * Math.sin(lt * 7 + i) ** 2} />; })}
          <circle cx={540} cy={960} r={34 + 24 * Math.sin(lt * 9)} fill="#FFF3C4" /><circle cx={540} cy={960} r={120} fill="#FFE9A0" opacity={0.25} />
          <circle cx={540} cy={960} r={120 + rb * 380} fill="none" stroke="#fff" strokeWidth={8} opacity={0.8 * (1 - rb)} />
        </svg>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
const Nobel: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-110 520 L-90 190 Q0 150 90 190 L110 520Z" fill="#0D0D14" stroke="#000" strokeWidth={4} /><path d="M-30 190 L0 300 L30 190Z" fill="#fff" /><path d="M-26 196 L-8 214 L8 214 L26 196 L26 232 L8 214 L-8 214 L-26 232Z" fill="#C21F1F" />
    <g transform="translate(0 0) scale(0.55)"><Head ex={{mouth: 'smile', eye: 0.9, pupil: 1, brow: 0, sweat: 0, blush: 0.4}} t={t} /><path d="M-70 40 Q0 20 70 40 Q60 78 0 76 Q-60 78 -70 40Z" fill="#fff" stroke="#BBB" strokeWidth={3} /><path d="M-110 -80 Q-100 -150 0 -150 Q100 -150 110 -80 Q60 -110 0 -106 Q-60 -110 -110 -80Z" fill="#F5F5F5" /></g>
    <g transform={`translate(-150 330) rotate(${-10 + Math.sin(t * 3) * 3})`}><path d="M-10 0 L-8 80 L8 80 L10 0 Q40 -20 30 -60 Q0 -40 -30 -60 Q-40 -20 -10 0Z" fill="url(#mGold)" stroke="#8A5A10" strokeWidth={3} /><rect x={-28} y={80} width={56} height={22} rx={4} fill="#1A1A22" /><text x={0} y={96} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={11} fill="#F2C94C">NOBEL</text></g>
  </g>
);
const Cern: React.FC<{t: number}> = ({t}) => {
  const lt = t - W.cern[0], nob = c01((lt - (T(17) - W.cern[0])) / 0.8);
  const light = c01((lt - (T(18) - W.cern[0])) / 1.2);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <defs><radialGradient id="tun" cx="50%" cy="38%" r="70%"><stop offset="0" stopColor="#E8EEF5" stopOpacity={0.7} /><stop offset="0.25" stopColor="#5B6B80" /><stop offset="1" stopColor="#0C1018" /></radialGradient></defs>
      <rect width={1080} height={1920} fill="url(#tun)" />
      {Array.from({length: 14}).map((_, i) => { const k = ((i + lt * 2.5) % 14) / 14, r = 60 + k * k * 900; return <ellipse key={i} cx={540} cy={760 + k * 160} rx={r * 0.7} ry={r} fill="none" stroke="#202938" strokeWidth={4 + k * 22} opacity={0.5 + 0.4 * k} />; })}
      {Array.from({length: 16}).map((_, i) => <line key={i} x1={540} y1={720} x2={540 + Math.cos(i * 0.39) * 1400} y2={720 + Math.sin(i * 0.39) * 1400} stroke="#7C93B8" strokeWidth={2} opacity={0.2} />)}
      <polygon points="880,420 1080,520 1080,1500 880,1400" fill="#1D54C8" /><text transform="translate(985 880) rotate(75)" fontFamily={F} fontWeight={900} fontSize={70} fill="#fff" textAnchor="middle" letterSpacing={4}>CERN</text><text transform="translate(1030 1180) rotate(75)" fontFamily={F} fontWeight={800} fontSize={26} fill="#BFD3FF" textAnchor="middle">LHC</text>
      <g transform="translate(540 1000) scale(1.25) translate(-540 -1000)"><Room t={t} lamp={0} bare><Macaque ex={exAt(t)} shake={shakeAt(t)} t={t} y={640} /></Room><Blanket shake={shakeAt(t)} t={t} burnt={1} /><TopArm shake={shakeAt(t)} t={t} /></g>
      <rect x={0} y={1180} width={1080} height={740} fill="#150E10" opacity={0.0} />
      {lt < T(17) - W.cern[0] + 0.6 && Array.from({length: 40}).map((_, i) => { const a = random(`sp${i}`) * 6.283, k = (lt * 2 + random(`sk${i}`)) % 1; return <line key={i} x1={540 + Math.cos(a) * 60 * k} y1={1100 + Math.sin(a) * 60 * k} x2={540 + Math.cos(a) * (60 + 360 * k)} y2={1100 + Math.sin(a) * (60 + 360 * k)} stroke="#FFC24A" strokeWidth={3} opacity={1 - k} />; })}
      {nob > 0 && <g opacity={nob} transform={`translate(${lerp(260, 0, nob)} 0)`}><Nobel x={870} y={760} t={t} /></g>}
      <circle cx={540} cy={1050} r={80 + 900 * light} fill="#FFF8DA" opacity={Math.min(1, light * 1.4)} />
    </svg>
  );
};
const Star: React.FC<{t: number}> = ({t}) => {
  const lt = t - W.star[0], k = c01(lt / 0.8), len = W.star[1] - W.star[0];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <rect width={1080} height={1920} fill="#0B0A12" />
      <circle cx={540} cy={960} r={420 + 60 * (1 - k) + 14 * Math.sin(lt * 6)} fill="#FFD27A" opacity={0.25} />
      <circle cx={540} cy={960} r={330 * (0.4 + 0.6 * k)} fill="url(#mGold)" stroke="#FFE9A8" strokeWidth={8} />
      {Array.from({length: 26}).map((_, i) => { const a = random(`g${i}`) * 6.283, r = random(`h${i}`) * 300; return <circle key={i} cx={540 + Math.cos(a) * r} cy={960 + Math.sin(a) * r} r={14 + random(`i${i}`) * 26} fill="#D89B3A" opacity={0.35} />; })}
      <g transform={`translate(540 960) scale(${1.0 * (0.4 + 0.6 * k)})`}><Head ex={{mouth: 'worry', eye: 0.5, pupil: 1, brow: -0.5, sweat: 0, blush: 0.8}} t={t} /></g>
      {Array.from({length: 14}).map((_, i) => { const a = (i / 14) * 6.283 + lt; return <path key={i} d={`M${540 + Math.cos(a) * 340} ${960 + Math.sin(a) * 340} L${540 + Math.cos(a) * (430 + 40 * Math.sin(lt * 5 + i))} ${960 + Math.sin(a) * (430 + 40 * Math.sin(lt * 5 + i))}`} stroke="#FFD27A" strokeWidth={10} strokeLinecap="round" />; })}
      <rect width={1080} height={1920} fill="#fff" opacity={Math.max(0, 1 - lt * 4)} />
      {lt > len - 0.01 && null}
    </svg>
  );
};
const Hole: React.FC<{t: number}> = ({t}) => {
  const lt = t - W.hole[0], collapse = c01(lt / 1.2), hum = c01((lt - (T(21) - W.hole[0])) / 3.4), cx = 540, cy = 800;
  const dots = Array.from({length: 70}).map((_, i) => ({a: random(`ha${i}`) * 6.283, r: 150 + random(`hr${i}`) * 160}));
  const COL = ['#E84545', '#F2C94C', '#4DA8DA', '#6BCB77', '#B084CC', '#FF8A3D'];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <defs><radialGradient id="acc"><stop offset="0.55" stopColor="#FFB070" stopOpacity={0} /><stop offset="0.8" stopColor="#FFB070" stopOpacity={0.9} /><stop offset="1" stopColor="#FF7A30" stopOpacity={0} /></radialGradient><radialGradient id="earth" cx="35%" cy="35%"><stop offset="0" stopColor="#7FB8F0" /><stop offset="1" stopColor="#1A3F7A" /></radialGradient></defs>
      <rect width={1080} height={1920} fill="#020208" />{Array.from({length: 80}).map((_, i) => <circle key={i} cx={random(`bx${i}`) * 1080} cy={random(`by${i}`) * 1920} r={1.4 + random(`bz${i}`) * 1.6} fill="#fff" opacity={0.3 + 0.6 * random(`bo${i}`)} />)}
      <g transform={`translate(${cx} ${cy}) scale(${0.3 + 0.7 * collapse})`}>
        <ellipse rx={520} ry={150} fill="url(#acc)" /><ellipse rx={470} ry={120} fill="none" stroke="#FFC38A" strokeWidth={6} opacity={0.7} />
        {dots.map((d, i) => <circle key={i} cx={Math.cos(d.a + t * 0.8) * (d.r + 220)} cy={Math.sin(d.a + t * 0.8) * (d.r + 220) * 0.25} r={4} fill="#FFD9A8" opacity={0.7} />)}
        <circle r={210} fill="#000" /><circle r={218} fill="none" stroke="#FFB070" strokeWidth={20} opacity={0.9} style={{filter: 'blur(2px)'}} /><circle r={214} fill="none" stroke="#FFE3C0" strokeWidth={5} />
        <path d="M-520 -4 Q0 -60 520 -4" fill="none" stroke="#FFC38A" strokeWidth={8} opacity={0.6} />
      </g>
      {lt > T(21) - W.hole[0] - 0.3 && (
        <g>
          <circle cx={200} cy={1560} r={330} fill="url(#earth)" stroke="#9FD0FF" strokeWidth={6} /><path d="M80 1450 Q150 1400 230 1450 Q260 1520 180 1580 Q90 1560 80 1450Z" fill="#4CA860" opacity={0.9} /><path d="M260 1640 Q330 1600 380 1660 Q350 1720 280 1700Z" fill="#4CA860" opacity={0.9} />
          {Array.from({length: 26}).map((_, i) => { const k = c01(hum * 1.3 - random(`hk${i}`) * 0.35), x = lerp(230 + random(`hx${i}`) * 80, cx + (random(`hy${i}`) - 0.5) * 80, k), y = lerp(1330 - random(`hz${i}`) * 60, cy + 40, eo(k)); return <g key={i} transform={`translate(${x} ${y}) rotate(${k * 600 + i * 30}) scale(${1 - 0.7 * k})`} opacity={k < 1 ? 1 : 0}><circle r={9} fill="#F2C99A" stroke="#000" strokeWidth={1.5} /><rect x={-8} y={9} width={16} height={22} rx={4} fill={COL[i % 6]} /><line x1={-8} y1={14} x2={-18} y2={4} stroke={COL[i % 6]} strokeWidth={5} /><line x1={8} y1={14} x2={18} y2={4} stroke={COL[i % 6]} strokeWidth={5} /></g>; })}
        </g>
      )}
    </svg>
  );
};

/* ---------------- subtitles (top, active word bold, upcoming grey, key words boxed) ---------------- */
const KEYS = ['macaque', 'macaques', 'Tuesday.', 'Fifty.', 'FBI', 'bullet.', 'Cars', 'sound', 'news:', 'CERN.', 'Nobel', 'star.', 'black', 'bedsheets.', 'friend,', 'time-travelling,'];
type Card = {t0: number; t1: number; words: {w: string; a: number; b: number}[]};
const cards: Card[] = [];
for (const sg of sec) {
  const w = sg.text.split(' '); const n = w.length; const k = Math.ceil(n / 3); const size = Math.ceil(n / k);
  const chunks: string[][] = []; for (let i = 0; i < n; i += size) chunks.push(w.slice(i, i + size));
  const tot = chunks.reduce((s2, c) => s2 + c.join(' ').length + 1, 0); let tt = sg.start;
  for (const c of chunks) { const d = ((sg.end - sg.start) * (c.join(' ').length + 1)) / tot; const L = c.reduce((s2, x) => s2 + x.length + 1, 0); let acc = tt; cards.push({t0: tt, t1: tt + d, words: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st, b: acc}; })}); tt += d; }
}
const Subs: React.FC = () => {
  const s = useCurrentFrame() / FPS; const c = cards.find((x) => s >= x.t0 && s < x.t1 + 0.05);
  if (!c || s > sec[22].end + 0.3) return null;
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: 300, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', textAlign: 'center'}}>
      {c.words.map((x, i) => { const act = s >= x.a - 0.02, key = KEYS.includes(x.w); return <span key={i} style={{fontFamily: F, fontWeight: act ? 900 : 600, fontSize: 56, color: act ? '#fff' : 'rgba(255,255,255,.55)', textShadow: '0 3px 10px rgba(0,0,0,.85), 0 0 3px #000', padding: key && act ? '0 10px' : 0, border: key && act ? '3px solid #4DA3FF' : '3px solid transparent', background: key && act ? 'rgba(46,108,200,.35)' : 'transparent', borderRadius: 6}}>{x.w}</span>; })}
    </div>
  );
};

/* ---------------- composition ---------------- */
const Scene: React.FC<{k: WK; children: (t: number) => React.ReactNode}> = ({k, children}) => {
  const from = Math.round(W[k][0] * FPS), len = Math.round(W[k][1] * FPS) - from + 1;
  return <Sequence from={from} durationInFrames={len}><AbsoluteFill><Inner t0={W[k][0]}>{children}</Inner></AbsoluteFill></Sequence>;
};
const Inner: React.FC<{t0: number; children: (t: number) => React.ReactNode}> = ({t0, children}) => { const f = useCurrentFrame(); return <>{children(t0 + f / FPS)}</>; };

export const MacaqueFaster: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Defs />
    <Scene k="room1">{(t) => <Bedroom t={t} zoom={[kf(t, [[0, 2.1], [1.6, 2.1], [3.4, 1.05], [T(4), 1.2]]) * punch(t, [T(2), T(3)]), 540, kf(t, [[0, 720], [1.6, 720], [3.4, 900]])]} />}</Scene>
    <Scene k="fbi">{(t) => <Fbi t={t} />}</Scene>
    <Scene k="room2">{(t) => <Bedroom t={t} burnt={kf(t, [[T(8) + 1, 0], [T(9) + 1, 1]])} zoom={[kf(t, [[T(6), 1.05], [T(8), 1.3], [T(9), 1.5], [T(10), 1.6]]) * punch(t, [T(6), T(7), T(8), T(9)]), 540, 900]} fire={kf(t, [[T(7), 0], [T(8) + 0.2, 0], [T(8) + 1.8, 1], [T(10), 1.2]])} extra={t > T(9) && t < T(9) + 1.2 ? <Burst k={(t - T(9)) / 1.2} /> : null} />}</Scene>
    <Scene k="news">{(t) => <News t={t} />}</Scene>
    <Scene k="relat">{(t) => <Bedroom t={t} night={kf(t, [[T(12), 1], [T(13), 0.55]])} scene={t > T(13) ? 'volcano' : 'night'} clock={kf(t, [[T(12), 1], [T(13), 0.1]])} burnt={1} bigClock={kf(t, [[T(12), 0], [T(12) + 0.6, 1]])} dark={0.2} zoom={[kf(t, [[T(12), 1.1], [T(13) - 0.2, 1.1], [T(13) + 0.3, 2.3], [T(14), 2.5]]), 540, kf(t, [[T(13) - 0.2, 900], [T(13) + 0.3, 700]])]} extra={<g>{Array.from({length: 6}).map((_, i) => { const k = ((t * 0.5 + i / 6) % 1); return <ellipse key={i} cx={540} cy={1500} rx={120 + k * 700} ry={30 + k * 160} fill="none" stroke="#9FD0FF" strokeWidth={4} opacity={0.7 * (1 - k)} />; })}</g>} />}</Scene>
    <Scene k="atoms">{(t) => <Atoms t={t} />}</Scene>
    <Scene k="cern">{(t) => <Cern t={t} />}</Scene>
    <Scene k="star">{(t) => <Star t={t} />}</Scene>
    <Scene k="hole">{(t) => <Hole t={t} />}</Scene>
    <Scene k="end">{(t) => <Bedroom t={t} night={1} zoom={[kf(t, [[W.end[0], 1.1], [END, 2.2]]), 540, kf(t, [[W.end[0], 900], [END, 700]])]} />}</Scene>
    <Subs />
    <Audio src={staticFile('audio/mac_voice.wav')} />
    <Audio src={staticFile('audio/mac_sfx.wav')} volume={0.3} />
  </AbsoluteFill>
);
export const MAC_BOUNDS = W;
export const _u = [interpolate, eio];
