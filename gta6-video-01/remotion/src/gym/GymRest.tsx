import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame, Easing} from 'remotion';
import {OL, BG, FONT, G, Floor, FrontPerson, Person, POSES, Pill, Pop, Source, Tank, TimerCard, Xray, mixPose} from './kit';
import {PlateG, Rack, FuelCell, Skeleton, PhoneGlow} from './props';
import {Pose} from './kit';
import {GYM_TOTAL, SEC, SecKey, secFrom, secLen} from './timeline';
import {Subs} from './Subs';
import {FPS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const tri = (x: number) => 0.5 - 0.5 * Math.cos(x * Math.PI * 2);

/** Punch-zoom + shake + white flash on the given local seconds. */
const Impact: React.FC<{at: number[]; children: React.ReactNode}> = ({at, children}) => {
  const t = useT();
  let k = 0, sh = 0, fl = 0;
  for (const a of at) { const d = t - a; if (d >= 0 && d < 0.7) { k += 0.07 * Math.exp(-d * 8); if (d < 0.3) sh += (1 - d / 0.3) * 16; if (d < 0.16) fl = Math.max(fl, 0.5 * (1 - d / 0.16)); } }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${Math.sin(t * 97) * sh}px,${Math.cos(t * 83) * sh}px) scale(${1 + k})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: fl}} />
    </AbsoluteFill>
  );
};
/** Big stamped text that slams in from 2.4x. */
const Slam: React.FC<{at: number; text: string; color: string; size?: number; rot?: number; left: number; top: number; bg?: string; out?: number}> = ({at, text, color, size = 120, rot = -8, left, top, bg = '#fff', out}) => {
  const t = useT();
  if (t < at || (out !== undefined && t > out)) return null;
  const p = interpolate(t, [at, at + 0.14], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return <div style={{position: 'absolute', left, top, transform: `rotate(${rot}deg) scale(${2.4 - 1.4 * p})`, opacity: Math.min(1, p * 2), transformOrigin: 'center', border: `${size * 0.09}px solid ${color}`, color, background: bg, borderRadius: size * 0.18, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, padding: `${size * 0.1}px ${size * 0.28}px`, whiteSpace: 'nowrap', letterSpacing: 2, boxShadow: '0 12px 0 rgba(0,0,0,.15)'}}>{text}</div>;
};
const Header: React.FC<{dark?: boolean; tag?: string}> = ({dark, tag = 'REST'}) => (
  <>
    <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: 3, color: dark ? '#7FB6FF' : '#6a6a66'}}>GYM FACTS</div>
    <div style={{position: 'absolute', right: 150, top: 62}}><Pill text={tag} color={G.orange} size={22} bg={dark ? '#0B1E3F' : G.bg} /></div>
  </>
);
const Seat: React.FC<{x: number; y: number; w: number; floor: number}> = ({x, y, w, floor}) => (
  <>
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 44, borderRadius: 18, background: '#3A3F4B'}} />
    <div style={{position: 'absolute', left: x + 30, top: y + 40, width: 28, height: floor - y - 40, background: '#2A2E38'}} /><div style={{position: 'absolute', left: x + w - 58, top: y + 40, width: 28, height: floor - y - 40, background: '#2A2E38'}} />
  </>
);
/** Person sitting on a bench; floor line at y=1150. */
const SitScene: React.FC<{shirt: string; cap?: boolean; beard?: boolean; phone?: boolean; x?: number; opacity?: number; mood?: 'smile' | 'flat' | 'worry'}> = ({shirt, cap, beard, phone, x = 0, opacity = 1, mood}) => {
  const s = 2.0, y0 = 1150 - 462 * s, x0 = 140 + x;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <Seat x={x0 + 70 * s} y={y0 + 372 * s} w={190 * s} floor={1150} />
      <Person pose={POSES.sit} shirt={shirt} cap={cap} beard={beard} phone={phone} x={x0} y={y0} s={s} mood={mood} />
    </div>
  );
};

/* ---------------- 1. buddy vs you ---------------- */
const SIDE: Pose = {hip: [200, 365], sh: [206, 215], head: [214, 160], handL: [228, 342], handR: [212, 350], footL: [214, 565], footR: [188, 565], legBend: 1, armBend: -1};
const READY: Pose = {...SIDE, handL: [302, 210], handR: [292, 218]};
const walkPose = (ph: number): Pose => ({...SIDE, footL: [200 + 34 * Math.sin(ph), 565 - Math.max(0, 22 * Math.cos(ph))], footR: [200 - 34 * Math.sin(ph), 565 - Math.max(0, -22 * Math.cos(ph))], handL: [218 - 30 * Math.sin(ph), 342], handR: [210 + 30 * Math.sin(ph), 346]});
const S1 = 1.8, FLOOR = 1150;
const BenchB: React.FC<{x: number}> = ({x}) => <Seat x={x} y={FLOOR - 165} w={360} floor={FLOOR} />;
/** Timer card with a per-second bump; `hot` turns it red with expanding pulse rings. */
const LiveTimer: React.FC<{secs: number; color: string; hot?: number; scribble?: number; x: number; y: number}> = ({secs, color, hot = -1, scribble = -1, x, y}) => {
  const t = useT();
  const bump = 1 + 0.06 * (1 - (secs % 1)) + (hot >= 0 && t >= hot ? 0.3 * Math.exp(-(t - hot) * 7) : 0);
  const sh = hot >= 0 && t >= hot && t < hot + 0.35 ? Math.sin(t * 120) * 10 : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 320, height: 130}}>
      {hot >= 0 && t >= hot && [0, 1, 2].map((k) => { const d = t - hot - k * 0.16; if (d < 0 || d > 0.8) return null; const r = 90 + d * 420; return <div key={k} style={{position: 'absolute', left: 160 - r, top: 65 - r, width: r * 2, height: r * 2, borderRadius: r, border: `${8 * (1 - d / 0.8)}px solid ${G.red}`, opacity: 1 - d / 0.8}} />; })}
      {scribble >= 0 && t >= scribble && <svg width={480} height={300} viewBox="0 0 480 300" style={{position: 'absolute', left: -80, top: -85, overflow: 'visible'}}>{[[60, 60, 20, 20], [110, 40, 96, 4], [240, 30, 240, -8], [380, 50, 420, 14], [410, 230, 456, 262], [70, 230, 26, 266]].map(([a, b, c, d], i) => { const p = Math.min(1, Math.max(0, (t - scribble - i * 0.03) / 0.18)); return <line key={i} x1={a} y1={b} x2={a + (c - a) * p} y2={b + (d - b) * p} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={t - scribble > 1.2 ? 0 : 1} />; })}</svg>}
      <div style={{transform: `translateX(${sh}px) scale(${bump})`, transformOrigin: 'center'}}><TimerCard text={mmss(Math.min(secs, 180))} color={color} w={320} /></div>
    </div>
  );
};
const Buddy: React.FC = () => {
  const t = useT();
  const sw = interpolate(t, [2.8, 3.25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  // --- buddy: timer races to 1:00, he jumps up and walks to the plate post
  const secs = interpolate(t, [0.1, 1.5], [0, 60], {...clamp, easing: Easing.in(Easing.quad)});
  const rise = interpolate(t, [1.55, 1.8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hop = t > 1.62 && t < 1.98 ? Math.sin(((t - 1.62) / 0.36) * Math.PI) * 95 : 0;
  const walk = interpolate(t, [1.95, 2.6], [0, 1], clamp);
  const sitPose = POSES.sit;
  let pose: Pose = mixPose(sitPose, SIDE, rise);
  if (walk > 0 && walk < 1) pose = walkPose(walk * Math.PI * 4);
  if (walk >= 1) pose = mixPose(SIDE, READY, interpolate(t, [2.6, 2.75], [0, 1], clamp));
  const x0 = interpolate(rise, [0, 1], [40, -68]) + walk * 295;
  const y0 = interpolate(rise, [0, 1], [FLOOR - 462 * S1, FLOOR - 585 * S1]) - hop;
  // --- you: blue guy relaxed on his phone, plate post waiting
  const ty = t;
  return (
    <AbsoluteFill>
      <Floor y={FLOOR} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${-sw * 1100}px)`}}>
        <BenchB x={140} />
        <Rack x={880} floor={FLOOR} top={380} plateY={505} />
        <Person pose={pose} shirt={G.orange} cap beard s={S1} x={x0} y={y0} mood={rise > 0.5 ? 'smile' : 'flat'} />
        <LiveTimer secs={secs} color={t >= 1.5 ? G.red : G.ink} hot={1.5} x={380} y={170} />
        <Pop at={8} style={{left: 60, top: 300}}><Pill text="Your buddy" color={G.orange} size={30} /></Pop>
        {t > 1.6 && <Slam at={1.6} text="GO!" color={G.orange} size={80} left={120} top={600} rot={-8} out={2.8} />}
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${(1 - sw) * 1100}px)`}}>
        <BenchB x={140} />
        <Rack x={880} floor={FLOOR} top={380} plateY={505} bob={Math.sin(ty * 3) * 4} />
        <Pop at={Math.round(3.4 * FPS)} style={{left: 760, top: 300}}><div style={{background: '#fff', border: `4px solid ${G.ink}`, borderRadius: 22, padding: '4px 18px', fontFamily: FONT, fontWeight: 900, fontSize: 40}}>{'.'.repeat(1 + (Math.floor(ty * 3) % 3))}</div></Pop>
        {t > 2.9 && <PhoneGlow x={40 + 222 * S1} y={FLOOR - 462 * S1 + 210 * S1} t={t} />}
        <Person pose={POSES.sit} shirt={G.blue} phone mood="smile" s={S1} x={40} y={FLOOR - 462 * S1} />
        {t > 3.55 && <LiveTimer secs={180} color={G.blue} scribble={3.55} x={380} y={170} />}
        {t > 2.95 && <div style={{position: 'absolute', left: 90, top: 360}}><Pill text="You" color={G.blue} size={30} /></div>}
        {t > 4.25 && <Pop at={Math.round(4.25 * FPS)} style={{left: 230, top: 360}}><Pill text="Resting" color={G.blue} size={30} bg="#E8F0FF" /></Pop>}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 2. eight weeks: leg-press lanes ---------------- */
const LegLane: React.FC<{y: number; shirt: string; e: number; v: number; reps: number; sweat: number; glow: number; cap?: boolean; beard?: boolean; label: string; color: string; show: number}> = ({y, shirt, e, v, reps, sweat, glow, cap, beard, label, color, show}) => {
  const d: [number, number] = [0.707, -0.707], n: [number, number] = [0.707, 0.707];
  const hip: [number, number] = [205, 425], sh: [number, number] = [86, 345];
  const L = 128 + 78 * e;
  const F: [number, number] = [hip[0] + d[0] * L, hip[1] + d[1] * L];
  const at = (k: number, m: number): [number, number] => [F[0] + d[0] * k + n[0] * m, F[1] + d[1] * k + n[1] * m];
  const pose = {hip, sh, head: [50, 312] as [number, number], handL: [214, 468] as [number, number], handR: [204, 474] as [number, number], footL: F, footR: [F[0] - 8, F[1] + 8] as [number, number], legBend: 1 as const, armBend: -1 as const};
  const tube = (x1: number, y1: number, x2: number, y2: number, w = 20, c = '#4C5260') => <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OL} strokeWidth={w + 7} strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" /></g>;
  const p1 = at(16, 70), p2 = at(16, -80), s1 = at(18, 10), s2 = at(140, 10), pl1 = at(78, 18), pl2 = at(108, -14);
  return (
    <div style={{position: 'absolute', left: 90, top: y, transform: 'scale(1.15)', transformOrigin: '0 0', opacity: show}}>
      <svg width={720} height={560} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* frame */}
        {tube(30, 540, 680, 540, 20)}{tube(620, 540, 620, 120, 22)}{tube(260, 540, 260, 478, 20)}{tube(120, 540, 120, 440, 20)}{tube(430, 540, 520, 300, 16)}
        {/* twin rails */}
        {tube(250, 470, 610, 110, 14, '#9AA0AA')}{tube(272, 492, 632, 132, 14, '#9AA0AA')}
        {/* seat */}
        {tube(40, 335, 200, 450, 48, '#2B2F3A')}{tube(200, 452, 276, 462, 42, '#2B2F3A')}
        {/* carriage: platform + sled + plate horns */}
        {tube(s1[0], s1[1], s2[0], s2[1], 30, '#3A3F4B')}
        <PlateG cx={pl2[0]} cy={pl2[1]} r={62} label="25" /><PlateG cx={pl1[0]} cy={pl1[1]} r={62} label="25" />
        {tube(p1[0], p1[1], p2[0], p2[1], 18, '#5A606D')}
        {[0, 1, 2].map((i) => { const a = at(160 + i * 10, 60 - i * 50), b = at(205 + i * 10, 60 - i * 50); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={G.ink} strokeWidth={6} strokeLinecap="round" opacity={Math.min(1, Math.abs(v) * 0.8)} />; })}
      </svg>
      <Person pose={pose} shirt={shirt} cap={cap} beard={beard} s={1} glowThigh={glow} sweat={sweat} mood={e > 0.55 ? 'strain' : 'flat'} />
      <div style={{position: 'absolute', left: 10, top: 150}}><Pill text={label} color={color} size={28} bg="#fff" /></div>
      <div style={{position: 'absolute', left: 640, top: 300, fontFamily: FONT, fontWeight: 900, fontSize: 26, color: G.grey, letterSpacing: 2, textAlign: 'center'}}>REPS<div style={{fontSize: 60, color, lineHeight: 1}}>{reps}</div></div>
    </div>
  );
};
const Weeks: React.FC = () => {
  const t = useT();
  const week = Math.max(1, Math.min(8, Math.floor(interpolate(t, [0, 2.3], [1, 8.99], clamp))));
  const P = 0.5; const e = (off: number) => tri(((t + off) % P) / P); const v = (off: number) => Math.sin((((t + off) % P) / P) * Math.PI * 2) * Math.PI; const reps = (off: number) => Math.floor((t + off) / P) + 1;
  const glowB = interpolate(t, [1.9, 3.3], [0, 1], clamp), glowO = interpolate(t, [1.9, 3.3], [0, 0.38], clamp);
  const lazy = interpolate(t, [4.1, 4.4], [0, 1], clamp);
  const lanes = 1 - lazy;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: lanes}}><div style={{display: 'inline-block', background: G.ink, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '8px 30px', borderRadius: 999, letterSpacing: 2}}>WEEK {week} OF 8</div></div>
      <LegLane y={190} shirt={G.blue} e={e(0)} v={v(0)} reps={reps(0)} sweat={(t * 1.6) % 1} glow={glowB} label="3 MIN REST" color={G.blue} show={lanes} cap={false} />
      <LegLane y={690} shirt={G.orange} e={e(0.22)} v={v(0.22)} reps={reps(0.22) + 4} sweat={(t * 1.6 + 0.5) % 1} glow={glowO} label="1 MIN REST" color={G.orange} show={lanes} cap beard />
      <div style={{position: 'absolute', left: 60, top: 1290, opacity: lanes}}><Source /></div>
      {lazy > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: lazy}}>
          <Floor y={1210} />
          <FrontPerson shirt={G.blue} s={1.75} x={190} y={1210 - 575 * 1.75} mood="worry" sweat={(t * 1.4) % 1} />
          <Slam at={4.3} text="LAZY?" color={G.red} size={140} left={250} top={150} />
          <svg width={200} height={200} style={{position: 'absolute', left: 700, top: 300}} viewBox="0 0 200 200"><path d="M20 20 Q150 30 150 170" stroke={G.red} strokeWidth={14} fill="none" strokeLinecap="round" opacity={t > 4.45 ? 1 : 0} /><path d="M120 150 L150 185 L178 148" stroke={G.red} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={t > 4.45 ? 1 : 0} /></svg>
          
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 3. inside: fast fuel ---------------- */
const Inside: React.FC = () => {
  const t = useT();
  const dark = t < 8.7;
  const level = t < 4.6 ? 0.08 : t < 6.6 ? interpolate(t, [4.6, 5.6], [0.08, 0.5], clamp) : t < 8.6 ? interpolate(t, [6.6, 7.6], [0.5, 0.92], clamp) : interpolate(t, [8.9, 11.6], [0.46, 0.2], clamp);
  const timer = t < 6.7 ? (t > 4.9 ? '1:00' : null) : t < 8.7 ? '3:00' : null;
  const reps = Math.max(0, Math.min(4, Math.floor((t - 9.6) / 0.62) + 1));
  const ph = t > 9.6 ? Math.min(((t - 9.6) % 0.62) / 0.62, 1) : 0;
  const stuck = reps >= 4 && t > 9.6 + 0.62 * 3 + 0.4;
  const sq = stuck ? 0.9 : tri(ph);
  const squatPose = mixPose(POSES.squatUp, POSES.squatDown, sq);
  return (
    <AbsoluteFill>
      <BG dark={dark} />
      <Header dark={dark} tag="FUEL" />
      {dark ? (
        <>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${interpolate(t, [0.3, 2.2], [1, 2.05], {...clamp, easing: Easing.inOut(Easing.cubic)})})`, transformOrigin: '540px 980px'}}>
            <Skeleton left={210} top={190} s={1.1} sweep={t > 2.0 && t < 4.6 ? ((t - 2.0) % 1.3) / 1.3 : 0} pulse={0.5 + 0.5 * Math.sin(t * 5)} />
          </div>
          <Pop at={Math.round(1.9 * FPS)} style={{left: 395, top: 520}}><Pill text="Fast fuel" color={G.yellow} size={38} bg="#0B1E3F" /></Pop>
          <Pop at={Math.round(1.9 * FPS)} style={{left: 435, top: 610}}><FuelCell level={level} t={t} left={0} top={0} w={210} h={420} glow={level} /></Pop>
          {t > 4.5 && <LiveTimer secs={t < 6.6 ? interpolate(t, [4.6, 5.6], [0, 60], clamp) : interpolate(t, [6.6, 7.6], [60, 180], clamp)} color={t < 6.6 ? G.orange : t > 7.6 ? G.green : G.ink} x={380} y={190} />}
          {t > 5.65 && t < 6.6 && <Slam at={5.7} text="HALF" color={G.yellow} size={70} left={720} top={760} rot={6} bg="#0B1E3F" />}
          {t > 7.75 && <Slam at={7.8} text="ALMOST FULL" color={G.green} size={64} left={290} top={1110} rot={-5} bg="#0B1E3F" />}
        </>
      ) : (
        <>
          <Floor y={1130} />
          <div style={{position: 'absolute', left: 30, top: 1130 - 565 * 1.9}}>
            <svg width={400 * 1.9} height={600 * 1.9} viewBox="0 0 400 600" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <PlateG cx={squatPose.sh[0] - 24} cy={squatPose.sh[1] - 6} r={70} />
            </svg>
            <Person pose={squatPose} shirt={G.blue} s={1.9} mood={stuck ? 'worry' : 'strain'} sweat={(t * 1.8) % 1} />
          </div>
          <Tank level={level} x={640} y={640} s={2.0} />
          <div style={{position: 'absolute', left: 60, top: 220, width: 960, textAlign: 'center'}}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: 3, color: G.grey, marginBottom: 14}}>REPS</div>
            <div style={{display: 'flex', gap: 14, justifyContent: 'center'}}>{Array.from({length: 10}).map((_, i) => <div key={i} style={{width: 54, height: 54, borderRadius: 27, border: `5px solid ${G.ink}`, background: i < reps ? G.green : 'transparent'}} />)}</div>
          </div>
          <Pop at={Math.round(9.0 * FPS)} style={{left: 700, top: 560}}><Pill text="Half-empty" color={G.red} size={28} bg="#fff" /></Pop>
          {level < 0.3 && Math.floor(t * 6) % 2 === 0 && <div style={{position: 'absolute', left: 650, top: 650, width: 400, height: 520, border: `8px solid ${G.red}`, borderRadius: 30}} />}
          <Slam at={11.85} text="FAIL" color={G.red} size={120} left={300} top={1150} rot={-8} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 4. the study ---------------- */
const Study: React.FC = () => {
  const t = useT();
  const people = Array.from({length: 21}, (_, i) => i);
  const split = t >= 5.95;
  return (
    <AbsoluteFill>
      <Header />
      <Pop at={4} style={{left: 60, top: 160}}><div style={{background: '#fff', border: `4px solid ${G.ink}`, borderRadius: 16, padding: '8px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 52, lineHeight: 1}}>{Math.min(21, Math.round(interpolate(t, [0.1, 2.3], [0, 21], clamp)))}<div style={{fontSize: 16, letterSpacing: 2, color: G.grey}}>PEOPLE</div></div></Pop>
      <div style={{position: 'absolute', left: 230, top: 180}}><Source /></div>
      {people.map((i) => {
        const col = Math.floor(i / 3), row = i % 3;
        const at = Math.round((0.15 + i * 0.1) * FPS);
        const grp = i < 11 ? 'o' : 'b';
        const shirt = !split ? '#9AA3B2' : grp === 'o' ? G.orange : G.blue;
        return <Pop key={i} at={at} style={{left: 40 + col * 138, top: 360 + row * 235}}><div style={{position: 'relative', width: 160, height: 240}}><FrontPerson shirt={shirt} s={0.4} cap={split && grp === 'o'} barbell crouch={t > 1.0 ? tri(((t - 1.0) * 1.25 + i * 0.045) % 1) * 0.9 : 0} /></div></Pop>;
      })}
      {t > 2.75 && <Pop at={Math.round(2.8 * FPS)} style={{left: 60, top: 1090}}><Pill text="Same exercises" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 3.4 && <Pop at={Math.round(3.5 * FPS)} style={{left: 400, top: 1090}}><Pill text="Same sets" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 4.8 && <Pop at={Math.round(4.85 * FPS)} style={{left: 650, top: 1090}}><Pill text="3 days / week" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 5.95 && <Pop at={Math.round(6.0 * FPS)} style={{left: 130, top: 250}}><TimerCard text="1:00" color={G.orange} w={220} /></Pop>}
      {t > 8.0 && <Pop at={Math.round(8.05 * FPS)} style={{left: 700, top: 250}}><TimerCard text="3:00" color={G.blue} w={220} /></Pop>}
      <Slam at={8.05} text="VS" color={G.ink} size={80} left={455} top={262} rot={0} />
      {t > 8.75 && <Pop at={Math.round(8.8 * FPS)} style={{left: 300, top: 1190}}><div style={{background: G.ink, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '8px 30px', borderRadius: 999, letterSpacing: 2}}>WEEK 1 OF 8</div></Pop>}
    </AbsoluteFill>
  );
};

/* ---------------- 5. results + pump ---------------- */
const Squatter: React.FC<{x: number; shirt: string; glow: number; ph: number; cap?: boolean; beard?: boolean}> = ({x, shirt, glow, ph, cap, beard}) => {
  const p = mixPose(POSES.squatUp, POSES.squatDown, tri(ph)); const s = 1.5;
  return (
    <div style={{position: 'absolute', left: x, top: 1160 - 565 * s}}>
      <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><PlateG cx={p.sh[0] - 24} cy={p.sh[1] - 6} r={70} /></svg>
      <Person pose={p} shirt={shirt} s={s} glowThigh={glow} cap={cap} beard={beard} mood="strain" sweat={(ph * 2) % 1} />
    </div>
  );
};
const Results: React.FC = () => {
  const t = useT();
  const pump = t >= 4.0;
  const glowB = interpolate(t, [0.5, 1.8], [0, 1], clamp), glowO = interpolate(t, [0.5, 1.8], [0, 0.3], clamp);
  const bars = t >= 2.35 && t < 4.0;
  const hb = interpolate(t, [2.4, 3.2], [0, 1], clamp);
  const gl = interpolate(t, [4.1, 4.8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Header />
      {!pump && !bars && (
        <>
          <Floor y={1160} />
          <Squatter x={-30} shirt={G.blue} glow={glowB} ph={(t % 0.75) / 0.75} />
          <Squatter x={500} shirt={G.orange} glow={glowO} ph={((t + 0.3) % 0.75) / 0.75} cap beard />
          <Pop at={6} style={{left: 330, top: 230}}><Pill text="Thigh muscle" color={G.green} size={40} bg="#fff" /></Pop>
          {t > 1.0 && <div style={{position: 'absolute', left: 380, top: 640 - 120 * interpolate(t, [1.0, 2.0], [0, 1], clamp), opacity: interpolate(t, [1.0, 1.2], [0, 1], clamp)}}><svg width={120} height={200} viewBox="0 0 120 200"><path d="M60 190 L60 40" stroke={G.green} strokeWidth={26} strokeLinecap="round" /><path d="M14 76 L60 20 L106 76" stroke={G.green} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: G.green, marginTop: -6}}>MORE</div></div>}
          <Pop at={20} style={{left: 150, top: 1200}}><Pill text="3 min" color={G.blue} size={30} /></Pop>
          <Pop at={24} style={{left: 660, top: 1200}}><Pill text="1 min" color={G.orange} size={30} /></Pop>
          <div style={{position: 'absolute', left: 60, top: 1255}}><Source /></div>
        </>
      )}
      {bars && (
        <>
          <Floor y={1100} />
          <Pop at={Math.round(2.4 * FPS)} style={{left: 270, top: 230}}><Pill text="Squat strength" color={G.ink} size={40} bg="#fff" /></Pop>
          <div style={{position: 'absolute', left: 230, top: 1100 - 700 * hb, width: 220, height: 700 * hb, background: G.blue, borderRadius: '18px 18px 0 0'}} />
          <div style={{position: 'absolute', left: 580, top: 1100 - 450 * hb, width: 220, height: 450 * hb, background: G.orange, borderRadius: '18px 18px 0 0'}} />
          <div style={{position: 'absolute', left: 260, top: 1130}}><Pill text="3 min" color={G.blue} size={30} /></div><div style={{position: 'absolute', left: 610, top: 1130}}><Pill text="1 min" color={G.orange} size={30} /></div>
        </>
      )}
      {pump && (
        <>
          <div style={{position: 'absolute', left: 190, top: 520, width: 700, height: 700, borderRadius: 350, background: 'radial-gradient(circle, rgba(255,201,60,.65), rgba(255,201,60,0) 68%)', opacity: gl}} />
          <Slam at={6.9} text="PUMP ≠ GROWTH" color={G.red} size={78} left={110} top={1205} rot={-4} />
          <Floor y={1200} />
          <FrontPerson shirt={G.orange} cap beard mood="strain" sweat={(t * 1.5) % 1} s={1.7} x={200} y={1200 - 575 * 1.7} handL={[78, 126]} handR={[322, 126]} />
          <Pop at={Math.round(4.15 * FPS)} style={{left: 410, top: 230}}><Pill text="Pump" color={G.red} size={48} bg="#fff" /></Pop>
          {t > 5.8 && <Pop at={Math.round(5.85 * FPS)} style={{left: 330, top: 320}}><Pill text="Feels bigger" color={G.orange} size={34} bg="#fff" /></Pop>}
          {t > 6.85 && (
            <Pop at={Math.round(99 * FPS)} style={{left: 360, top: 1225}}>
              <div style={{position: 'relative'}}><Pill text="Growth" color={G.green} size={44} bg="#fff" /><div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 10, background: G.red, transform: 'rotate(-6deg)'}} /></div>
            </Pop>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 6. pooling the studies ---------------- */
const Pooling: React.FC = () => {
  const t = useT();
  const papers = t < 1.35;
  const time = t < 3.6 ? interpolate(t, [1.4, 2.6], [30, 45], clamp) : interpolate(t, [3.65, 4.6], [45, 90], clamp);
  const same = t >= 3.6;
  const glow = same ? interpolate(t, [3.7, 4.6], [0.45, 1], clamp) : 0.35;
  return (
    <AbsoluteFill>
      <Header />
      {papers ? (
        <>
          {[0, 1, 2, 3].map((i) => <Pop key={i} at={4 + i * 6} style={{left: 190 + i * 170 - (i % 2) * 40, top: 480 + (i % 2) * 120}}><div style={{width: 260, height: 340, background: '#fff', border: `4px solid ${G.ink}`, borderRadius: 14, transform: `rotate(${(i - 1.5) * 6}deg)`, padding: 22, boxShadow: '0 8px 0 rgba(0,0,0,.12)'}}>{[0, 1, 2, 3, 4, 5].map((k) => <div key={k} style={{height: 12, background: k === 0 ? G.ink : '#D5D5D1', margin: '16px 0', width: k === 0 ? '60%' : '100%', borderRadius: 6}} />)}</div></Pop>)}
        </>
      ) : (
        <>
          <Floor y={1210} />
          <FrontPerson shirt={same ? G.blue : G.orange} s={1.9} x={160} y={1210 - 575 * 1.9} glow={glow} mood={same ? 'smile' : 'worry'} cap={!same} beard={!same} />
          <div style={{position: 'absolute', left: 400, top: 150}}><TimerCard text={mmss(time)} color={same ? G.green : G.red} w={280} /></div>
          {!same && t > 2.2 && <Pop at={Math.round(2.25 * FPS)} style={{left: 360, top: 1230}}><Pill text="A bit worse" color={G.red} size={38} bg="#fff" /></Pop>}
          {same && t > 4.6 && <Pop at={Math.round(4.65 * FPS)} style={{left: 280, top: 1230}}><Pill text="Basically the same" color={G.green} size={36} bg="#fff" /></Pop>}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 7. the guy on his phone ---------------- */
const Phone: React.FC = () => {
  const t = useT();
  const level = interpolate(t, [2.9, 4.6], [0.5, 1], clamp);
  const stamp = interpolate(t, [1.7, 1.9], [0, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  return (
    <AbsoluteFill>
      <Header />
      <Floor y={1150} />
      <PhoneGlow x={30 + 222 * 2} y={1150 - 462 * 2 + 210 * 2} t={t} />
      <SitScene shirt={G.blue} phone mood="smile" x={-110} />
      <Tank level={level} x={660} y={1150 - 250 * 1.9} s={1.9} />
      {stamp > 0 && <div style={{position: 'absolute', left: 200, top: 250, transform: `rotate(-10deg) scale(${0.4 + 0.6 * stamp})`, opacity: stamp, border: `10px solid ${G.green}`, color: G.green, borderRadius: 18, fontFamily: FONT, fontWeight: 900, fontSize: 78, padding: '6px 34px', letterSpacing: 3}}>NOT LAZY</div>}
      {t > 3.0 && <Pop at={Math.round(3.05 * FPS)} style={{left: 690, top: 520}}><Pill text="Full tank" color={G.yellow} size={34} bg={G.ink} /></Pop>}
    </AbsoluteFill>
  );
};

/* ---------------- 8. send it to that friend ---------------- */
const Cta: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header />
      <Floor y={1210} />
      <FrontPerson shirt={G.orange} cap beard stopwatch mood="smile" s={1.95} x={150} y={1210 - 575 * 1.95} handL={[160, 330]} handR={[350, 196]} />
      <Pop at={6} style={{left: 690, top: 180}}><Pill text="That friend" color={G.orange} size={36} bg="#fff" /></Pop>
      <Pop at={Math.round(1.5 * FPS)} style={{left: 40, top: 140}}>
        <div style={{position: 'relative', background: '#fff', border: `5px solid ${G.ink}`, borderRadius: 26, padding: '16px 28px', fontFamily: FONT, fontWeight: 900, fontSize: 42, lineHeight: 1.1, textAlign: 'center', width: 460}}>3 MINUTES IS<br />FOR SLACKERS!<div style={{position: 'absolute', left: 50, bottom: -30, width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: `32px solid ${G.ink}`}} /></div>
      </Pop>
      {t > 3.1 && <Pop at={Math.round(3.15 * FPS)} style={{left: 330, top: 1235}}><div style={{background: G.green, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 40, borderRadius: 999, padding: '12px 40px', letterSpacing: 2}}>SEND IT ➜</div></Pop>}
    </AbsoluteFill>
  );
};

const S: React.FC<{k: SecKey; children: React.ReactNode}> = ({k, children}) => (
  <Sequence from={secFrom(k)} durationInFrames={secLen(k)}><AbsoluteFill>{children}</AbsoluteFill></Sequence>
);
export const GymRest: React.FC = () => (
  <AbsoluteFill style={{background: G.bg}}>
    <BG />
    <Header />
    <S k="buddy"><Impact at={[3.59]}><Buddy /></Impact></S>
    <S k="weeks"><Impact at={[4.3]}><Weeks /></Impact></S>
    <S k="inside"><Impact at={[7.81, 11.85]}><Inside /></Impact></S>
    <S k="study"><Impact at={[8.05]}><Study /></Impact></S>
    <S k="results"><Impact at={[4.05, 6.9]}><Results /></Impact></S>
    <S k="pooling"><Impact at={[4.65]}><Pooling /></Impact></S>
    <S k="phone"><Impact at={[1.75]}><Phone /></Impact></S>
    <S k="cta"><Impact at={[1.5]}><Cta /></Impact></S>
    <Subs />
    <Audio src={staticFile('audio/gym_voice.mp3')} volume={1} />
    <Audio src={staticFile('audio/gym_music.wav')} volume={(fr) => 0.22 * interpolate(fr, [0, 10, GYM_TOTAL - 40, GYM_TOTAL], [0, 1, 1, 0], clamp)} />
    <Audio src={staticFile('audio/gym_sfx.wav')} volume={0.5} />
  </AbsoluteFill>
);
