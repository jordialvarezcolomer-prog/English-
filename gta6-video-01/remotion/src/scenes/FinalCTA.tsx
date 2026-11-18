import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash} from '../components/Fx';
import {C} from '../theme';
import {PhotoCard} from '../components/PhotoCard';

export const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 90], [1.45, 1.1]);
  return (
    <AbsoluteFill style={{background: C.purple}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}><Img src={staticFile('images/vicecity_dusk_aerial.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.4) brightness(1.1)'}} /></AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 30%, ${C.ink}aa)`}} />
      <PhotoCard src="images/cover_ps5.jpg" at={4} w={560} ratio={1} left={260} top={300} rotate={-4} zoom={[1.0, 1.06]} radius={24} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 960}}>
        <KineticText text="[November 19]" at={20} size={104} hl={C.yellow} />
        <KineticText text="PS5 · Xbox Series X|S" at={34} size={46} style={{marginTop: 24}} />
      </AbsoluteFill>
      <Flash at={0} />
    </AbsoluteFill>
  );
};
