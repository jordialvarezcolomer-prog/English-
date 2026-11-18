import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Shake, Whip} from '../components/Fx';
import {VideoCard} from '../components/VideoCard';
import {C} from '../theme';

/** Fact 2: real clip of a plane flying between skyscrapers. NOTE: the "it does not explode" claim comes from the user; it is NOT verified. */
export const PlanesScene: React.FC = () => (
  <AbsoluteFill>
    <VideoCard src="clips/planes_skyscrapers.mp4" at={4} w={960} ratio={0.82} left={60} top={470} rotate={-1} focus="52% 50%" zoom={[1.05, 1.3]} startFrom={120} />
  </AbsoluteFill>
);
export const PlanesOverlay: React.FC = () => (
  <Shake amp={10} at={108} dur={30}>
    <NumberBadge n="02" label="PLANES" color={C.purple} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="[Planes?]" at={2} out={30} size={150} hl={C.yellow} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="Into a [skyscraper]" at={34} out={104} size={96} hl={C.turquoise} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="It [doesn't explode]" at={108} out={156} size={104} hl={C.red} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="How is that [possible?!]" at={160} size={92} hl={C.pink} />
    </AbsoluteFill>
    <Flash at={34} color={C.turquoise} /><Flash at={108} color={C.red} /><Whip at={200} />
  </Shake>
);
