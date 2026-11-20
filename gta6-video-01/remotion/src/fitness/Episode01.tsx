import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Character, Pose} from './Character';
import {Cam, Dumbbell, Gym} from './Gym';
import {Bottle, PowderStream, Scoop, Shaker, Tub} from './Props3D';
import {Cells, FiberWorld} from './Micro';
import {BatteryDuel, Calendar, Chip, DayBar, Finish, Flash, NameTag, Reps, ScaleCard, Slam} from './Overlays';
import {Subs} from './Subs';
import {ALEX, DANIEL, FX} from './theme';
import {EP1, EP1_TOTAL, sceneNew} from './ep01_timeline';
import {SceneClock, useLocalOld} from './time';
import {useRpmBase} from './Human';

const W = 1080, H = 1920, FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type V3 = [number, number, number];
type Key = {t: number; pos: V3; look: V3; fov?: number};
/** Keyframed camera with ease-in-out between keys (absolute seconds). */
const camAt = (t: number, keys: Key[]) => {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const p = b.t === a.t ? 1 : Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  const L = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * p, x[1] + (y[1] - x[1]) * p, x[2] + (y[2] - x[2]) * p];
  return {pos: L(a.pos, b.pos), look: L(a.look, b.look), fov: (a.fov ?? 36) + ((b.fov ?? 36) - (a.fov ?? 36)) * p};
};
const tri = (x: number) => 0.5 - 0.5 * Math.cos(x * Math.PI * 2);
const idle = (t: number, side: 1 | -1): Pose => ({bob: 0.004 * Math.sin(t * 2.2), shL: [0, 0, 0.1 + 0.015 * Math.sin(t * 2.2)], shR: [0, 0, -0.1 - 0.015 * Math.sin(t * 2.2)], turn: 0.14 * side, headY: -0.05 * side});
const curl = (c: number, base: Pose, side: 'L' | 'R' | 'B'): Pose => ({...base, ...(side !== 'R' ? {shL: [-0.12 * c, 0, 0.12] as V3, elL: 0.2 + 2.15 * c, wrL: -0.25 * c} : {}), ...(side !== 'L' ? {shR: [-0.12 * c, 0, -0.12] as V3, elR: 0.2 + 2.15 * c, wrR: -0.25 * c} : {})});
const DB = <group rotation={[0, Math.PI / 2, 0]}><Dumbbell scale={0.85} /></group>;
const POS_A: V3 = [-0.37, 0, 0], POS_D: V3 = [0.37, 0, 0];

/** Full 3D gym stage with both characters; `children` adds scene-specific 3D objects. */
const Stage: React.FC<{cam: ReturnType<typeof camAt>; a: Pose; d: Pose; muscle?: number; muscleD?: number; flexA?: [number, number]; flexD?: [number, number]; holdA?: [React.ReactNode, React.ReactNode]; holdD?: [React.ReactNode, React.ReactNode]; sweat?: number; children?: React.ReactNode; light?: number; spread?: number; smileA?: number; smileD?: number}> = ({smileA = 0.25, smileD = 0.15, spread = 0.37, cam, a, d, muscle = 0.12, muscleD, flexA = [0, 0], flexD = [0, 0], holdA = [null, null], holdD = [null, null], sweat = 0, children, light = 1}) => (
  <ThreeCanvas width={W} height={H} shadows>
    <Cam pos={cam.pos} look={cam.look} fov={cam.fov} />
    <Gym light={light} />
    <Character spec={ALEX} smile={smileA} position={[-spread, 0, 0]} pose={a} muscle={muscle} flexL={flexA[0]} flexR={flexA[1]} holdL={holdA[0]} holdR={holdA[1]} sweat={sweat} />
    <Character spec={DANIEL} smile={smileD} position={[spread, 0, 0]} pose={d} muscle={muscleD ?? muscle} flexL={flexD[0]} flexR={flexD[1]} holdL={holdD[0]} holdR={holdD[1]} sweat={sweat} />
    {children}
  </ThreeCanvas>
);
const useT = () => useLocalOld();

/* ====================== SCENE 1 — HOOK ====================== */
const Hook: React.FC = () => {
  const t = useT();
  const c = tri((t % 0.8) / 0.8);
  const cam = camAt(t, [
    {t: 0, pos: [0, 1.12, 1.45], look: [0, 1.08, 0], fov: 28},
    {t: 1.15, pos: [0, 1.12, 1.75], look: [0, 1.08, 0], fov: 28},
    {t: 2.7, pos: [0, 1.35, 4.7], look: [0, 1.05, 0], fov: 38},
    {t: 3.4, pos: [-0.2, 1.4, 3.4], look: [-0.3, 1.25, 0], fov: 36},
    {t: 5.7, pos: [-0.35, 1.45, 2.6], look: [-0.35, 1.3, 0], fov: 34},
    {t: 6.3, pos: [0.3, 1.45, 2.6], look: [0.35, 1.3, 0], fov: 34},
    {t: 8.5, pos: [0.4, 1.5, 2.3], look: [0.37, 1.35, 0], fov: 33},
  ]);
  const show = t >= 3.35 ? interpolate(t, [3.35, 3.8], [0, 1], clamp) : 0;
  const push = interpolate(t, [6.4, 7.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const curling = t < 3.2;
  const a: Pose = curling ? curl(c, idle(t, 1), 'B') : {...idle(t, 1), shL: [-1.05 * show, 0.1, 0.32 * show], elL: 0.15 + 1.35 * show, wrL: 0.2 * show};
  const d: Pose = curling ? curl(c, idle(t, -1), 'B') : t < 6.15 ? idle(t, -1) : {...idle(t, -1), shR: [-1.4 * push, 0, -0.15], elR: 0.3 - 0.15 * push, wrR: -1.35 * push, headY: Math.sin(t * 12) * 0.18 * (t < 7.8 ? 1 : 0)};
  const tubX = interpolate(push, [0, 1], [0.37, 1.1]);
  if (t >= 8.59) {
    // split-screen face close-ups
    const z = interpolate(t, [8.59, 11.3], [0.95, 0.72]);
    return (
      <AbsoluteFill>
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: i * 540, top: 0, width: 540, height: H, overflow: 'hidden'}}>
            <ThreeCanvas width={540} height={H} shadows>
              <Cam pos={[i ? 0.37 : -0.37, 1.6, z]} look={[i ? 0.37 : -0.37, 1.58, 0]} fov={30} />
              <Gym />
              <Character spec={ALEX} position={POS_A} pose={{...idle(t, 1), turn: 0}} />
              <Character spec={DANIEL} position={POS_D} pose={{...idle(t, -1), turn: 0}} />
            </ThreeCanvas>
            <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 50%, ${i ? FX.red : FX.blue}55)`}} />
          </div>
        ))}
        <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: H, background: `linear-gradient(${FX.blue}, ${FX.gold}, ${FX.red})`, boxShadow: `0 0 30px ${FX.gold}`}} />
        <Slam at={8.65} text="?" size={360} color={FX.gold} top={980} glow={FX.gold} />
        <Slam at={9.9} text="WHAT CHANGES?" size={110} top={260} />
        <Flash at={8.59} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Stage smileA={curling ? 0.1 : 0.55} smileD={0} cam={cam} a={a} d={d} flexA={curling ? [c, c] : [0, 0]} flexD={curling ? [c, c] : [0, 0]} holdA={[curling ? DB : <Tub scale={1.1} />, curling ? DB : null]} holdD={[curling ? DB : null, curling ? DB : null]}>
        {!curling && t >= 6.0 && <group position={[tubX, 1.32 - push * 0.4, 0.42]} rotation={[0, push * 2, push]}><Tub scale={1.1} /></group>}
      </Stage>
      <Slam at={1.45} out={3.15} text="90 DAYS" size={230} color={FX.gold} top={1000} glow="rgba(255,194,61,.8)" />
      <NameTag at={3.5} out={5.9} name="ALEX" sub="TAKES CREATINE" color={FX.blue} x={70} y={300} />
      <NameTag at={6.25} out={8.5} name="DANIEL" sub="TAKES NOTHING" color={FX.red} x={560} y={300} align="right" />
      {t > 7.0 && t < 8.6 && <div style={{position: 'absolute', left: 640, top: 760, fontFamily: FX.font, fontWeight: 900, fontSize: 220, color: FX.red, textShadow: `0 0 40px ${FX.red}`, transform: `scale(${interpolate(t, [7.0, 7.2], [2, 1], clamp)})`}}>✕</div>}
      <Flash at={1.15} len={0.14} />
    </AbsoluteFill>
  );
};

/* ====================== SCENE 2 — DAY 0 ====================== */
const Day0: React.FC = () => {
  const t = useT(); // absolute-within-sequence seconds; sequence starts at 11.28
  const ang = interpolate(t, [0, 6.9], [-0.75, 0.75]);
  const cam = {pos: [Math.sin(ang) * 3.9, 1.25 + 0.1 * Math.sin(t), Math.cos(ang) * 3.9] as V3, look: [0, 1.0, 0] as V3, fov: 38};
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={idle(t + 11, 1)} d={idle(t + 11, -1)} />
      <DayBar day={0} />
      <Slam at={0.05} out={1.6} text="DAY 0" size={190} color={FX.white} top={330} />
      <NameTag at={0.95} name="ALEX" sub="78.2 KG" color={FX.blue} x={70} y={300} />
      <NameTag at={1.15} name="DANIEL" sub="78.6 KG" color={FX.red} x={560} y={300} align="right" />
      <Chip at={3.18} text="SAME WORKOUT" icon="🏋️" x={70} y={1120} />
      <Chip at={4.79} text="SAME FOOD" icon="🍗" x={70} y={1210} />
      <Chip at={5.83} text="SAME SLEEP" icon="😴" x={520} y={1210} />
    </AbsoluteFill>
  );
};

/* ====================== SCENE 3 — THE DIFFERENCE ====================== */
const Difference: React.FC = () => {
  const t = useT(); // starts at 18.20
  if (t < 1.68) {
    const cam = camAt(t, [{t: 0, pos: [0, 1.35, 4.2], look: [0, 1.1, 0], fov: 36}, {t: 1.68, pos: [0, 1.4, 3.2], look: [0, 1.15, 0], fov: 34}]);
    return <AbsoluteFill><Stage cam={cam} a={idle(t, 1)} d={idle(t, -1)} /><DayBar day={0} /><Slam at={0.05} text="ONE DIFFERENCE" size={120} color={FX.gold} top={360} glow="rgba(255,194,61,.7)" /></AbsoluteFill>;
  }
  if (t < 4.85) {
    // macro: powder into the shaker
    const lt = t - 1.68; const ang = interpolate(lt, [0, 3.2], [-0.5, 0.35]);
    return (
      <AbsoluteFill>
        <ThreeCanvas width={W} height={H} shadows>
          <Cam pos={[Math.sin(ang) * 0.82, 1.2 + lt * 0.02, Math.cos(ang) * 0.82]} look={[0, 1.06, 0]} fov={32} />
          <Gym light={0.8} />
          <mesh position={[0, 0.92, 0]} receiveShadow castShadow><boxGeometry args={[1.4, 0.04, 0.8]} /><meshStandardMaterial color="#1E2026" roughness={0.4} metalness={0.3} /></mesh>
          <group position={[0, 1.04, 0]}><Shaker mix={interpolate(lt, [0.6, 2.5], [0, 1], clamp)} t={lt} /></group>
          <group position={[-0.22, 1.03, -0.12]}><Tub /></group>
          <group position={[0.02, 1.3, 0]} rotation={[0, 0, interpolate(lt, [0, 0.5], [0, 1.9], clamp)]}><Scoop full={interpolate(lt, [0.4, 1.6], [1, 0], clamp)} /></group>
          <group position={[0.0, 1.27, 0]}><PowderStream t={lt} h={0.16} on={lt > 0.45 && lt < 1.9 ? 1 : 0} /></group>
        </ThreeCanvas>
        <DayBar day={1} />
        <Chip at={1.9} text="5 g CREATINE" icon="🥄" color={FX.gold} x={70} y={330} />
        <Chip at={2.5} text="EVERY DAY" icon="📅" color={FX.blue} x={560} y={330} />
      </AbsoluteFill>
    );
  }
  // Daniel drinks plain water; camera starts rushing to Alex's arm at the end
  const lt = t - 4.85;
  const drink = interpolate(lt, [0, 0.4], [0, 1], clamp);
  const cam = camAt(lt, [{t: 0, pos: [0.4, 1.5, 2.2], look: [0.37, 1.4, 0], fov: 34}, {t: 0.85, pos: [0.3, 1.45, 2.0], look: [0.3, 1.38, 0], fov: 34}, {t: 1.25, pos: [-0.45, 1.25, 0.9], look: [-0.55, 1.2, 0], fov: 32}]);
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={idle(t, 1)} d={{...idle(t, -1), shR: [-1.0 * drink, 0, 0.55 * drink], elR: 0.2 + 2.1 * drink, wrR: 0.1 * drink, headX: -0.28 * drink}} holdD={[null, <group position={[0, -0.02, 0.04]} rotation={[Math.PI - 0.7, 0, 0]}><Bottle /></group>]} />
      <DayBar day={1} />
      <NameTag at={4.9} out={5.75} name="DANIEL" sub="JUST WATER" color={FX.red} x={560} y={300} align="right" />
    </AbsoluteFill>
  );
};

/* ====================== SCENE 4 — INSIDE THE MUSCLE ====================== */
const Inside: React.FC = () => {
  const t = useT(); // starts at 24.23
  if (t < 1.15) {
    const cam = camAt(t, [{t: 0, pos: [-0.45, 1.25, 0.9], look: [-0.55, 1.2, 0], fov: 32}, {t: 1.15, pos: [-0.56, 1.22, 0.22], look: [-0.57, 1.22, 0], fov: 28}]);
    return <AbsoluteFill><Stage cam={cam} a={{...idle(t, 1), turn: 0.4, shR: [-0.2, 0, -0.15], elR: 1.7}} d={idle(t, -1)} flexA={[0, 0.9]} /><Flash at={0.95} len={0.35} color="#FF6B7A" /></AbsoluteFill>;
  }
  const fill = interpolate(t, [1.62, 6.1], [0.12, 1], clamp);
  const camZ = 2 - (t - 1.15) * 0.9;
  const atp = t >= 6.53;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={H}><FiberWorld t={t} fill={fill} camZ={camZ} glow={atp ? 0.6 : 1} /></ThreeCanvas>
      <DayBar day={interpolate(t, [1.2, 12.8], [1, 14], clamp)} />
      {!atp && <>
        <Chip at={1.3} text="INSIDE THE MUSCLE" icon="🔬" color={FX.red} x={70} y={260} />
        <Chip at={1.9} text="PHOSPHOCREATINE ↑" icon="⚡" color={FX.gold} x={70} y={1160} />
        <div style={{position: 'absolute', left: 70, right: 160, top: 1250, height: 26, borderRadius: 13, background: 'rgba(255,255,255,.15)', overflow: 'hidden'}}><div style={{width: `${40 + 55 * fill}%`, height: '100%', background: `linear-gradient(90deg, ${FX.gold}, #FFE9A8)`, boxShadow: `0 0 20px ${FX.gold}`}} /></div>
        <div style={{position: 'absolute', left: 70, top: 1286, fontFamily: FX.font, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,.6)', letterSpacing: 2}}>MUSCLE CREATINE STORES · ILLUSTRATIVE</div>
      </>}
      {atp && <>
        <AbsoluteFill style={{background: 'rgba(8,4,10,.7)'}} />
        <BatteryDuel t={t - 6.53} />
      </>}
      <Flash at={1.15} len={0.3} color="#FF8C9A" /><Flash at={6.53} len={0.2} />
    </AbsoluteFill>
  );
};

/* ====================== SCENE 5 — WEEKS 2-4 ====================== */
const Weeks: React.FC = () => {
  const t = useT(); // starts at 37.10
  if (t < 1.5) {
    const day = interpolate(t, [0, 1.4], [14, 28], {...clamp, easing: Easing.inOut(Easing.quad)});
    return (
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1B2433, #07090D 70%)'}}>
        <DayBar day={day} />
        <div style={{position: 'absolute', left: 360, top: 600, transform: `rotate(${Math.sin(t * 8) * 3}deg)`}}><Calendar day={day} /></div>
        <Slam at={0.05} text="WEEKS 2 – 4" size={110} top={1110} color={FX.white} />
      </AbsoluteFill>
    );
  }
  const lt = t - 1.5; const P = 0.48;
  const repsD = Math.min(10, Math.floor(lt / P) + 1), failD = lt > 10 * P - 0.2;
  const repsA = Math.min(12, Math.floor(lt / P) + 1);
  const cD = failD ? interpolate(lt, [10 * P - 0.2, 10 * P + 0.4], [0.6, 0], clamp) : tri((lt % P) / P);
  const cA = repsA >= 12 && lt > 12 * P ? 0.0 : tri((lt % P) / P);
  const cam = camAt(lt, [{t: 0, pos: [0, 1.3, 3.5], look: [0, 1.15, 0], fov: 36}, {t: 4, pos: [0.0, 1.25, 3.0], look: [0, 1.15, 0], fov: 34}, {t: 7, pos: [-0.25, 1.3, 2.4], look: [-0.3, 1.2, 0], fov: 34}]);
  const chart = t >= 7.39;
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={curl(cA, idle(t, 1), 'L')} d={curl(cD, idle(t, -1), 'R')} flexA={[cA, 0]} flexD={[0, cD]} holdA={[DB, null]} holdD={[null, DB]} sweat={(t * 1.3) % 1} muscle={0.22} muscleD={0.2} />
      <DayBar day={interpolate(t, [1.5, 9], [21, 28], clamp)} />
      {!chart && <>
        <Reps n={repsA} color={FX.blue} x={70} y={1010} label="ALEX" />
        <Reps n={repsD} color={FX.red} x={710} y={1010} label="DANIEL" fail={failD} />
        {lt > 10 * P + 0.3 && <Slam at={1.5 + 10 * P + 0.3} text="+1–2 REPS" size={100} color={FX.blue} top={300} glow={FX.blue} />}
      </>}
      {chart && (() => {
        const p = interpolate(t, [7.4, 8.9], [0, 1], clamp);
        const ptsA = Array.from({length: 9}, (_, i) => [120 + i * 100, 420 - i * 34 - i * i * 1.4]), ptsD = Array.from({length: 9}, (_, i) => [120 + i * 100, 420 - i * 34]);
        const cut = (pts: number[][]) => pts.slice(0, Math.max(2, Math.round(p * 9))).map((q) => q.join(',')).join(' ');
        return (
          <svg width={1080} height={600} style={{position: 'absolute', left: 0, top: 260}}>
            <rect x={60} y={0} width={960} height={560} rx={36} fill="rgba(8,10,14,.82)" stroke="rgba(255,255,255,.15)" strokeWidth={3} />
            <text x={540} y={70} textAnchor="middle" fill="#fff" fontFamily={FX.font} fontWeight={900} fontSize={44}>TOTAL REPS, WEEK BY WEEK</text>
            <polyline points={cut(ptsD)} fill="none" stroke={FX.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={cut(ptsA)} fill="none" stroke={FX.blue} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            <text x={540} y={530} textAnchor="middle" fill="rgba(255,255,255,.5)" fontFamily={FX.font} fontWeight={700} fontSize={22}>ILLUSTRATIVE</text>
          </svg>
        );
      })()}
    </AbsoluteFill>
  );
};

/* ====================== SCENE 6 — DAY 60 ====================== */
const Day60: React.FC = () => {
  const t = useT(); // starts at 46.14
  const cells = t >= 1.25 && t < 4.7;
  if (cells) {
    const sw = interpolate(t, [1.4, 4.2], [0, 1], clamp);
    return (
      <AbsoluteFill>
        <ThreeCanvas width={W} height={H}>
          <color attach="background" args={['#12040A']} />
          <ambientLight intensity={0.7} /><pointLight position={[0, 2, 4]} intensity={60} color="#FFE0E0" /><pointLight position={[0, -2, 3]} intensity={30} color="#7FD3FF" />
          <Cam pos={[0, 0, 7.2]} look={[0, 0, 0]} fov={36} />
          <group position={[0, 1.9, 0]}><Cells swell={sw} t={t} tint={FX.blue} x={0} /></group>
          <group position={[0, -2.1, 0]}><Cells swell={0.05} t={t} tint={FX.red} x={0} /></group>
        </ThreeCanvas>
        <DayBar day={60} />
        <Chip at={1.4} text="ALEX · CREATINE" color={FX.blue} x={70} y={250} />
        <Chip at={1.6} text="DANIEL · NO CREATINE" color={FX.red} x={70} y={1240} />
        <Chip at={2.4} text="MORE WATER INSIDE THE CELL" icon="💧" color="#7FD3FF" x={110} y={850} />
      </AbsoluteFill>
    );
  }
  if (t >= 4.7) {
    const k = interpolate(t, [4.75, 5.6], [0, 1], clamp);
    return (
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #142030, #07090D 70%)'}}>
        <DayBar day={60} />
        <div style={{position: 'absolute', left: 90, top: 330, transform: `translateY(${(1 - k) * 60}px)`, opacity: k}}><ScaleCard kg={78.2 + 1.5 * k} delta={1.5 * k} color={FX.blue} name="ALEX" note="MOSTLY WATER" /></div>
        <div style={{position: 'absolute', left: 570, top: 330, transform: `translateY(${(1 - k) * 60}px)`, opacity: k}}><ScaleCard kg={78.6 + 0.5 * k} delta={0.5 * k} color={FX.red} name="DANIEL" /></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', fontFamily: FX.font, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,.5)'}}>ILLUSTRATIVE NUMBERS</div>
        <Slam at={7.16} text={<span>💧 ≠ 💪</span>} size={200} top={880} />
        <Slam at={7.2} text="WATER ≠ MUSCLE" size={96} top={1120} color="#7FD3FF" glow="#1E7FD0" />
      </AbsoluteFill>
    );
  }
  const cam = camAt(t, [{t: 0, pos: [0, 1.3, 3.8], look: [0, 1.1, 0], fov: 36}, {t: 1.25, pos: [0, 1.35, 3.0], look: [0, 1.15, 0], fov: 34}]);
  return <AbsoluteFill><Stage cam={cam} a={idle(t, 1)} d={idle(t, -1)} muscle={0.36} muscleD={0.31} /><DayBar day={interpolate(t, [0, 0.8], [28, 60], clamp)} /><Slam at={0.05} text="DAY 60" size={220} color={FX.gold} top={360} glow="rgba(255,194,61,.7)" /></AbsoluteFill>;
};

/* ====================== SCENE 7 — DAY 90 ====================== */
const Day90: React.FC = () => {
  const t = useT(); // starts at 55.44
  const flex = interpolate(t, [1.3, 1.8], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const ang = interpolate(t, [3.6, 7.6], [0, 0.8]);
  const cam = t < 1.3 ? camAt(t, [{t: 0, pos: [0, 1.3, 4.5], look: [0, 1.1, 0], fov: 38}, {t: 1.3, pos: [0, 1.35, 3.6], look: [0, 1.15, 0], fov: 36}]) : {pos: [Math.sin(ang) * 5.2, 1.4, Math.cos(ang) * 5.2] as V3, look: [0, 1.2, 0] as V3, fov: 38};
  const pose = (side: 1 | -1): Pose => ({...idle(t, side), shL: [0, 0, 1.4 * flex], twL: Math.PI / 2 * flex, elL: 0.15 + 1.75 * flex, shR: [0, 0, -1.4 * flex], twR: -Math.PI / 2 * flex, elR: 0.15 + 1.75 * flex, turn: 0.1 * side});
  const stats = t >= 4.5;
  if (t >= 1.3 && t < 3.6) {
    // muscle-growth time-lapse: same 90 days, both grow; creatine adds a small extra
    const p = interpolate(t, [1.45, 3.35], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    const mA = 0.12 + 0.5 * p, mD = 0.12 + 0.4 * p;
    const fx = (side: 1 | -1): Pose => ({...idle(t, side), turn: 0.25 * side, shL: [0, 0, 1.4], twL: Math.PI / 2, elL: 1.85 + 0.08 * Math.sin(t * 6), shR: [0, 0, -1.4], twR: -Math.PI / 2, elR: 1.85 + 0.08 * Math.sin(t * 6)});
    return (
      <AbsoluteFill>
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: i * 540, top: 0, width: 540, height: H, overflow: 'hidden'}}>
            <ThreeCanvas width={540} height={H} shadows>
              <Cam pos={[i ? 0.66 : -0.66, 1.5, 2.7]} look={[i ? 0.66 : -0.66, 1.42, 0]} fov={40} />
              <Gym />
              <Character spec={ALEX} position={[-0.42, 0, 0]} pose={fx(1)} muscle={mA} flexL={1} flexR={1} sweat={(t * 1.2) % 1} />
              <Character spec={DANIEL} position={[0.42, 0, 0]} pose={fx(-1)} muscle={mD} flexL={1} flexR={1} sweat={(t * 1.2 + 0.5) % 1} />
            </ThreeCanvas>
            <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 60%, ${i ? FX.red : FX.blue}66)`}} />
            <div style={{position: 'absolute', left: 40, right: 40, top: 1150}}>
              <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: 3}}>MUSCLE</div>
              <div style={{height: 30, borderRadius: 15, background: 'rgba(255,255,255,.15)', marginTop: 8, overflow: 'hidden'}}><div style={{width: `${20 + (i ? 52 : 62) * p}%`, height: '100%', background: i ? FX.red : FX.blue, boxShadow: `0 0 18px ${i ? FX.red : FX.blue}`}} /></div>
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: H, background: `linear-gradient(${FX.blue}, ${FX.gold}, ${FX.red})`, boxShadow: `0 0 30px ${FX.gold}`}} />
        <DayBar day={Math.round(90 * p)} />
        <Chip at={1.35} text="ALEX · CREATINE" color={FX.blue} x={40} y={250} />
        <Chip at={1.45} text="DANIEL · NONE" color={FX.red} x={600} y={250} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', fontFamily: FX.font, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,.6)', letterSpacing: 2}}>BOTH GROW · CREATINE'S EXTRA IS SMALL (PARTLY WATER) · ILLUSTRATIVE</div>
        <Flash at={1.3} len={0.15} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Stage smileA={0.8} smileD={0.7} spread={0.64} cam={cam} a={pose(1)} d={pose(-1)} muscle={0.62} muscleD={0.52} flexA={[flex, flex]} flexD={[flex, flex]} light={1.1} />
      <DayBar day={interpolate(t, [0, 0.8], [60, 90], clamp)} />
      <Slam at={0.05} out={1.25} text="DAY 90" size={240} color={FX.gold} top={360} glow="rgba(255,194,61,.8)" />
      {!stats && <>
        <Chip at={1.4} text="MUSCLE ✓" color={FX.blue} x={70} y={300} />
        <Chip at={1.6} text="MUSCLE ✓" color={FX.red} x={690} y={300} />
      </>}
      {stats && (() => {
        const p = interpolate(t, [4.6, 5.6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div style={{position: 'absolute', left: 70, right: 160, top: 260, background: 'rgba(8,10,14,.8)', border: '2px solid rgba(255,255,255,.15)', borderRadius: 30, padding: '24px 30px'}}>
            <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: 2}}>TRAINING PERFORMANCE</div>
            {[['ALEX', FX.blue, 1], ['DANIEL', FX.red, 0.9]].map(([n, c, v]) => <div key={n as string} style={{marginTop: 18}}><div style={{fontFamily: FX.font, fontWeight: 800, fontSize: 24, color: c as string, letterSpacing: 3}}>{n}</div><div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,.1)', marginTop: 6}}><div style={{width: `${(v as number) * 100 * p}%`, height: '100%', borderRadius: 17, background: c as string, boxShadow: `0 0 20px ${c}`}} /></div></div>)}
            <div style={{fontFamily: FX.font, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,.5)', marginTop: 14}}>A SMALL EDGE · ILLUSTRATIVE</div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

/* ====================== SCENE 8 — FINAL ====================== */
const Final: React.FC = () => {
  const t = useT(); // starts at 63.03
  const cam = camAt(t, [{t: 0, pos: [0, 1.4, 4.6], look: [0, 1.15, 0], fov: 38}, {t: 10.6, pos: [0, 1.45, 3.1], look: [0, 1.25, 0], fov: 34}]);
  const end = t >= 6.2;
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={{...idle(t, 1), shL: [-0.5, 0.1, 0.38], elL: 1.45}} d={{...idle(t, -1), shR: [0, 0, -0.1]}} holdA={[<Tub scale={1.1} />, null]} light={end ? 0.75 : 1} muscle={0.62} muscleD={0.52} smileA={0.75} smileD={0.55} />
      {!end && <Slam at={0.05} out={1.6} text="ISN'T MAGIC" size={120} top={330} />}
      {!end && <>
        <Chip at={1.75} text="TRAINING" icon="🏋️" x={70} y={330} />
        <Chip at={2.35} text="FOOD" icon="🍗" x={420} y={330} />
        <Chip at={3.0} text="RECOVERY" icon="😴" x={640} y={420} />
        <Slam at={4.69} text="+ AN EDGE" size={130} color={FX.gold} top={560} glow="rgba(255,194,61,.7)" />
      </>}
      {end && <>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.65), transparent 45%)'}} />
        <Slam at={6.23} text={<span>CREATINE:<br /><span style={{color: FX.gold}}>WORTH IT?</span></span>} size={150} top={250} />
        <Chip at={7.2} text="COMMENT YES OR NO" icon="👇" color={FX.gold} x={180} y={1180} />
      </>}
      <Flash at={6.23} len={0.2} />
    </AbsoluteFill>
  );
};

const scenes: [keyof typeof EP1, React.FC][] = [['hook', Hook], ['day0', Day0], ['difference', Difference], ['inside', Inside], ['weeks', Weeks], ['day60', Day60], ['day90', Day90], ['final', Final]];
export const Episode01: React.FC = () => {
  const ok = useRpmBase();
  return (
  <AbsoluteFill style={{background: FX.bg}}>
    {ok && scenes.map(([k, C]) => { const [a, b] = sceneNew(k); const from = Math.round(a * FPS); return <Sequence key={k} from={from} durationInFrames={Math.round(b * FPS) - from}><SceneClock newStart={from / FPS} oldStart={EP1[k][0]}><C /></SceneClock></Sequence>; })}
    <Finish />
    <Subs />
    <Audio src={staticFile('audio/creatine_voice_tight.wav')} />
    <Audio src={staticFile('audio/creatine_music.wav')} volume={(f) => 0.3 * interpolate(f, [0, 8, EP1_TOTAL - 45, EP1_TOTAL], [0, 1, 1, 0], clamp)} />
    <Audio src={staticFile('audio/creatine_sfx.wav')} volume={0.6} />
  </AbsoluteFill>
  );
};
