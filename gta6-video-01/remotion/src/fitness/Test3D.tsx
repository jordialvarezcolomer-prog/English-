import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './Character';
import {Cam, Gym} from './Gym';
import {ALEX, DANIEL} from './theme';

/** Look-dev test: frame 0-9 face close-up, 10-19 body (muscle 0.1), 20-29 body (muscle 0.65). */
export const Test3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const face = f < 10, mus = f < 20 ? 0.1 : 0.65;
  const flex = {shL: [0, 0, 1.4] as [number, number, number], twL: Math.PI / 2, elL: 1.9, shR: [0, 0, -1.4] as [number, number, number], twR: -Math.PI / 2, elR: 1.9};
  return (
    <ThreeCanvas width={width} height={height} shadows>
      {face ? <Cam pos={[f < 5 ? -0.5 : 0.5, 1.64, 0.95]} look={[f < 5 ? -0.5 : 0.5, 1.63, 0]} fov={22} /> : <Cam pos={[0, 1.25, 4.9]} look={[0, 1.1, 0]} fov={38} />}
      <Gym />
      <Character spec={ALEX} position={[-0.5, 0, 0]} pose={face ? {} : flex} muscle={mus} flexL={face ? 0 : 1} flexR={face ? 0 : 1} />
      <Character spec={DANIEL} position={[0.5, 0, 0]} pose={face ? {} : flex} muscle={mus} flexL={face ? 0 : 1} flexR={face ? 0 : 1} />
    </ThreeCanvas>
  );
};
