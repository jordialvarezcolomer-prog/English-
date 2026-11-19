import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame, Easing} from 'remotion';
import {BG, Bench, FONT, G, Floor, Person, POSES, Pill, Plate, Pop, Source, Tank, TimerCard, Xray, mixPose} from './kit';
import {GYM_TOTAL, SEC, SecKey, secFrom, secLen} from './timeline';
import {Subs} from './Subs';
import {FPS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const tri = (x: number) => 0.5 - 0.5 * Math.cos(x * Math.PI * 2);

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
const Buddy: React.FC = () => {
  const t = useT();
  const sw = interpolate(t, [2.8, 3.25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const secs = interpolate(t, [0.15, 2.7], [0, 60], clamp);
  const shake = t > 3.6 && t < 4.0 ? Math.sin(t * 90) * 7 : 0;
  return (
    <AbsoluteFill>
      <Floor y={1150} />
      <div style={{position: 'absolute', left: 1500 * 0, top: 0, width: 1080, height: 1920, transform: `translateX(${-sw * 1100}px)`}}>
        <SitScene shirt={G.orange} cap beard />
        <Pop at={4} style={{left: 400, top: 230}}><TimerCard text={mmss(secs)} color={G.ink} w={300} /></Pop>
        <Pop at={8} style={{left: 380, top: 350}}><Pill text="Your buddy" color={G.orange} size={30} /></Pop>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${(1 - sw) * 1100}px)`}}>
        <SitScene shirt={G.blue} phone mood="smile" />
        {t > 3.55 && <div style={{position: 'absolute', left: 400, top: 230}}><TimerCard text="3:00" color={G.blue} w={300} shake={shake} /></div>}
        {t > 4.25 && <div style={{position: 'absolute', left: 590, top: 350}}><Pill text="Resting" color={G.blue} size={28} /></div>}
        {t > 2.95 && <div style={{position: 'absolute', left: 440, top: 350}}><Pill text="You" color={G.blue} size={30} /></div>}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 2. eight weeks: leg-press lanes ---------------- */
const LegLane: React.FC<{y: number; shirt: string; e: number; glow: number; cap?: boolean; beard?: boolean; label: string; color: string; show: number}> = ({y, shirt, e, glow, cap, beard, label, color, show}) => {
  const L = 118 + 74 * e, th = (42 * Math.PI) / 180;
  const hip: [number, number] = [172, 372], sh: [number, number] = [52, 290];
  const footL: [number, number] = [hip[0] + L * Math.cos(th), hip[1] - L * Math.sin(th)];
  const pose = {hip, sh, head: [10, 246] as [number, number], handL: [hip[0] + 22, hip[1] + 10] as [number, number], handR: [hip[0] + 12, hip[1] + 18] as [number, number], footL, footR: [footL[0] - 6, footL[1] + 6] as [number, number], legBend: 1 as const, armBend: -1 as const};
  return (
    <div style={{position: 'absolute', left: 150, top: y, transform: 'scale(1.2)', transformOrigin: '0 0', opacity: show}}>
      <svg width={640} height={520} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line x1={110} y1={470} x2={540} y2={170} stroke="#B9B9B5" strokeWidth={14} strokeLinecap="round" />
        <line x1={50} y1={350} x2={180} y2={445} stroke="#3A3F4B" strokeWidth={70} strokeLinecap="round" />
        <g transform={`translate(${footL[0] + 34} ${footL[1] - 26}) rotate(${42})`}><rect x={-14} y={-110} width={30} height={220} rx={10} fill="#3A3F4B" /><circle cx={0} cy={86} r={34} fill="#2B6BE0" /><circle cx={0} cy={86} r={10} fill="#E9E9E6" /><circle cx={0} cy={-86} r={34} fill="#2B6BE0" /><circle cx={0} cy={-86} r={10} fill="#E9E9E6" /></g>
      </svg>
      <Person pose={pose} shirt={shirt} cap={cap} beard={beard} s={1} glowThigh={glow} />
      <div style={{position: 'absolute', left: 10, top: 70}}><Pill text={label} color={color} size={30} /></div>
    </div>
  );
};
const Weeks: React.FC = () => {
  const t = useT();
  const week = Math.max(1, Math.min(8, Math.floor(interpolate(t, [0, 2.3], [1, 8.99], clamp))));
  const e = (off: number) => tri(((t + off) % 1.5) / 1.5);
  const glowB = interpolate(t, [1.9, 3.3], [0, 1], clamp), glowO = interpolate(t, [1.9, 3.3], [0, 0.38], clamp);
  const lazy = interpolate(t, [4.1, 4.4], [0, 1], clamp);
  const lanes = 1 - lazy;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: lanes}}><div style={{display: 'inline-block', background: G.ink, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '8px 30px', borderRadius: 999, letterSpacing: 2}}>WEEK {week} OF 8</div></div>
      <LegLane y={250} shirt={G.blue} e={e(0)} glow={glowB} label="3 MIN REST" color={G.blue} show={lanes} cap={false} />
      <LegLane y={720} shirt={G.orange} e={e(0.4)} glow={glowO} label="1 MIN REST" color={G.orange} show={lanes} cap beard />
      <div style={{position: 'absolute', left: 60, top: 1290, opacity: lanes}}><Source /></div>
      {lazy > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: lazy}}>
          <Floor y={1210} />
          <Person pose={POSES.stand} shirt={G.blue} s={2.0} x={140} y={1210 - 565 * 2} mood="worry" />
          <Pop at={Math.round(4.3 * FPS)} style={{left: 640, top: 250}}><Pill text="Lazy?!" color={G.red} size={46} bg="#fff" /></Pop>
          <Pop at={Math.round(4.5 * FPS)} style={{left: 90, top: 320}}><Pill text="Lazy?" color={G.orange} size={34} bg="#fff" /></Pop>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 3. inside: fast fuel ---------------- */
const Inside: React.FC = () => {
  const t = useT();
  const dark = t < 8.7;
  const level = t < 4.9 ? interpolate(t, [2.6, 4.2], [0.08, 0.1], clamp) : t < 6.6 ? interpolate(t, [4.94, 5.9], [0.08, 0.5], clamp) : t < 8.6 ? interpolate(t, [6.97, 8.1], [0.5, 0.92], clamp) : interpolate(t, [8.9, 11.6], [0.46, 0.2], clamp);
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
          <Xray x={70} y={250} s={1.4} glow={interpolate(t, [0, 1], [0.3, 1], clamp)} />
          <Pop at={Math.round(1.9 * FPS)} style={{left: 590, top: 330}}><Pill text="Fast fuel" color={G.yellow} size={36} bg="#0B1E3F" /></Pop>
          <Pop at={Math.round(1.9 * FPS)} style={{left: 590, top: 450}}><Tank level={level} s={2.2} /></Pop>
          {timer && <div style={{position: 'absolute', left: 640, top: 200}}><TimerCard text={timer} color={t < 6.7 ? G.orange : G.blue} w={250} /></div>}
          {t > 5.65 && t < 6.6 && <Pop at={Math.round(5.7 * FPS)} style={{left: 90, top: 1130}}><Pill text="Half a tank" color={G.yellow} size={34} bg="#0B1E3F" /></Pop>}
          {t > 7.75 && <Pop at={Math.round(7.8 * FPS)} style={{left: 90, top: 1130}}><Pill text="Almost full" color={G.green} size={34} bg="#0B1E3F" /></Pop>}
        </>
      ) : (
        <>
          <Floor y={1130} />
          <Plate x={0} y={0} r={0} />
          <div style={{position: 'absolute', left: 30, top: 1130 - 565 * 1.9}}>
            <Person pose={squatPose} shirt={G.blue} s={1.9} mood={stuck ? 'worry' : 'flat'} />
            <svg width={400 * 1.9} height={600 * 1.9} viewBox="0 0 400 600" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <rect x={squatPose.sh[0] - 4} y={squatPose.sh[1] - 38} width={30} height={46} fill="none" />
              <circle cx={squatPose.sh[0] - 6} cy={squatPose.sh[1] - 14} r={50} fill="#2B6BE0" opacity={0.92} /><circle cx={squatPose.sh[0] - 6} cy={squatPose.sh[1] - 14} r={13} fill="#E9E9E6" />
            </svg>
          </div>
          <Tank level={level} x={640} y={640} s={2.0} />
          <div style={{position: 'absolute', left: 60, top: 220, width: 960, textAlign: 'center'}}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: 3, color: G.grey, marginBottom: 14}}>REPS</div>
            <div style={{display: 'flex', gap: 14, justifyContent: 'center'}}>{Array.from({length: 10}).map((_, i) => <div key={i} style={{width: 54, height: 54, borderRadius: 27, border: `5px solid ${G.ink}`, background: i < reps ? G.green : 'transparent'}} />)}</div>
          </div>
          <Pop at={Math.round(9.0 * FPS)} style={{left: 700, top: 560}}><Pill text="Half-empty" color={G.red} size={28} bg="#fff" /></Pop>
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
        return <Pop key={i} at={at} style={{left: 40 + col * 138, top: 340 + row * 235}}><div style={{position: 'relative', width: 160, height: 240}}><Person pose={POSES.stand} shirt={shirt} s={0.4} cap={split && grp === 'o'} /></div></Pop>;
      })}
      {t > 2.75 && <Pop at={Math.round(2.8 * FPS)} style={{left: 60, top: 1090}}><Pill text="Same exercises" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 3.4 && <Pop at={Math.round(3.5 * FPS)} style={{left: 400, top: 1090}}><Pill text="Same sets" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 4.8 && <Pop at={Math.round(4.85 * FPS)} style={{left: 650, top: 1090}}><Pill text="3 days / week" color={G.ink} size={28} bg="#fff" /></Pop>}
      {t > 5.95 && <Pop at={Math.round(6.0 * FPS)} style={{left: 130, top: 250}}><TimerCard text="1:00" color={G.orange} w={220} /></Pop>}
      {t > 8.0 && <Pop at={Math.round(8.05 * FPS)} style={{left: 700, top: 250}}><TimerCard text="3:00" color={G.blue} w={220} /></Pop>}
      {t > 8.75 && <Pop at={Math.round(8.8 * FPS)} style={{left: 300, top: 1190}}><div style={{background: G.ink, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '8px 30px', borderRadius: 999, letterSpacing: 2}}>WEEK 1 OF 8</div></Pop>}
    </AbsoluteFill>
  );
};

/* ---------------- 5. results + pump ---------------- */
const Squatter: React.FC<{x: number; shirt: string; glow: number; ph: number; cap?: boolean; beard?: boolean}> = ({x, shirt, glow, ph, cap, beard}) => {
  const p = mixPose(POSES.squatUp, POSES.squatDown, tri(ph)); const s = 1.5;
  return (
    <div style={{position: 'absolute', left: x, top: 1160 - 565 * s}}>
      <Person pose={p} shirt={shirt} s={s} glowThigh={glow} cap={cap} beard={beard} />
      <svg width={400 * s} height={600 * s} viewBox="0 0 400 600" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><circle cx={p.sh[0] - 6} cy={p.sh[1] - 14} r={46} fill="#2B6BE0" /><circle cx={p.sh[0] - 6} cy={p.sh[1] - 14} r={12} fill="#E9E9E6" /></svg>
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
          <Squatter x={-30} shirt={G.blue} glow={glowB} ph={(t % 1.6) / 1.6} />
          <Squatter x={500} shirt={G.orange} glow={glowO} ph={((t + 0.5) % 1.6) / 1.6} cap beard />
          <Pop at={6} style={{left: 330, top: 230}}><Pill text="Thigh muscle" color={G.green} size={40} bg="#fff" /></Pop>
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
          <Floor y={1200} />
          <Person pose={POSES.flex} shirt={G.orange} cap beard mood="smile" s={1.7} x={200} y={1200 - 565 * 1.7} />
          <Pop at={Math.round(4.15 * FPS)} style={{left: 410, top: 230}}><Pill text="Pump" color={G.red} size={48} bg="#fff" /></Pop>
          {t > 5.8 && <Pop at={Math.round(5.85 * FPS)} style={{left: 330, top: 320}}><Pill text="Feels bigger" color={G.orange} size={34} bg="#fff" /></Pop>}
          {t > 6.85 && (
            <Pop at={Math.round(6.9 * FPS)} style={{left: 360, top: 1225}}>
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
          <Person pose={POSES.stand} shirt={same ? G.blue : G.orange} s={1.9} x={160} y={1210 - 565 * 1.9} glowThigh={glow} mood={same ? 'smile' : 'worry'} cap={!same} beard={!same} />
          <div style={{position: 'absolute', left: 400, top: 240}}><TimerCard text={mmss(time)} color={same ? G.green : G.red} w={280} /></div>
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
      <Person pose={POSES.point} shirt={G.orange} cap beard stopwatch mood="smile" s={1.95} x={150} y={1210 - 565 * 1.95} />
      <Pop at={6} style={{left: 680, top: 230}}><Pill text="That friend" color={G.orange} size={36} bg="#fff" /></Pop>
      <Pop at={Math.round(1.5 * FPS)} style={{left: 60, top: 230}}>
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
    <S k="buddy"><Buddy /></S>
    <S k="weeks"><Weeks /></S>
    <S k="inside"><Inside /></S>
    <S k="study"><Study /></S>
    <S k="results"><Results /></S>
    <S k="pooling"><Pooling /></S>
    <S k="phone"><Phone /></S>
    <S k="cta"><Cta /></S>
    <Subs />
    <Audio src={staticFile('audio/gym_voice.mp3')} volume={1} />
    <Audio src={staticFile('audio/gym_music.wav')} volume={(fr) => 0.22 * interpolate(fr, [0, 10, GYM_TOTAL - 40, GYM_TOTAL], [0, 1, 1, 0], clamp)} />
    <Audio src={staticFile('audio/gym_sfx.wav')} volume={0.5} />
  </AbsoluteFill>
);
