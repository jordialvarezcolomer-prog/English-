import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './Character';
import {Cam, Dumbbell, Gym} from './Gym';
import {ALEX, DANIEL} from './theme';

export const Test3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const c = 0.5 - 0.5 * Math.cos(f * 0.2);
  return (
    <ThreeCanvas width={width} height={height} shadows>
      <Cam pos={[0, 1.35, 4.6]} look={[0, 1.05, 0]} fov={38} />
      <Gym />
      <Character spec={ALEX} position={[-0.5, 0, 0]} pose={{turn: 0.25, shL: [0, 0, 0.1], elL: 0.3 + 2.0 * c}} flexL={c} holdL={<group rotation={[0, Math.PI / 2, 0]}><Dumbbell scale={0.8} /></group>} />
      <Character spec={DANIEL} position={[0.5, 0, 0]} pose={{turn: -0.25, shR: [0, 0, -0.1], elR: 0.3 + 2.0 * c}} flexR={c} holdR={<group rotation={[0, Math.PI / 2, 0]}><Dumbbell scale={0.8} /></group>} />
    </ThreeCanvas>
  );
};
