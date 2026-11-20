import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './Character';
import {Cam, Gym} from './Gym';
import {useRpmBase} from './Human';
import {Tub} from './Props3D';
import {ALEX, DANIEL} from './theme';

/* look-dev: f<10 faces, 10-19 bodies (muscle .12), 20-29 bodies (muscle .6), 30+ tub presenting */
export const Test3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const ok = useRpmBase();
  const face = f < 10;
  const m = f < 20 ? 0.12 : 0.6;
  const present = f >= 30;
  return ok ? (
    <ThreeCanvas width={width} height={height} shadows>
      {face ? <Cam pos={[f < 5 ? -0.42 : 0.42, 1.66, 0.85]} look={[f < 5 ? -0.42 : 0.42, 1.64, 0]} fov={24} /> : present ? <Cam pos={[-0.2, 1.4, 2.4]} look={[-0.3, 1.25, 0]} fov={36} /> : <Cam pos={[0, 1.25, 4.4]} look={[0, 1.1, 0]} fov={38} />}
      <Gym />
      <Character spec={ALEX} position={[-0.42, 0, 0]} smile={0.4} muscle={m} pose={present ? {shL: [-1.05, 0.1, 0.32], elL: 1.5, wrL: 0.2} : f >= 25 ? {shL: [0, 0, 1.4], twL: Math.PI / 2, elL: 1.85, shR: [0, 0, -1.4], twR: -Math.PI / 2, elR: 1.85} : {}} holdL={present ? <Tub scale={1.1} /> : undefined} flexL={f >= 25 ? 1 : 0} flexR={f >= 25 ? 1 : 0} />
      <Character spec={DANIEL} position={[0.42, 0, 0]} smile={0.1} muscle={m} />
    </ThreeCanvas>
  ) : null;
};
