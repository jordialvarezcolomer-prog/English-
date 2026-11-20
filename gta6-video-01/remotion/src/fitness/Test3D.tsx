import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './Character';
import {Cam, Gym} from './Gym';
import {useRpmBase} from './Human';
import {Bottle, Tub} from './Props3D';
import {ALEX, DANIEL} from './theme';
import {DRINK_R, OLY_A, OLY_D, SHOW_TUB, STOP_R} from './poses';

/* look-dev: 0 faces A, 5 face D (tongue), 10 bodies idle, 20 olympia, 30 tub+stop, 35 drink */
export const Test3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const ok = useRpmBase();
  const face = f < 10 || f >= 40;
  const a = f >= 40 ? OLY_A : f >= 30 ? SHOW_TUB : f >= 20 ? OLY_A : {};
  const d = f >= 40 ? STOP_R : f >= 35 ? {...DRINK_R, shR: [[-1.25, 0, 0.12], [-1.45, 0, 0.2], [-1.1, 0, 0.3], [-1.35, 0.3, 0.1], [-1.25, 0, 0.12]][f - 35] as [number, number, number], elR: [2.05, 2.15, 2.25, 2.0, 1.85][f - 35]} : f >= 30 ? STOP_R : f >= 20 ? OLY_D : {};
  return ok ? (
    <ThreeCanvas width={width} height={height} shadows>
      {face ? <Cam pos={[f < 5 || f === 40 ? -0.42 : 0.42, 1.68, 0.95]} look={[f < 5 || f === 40 ? -0.42 : 0.42, 1.68, 0]} fov={26} /> : f >= 30 ? <Cam pos={[0, 1.4, 2.6]} look={[0, 1.3, 0]} fov={36} /> : <Cam pos={[0, 1.3, 4.6]} look={[0, 1.15, 0]} fov={38} />}
      <Gym />
      <Character spec={ALEX} position={[-0.45, 0, 0]} smile={0.4} muscle={f >= 20 && f < 30 ? 0.62 : 0.12} pose={a} flexL={f >= 20 && f < 30 ? 1 : 0} holdL={f >= 30 ? <Tub scale={1.1} /> : undefined} />
      <Character spec={DANIEL} position={[0.45, 0, 0]} smile={0.1} muscle={f >= 20 && f < 30 ? 0.52 : 0.12} pose={d} flexL={f >= 20 && f < 30 ? 1 : 0} tired={f >= 5 && f < 10 ? 1 : 0} holdR={f >= 35 ? <Bottle /> : undefined} />
    </ThreeCanvas>
  ) : null;
};
