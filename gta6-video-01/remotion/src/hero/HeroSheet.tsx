import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import {Muscle, Pose, buildHero} from './Hero';
import {buildMachine} from './Machine';
import {PAL} from './toon';
import {STAND, backLatSpread, doubleBiceps, lateralRaise, pushdown, threeQuarter} from './poses';

/** Look-dev / consistency test: ONE rig, many poses and cameras. Frame n = shot n. */
type Shot = {name: string; pose: Pose; glow: Partial<Record<Muscle, number>>; cam: [number, number, number]; look: [number, number, number]; fov: number; machine?: boolean};
export const SHOTS: Shot[] = [
  {name: 'side · pushdown (extended)', pose: pushdown(0.12), glow: {triceps: 1}, cam: [-6.4, 1.05, 0.3], look: [0, 1.0, 0.3], fov: 24, machine: true},
  {name: 'side · pushdown (top)', pose: pushdown(1.75), glow: {triceps: 0.0, biceps: 0}, cam: [-6.4, 1.05, 0.3], look: [0, 1.0, 0.3], fov: 24, machine: true},
  {name: 'front · relaxed (V-taper)', pose: STAND, glow: {}, cam: [0, 1.0, 5.6], look: [0, 1.0, 0], fov: 26},
  {name: 'back · lat spread', pose: backLatSpread, glow: {lats: 1, traps: 0.8}, cam: [0, 1.1, 5.2], look: [0, 1.05, 0], fov: 26},
  {name: '3/4 · front', pose: threeQuarter, glow: {}, cam: [2.8, 1.1, 4.6], look: [0, 1.0, 0], fov: 26},
  {name: 'front · lateral raise (side delts)', pose: lateralRaise(1), glow: {delt_side: 1}, cam: [0, 1.15, 5.2], look: [0, 1.1, 0], fov: 26},
  {name: 'front · double biceps', pose: doubleBiceps, glow: {biceps: 0.7}, cam: [0, 1.2, 4.6], look: [0, 1.1, 0], fov: 26},
  {name: 'close-up · face', pose: STAND, glow: {}, cam: [0.0, 1.88, 1.7], look: [0, 1.86, 0], fov: 18},
  {name: 'close-up · torso', pose: STAND, glow: {}, cam: [0.0, 1.45, 2.3], look: [0, 1.42, 0], fov: 22},
  {name: 'close-up · arm (3/4)', pose: threeQuarter, glow: {biceps: 0.0}, cam: [1.7, 1.2, 1.7], look: [0.28, 1.15, 0.1], fov: 20},
  {name: 'close-up · legs', pose: STAND, glow: {quads: 0.0}, cam: [1.4, 0.55, 2.2], look: [0, 0.5, 0], fov: 24},
];
const Cam: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov: number}> = ({pos, look, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => { camera.position.set(...pos); (camera as THREE.PerspectiveCamera).fov = fov; camera.lookAt(...look); camera.updateProjectionMatrix(); });
  return null;
};
export const HeroScene: React.FC<{shot: Shot; aspect: number}> = ({shot, aspect}) => {
  const hero = useMemo(() => buildHero(aspect), [aspect]);
  const mach = useMemo(() => buildMachine(aspect), [aspect]);
  hero.setPose(shot.pose); hero.setGlow(shot.glow);
  const hand = hero.handWorld('L', [0, -0.03, 0.04]).lerp(hero.handWorld('R', [0, -0.03, 0.04]), 0.5);
  mach.update(hand, !!shot.machine);
  return (
    <>
      <color attach="background" args={['#F3F4F1']} />
      <Cam pos={shot.cam} look={shot.look} fov={shot.fov} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}><circleGeometry args={[0.75, 48]} /><meshBasicMaterial color="#1A1F22" transparent opacity={0.16} /></mesh>
      <primitive object={hero.root} />
      {shot.machine && <primitive object={mach.group} />}
    </>
  );
};
export const HeroSheet: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const shot = SHOTS[Math.min(SHOTS.length - 1, f)];
  return <ThreeCanvas width={width} height={height}><HeroScene shot={shot} aspect={width / height} /></ThreeCanvas>;
};
export const _p = [PAL, doubleBiceps];

/** 3-second triceps pushdown loop (side view): upper arms fixed, only the elbow extends; triceps lights up on the push. */
export const HeroPushdown: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const t = f / 30, ph = (t / 1.5) % 1;
  const push = ph < 0.4 ? 0.5 - 0.5 * Math.cos((ph / 0.4) * Math.PI) : 1 - (0.5 - 0.5 * Math.cos(((ph - 0.4) / 0.6) * Math.PI)); // fast down, slow return
  const e = 1.75 - 1.63 * push;
  const camX = -6.4 + 2.4 * Math.min(1, t / 3);
  const shot: Shot = {name: 'pushdown', pose: pushdown(e), glow: {triceps: 0.15 + 0.85 * push, forearms: 0.1 * push}, cam: [camX, 1.05, 0.3 + 0.0 * t], look: [0, 1.0 + 0.1 * Math.min(1, t / 3), 0.3], fov: 24, machine: true};
  return <ThreeCanvas width={width} height={height}><HeroScene shot={shot} aspect={width / height} /></ThreeCanvas>;
};
