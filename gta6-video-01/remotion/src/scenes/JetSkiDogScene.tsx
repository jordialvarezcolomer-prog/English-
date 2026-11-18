import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Whip} from '../components/Fx';
import {PhotoCard} from '../components/PhotoCard';
import {VideoCard} from '../components/VideoCard';
import {C} from '../theme';

/** Fact 1: jet ski with the dog on board (real clip) -> beach interaction (real clip) -> "one detailed world". Timed to the narration. */
export const JetSkiDogScene: React.FC = () => (
  <AbsoluteFill>
    <VideoCard src="clips/dog_jetski.mp4" at={0} out={164} w={940} ratio={0.95} left={70} top={400} rotate={-1.5} focus="52% 85%" zoom={[1.5, 1.75]} />
    <VideoCard src="clips/beach_people.mp4" at={172} out={332} w={940} ratio={0.95} left={70} top={400} rotate={1.5} focus="45% 60%" zoom={[1.2, 1.45]} startFrom={60} />
    <PhotoCard src="images/boat_duo.jpg" at={338} w={900} left={90} top={540} rotate={2} zoom={[1.05, 1.4]} focus="72% 50%" from="right" />
  </AbsoluteFill>
);
export const JetSkiDogOverlay: React.FC = () => (
  <AbsoluteFill>
    <NumberBadge n="01" label="LEONIDA LIFE" color={C.turquoise} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="[Jet skis]" at={4} out={84} size={190} hl={C.yellow} from="left" />
      <KineticText text="With your [dog]" at={90} out={168} size={120} hl={C.pink} from="right" />
      <KineticText text="Hit the [beach]" at={180} out={290} size={130} hl={C.turquoise} />
      <KineticText text="[Interact] with everyone" at={232} out={332} size={78} hl={C.yellow} style={{marginTop: 10}} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="One [detailed] world" at={338} size={100} hl={C.yellow} />
    </AbsoluteFill>
    <Flash at={4} color={C.turquoise} /><Whip at={166} /><Flash at={172} /><Flash at={338} color={C.yellow} />
  </AbsoluteFill>
);
