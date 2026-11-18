import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, Easing} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, Shake, Whip} from '../components/Fx';
import {C} from '../theme';

/** Opening: fast aerial push-in over Vice City + kinetic title. Never static, never dark. */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 180], [1.0, 1.35], {easing: Easing.out(Easing.cubic)});
  const px = interpolate(frame, [0, 180], [-120, 140]);
  const layer = (scale: number, par: number, op = 1, filter = '') => (
    <AbsoluteFill style={{opacity: op, transform: `translateX(${px * par}px) scale(${z * scale})`, filter}}>
      <Img src={staticFile('images/vicecity_dusk_aerial.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%'}} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: C.purple}}>
      <Shake amp={5} at={0} dur={14}>
        {layer(1.55, 1, 1, 'saturate(1.45) brightness(1.18) contrast(1.05)')}
        <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.pink}55 0%, transparent 35%, ${C.turquoise}33 100%)`, mixBlendMode: 'screen'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(11,6,32,.45) 100%)'}} />
      </Shake>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 520}}>
        <KineticText text="Did you know" at={4} size={104} />
        <KineticText text="these [6 things]" at={16} size={104} hl={C.turquoise} />
        <KineticText text="about [GTA 6]?" at={28} size={120} hl={C.pink} />
        <div style={{height: 40}} />
        <KineticText text="The last one will [blow your mind.]" at={100} size={78} hl={C.yellow} style={{padding: '0 90px'}} />
      </AbsoluteFill>
      <Flash at={4} /><Flash at={100} color={C.yellow} /><Whip at={166} color={C.turquoise} />
    </AbsoluteFill>
  );
};
