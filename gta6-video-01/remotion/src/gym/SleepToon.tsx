import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {BG, FONT, FrontPerson, G, OL, Person, POSES, Pill, Pop, Pose, Tank, TimerCard, Xray, mixPose, Floor} from './kit';
import {PhoneGlow, PlateG} from './props';
import {FPS} from '../theme';
import SEG from '../fitness/ep02_segments.json';

/* =====================================================================================
   "5 h vs 8 h of sleep" — flat outlined cartoon (same kit as the gym-rest reference video)
   Voice: Kokoro am_michael, timings from ep02_segments.json. Retention plan: docs/PLAN_sleep_toon.md
   ===================================================================================== */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;
const tri = (x: number) => 0.5 - 0.5 * Math.cos(x * Math.PI * 2);
const eo = Easing.out(Easing.cubic);
const sec = SEG as {start: number; end: number; text: string}[];
const END = sec[17].end + 2.0;
export const SLEEPTOON_TOTAL = Math.round(END * FPS);
const B = {
  hook: [0, sec[1].start], same: [sec[1].start, sec[2].start], thirty: [sec[2].start, sec[3].start], nightA: [sec[3].start, sec[4].start], nightD: [sec[4].start, sec[5].start],
  testo: [sec[5].start, sec[6].start], horm: [sec[6].start, sec[8].start], crave: [sec[8].start, sec[9].start], reps: [sec[9].start, sec[10].start + 3.3], gh: [sec[10].start + 3.3, sec[11].start],
  scary: [sec[11].start, sec[12].start], study: [sec[12].start, sec[14].start], face: [sec[14].start, sec[15].start], gains: [sec[15].start, sec[16].start], supp: [sec[16].start, sec[17].start], poll: [sec[17].start, END],
} as const;
type BK = keyof typeof B;
const RED = '#E8432E'; // Daniel's shirt
const PURPLE = '#7B5A9E';

/* ---------------- shared bits ---------------- */
const Impact: React.FC<{at: number[]; children: React.ReactNode}> = ({at, children}) => {
  const t = useT(); let k = 0, sh = 0, fl = 0;
  for (const a of at) { const d = t - a; if (d >= 0 && d < 0.7) { k += 0.07 * Math.exp(-d * 8); if (d < 0.3) sh += (1 - d / 0.3) * 14; if (d < 0.16) fl = Math.max(fl, 0.5 * (1 - d / 0.16)); } }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${Math.sin(t * 97) * sh}px,${Math.cos(t * 83) * sh}px) scale(${1 + k})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: fl}} />
    </AbsoluteFill>
  );
};
const Stamp: React.FC<{at: number; text: string; color: string; size?: number; rot?: number; left: number; top: number; bg?: string; out?: number; center?: boolean}> = ({at, text, color, size = 110, rot = -8, left, top, bg = '#fff', out, center}) => {
  const t = useT();
  if (t < at || (out !== undefined && t > out)) return null;
  const p = interpolate(t, [at, at + 0.14], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return <div style={{position: 'absolute', left, top, width: center ? 1080 - 2 * left : undefined, display: center ? 'flex' : undefined, justifyContent: 'center', transform: `rotate(${rot}deg) scale(${2.4 - 1.4 * p})`, opacity: Math.min(1, p * 2)}}><div style={{border: `${size * 0.09}px solid ${color}`, color, background: bg, borderRadius: size * 0.18, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, padding: `${size * 0.1}px ${size * 0.28}px`, whiteSpace: 'nowrap', letterSpacing: 2, boxShadow: '0 12px 0 rgba(0,0,0,.15)'}}>{text}</div></div>;
};
const Header: React.FC<{tag: string; color?: string; dark?: boolean}> = ({tag, color = G.blue, dark}) => (
  <>
    <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: 3, color: dark ? '#7FB6FF' : '#6a6a66'}}>SLEEP FACTS</div>
    <div style={{position: 'absolute', right: 150, top: 62}}><Pill text={tag} color={color} size={22} bg={dark ? '#0B1E3F' : G.bg} /></div>
  </>
);
const SrcLine: React.FC<{text: string; top?: number; dark?: boolean}> = ({text, top = 1262, dark}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: dark ? '#9CC3F5' : G.grey, gap: 8, alignItems: 'center'}}>
    <svg width="18" height="22" viewBox="0 0 18 22"><path d="M1 1h11l5 5v15H1z" fill="none" stroke={dark ? '#9CC3F5' : G.grey} strokeWidth="2" /></svg>{text}
  </div>
);
const blinkAt = (t: number, times: number[]) => { for (const a of times) { const d = t - a; if (d >= 0 && d < 0.2) return Math.sin((d / 0.2) * Math.PI); } return 0; };
const Alex: React.FC<{x: number; y: number; s: number; t?: number; mood?: 'smile' | 'flat' | 'worry'; bicep?: number; pump?: number; blink?: number; tired?: number; yawn?: number; handL?: [number, number]; handR?: [number, number]; point?: boolean; crouch?: number}> = ({x, y, s, t = 0, mood = 'smile', bicep = 0, pump = 0, blink, tired = 0, yawn = 0, handL, handR, point, crouch}) => (
  <FrontPerson shirt={G.blue} hair="short" mood={mood} s={s} x={x} y={y} bicep={bicep} pumpGlow={pump} tired={tired} yawn={yawn} blink={blink ?? blinkAt(t, [0.7, 2.6, 4.4, 6.1, 8.2])} handL={handL} handR={handR} point={point} crouch={crouch} />
);
const Daniel: React.FC<{x: number; y: number; s: number; t?: number; mood?: 'smile' | 'flat' | 'worry' | 'strain'; bicep?: number; pump?: number; blink?: number; tired?: number; yawn?: number; sweat?: number; handL?: [number, number]; handR?: [number, number]; crouch?: number}> = ({x, y, s, t = 0, mood = 'flat', bicep = 0, pump = 0, blink, tired = 1, yawn = 0, sweat = 0, handL, handR, crouch}) => (
  <FrontPerson shirt={RED} cap beard mood={mood} s={s} x={x} y={y} bicep={bicep} pumpGlow={pump} tired={tired} yawn={yawn} sweat={sweat} blink={blink ?? blinkAt(t, [0.4, 1.3, 2.9, 3.8, 5.2, 6.6, 8.0])} handL={handL} handR={handR} crouch={crouch} />
);
/** Bottom-aligned FrontPerson helper: floor y, soles at y≈570*s. */
const feetY = (floor: number, s: number) => floor - 572 * s;

/* ---------------- flat icons ---------------- */
type IconKind = 'dumbbell' | 'bowl' | 'shake' | 'donut' | 'pizza' | 'cookie' | 'fries' | 'bell' | 'coin' | 'moon';
const Icon: React.FC<{k: IconKind; size?: number}> = ({k, size = 110}) => {
  const sw = 4;
  const body = (() => {
    switch (k) {
      case 'dumbbell': return <><rect x={22} y={44} width={56} height={12} rx={4} fill="#9AA0AA" stroke={OL} strokeWidth={sw} /><rect x={8} y={26} width={18} height={48} rx={6} fill="#1C1D22" stroke={OL} strokeWidth={sw} /><rect x={74} y={26} width={18} height={48} rx={6} fill="#1C1D22" stroke={OL} strokeWidth={sw} /></>;
      case 'bowl': return <><path d="M12 48 Q50 98 88 48 Z" fill="#fff" stroke={OL} strokeWidth={sw} strokeLinejoin="round" /><circle cx={34} cy={42} r={14} fill={G.green} stroke={OL} strokeWidth={sw} /><circle cx={56} cy={36} r={14} fill="#FF7A59" stroke={OL} strokeWidth={sw} /><circle cx={70} cy={44} r={11} fill={G.yellow} stroke={OL} strokeWidth={sw} /><path d="M12 48 L88 48" stroke={OL} strokeWidth={sw} /></>;
      case 'shake': return <><rect x={30} y={30} width={40} height={60} rx={10} fill="#fff" stroke={OL} strokeWidth={sw} /><rect x={30} y={52} width={40} height={38} rx={10} fill={G.blue} stroke={OL} strokeWidth={sw} /><rect x={26} y={16} width={48} height={18} rx={8} fill={G.ink} stroke={OL} strokeWidth={sw} /></>;
      case 'donut': return <><circle cx={50} cy={52} r={36} fill="#E7A560" stroke={OL} strokeWidth={sw} /><path d="M18 50 Q22 20 50 20 Q80 20 82 50 Q70 44 62 52 Q54 40 44 52 Q34 44 18 50Z" fill="#FF8FB1" stroke={OL} strokeWidth={3} strokeLinejoin="round" /><circle cx={50} cy={52} r={11} fill={G.bg} stroke={OL} strokeWidth={sw} /></>;
      case 'pizza': return <><path d="M50 92 L10 24 Q50 8 90 24 Z" fill="#F5C45A" stroke={OL} strokeWidth={sw} strokeLinejoin="round" /><path d="M10 24 Q50 8 90 24" fill="none" stroke="#D88A3C" strokeWidth={9} strokeLinecap="round" /><circle cx={40} cy={36} r={7} fill={G.red} stroke={OL} strokeWidth={3} /><circle cx={60} cy={44} r={7} fill={G.red} stroke={OL} strokeWidth={3} /><circle cx={50} cy={62} r={6} fill={G.red} stroke={OL} strokeWidth={3} /></>;
      case 'cookie': return <><circle cx={50} cy={50} r={38} fill="#D9A45E" stroke={OL} strokeWidth={sw} /><circle cx={36} cy={38} r={6} fill="#5A3A22" /><circle cx={60} cy={34} r={5} fill="#5A3A22" /><circle cx={64} cy={60} r={6} fill="#5A3A22" /><circle cx={40} cy={64} r={5} fill="#5A3A22" /></>;
      case 'fries': return <>{[24, 36, 48, 60, 72].map((x, i) => <rect key={i} x={x} y={14 + (i % 2) * 8} width={10} height={50} rx={3} fill={G.yellow} stroke={OL} strokeWidth={3} />)}<path d="M18 48 L82 48 L74 94 L26 94 Z" fill={G.red} stroke={OL} strokeWidth={sw} strokeLinejoin="round" /></>;
      case 'bell': return <><path d="M50 12 Q22 14 22 52 L14 72 L86 72 L78 52 Q78 14 50 12Z" fill={G.yellow} stroke={OL} strokeWidth={sw} strokeLinejoin="round" /><circle cx={50} cy={80} r={9} fill={G.ink} stroke={OL} strokeWidth={3} /></>;
      case 'coin': return <><circle cx={50} cy={50} r={38} fill="#FFC93C" stroke={OL} strokeWidth={sw} /><circle cx={50} cy={50} r={28} fill="none" stroke="#E0A31A" strokeWidth={4} /><path d="M50 32 V68 M32 50 H68" stroke={OL} strokeWidth={8} strokeLinecap="round" /></>;
      case 'moon': return <><path d="M62 10 A42 42 0 1 0 90 62 A34 34 0 1 1 62 10Z" fill="#FFE9A3" stroke={OL} strokeWidth={sw} strokeLinejoin="round" /></>;
    }
  })();
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>{body}</svg>;
};
const IconBubble: React.FC<{k: IconKind; at: number; x: number; y: number; size?: number; color?: string}> = ({k, at, x, y, size = 130, color = G.ink}) => {
  const t = useT(); if (t < at) return null;
  const p = interpolate(t, [at, at + 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.4))});
  return <div style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, background: '#fff', border: `5px solid ${color}`, boxShadow: '0 8px 0 rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}><Icon k={k} size={size * 0.62} /></div>;
};
const Zzz: React.FC<{x: number; y: number; t: number; color?: string}> = ({x, y, t, color = G.blue}) => (
  <>{[0, 1, 2].map((i) => { const p = (t * 0.7 + i / 3) % 1; return <div key={i} style={{position: 'absolute', left: x + p * 90 + i * 14, top: y - p * 230, fontFamily: FONT, fontWeight: 900, fontSize: 56 + i * 14, color, opacity: Math.sin(p * Math.PI), WebkitTextStroke: `3px ${OL}`, paintOrder: 'stroke fill'}}>Z</div>; })}</>
);
/** Hand-drawn scribble circle that draws itself. */
const Ring: React.FC<{at: number; cx: number; cy: number; rx: number; ry: number; color?: string; sw?: number}> = ({at, cx, cy, rx, ry, color = G.red, sw = 9}) => {
  const t = useT(); const p = interpolate(t, [at, at + 0.45], [0, 1], {...clamp, easing: eo}); if (t < at) return null;
  const L = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 1.15;
  return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(-6 ${cx} ${cy})`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} /></svg>;
};
const Callout: React.FC<{at: number; text: string; x: number; y: number; tx: number; ty: number; color?: string}> = ({at, text, x, y, tx, ty, color = G.red}) => {
  const t = useT(); if (t < at) return null;
  const p = interpolate(t, [at, at + 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={color} strokeWidth={6} strokeLinecap="round" /><circle cx={tx} cy={ty} r={11 * p} fill={color} /></svg>
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`}}><Pill text={text} color={color} size={30} bg="#fff" /></div>
    </>
  );
};
const hhmm = (h: number) => { const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.floor((h - Math.floor(h)) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

/* ---------------- 1. HOOK (0 → 3.2 s) ---------------- */
const Hook: React.FC = () => {
  const t = useT(); const s = 2.6;
  const yawnK = interpolate(t, [1.0, 1.5, 2.2, 2.6], [0, 1, 1, 0], clamp);
  const zoom = 1 + 0.07 * interpolate(t, [0, 3.2], [0, 1]);
  const panel = (i: 0 | 1) => (
    <div key={i} style={{position: 'absolute', left: i * 540, top: 120, width: 540, height: 1130, overflow: 'hidden', background: i ? '#F3E6E6' : '#E4EDFB', backgroundImage: `linear-gradient(${G.grid} 1px, transparent 1px), linear-gradient(90deg, ${G.grid} 1px, transparent 1px)`, backgroundSize: '60px 60px'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1130, transform: `scale(${zoom})`, transformOrigin: '270px 420px'}}>
        {i === 0
          ? <Alex x={270 - 200 * s} y={420 - 140 * s} s={s} t={t} mood="smile" />
          : <Daniel x={270 - 200 * s} y={420 - 140 * s} s={s} t={t} mood="worry" yawn={yawnK} blink={yawnK > 0.2 ? 0.95 : undefined} />}
      </div>
    </div>
  );
  const stamp = (i: 0 | 1, at: number) => <Stamp key={i} at={at} text={i ? '5 HOURS' : '8 HOURS'} color={i ? G.red : G.blue} size={74} left={i * 540 + 70} top={880} rot={i ? 5 : -5} />;
  return (
    <AbsoluteFill>
      <Header tag="30-DAY TEST" />
      {panel(0)}{panel(1)}
      <div style={{position: 'absolute', left: 536, top: 120, width: 8, height: 1130, background: G.ink}} />
      {stamp(0, 0.35)}{stamp(1, 1.15)}
      <Ring at={2.15} cx={810} cy={525} rx={130} ry={52} />
      {t > 2.7 && <Pop at={Math.round(2.7 * FPS)} style={{left: 700, top: 405}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, color: G.red}}>?</div></Pop>}
    </AbsoluteFill>
  );
};

/* ---------------- 2. SAME WORKOUT / DIET / PROTEIN ---------------- */
const Same: React.FC = () => {
  const t = useT(); const s = 1.15, fl = 1150, y = feetY(fl, s);
  const beats = [{k: 'dumbbell' as const, text: 'SAME WORKOUT', at: 0.1}, {k: 'bowl' as const, text: 'SAME DIET', at: 0.85}, {k: 'shake' as const, text: 'SAME PROTEIN', at: 1.6}];
  const bob = Math.sin(t * 5) * 4;
  return (
    <AbsoluteFill>
      <Header tag="CONTROLS" />
      <Floor y={fl} />
      <Alex x={20} y={y + bob} s={s} t={t} />
      <Daniel x={560} y={y - bob} s={s} t={t} tired={0.9} />
      {beats.map((b, i) => (
        <React.Fragment key={i}>
          <IconBubble k={b.k} at={b.at} x={90} y={205 + i * 112} size={100} color={G.blue} />
          <IconBubble k={b.k} at={b.at + 0.04} x={890} y={205 + i * 112} size={100} color={G.red} />
          <Pop at={Math.round(b.at * FPS)} style={{left: 200, top: 222 + i * 112, width: 680, display: 'flex', justifyContent: 'center'}}><Pill text={`${b.text} ✓`} color={G.ink} size={46} bg="#fff" /></Pop>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- 3. 30 DAYS ---------------- */
const Thirty: React.FC = () => {
  const t = useT(); const s = 0.78, fl = 1150, y = feetY(fl, s);
  const done = Math.floor(interpolate(t, [0.1, 1.5], [0, 30], clamp));
  return (
    <AbsoluteFill>
      <Header tag="30 DAYS" color={G.orange} />
      <Floor y={fl} />
      <div style={{position: 'absolute', left: 150, top: 230, width: 780, background: '#fff', border: `6px solid ${G.ink}`, borderRadius: 26, boxShadow: '0 12px 0 rgba(0,0,0,.14)', overflow: 'hidden'}}>
        <div style={{background: G.red, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 38, color: '#fff', letterSpacing: 6, borderBottom: `6px solid ${G.ink}`}}>DAYS</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: 16, gap: 8}}>
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} style={{height: 84, borderRadius: 12, border: `3px solid ${G.ink}`, background: i < done ? '#E8F7EE' : '#fff', position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 26, color: G.grey, display: 'flex', alignItems: 'flex-start', paddingLeft: 8}}>
              {i + 1}{i < done && <svg width={50} height={50} viewBox="0 0 50 50" style={{position: 'absolute', right: 6, bottom: 4}}><path d="M8 26 L21 38 L42 12" fill="none" stroke={G.green} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
          ))}
        </div>
      </div>
      <Stamp at={1.1} text="30 DAYS" color={G.orange} size={120} left={0} top={740} rot={-7} center />
      <Alex x={-40} y={y} s={s} t={t} /><Daniel x={720} y={y} s={s} t={t} tired={0.9} />
    </AbsoluteFill>
  );
};

/* ---------------- 4a. NIGHT — ALEX (8.1 → 9.6 s) ---------------- */
const Bed: React.FC<{x: number; y: number; w: number; headboard?: boolean}> = ({x, y, w, headboard = true}) => (
  <>
    {headboard && <div style={{position: 'absolute', left: x - 30, top: y - 250, width: 40, height: 330, background: '#8B5E3C', border: `5px solid ${OL}`, borderRadius: 16}} />}
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 92, background: '#fff', border: `6px solid ${OL}`, borderRadius: 22}} />
    <div style={{position: 'absolute', left: x + 20, top: y + 86, width: 34, height: 1150 - (y + 86), background: '#8B5E3C', border: `4px solid ${OL}`}} />
    <div style={{position: 'absolute', left: x + w - 54, top: y + 86, width: 34, height: 1150 - (y + 86), background: '#8B5E3C', border: `4px solid ${OL}`}} />
  </>
);
const Window: React.FC<{t: number; dark?: boolean; dawn?: number}> = ({t, dawn = 0}) => (
  <div style={{position: 'absolute', left: 640, top: 190, width: 330, height: 380, borderRadius: 24, border: `8px solid ${OL}`, background: dawn > 0 ? `linear-gradient(180deg, #FFD08A ${100 - dawn * 80}%, #14234A)` : '#14234A', overflow: 'hidden'}}>
    {dawn < 0.5 && Array.from({length: 9}).map((_, i) => <div key={i} style={{position: 'absolute', left: 20 + random(`wx${i}`) * 280, top: 20 + random(`wy${i}`) * 200, width: 8, height: 8, borderRadius: 4, background: '#fff', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))}} />)}
    <div style={{position: 'absolute', left: 120 + dawn * 90, top: 60 + dawn * 240, opacity: 1 - dawn * 0.9}}><Icon k="moon" size={120} /></div>
    <div style={{position: 'absolute', left: 140, top: 340 - dawn * 250, width: 90, height: 90, borderRadius: 45, background: '#FFB938', border: `5px solid ${OL}`, opacity: dawn}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 6, background: OL}} /><div style={{position: 'absolute', top: 0, bottom: 0, left: '50%', width: 6, background: OL}} />
  </div>
);
const NightA: React.FC = () => {
  const t = useT(); const s = 1.55;
  const clock = interpolate(t, [0.05, 1.35], [23, 31], {...clamp, easing: Easing.inOut(Easing.quad)});
  const dawn = interpolate(t, [0.9, 1.4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Header tag="NIGHT" />
      <Floor y={1150} />
      <Window t={t} dawn={dawn} />
      <Bed x={60} y={930} w={960} />
      <div style={{position: 'absolute', left: 120, top: 868, width: 190, height: 62, background: '#fff', border: `6px solid ${OL}`, borderRadius: 30}} />
      <Person pose={POSES.stand} shirt={G.blue} phones={false} s={s} x={20} y={395} rot={-90} blink={1} mood="smile" />
      <div style={{position: 'absolute', left: 300, top: 870, width: 720, height: 116, background: '#9FC3FF', border: `6px solid ${OL}`, borderRadius: 30}} />
      {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 400 + i * 160, top: 892, width: 60, height: 10, borderRadius: 5, background: '#7BA8F0'}} />)}
      <Zzz x={230} y={800} t={t} />
      <div style={{position: 'absolute', left: 60, top: 230}}><TimerCard text={hhmm(clock)} color={G.blue} w={340} label="ALEX" /></div>
      <Stamp at={0.35} text="8 H" color={G.blue} size={96} left={650} top={640} rot={-6} />
    </AbsoluteFill>
  );
};

/* ---------------- 4b. NIGHT — DANIEL (9.6 → 12.5 s) ---------------- */
const BEDSIT: Pose = {hip: [150, 420], sh: [150, 252], head: [162, 198], handL: [232, 352], handR: [224, 358], footL: [336, 440], footR: [326, 444], legBend: 1, armBend: -1};
const NightD: React.FC = () => {
  const t = useT(); const s = 1.7;
  const alarm = 2.0, ringing = t >= alarm;
  const clock = t < alarm ? interpolate(t, [0, alarm], [23.4, 26.0], clamp) : 31;
  const shake = ringing ? Math.sin(t * 90) * 9 : 0;
  const x0 = 250, y0 = 1010 - 440 * s; // hip sits on mattress top
  const sw = interpolate(t, [0, 0.22], [1, 0], {...clamp, easing: eo});
  const head: [number, number] = ringing ? [BEDSIT.head[0] + 6, BEDSIT.head[1] + 22] : BEDSIT.head;
  const pose: Pose = ringing ? {...BEDSIT, head, sh: [150, 262], handL: [190, 300], handR: [186, 306]} : BEDSIT;
  return (
    <AbsoluteFill style={{transform: `translateX(${sw * 1100}px)`}}>
      <Header tag="NIGHT" color={G.red} />
      <Floor y={1150} />
      <div style={{position: 'absolute', inset: 0, background: ringing ? 'rgba(232,67,46,.10)' : 'rgba(10,20,60,.14)'}} />
      <Window t={t} dawn={ringing ? 1 : 0} />
      <Bed x={60} y={1010} w={960} />
      <div style={{position: 'absolute', left: 90, top: 760, width: 170, height: 250, background: '#fff', border: `6px solid ${OL}`, borderRadius: 40}} />
      {!ringing && <PhoneGlow x={x0 + 232 * s} y={y0 + 300 * s} t={t} />}
      <Person pose={pose} shirt={RED} cap beard s={s} x={x0 - 200} y={y0} phone={!ringing} scroll={t} mood="worry" tired={1} blink={ringing ? 0.6 : blinkAt(t, [0.8, 1.6])} />
      <div style={{position: 'absolute', left: 420, top: 905, width: 600, height: 118, background: '#F2A2A2', border: `6px solid ${OL}`, borderRadius: 30}} />
      <div style={{position: 'absolute', left: 60, top: 230, transform: `translateX(${shake}px)`}}>
        {ringing && [0, 1, 2].map((k) => { const d = (t - alarm - k * 0.18) % 0.54; if (d < 0) return null; const r = 80 + d * 380; return <div key={k} style={{position: 'absolute', left: 170 - r, top: 60 - r, width: r * 2, height: r * 2, borderRadius: r, border: `${8 * (1 - d / 0.54)}px solid ${G.red}`, opacity: 1 - d / 0.54}} />; })}
        <TimerCard text={hhmm(clock)} color={ringing ? G.red : G.ink} w={340} label={ringing ? 'ALARM' : 'DANIEL · SCROLLING'} />
      </div>
      {ringing && <div style={{position: 'absolute', left: 390, top: 210, transform: `rotate(${Math.sin(t * 45) * 16}deg)`}}><Icon k="bell" size={120} /></div>}
      <Stamp at={0.55} text="5 H" color={G.red} size={96} left={650} top={640} rot={6} />
    </AbsoluteFill>
  );
};

/* ---------------- 5. TESTOSTERONE ---------------- */
const Testo: React.FC = () => {
  const t = useT(); const s = 0.8, fl = 1235, y = feetY(fl, s);
  const drain = interpolate(t, [4.3, 5.3], [0, 1], {...clamp, easing: eo});
  const lvl = 0.82; const lA = lvl, lD = lvl - 0.1 * drain;
  const tank = (x: number, level: number, c: string, name: string, show: number) => (
    <div style={{opacity: show, transform: `translateY(${(1 - show) * 40}px)`}}>
      <Tank level={level} x={x} y={265} s={1.35} />
      <div style={{position: 'absolute', left: x - 30, top: 610, width: 330, display: 'flex', justifyContent: 'center'}}><Pill text={name} color={c} size={34} bg="#fff" /></div>
    </div>
  );
  const showT = interpolate(t, [2.2, 2.6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Header tag="HORMONES" color={G.orange} />
      <Floor y={fl - 6} />
      <Pop at={Math.round(0.2 * FPS)} style={{left: 120, top: 190}}><Pill text="1 WEEK · 5 H SLEEP" color={G.red} size={34} bg="#fff" /></Pop>
      <Pop at={Math.round(1.1 * FPS)} style={{left: 640, top: 190}}><Pill text="YOUNG MEN" color={G.ink} size={30} bg="#fff" /></Pop>
      {tank(120, lA, G.blue, '8 H', showT)}
      {tank(640, lD, G.red, '5 H', showT)}
      {t > 2.6 && <Pop at={Math.round(2.7 * FPS)} style={{left: 300, top: 400, width: 480, display: 'flex', justifyContent: 'center'}}><div style={{background: G.ink, color: G.yellow, fontFamily: FONT, fontWeight: 900, fontSize: 34, borderRadius: 14, padding: '6px 20px', letterSpacing: 2}}>TESTOSTERONE</div></Pop>}
      {t > 4.3 && <div style={{position: 'absolute', left: 760, top: 300 + 90 * drain, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: G.red, opacity: 1 - 0.4 * drain}}>▼</div>}
      <Stamp at={4.5} text="−10 to 15%" color={G.red} size={86} left={0} top={690} rot={-5} center />
      <Alex x={20} y={y} s={s} t={t} /><Daniel x={640} y={y} s={s} t={t} tired={1} mood="worry" sweat={drain > 0.3 ? (t * 1.5) % 1 : 0} />
      <SrcLine text="Leproult & Van Cauter · JAMA 2011" top={1262} />
    </AbsoluteFill>
  );
};

/* ---------------- 6. HUNGER HORMONES (dark X-ray interrupt) ---------------- */
const Horm: React.FC = () => {
  const t = useT();
  const up = interpolate(t, [2.9, 3.9], [0, 1], {...clamp, easing: eo});
  const bar = (x: number, label: string, sub: string, color: string, v: number, arrow: string, show: number) => (
    <div style={{position: 'absolute', left: x, top: 330, width: 280, textAlign: 'center', opacity: show}}>
      <Pill text={label} color={color} size={36} bg="#0B1E3F" />
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: '#BFD8FF', marginTop: 12, letterSpacing: 2}}>{sub}</div>
      <div style={{position: 'relative', margin: '24px auto 0', width: 110, height: 560, borderRadius: 55, background: 'rgba(255,255,255,.1)', border: '4px solid rgba(255,255,255,.35)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: color}} />
      </div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color, marginTop: 8, opacity: up > 0.4 ? 1 : 0, transform: `translateY(${up > 0.4 ? 0 : 30}px)`}}>{arrow}</div>
    </div>
  );
  const wob = Math.sin(t * 14) * (t < 2.9 ? 7 : 3);
  return (
    <AbsoluteFill>
      <BG dark />
      <Header tag="HUNGER" color={G.orange} dark />
      <Xray x={360} y={260} s={0.95} glow={0.4} />
      <div style={{position: 'absolute', left: 478, top: 500, width: 130, height: 92, borderRadius: '50% 50% 46% 46%', background: '#FF9A1F', border: `6px solid ${OL}`, opacity: 0.9, transform: `translateX(${wob}px) scale(${1 + 0.06 * Math.sin(t * 10)})`}} />
      <Pop at={Math.round(0.3 * FPS)} style={{left: 360, top: 190, width: 360, display: 'flex', justifyContent: 'center'}}><Pill text="HUNGER HORMONES" color="#7FB6FF" size={30} bg="#0B1E3F" /></Pop>
      {[0, 1, 2].map((i) => t < 2.9 ? <div key={i} style={{position: 'absolute', left: 330 + i * 150 + Math.sin(t * 8 + i) * 12, top: 560 + (i % 2) * 120 + Math.cos(t * 7 + i) * 14, fontFamily: FONT, fontWeight: 900, fontSize: 90, color: G.yellow, opacity: 0.9}}>?</div> : null)}
      {bar(30, 'GHRELIN', '“I’M HUNGRY”', '#FF9A1F', 0.4 + 0.5 * up, '▲', interpolate(t, [2.6, 2.9], [0, 1], clamp))}
      {bar(770, 'LEPTIN', '“I’M FULL”', '#3DA8FF', 0.7 - 0.38 * up, '▼', interpolate(t, [3.2, 3.5], [0, 1], clamp))}
    </AbsoluteFill>
  );
};

/* ---------------- 7. CRAVINGS ---------------- */
const Crave: React.FC = () => {
  const t = useT(); const s = 1.7, fl = 1180;
  const foods: IconKind[] = ['donut', 'pizza', 'cookie', 'fries', 'donut', 'pizza', 'cookie', 'fries'];
  const mouth = interpolate(t, [3.4, 4.0], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Header tag="CRAVINGS" color={G.orange} />
      <Floor y={fl} />
      <Daniel x={540 - 200 * s} y={feetY(fl, s)} s={s} t={t} tired={1} mood={t > 3.2 ? 'smile' : 'worry'} yawn={0} sweat={0} />
      <Stamp at={2.2} text="+24% HUNGER" color={G.orange} size={96} left={0} top={250} rot={-5} center />
      {foods.map((k, i) => {
        const at = 3.0 + i * 0.3; if (t < at) return null;
        const p = interpolate(t, [at, at + 0.9], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
        const sx = i % 2 ? 1000 : 80, sy = 400 + (i % 4) * 130;
        const tx = 540, ty = 640;
        return <div key={i} style={{position: 'absolute', left: sx + (tx - sx) * p - 55, top: sy + (ty - sy) * p - 55 - Math.sin(p * Math.PI) * 120, transform: `rotate(${p * 360 * (i % 2 ? 1 : -1)}deg) scale(${1 - 0.55 * p})`, opacity: p > 0.96 ? 0 : 1}}><Icon k={k} size={110} /></div>;
      })}
      {mouth > 0 && <Pop at={Math.round(3.4 * FPS)} style={{left: 60, top: 1010}}><Pill text="SUGAR · JUNK FOOD" color={G.red} size={38} bg="#fff" /></Pop>}
      <SrcLine text="Spiegel et al. · Ann Intern Med 2004" top={1200} />
    </AbsoluteFill>
  );
};

/* ---------------- 8. GYM REPS (attention reset) ---------------- */
const Reps: React.FC = () => {
  const t = useT(); const fl = 1190, s = 1.4;
  const P = 0.42, t0 = 0.55, lt = Math.max(0, t - t0);
  const failAt = 7 * P;
  const doneA = Math.min(10, Math.floor(lt / P));
  const doneD = Math.min(7, Math.floor(lt / P));
  const wave = (x: number) => tri(x);
  const kA = lt / P >= 10 ? 0 : wave((lt % P) / P);
  const kD = lt < failAt ? wave((lt % P) / P) : interpolate(lt, [failAt, failAt + 0.4, failAt + 1.0], [0, 0.55, 0.45], clamp);
  const failed = lt > failAt + 0.35;
  const poseA = mixPose(POSES.squatUp, POSES.squatDown, kA), poseD = mixPose(POSES.squatUp, POSES.squatDown, kD);
  const dots = (n: number, c: string, x: number) => (
    <div style={{position: 'absolute', left: x, top: 330, width: 460, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap'}}>
      {Array.from({length: 10}).map((_, i) => <div key={i} style={{width: 34, height: 34, borderRadius: 17, border: `4px solid ${i >= 7 && c === G.red ? '#C9C9C5' : c}`, background: i < n ? c : 'transparent'}} />)}
    </div>
  );
  return (
    <AbsoluteFill>
      <Header tag="GYM" color={G.green} />
      <Floor y={fl} />
      <Person pose={poseA} shirt={G.blue} plate={58} glowThigh={kA} thighColor={G.green} s={s} x={-110} y={fl - 585 * s} mood="smile" />
      <Person pose={poseD} shirt={RED} cap beard plate={58} glowThigh={failed ? 1 : kD} thighColor={G.red} s={s} x={420} y={fl - 585 * s} mood={failed ? 'strain' : 'worry'} tired={1} sweat={(t * 1.6) % 1} />
      <Pop at={4} style={{left: 90, top: 250}}><Pill text="ALEX · 8 H" color={G.blue} size={32} bg="#fff" /></Pop>
      <Pop at={8} style={{left: 590, top: 250}}><Pill text="DANIEL · 5 H" color={G.red} size={32} bg="#fff" /></Pop>
      {dots(doneA, G.green, 10)}{dots(doneD, G.red, 570)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'space-between', padding: '0 120px', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: G.ink}}><span>{doneA}</span><span>{doneD}</span></div>
      <Pop at={Math.round(0.3 * FPS)} style={{left: 330, top: 520}}><Pill text="SAME WEIGHT · 20 KG" color={G.ink} size={30} bg="#fff" /></Pop>
      {failed && <Stamp at={t0 + failAt + 0.4} text="FAILED" color={G.red} size={74} left={600} top={590} rot={8} />}
      <SrcLine text="Illustrative" top={1220} />
    </AbsoluteFill>
  );
};

/* ---------------- 9. GROWTH HORMONE (night graph) ---------------- */
const GH: React.FC = () => {
  const t = useT();
  const X0 = 150, Y0 = 940, W = 800, H = 520;
  const gx = (h: number) => X0 + (W * h) / 8, gy = (v: number) => Y0 - H * v;
  const draw = interpolate(t, [0.2, 2.2], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  // stylised sleep-depth (0 awake .. 3 deep) per half hour & GH pulses during deep blocks
  const st = [0, 1, 2, 3, 3, 2, 3, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1];
  const depth = st.map((d, i) => `${gx((i * 8) / (st.length - 1))},${Y0 + 70 + d * 36}`).join(' ');
  const pulse = (h: number, a: number) => a * Math.exp(-Math.pow((h - 0) , 2));
  const gh = Array.from({length: 81}).map((_, i) => { const h = (i * 8) / 80; const v = 0.12 + 0.62 * Math.exp(-Math.pow((h - 1.1) / 0.55, 2)) + 0.42 * Math.exp(-Math.pow((h - 2.9) / 0.5, 2)) + 0.22 * Math.exp(-Math.pow((h - 4.7) / 0.5, 2)) + 0.12 * Math.exp(-Math.pow((h - 6.3) / 0.5, 2)); return [gx(h), gy(v)] as [number, number]; });
  void pulse;
  const shown = gh.filter((_, i) => i / 80 <= draw);
  const cutX = gx(5);
  const alarm = interpolate(t, [2.3, 2.6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Header tag="RECOVERY" color={G.green} />
      <Pop at={Math.round(0.1 * FPS)} style={{left: 140, top: 190}}><Pill text="GROWTH HORMONE" color={G.green} size={38} bg="#fff" /></Pop>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <rect x={gx(0.4)} y={Y0 - H - 10} width={gx(2.0) - gx(0.4)} height={H + 10} fill={G.blue} opacity={0.12} /><rect x={gx(2.4)} y={Y0 - H - 10} width={gx(3.4) - gx(2.4)} height={H + 10} fill={G.blue} opacity={0.12} />
        <line x1={X0} y1={Y0} x2={X0 + W + 20} y2={Y0} stroke={G.ink} strokeWidth={6} strokeLinecap="round" /><line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 40} stroke={G.ink} strokeWidth={6} strokeLinecap="round" />
        {[0, 2, 4, 6, 8].map((h) => <g key={h}><line x1={gx(h)} y1={Y0} x2={gx(h)} y2={Y0 + 14} stroke={G.ink} strokeWidth={5} /><text x={gx(h)} y={Y0 + 54} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={G.ink}>{h}h</text></g>)}
        <text x={X0 - 48} y={Y0 - H / 2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={G.grey} letterSpacing={3} transform={`rotate(-90 ${X0 - 48} ${Y0 - H / 2})`}>GROWTH HORMONE</text>
        <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={G.ink} strokeWidth={16} opacity={0.12} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={G.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={depth} fill="none" stroke="#8AA7D9" strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
        <text x={X0 + 6} y={Y0 + 190} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#6C86B8">sleep depth</text>
        {alarm > 0 && <g opacity={alarm}><rect x={cutX} y={Y0 - H - 10} width={gx(8) - cutX} height={H + 10} fill={G.red} opacity={0.12} /><line x1={cutX} y1={Y0 - H - 20} x2={cutX} y2={Y0} stroke={G.red} strokeWidth={8} strokeDasharray="14 10" /></g>}
      </svg>
      <Pop at={Math.round(0.9 * FPS)} style={{left: gx(0.5), top: Y0 - H - 60}}><Pill text="DEEP SLEEP" color={G.blue} size={26} bg="#fff" /></Pop>
      {alarm > 0 && <div style={{position: 'absolute', left: cutX - 14, top: Y0 - H - 110, transform: `scale(${alarm})`}}><Icon k="bell" size={90} /></div>}
      {t > 2.6 && <Stamp at={2.6} text="5 H = CUT SHORT" color={G.red} size={60} left={0} top={Y0 + 190} rot={-4} center />}
      <SrcLine text="Illustrative sketch · deep sleep drives GH release" top={1300} />
    </AbsoluteFill>
  );
};

/* ---------------- 10. THE SCARIEST PART ---------------- */
const Scary: React.FC = () => {
  const t = useT(); const s = 3.0;
  const sh = t < 0.5 ? Math.sin(t * 80) * (1 - t / 0.5) * 12 : 0;
  return (
    <AbsoluteFill style={{background: '#F7DCDC'}}>
      <BG />
      <AbsoluteFill style={{background: 'rgba(229,56,59,.12)'}} />
      <Header tag="WARNING" color={G.red} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1250, overflow: 'hidden'}}>
        <div style={{transform: `translateX(${sh}px) scale(${1 + 0.04 * t})`, transformOrigin: '540px 480px'}}>
          <Daniel x={540 - 200 * s} y={470 - 140 * s} s={s} t={t} mood="worry" sweat={(t * 1.4) % 1} />
        </div>
      </div>
      <Stamp at={0.05} text="THE SCARIEST PART" color={G.red} size={62} left={0} top={220} rot={-4} center />
      <Pop at={10} style={{left: 760, top: 420}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, color: G.red}}>!?</div></Pop>
    </AbsoluteFill>
  );
};

/* ---------------- 11. DIET STUDY ---------------- */
const Study: React.FC = () => {
  const t = useT(); const s0 = B.study[0];
  const tB = sec[13].start - s0; // second half starts at "but fifty-five percent..."
  const A = t < tB;
  const fl = 1235, s = 0.8;
  const grow = interpolate(t, [tB + 0.1, tB + 0.8], [0, 1], {...clamp, easing: eo});
  const split = interpolate(t, [tB + 0.7, tB + 1.4], [0, 1], clamp);
  const K = 150; // px per kg
  const bar = (x: number, c: string, fat: number, lean: number, label: string) => {
    const hF = fat * K * grow, hL = lean * K * grow;
    return (
      <div style={{position: 'absolute', left: x, top: 330, width: 330}}>
        <div style={{textAlign: 'center', marginBottom: 14}}><Pill text={label} color={c} size={32} bg="#fff" /></div>
        <div style={{position: 'relative', margin: '0 auto', width: 200, height: 4.4 * K, }}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: hF, background: split > 0.5 ? G.yellow : c, border: `5px solid ${OL}`, borderRadius: '18px 18px 0 0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: G.ink}}>{split > 0.8 && hF > 50 ? `FAT ${fat}` : ''}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: hF - 5 * (hF > 0 ? 1 : 0), height: hL, background: split > 0.5 ? '#8E6FD1' : c, border: `5px solid ${OL}`, borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#fff'}}>{split > 0.8 && hL > 50 ? `LEAN ${lean}` : ''}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: hF + hL + 14, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: G.ink}}>−{(fat + lean).toFixed(1)} kg</div>
        </div>
      </div>
    );
  };
  if (A) {
    const eq = interpolate(t, [3.3, 3.6], [0, 1], {...clamp, easing: Easing.out(Easing.back(3))});
    return (
      <AbsoluteFill>
        <Header tag="DIET STUDY" color="#8E6FD1" />
        <Floor y={fl} />
        <Pop at={Math.round(0.15 * FPS)} style={{left: 140, top: 190}}><Pill text="SAME DIET · 14 DAYS" color={G.ink} size={36} bg="#fff" /></Pop>
        <Alex x={-10} y={feetY(fl, s)} s={s} t={t} />
        <Daniel x={560} y={feetY(fl, s)} s={s} t={t} tired={1} mood="worry" />
        <Pop at={Math.round(0.9 * FPS)} style={{left: 90, top: 330}}><Pill text="8.5 H SLEEP" color={G.blue} size={34} bg="#fff" /></Pop>
        <Pop at={Math.round(1.3 * FPS)} style={{left: 640, top: 330}}><Pill text="5.5 H SLEEP" color={G.red} size={34} bg="#fff" /></Pop>
        <Pop at={Math.round(2.0 * FPS)} style={{left: 110, top: 440}}><TimerCard text="−2.9" color={G.blue} w={300} label="KG LOST" /></Pop>
        <Pop at={Math.round(2.5 * FPS)} style={{left: 670, top: 440}}><TimerCard text="−3.0" color={G.red} w={300} label="KG LOST" /></Pop>
        <div style={{position: 'absolute', left: 470, top: 455, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: G.green, transform: `scale(${eq})`, opacity: eq}}>=</div>
        <Stamp at={3.5} text="SAME WEIGHT LOST" color={G.green} size={60} left={0} top={650} rot={-4} center />
        <SrcLine text="Nedeltcheva et al. · Ann Intern Med 2010" top={1262} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Header tag="DIET STUDY" color="#8E6FD1" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center', gap: 12}}><Pill text="WHERE DID THE WEIGHT COME FROM?" color={G.ink} size={32} bg="#fff" /></div>
      {bar(110, G.blue, 1.4, 1.5, '8.5 H')}{bar(640, G.red, 0.6, 2.4, '5.5 H')}
      {split > 0.8 && <Stamp at={tB + 1.4} text="−55% FAT" color={G.red} size={70} left={420} top={1010} rot={-4} />}
      {split > 0.8 && <Stamp at={tB + 2.6} text="MORE MUSCLE LOST" color={'#8E6FD1'} size={50} left={140} top={1120} rot={3} />}
      <SrcLine text="Nedeltcheva et al. · Ann Intern Med 2010" top={1230} />
    </AbsoluteFill>
  );
};

/* ---------------- 12. FACES ---------------- */
const Faces: React.FC = () => {
  const t = useT(); const s = 2.6;
  const zoom = 1 + 0.06 * interpolate(t, [0, 4.3], [0, 1]);
  const panel = (i: 0 | 1) => (
    <div key={i} style={{position: 'absolute', left: i * 540, top: 120, width: 540, height: 1130, overflow: 'hidden', background: i ? '#F3E6E6' : '#E4EDFB', backgroundImage: `linear-gradient(${G.grid} 1px, transparent 1px), linear-gradient(90deg, ${G.grid} 1px, transparent 1px)`, backgroundSize: '60px 60px'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1130, transform: `scale(${zoom})`, transformOrigin: '270px 420px'}}>
        {i === 0 ? <Alex x={270 - 200 * s} y={420 - 140 * s} s={s} t={t} mood="smile" /> : <Daniel x={270 - 200 * s} y={420 - 140 * s} s={s} t={t} mood="worry" />}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Header tag="THE FACE" color={G.red} />
      {panel(0)}{panel(1)}
      <div style={{position: 'absolute', left: 536, top: 120, width: 8, height: 1130, background: G.ink}} />
      <Pop at={4} style={{left: 90, top: 190}}><Pill text="8 H" color={G.blue} size={36} bg="#fff" /></Pop>
      <Pop at={8} style={{left: 640, top: 190}}><Pill text="5 H" color={G.red} size={36} bg="#fff" /></Pop>
      <Callout at={0.35} text="PALER SKIN" x={810} y={800} tx={890} ty={470} />
      <Ring at={1.5} cx={810} cy={525} rx={135} ry={54} />
      <Callout at={1.6} text="DARKER CIRCLES" x={810} y={920} tx={780} ty={555} />
      <Callout at={2.9} text="DROOPY EYELIDS" x={810} y={1040} tx={840} ty={505} />
      <Pop at={Math.round(0.5 * FPS)} style={{left: 160, top: 880}}><Pill text="FRESH ✓" color={G.green} size={40} bg="#fff" /></Pop>
    </AbsoluteFill>
  );
};

/* ---------------- 13. GAINS LEFT ON THE TABLE ---------------- */
const Gains: React.FC = () => {
  const t = useT(); const s = 1.05, fl = 1170;
  const flex = interpolate(t, [0.3, 0.8], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const coins = Array.from({length: 7});
  return (
    <AbsoluteFill>
      <Header tag="THE VERDICT" color={G.orange} />
      <Floor y={fl} />
      <FrontPerson shirt={G.blue} hair="short" mood="smile" s={s} x={-50} y={feetY(fl, s)} bicep={flex} pumpGlow={flex} handL={[118 - 28 * flex, 368 - 190 * flex]} handR={[282 + 28 * flex, 368 - 190 * flex]} blink={blinkAt(t, [1.1, 3.0])} />
      <FrontPerson shirt={RED} cap beard mood="worry" s={s} x={560} y={feetY(fl, s)} bicep={0.25 * flex} handL={[118 - 14 * flex, 368 - 110 * flex]} handR={[282 + 14 * flex, 368 - 110 * flex]} tired={1} blink={blinkAt(t, [0.6, 2.2, 3.4])} />
      {/* table with Daniel's coins left on it */}
      <div style={{position: 'absolute', left: 420, top: 1010, width: 240, height: 22, background: '#8B5E3C', border: `5px solid ${OL}`, borderRadius: 8}} />
      <div style={{position: 'absolute', left: 440, top: 1030, width: 16, height: 140, background: '#8B5E3C', border: `4px solid ${OL}`}} /><div style={{position: 'absolute', left: 624, top: 1030, width: 16, height: 140, background: '#8B5E3C', border: `4px solid ${OL}`}} />
      {coins.map((_, i) => {
        const row = Math.floor(i / 4), col = i % 4;
        const home = {x: 440 + col * 48 - row * 24 + (row ? 24 : 0), y: 960 - row * 44};
        const grab = i >= 3 ? 0 : 1; // first 3 are Alex's: they fly to him
        const p = grab ? interpolate(t, [1.3 + i * 0.25, 2.2 + i * 0.25], [0, 1], {...clamp, easing: Easing.in(Easing.quad)}) : 0;
        const tx = 160, ty = 700;
        return <div key={i} style={{position: 'absolute', left: home.x + (tx - home.x) * p, top: home.y + (ty - home.y) * p - Math.sin(p * Math.PI) * 120, transform: `scale(${1 - 0.5 * p})`, opacity: p > 0.97 ? 0 : 1}}><Icon k="coin" size={62} /></div>;
      })}
      {t > 2.4 && <Pop at={Math.round(2.4 * FPS)} style={{left: 330, top: 330}}><Stamp at={0} text="GAINS LEFT ON THE TABLE" color={G.red} size={46} left={0} top={0} rot={-4} /></Pop>}
      <Pop at={Math.round(1.2 * FPS)} style={{left: 90, top: 250}}><Pill text="GAINS ✓" color={G.green} size={34} bg="#fff" /></Pop>
    </AbsoluteFill>
  );
};

/* ---------------- 14. SLEEP = CHEAPEST SUPPLEMENT ---------------- */
const Supp: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [0.05, 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const tag = interpolate(t, [0.9, 1.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  return (
    <AbsoluteFill>
      <Header tag="THE CHEAPEST SUPPLEMENT" color={G.blue} />
      <Floor y={1150} />
      <div style={{position: 'absolute', left: 300, top: 360 + Math.sin(t * 4) * 8, width: 480, height: 740, transform: `scale(${p}) rotate(${(1 - p) * -14}deg)`}}>
        <svg width={480} height={740} viewBox="0 0 480 740" style={{overflow: 'visible'}}>
          <rect x={90} y={20} width={300} height={110} rx={26} fill={G.ink} stroke={OL} strokeWidth={8} />
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={118 + i * 46} y1={34} x2={118 + i * 46} y2={116} stroke="#3A3F4B" strokeWidth={8} />)}
          <rect x={50} y={118} width={380} height={600} rx={46} fill="#fff" stroke={OL} strokeWidth={8} />
          <rect x={50} y={250} width={380} height={300} fill="#2F7BF2" stroke={OL} strokeWidth={8} />
          <text x={240} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff" letterSpacing={2}>SLEEP</text>
          <text x={240} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#BFD6FF" letterSpacing={8}>7–9 HOURS</text>
          <g transform="translate(190 276) scale(0.5)"><path d="M62 10 A42 42 0 1 0 90 62 A34 34 0 1 1 62 10Z" fill="#FFE9A3" stroke={OL} strokeWidth={6} /></g>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 720, top: 330, width: 230, height: 230, borderRadius: 115, background: G.yellow, border: `8px solid ${OL}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${tag}) rotate(14deg)`, boxShadow: '0 10px 0 rgba(0,0,0,.15)'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 90, color: G.ink, lineHeight: 1}}>$0</div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: G.ink, letterSpacing: 4}}>FREE</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 15. POLL / CTA ---------------- */
const Poll: React.FC = () => {
  const t = useT(); const s = 0.72, fl = 1245, b = Math.abs(Math.sin(t * Math.PI * 1.6));
  const opts: [string, string][] = [['😵', '5 H OR LESS'], ['🥱', '6 H'], ['🙂', '7 H'], ['😴', '8 H +']];
  return (
    <AbsoluteFill>
      <Header tag="YOUR TURN" color={G.orange} />
      <Floor y={fl} />
      <Alex x={-10} y={feetY(fl, s) - b * 40} s={s} t={t} />
      <Daniel x={800} y={feetY(fl, s) - (1 - b) * 40} s={s} t={t} tired={0.8} mood="smile" />
      <Pop at={4} style={{left: 160, top: 200, width: 760}}>
        <div style={{background: '#fff', border: `6px solid ${G.ink}`, borderRadius: 30, padding: '26px 30px 30px', boxShadow: '0 12px 0 rgba(0,0,0,.14)'}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 48, lineHeight: 1.05, textAlign: 'center', color: G.ink}}>HOW MANY HOURS<br />DO YOU SLEEP?</div>
          {opts.map(([e, o], i) => { const p = interpolate(t, [0.3 + i * 0.18, 0.6 + i * 0.18], [0, 1], {...clamp, easing: Easing.out(Easing.back(2)) }); return <div key={i} style={{marginTop: 12, padding: '10px 24px', borderRadius: 22, border: `5px solid ${[G.red, G.orange, G.yellow, G.blue][i]}`, fontFamily: FONT, fontWeight: 900, fontSize: 38, color: G.ink, transform: `translateX(${(1 - p) * -90}px)`, opacity: p}}>{e} {o}</div>; })}
          <div style={{textAlign: 'center', marginTop: 22}}><Pill text="COMMENT BELOW ↓" color={G.green} size={36} bg="#fff" /></div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

/* ---------------- captions (same bars as the reference) ---------------- */
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
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top: 1340, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', borderRadius: 16, padding: '10px 28px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: -1, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,.18)'}}>
        {c.words.map((x, i) => <span key={i} style={{color: s >= x.a - 0.02 ? '#fff' : '#7d7d7d', marginRight: i < c.words.length - 1 ? 16 : 0}}>{x.w}</span>)}
      </div>
    </div>
  );
};

const SC: React.FC<{k: BK; children: React.ReactNode; hits?: number[]}> = ({k, children, hits = [0]}) => {
  const from = Math.round(B[k][0] * FPS), len = Math.round(B[k][1] * FPS) - from;
  return <Sequence from={from} durationInFrames={len}><AbsoluteFill><Impact at={hits}>{children}</Impact></AbsoluteFill></Sequence>;
};
export const SleepToon: React.FC = () => (
  <AbsoluteFill style={{background: G.bg}}>
    <BG />
    <SC k="hook" hits={[0.02]}><Hook /></SC>
    <SC k="same"><Same /></SC>
    <SC k="thirty" hits={[1.1]}><Thirty /></SC>
    <SC k="nightA"><NightA /></SC>
    <SC k="nightD" hits={[2.0]}><NightD /></SC>
    <SC k="testo" hits={[0, 4.5]}><Testo /></SC>
    <SC k="horm"><Horm /></SC>
    <SC k="crave" hits={[0, 2.2]}><Crave /></SC>
    <SC k="reps"><Reps /></SC>
    <SC k="gh" hits={[2.6]}><GH /></SC>
    <SC k="scary" hits={[0.05]}><Scary /></SC>
    <SC k="study" hits={[3.5]}><Study /></SC>
    <SC k="face"><Faces /></SC>
    <SC k="gains" hits={[2.4]}><Gains /></SC>
    <SC k="supp" hits={[0.9]}><Supp /></SC>
    <SC k="poll"><Poll /></SC>
    <SubsBar />
    <Audio src={staticFile('audio/sleep_voice.wav')} />
    <Audio src={staticFile('audio/gym_music.wav')} loop volume={(f) => 0.22 * interpolate(f, [0, 10, SLEEPTOON_TOTAL - 40, SLEEPTOON_TOTAL], [0, 1, 1, 0], clamp)} />
    <Audio src={staticFile('audio/sleeptoon_sfx.wav')} volume={0.5} />
  </AbsoluteFill>
);
export const SLEEPTOON_BOUNDS = B;
