import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash} from '../components/Fx';
import {C} from '../theme';

export const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 90], [1.45, 1.1]);
  return (
    <AbsoluteFill style={{background: C.purple}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}><Img src={staticFile('images/vicecity_dusk_aerial.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.4) brightness(1.1)'}} /></AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 30%, ${C.ink}aa)`}} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 420}}>
        <KineticText text="Which one [surprised] you the most?" at={4} size={115} hl={C.yellow} style={{padding: '0 70px'}} />
        <KineticText text="Comment [below]" at={40} size={80} hl={C.turquoise} style={{marginTop: 40}} />
      </AbsoluteFill>
      <Flash at={0} />
    </AbsoluteFill>
  );
};
