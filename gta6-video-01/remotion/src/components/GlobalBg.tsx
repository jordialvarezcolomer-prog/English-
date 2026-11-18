import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C} from '../theme';

/** Permanent background: the Vice City aerial, heavily blurred, slowly drifting, with a neon colour wash. */
export const GlobalBg: React.FC = () => {
  const frame = useCurrentFrame();
  const z = 1.5 + 0.12 * Math.sin(frame / 120);
  const x = interpolate(frame, [0, 2310], [-90, 90]);
  return (
    <AbsoluteFill style={{background: C.purple}}>
      <Img src={staticFile('images/vicecity_dusk_aerial.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) saturate(1.7) brightness(1.2)', transform: `translateX(${x}px) scale(${z})`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.pink}44, transparent 40%, ${C.turquoise}33)`, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
