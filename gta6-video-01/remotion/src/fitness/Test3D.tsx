import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './Character';
import {Cam, Gym} from './Gym';
import {useRpmBase} from './Human';
import {ALEX, DANIEL} from './theme';

export const Test3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const ok = useRpmBase();
  const face = f < 10;
  return ok ? (
    <ThreeCanvas width={width} height={height} shadows>
      {face ? <Cam pos={[f < 5 ? -0.42 : 0.42, 1.66, 0.85]} look={[f < 5 ? -0.42 : 0.42, 1.64, 0]} fov={24} /> : <Cam pos={[0, 1.25, 4.4]} look={[0, 1.1, 0]} fov={38} />}
      <Gym />
      <Character spec={ALEX} position={[-0.42, 0, 0]} smile={0.4} muscle={f < 20 ? 0.12 : 0.6} />
      <Character spec={DANIEL} position={[0.42, 0, 0]} smile={0.1} muscle={f < 20 ? 0.12 : 0.6} />
    </ThreeCanvas>
  ) : null;
};
