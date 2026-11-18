import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Whip} from '../components/Fx';
import {PhotoCard} from '../components/PhotoCard';
import {VideoCard} from '../components/VideoCard';
import {C} from '../theme';

/** Fact 4: real "painting the wall" clip -> before/after houses -> duo polaroid (timed to the narration). */
export const HouseDecorationScene: React.FC = () => (
  <AbsoluteFill>
    <VideoCard src="clips/paint_wall.mp4" at={6} out={140} w={900} ratio={0.9} left={90} top={610} rotate={-2} focus="50% 40%" zoom={[1.05, 1.25]} />
    <PhotoCard src="images/houses_ba.jpg" at={146} out={214} w={900} ratio={0.828} left={90} top={620} rotate={2} zoom={[1.0, 1.25]} from="right" />
    <PhotoCard src="images/boat_duo.jpg" at={220} w={860} left={110} top={640} rotate={-3} zoom={[1.1, 1.4]} focus="72% 50%" ratio={0.62} from="bottom" />
  </AbsoluteFill>
);
export const HouseOverlay: React.FC = () => (
  <AbsoluteFill>
    <NumberBadge n="04" label="HOME LIFE" color={C.orange} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 215}}>
      <KineticText text="Yes, you can [decorate]" at={8} out={102} size={78} hl={C.turquoise} from="bottom" />
      <KineticText text="Jason's [beach house]" at={22} out={102} size={82} hl={C.pink} style={{marginTop: 12}} />
      <KineticText text="Even [build furniture] together" at={108} size={80} hl={C.yellow} />
    </AbsoluteFill>
    <Flash at={6} /><Whip at={140} color={C.orange} /><Flash at={146} />
  </AbsoluteFill>
);
