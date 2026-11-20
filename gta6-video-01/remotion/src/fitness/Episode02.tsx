import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Character, Pose} from './Character';
import {Cam, Dumbbell, Gym} from './Gym';
import {Chip, DayBar, Finish, Flash, NameTag, Reps, Slam} from './Overlays';
import {Callout, Cravings, GHGraph, HormoneCard, NightSplit, SleepPoll, SleepSupplement, Source, StudyBars, TestoCard} from './Overlays2';
import {Subs, buildCards} from './Subs';
import {ALEX, DANIEL, FX} from './theme';
import {useRpmBase} from './Human';
import SEG from './ep02_segments.json';

/* EPISODE 2 — "5 hours vs 8 hours of sleep for 30 days". Voice: Kokoro (am_michael), sentence-timed (ep02_segments.json). */
const W = 1080, H = 1920, FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type V3 = [number, number, number];
type Key = {t: number; pos: V3; look: V3; fov?: number};
const camAt = (t: number, keys: Key[]) => {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const p = b.t === a.t ? 1 : Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  const L = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * p, x[1] + (y[1] - x[1]) * p, x[2] + (y[2] - x[2]) * p];
  return {pos: L(a.pos, b.pos), look: L(a.look, b.look), fov: (a.fov ?? 36) + ((b.fov ?? 36) - (a.fov ?? 36)) * p};
};
const idle = (t: number, side: 1 | -1, tired = 0): Pose => ({bob: 0.004 * Math.sin(t * 2.2) - 0.01 * tired, shL: [0, 0, 0.1 + 0.015 * Math.sin(t * 2.2)], shR: [0, 0, -0.1 - 0.015 * Math.sin(t * 2.2)], turn: 0.14 * side, headY: -0.05 * side, headX: 0.12 * tired, lean: 0.05 * tired});
const wave = (x: number) => { const e = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u))); return x < 0.4 ? e(x / 0.4) : 1 - e((x - 0.4) / 0.6); };
const curl = (k: number, base: Pose, side: 'L' | 'R'): Pose => {
  const sh: V3 = side === 'L' ? [-0.08 * k - 0.06 * k * k, 0, 0.12] : [-0.08 * k - 0.06 * k * k, 0, -0.12];
  return {...base, lean: (base.lean ?? 0) - 0.03 * k, ...(side === 'L' ? {shL: sh, elL: 0.22 + 2.1 * k, wrL: 0, rlL: 1.4} : {shR: sh, elR: 0.22 + 2.1 * k, wrR: 0, rlR: -1.4})};
};
const DB = <group rotation={[0, Math.PI / 2, 0]}><Dumbbell scale={0.85} /></group>;
/** yawn envelope (0..1) peaking around `at` */
const yawn = (t: number, at: number) => interpolate(t, [at - 0.35, at, at + 0.7, at + 1.0], [0, 1, 1, 0], clamp);

const S = SEG as {start: number; end: number; text: string}[];
const END = S[S.length - 1].end + 2.7;
export const EP2_TOTAL = Math.round(END * FPS);
const SC = {hook: [0, S[3].start], night: [S[3].start, S[5].start], testo: [S[5].start, S[6].start], hunger: [S[6].start, S[9].start], gym: [S[9].start, S[11].start], study: [S[11].start, S[14].start], face: [S[14].start, S[15].start], final: [S[15].start, END]} as const;
/** local time of sentence i inside the scene that starts at s0 */
const at = (i: number, s0: number) => S[i].start - s0;

const HL = ['five', 'eight.', 'eight', 'thirty', 'Five.', 'testosterone', 'ten', 'fifteen', 'percent.', 'hunger', 'Ghrelin', 'leptin', 'twenty-four', 'sugar', 'junk', 'growth', 'hormone', 'deep', 'scariest', 'fifty-five', 'fat.', 'muscle', 'darker', 'circles,', 'droopier', 'paler', 'gains', 'cheapest', 'supplement', 'sleep?', 'Same'];
const CARDS = buildCards(S.map((s) => [s.start, s.end, s.text, HL.filter((w) => s.text.split(' ').includes(w))] as [number, number, string, string[]]));

const Stage: React.FC<{cam: ReturnType<typeof camAt>; a: Pose; d: Pose; tiredD?: number; holdA?: React.ReactNode; holdD?: React.ReactNode; openD?: number; smileA?: number; smileD?: number; muscle?: number; children?: React.ReactNode; spread?: number; sweat?: number; flexA?: number; flexD?: number}> = ({cam, a, d, tiredD = 0.6, holdA, holdD, openD = 0, smileA = 0.35, smileD = 0.05, muscle = 0.3, children, spread = 0.37, sweat = 0, flexA = 0, flexD = 0}) => (
  <ThreeCanvas width={W} height={H} shadows>
    <Cam pos={cam.pos} look={cam.look} fov={cam.fov} />
    <Gym />
    <Character spec={ALEX} smile={smileA} position={[-spread, 0, 0]} pose={a} muscle={muscle} holdL={holdA} flexL={flexA} flexR={flexA} />
    <Character spec={DANIEL} smile={smileD} position={[spread, 0, 0]} pose={d} muscle={muscle} tired={tiredD} mouthOpen={openD} holdR={holdD} sweat={sweat} flexL={flexD} flexR={flexD} />
    {children}
  </ThreeCanvas>
);

/** Split-screen face close-ups: Alex fresh (left), Daniel exhausted (right). */
const Faces: React.FC<{t: number; tired: number; open: number; zoom?: number}> = ({t, tired, open, zoom = 0}) => (
  <AbsoluteFill>
    {[0, 1].map((i) => (
      <div key={i} style={{position: 'absolute', left: i * 540, top: 0, width: 540, height: H, overflow: 'hidden'}}>
        <ThreeCanvas width={540} height={H} shadows>
          <Cam pos={[i ? 0.37 : -0.37, 1.62, 1.25 - zoom]} look={[i ? 0.37 : -0.37, 1.66, 0]} fov={30} />
          <Gym light={i ? 0.75 : 1} />
          <Character spec={ALEX} position={[-0.37, 0, 0]} pose={{...idle(t, 1), turn: 0}} smile={0.45} />
          <Character spec={DANIEL} position={[0.37, 0, 0]} pose={{...idle(t, -1, tired * 0.5), turn: 0}} smile={0} tired={tired} mouthOpen={open} />
        </ThreeCanvas>
        <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 50%, ${i ? FX.red : FX.blue}55)`}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: H, background: `linear-gradient(${FX.blue}, ${FX.gold}, ${FX.red})`, boxShadow: `0 0 30px ${FX.gold}`}} />
  </AbsoluteFill>
);

/* ---------------- 1. HOOK ---------------- */
const Hook: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  if (t < at(1, 0)) {
    const z = interpolate(t, [0, 3.2], [0, 0.18]);
    const k8 = interpolate(t, [0.35, 0.6], [0, 1], clamp), k5 = interpolate(t, [1.3, 1.55], [0, 1], clamp);
    return (
      <AbsoluteFill>
        <Faces t={t} tired={1} open={yawn(t, 2.1) * 0.95} zoom={z} />
        <div style={{position: 'absolute', left: 0, width: 540, top: 230, textAlign: 'center', opacity: k8, transform: `scale(${1.6 - 0.6 * k8})`}}><div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 210, color: FX.blue, textShadow: `0 0 40px ${FX.blue}`}}>8H</div><div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 6}}>😴 SLEEP</div></div>
        <div style={{position: 'absolute', left: 540, width: 540, top: 230, textAlign: 'center', opacity: k5, transform: `scale(${1.6 - 0.6 * k5})`}}><div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 210, color: FX.red, textShadow: `0 0 40px ${FX.red}`}}>5H</div><div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 6}}>🥱 SLEEP</div></div>
        <Flash at={0} len={0.25} />
      </AbsoluteFill>
    );
  }
  const cam = camAt(t, [{t: at(1, 0), pos: [0, 1.3, 4.4], look: [0, 1.1, 0], fov: 38}, {t: at(2, 0), pos: [0.4, 1.35, 3.6], look: [0, 1.15, 0], fov: 36}, {t: 8.1, pos: [0, 1.5, 2.4], look: [0, 1.4, 0], fov: 34}]);
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={idle(t, 1)} d={idle(t, -1, 0.6)} tiredD={0.8} openD={yawn(t, 4.6) * 0.9} />
      <Flash at={at(1, 0)} len={0.15} />
      <Chip at={at(1, 0) + 0.05} text="SAME WORKOUT" icon="🏋️" x={70} y={330} out={at(2, 0)} />
      <Chip at={at(1, 0) + 0.85} text="SAME DIET" icon="🥗" x={560} y={330} out={at(2, 0)} />
      <Chip at={at(1, 0) + 1.65} text="SAME PROTEIN" icon="🥩" x={300} y={440} out={at(2, 0)} />
      <Slam at={at(2, 0) + 0.05} text="30 DAYS" size={230} color={FX.gold} top={360} glow="rgba(255,194,61,.8)" />
    </AbsoluteFill>
  );
};

/* ---------------- 2. NIGHT ---------------- */
const Night: React.FC = () => <NightSplit t={useCurrentFrame() / FPS} />;

/* ---------------- 3. TESTOSTERONE ---------------- */
const Testo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cam = camAt(t, [{t: 0, pos: [0, 1.25, 4.3], look: [0, 1.0, 0], fov: 38}, {t: 6.8, pos: [0.3, 1.2, 3.6], look: [0, 1.0, 0], fov: 36}]);
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={idle(t, 1)} d={idle(t, -1, 0.7)} tiredD={0.75} openD={yawn(t, 5.6) * 0.9} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,.75), transparent 55%)'}} />
      <DayBar day={interpolate(t, [0, 0.6], [1, 7], clamp)} total={30} />
      <TestoCard t={t} />
    </AbsoluteFill>
  );
};

/* ---------------- 4. HUNGER ---------------- */
const Hunger: React.FC = () => {
  const t = useCurrentFrame() / FPS, s0 = SC.hunger[0];
  if (t < at(8, s0)) return <HormoneCard t={t} />;
  const lt = t - at(8, s0);
  const cam = camAt(lt, [{t: 0, pos: [0.37, 1.45, 2.7], look: [0.37, 1.3, 0], fov: 34}, {t: 5.9, pos: [0.37, 1.45, 2.3], look: [0.37, 1.32, 0], fov: 34}]);
  const p24 = interpolate(lt, [1.6, 1.85], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={idle(t, 1)} d={{...idle(t, -1, 0.6), headX: 0.05, headY: Math.sin(lt * 2) * 0.12}} tiredD={0.8} smileD={0.35 * interpolate(lt, [3.2, 4], [0, 1], clamp)} openD={0.15 * interpolate(lt, [3.2, 4], [0, 1], clamp)} />
      <Cravings t={lt} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: p24, transform: `scale(${1.6 - 0.6 * p24})`}}>
        <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 200, color: '#FF8A3D', textShadow: '0 0 50px #FF8A3D'}}>+24%</div>
        <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 56, color: '#fff', letterSpacing: 6}}>HUNGER</div>
      </div>
      <Source text="SPIEGEL ET AL. · ANN INTERN MED 2004" top={1290} o={p24} />
    </AbsoluteFill>
  );
};

/* ---------------- 5. GYM ---------------- */
const GymScene: React.FC = () => {
  const t = useCurrentFrame() / FPS, s0 = SC.gym[0];
  const ghAt = at(10, s0) + 3.3; // switch to the growth-hormone graph on "because a big part..."
  if (t >= ghAt) return <GHGraph t={t - ghAt} />;
  const P = 0.42, t0 = 0.3, lt = Math.max(0, t - t0);
  const repA = Math.min(10, Math.floor(lt / P)), failAt = 7 * P;
  const kA = lt / P >= 10 ? 0 : wave((lt % P) / P);
  const kD = lt < failAt ? wave((lt % P) / P) : interpolate(lt, [failAt, failAt + 0.5, failAt + 1.2, failAt + 1.6], [0, 0.55, 0.5, 0], clamp);
  const repD = Math.min(7, Math.floor(lt / P));
  const cam = camAt(t, [{t: 0, pos: [0, 1.35, 3.5], look: [0, 1.15, 0], fov: 36}, {t: ghAt, pos: [0.2, 1.4, 2.9], look: [0.1, 1.2, 0], fov: 34}]);
  const failed = lt > failAt + 0.4;
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={curl(kA, idle(t, 1), 'L')} d={curl(kD, idle(t, -1, 0.5), 'R')} holdA={DB} holdD={DB} tiredD={0.85} sweat={(t * 1.3) % 1} openD={failed ? 0.45 : yawn(t, 0.6) * 0.8} />
      <Reps n={repA} color={FX.blue} x={70} y={300} label="ALEX" />
      <Reps n={repD} color={FX.red} x={710} y={300} label="DANIEL" fail={failed} />
      <Source text="SAME WEIGHT · ILLUSTRATIVE" top={540} />
    </AbsoluteFill>
  );
};

/* ---------------- 6. THE STUDY ---------------- */
const Study: React.FC = () => {
  const t = useCurrentFrame() / FPS, s0 = SC.study[0];
  if (t < at(12, s0)) {
    return (
      <AbsoluteFill>
        <Faces t={t} tired={0.9} open={0} zoom={0.12} />
        <AbsoluteFill style={{background: 'rgba(80,0,0,.25)'}} />
        <Slam at={0.02} text="THE SCARIEST PART" size={104} color={FX.red} top={420} glow="rgba(255,71,71,.8)" />
        <Flash at={0} len={0.2} color="#FF4747" />
      </AbsoluteFill>
    );
  }
  const lt = t - at(12, s0);
  const split = interpolate(t, [at(13, s0) + 0.3, at(13, s0) + 1.1], [0, 1], clamp) + (t > at(13, s0) + 2.2 ? 0 : 0) ;
  return <StudyBars t={lt} split={t > at(13, s0) + 2.4 ? 1 : Math.min(0.9, split)} />;
};

/* ---------------- 7. FACE ---------------- */
const Face: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Faces t={t} tired={1} open={0} zoom={0.3 + t * 0.03} />
      <Callout t={t} at={1.2} text="PALER SKIN" x={800} y={420} tx={820} ty={840} />
      <Callout t={t} at={2.0} text="DARKER CIRCLES" x={700} y={1290} tx={700} ty={1100} />
      <Callout t={t} at={2.9} text="DROOPIER EYELIDS" x={790} y={560} tx={990} ty={1035} />
      <Source text="SUNDELIN ET AL. · SLEEP 2013" top={1640} />
    </AbsoluteFill>
  );
};

/* ---------------- 8. FINAL ---------------- */
const Final: React.FC = () => {
  const t = useCurrentFrame() / FPS, s0 = SC.final[0];
  if (t >= at(17, s0)) {
    const lt = t - at(17, s0);
    return <AbsoluteFill><Stage cam={{pos: [0, 1.35, 4.4], look: [0, 1.1, 0], fov: 38}} a={idle(t, 1)} d={idle(t, -1, 0.4)} tiredD={0.6} smileD={0.4} /><AbsoluteFill style={{background: 'rgba(5,7,12,.55)'}} /><SleepPoll t={lt} /></AbsoluteFill>;
  }
  if (t >= at(16, s0)) return <SleepSupplement t={t - at(16, s0)} />;
  const flex = interpolate(t, [0.4, 0.9], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const DBL: Pose = {shL: [0, 0, 1.4], twL: Math.PI / 2, elL: 1.9, gripL: 1.4, shR: [0, 0, -1.4], twR: -Math.PI / 2, elR: 1.9, gripR: 1.4};
  const a: Pose = {...idle(t, 1), ...(flex > 0 ? {shL: [0, 0, 1.4 * flex] as V3, twL: Math.PI / 2 * flex, elL: 0.15 + 1.75 * flex, gripL: 1.4, shR: [0, 0, -1.4 * flex] as V3, twR: -Math.PI / 2 * flex, elR: 0.15 + 1.75 * flex, gripR: 1.4} : {})};
  void DBL;
  const cam = camAt(t, [{t: 0, pos: [0, 1.35, 4.2], look: [0, 1.15, 0], fov: 38}, {t: 4.4, pos: [0, 1.4, 3.4], look: [0, 1.2, 0], fov: 36}]);
  return (
    <AbsoluteFill>
      <Stage cam={cam} a={a} d={idle(t, -1, 0.9)} tiredD={1} flexA={flex} openD={yawn(t, 1.6)} smileA={0.7} />
      <Slam at={2.4} text="GAINS LEFT ON THE TABLE" size={84} color={FX.gold} top={330} glow="rgba(255,194,61,.7)" />
    </AbsoluteFill>
  );
};

const scenes: [keyof typeof SC, React.FC][] = [['hook', Hook], ['night', Night], ['testo', Testo], ['hunger', Hunger], ['gym', GymScene], ['study', Study], ['face', Face], ['final', Final]];

export const Episode02: React.FC = () => {
  const ok = useRpmBase();
  return (
    <AbsoluteFill style={{background: FX.bg}}>
      {ok && scenes.map(([k, C]) => { const [a, b] = SC[k]; const from = Math.round(a * FPS); return <Sequence key={k} from={from} durationInFrames={Math.round(b * FPS) - from}><C /></Sequence>; })}
      <Finish />
      <Subs cards={CARDS} />
      <Audio src={staticFile('audio/sleep_voice.wav')} />
      <Audio src={staticFile('audio/creatine_music.wav')} volume={(f) => 0.26 * interpolate(f, [0, 8, EP2_TOTAL - 60, EP2_TOTAL], [0, 1, 1, 0], clamp)} />
      <Audio src={staticFile('audio/sleep_sfx.wav')} volume={0.55} />
    </AbsoluteFill>
  );
};
export const EP2_SCENES = SC;
