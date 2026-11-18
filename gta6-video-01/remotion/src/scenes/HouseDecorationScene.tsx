import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C, FONT} from '../theme';
import {PhotoCard, BlurBg} from '../components/PhotoCard';

const Room: React.FC<{furnished: boolean}> = ({furnished}) => (
  <AbsoluteFill style={{background: furnished ? `linear-gradient(${C.yellow}99, ${C.orange}99)` : 'linear-gradient(#cfd8e399,#9aa8ba99)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 820, background: furnished ? '#B5683Aaa' : '#8795a8aa'}} />
    {furnished && (<>
      <div style={{position: 'absolute', left: 120, top: 1040, width: 520, height: 150, borderRadius: 30, background: C.turquoise, boxShadow: '0 20px 0 rgba(0,0,0,.25)'}} />
      <div style={{position: 'absolute', left: 150, top: 1180, width: 340, height: 18, background: '#5a2e12'}} />
      <div style={{position: 'absolute', left: 700, top: 980, width: 190, height: 260, borderRadius: '50% 50% 0 0', background: C.green}} />
      <div style={{position: 'absolute', left: 80, top: 520, width: 300, height: 380, background: C.pink, border: '14px solid #fff'}} />
    </>)}
  </AbsoluteFill>
);
export const HouseDecorationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [110, 150], [0, 100], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const heart = interpolate(frame, [230, 260], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const z = interpolate(frame, [0, 330], [1, 1.2]);
  return (
    <ClipSlot k="house" fallback={
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <Room furnished={false} />
        <AbsoluteFill style={{clipPath: `inset(0 ${100 - wipe}% 0 0)`}}><Room furnished /></AbsoluteFill>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${wipe}%`, width: 10, background: '#fff', opacity: wipe > 0 && wipe < 100 ? 1 : 0}} />
        <div style={{position: 'absolute', top: 1180, left: 60, fontFamily: FONT, fontSize: 56, color: '#fff', textShadow: '0 4px 0 #0B0620', opacity: wipe < 100 ? 1 : 0}}>BEFORE</div>
        <div style={{position: 'absolute', top: 1180, right: 170, fontFamily: FONT, fontSize: 56, color: C.ink, opacity: wipe > 60 ? 1 : 0}}>AFTER</div>
        <PhotoCard src="images/boat_duo.jpg" at={215} w={640} left={380} top={700} rotate={5} zoom={[1.15, 1.35]} focus="72% 50%" ratio={0.7} />
        <div style={{position: 'absolute', left: 340, top: 650, fontSize: 130, opacity: heart, transform: `scale(${0.5 + heart * 0.6}) translateY(${(1 - heart) * 80}px)`}}>💞</div>
      </AbsoluteFill>}
    />
  );
};
export const HouseOverlay: React.FC = () => (
  <AbsoluteFill>
    <NumberBadge n="04" label="HOME LIFE" color={C.orange} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 280}}>
      <KineticText text="Yes, you can [decorate]" at={20} out={150} size={105} hl={C.turquoise} from="bottom" />
      <KineticText text="Jason's [beach house]" at={36} out={150} size={110} hl={C.pink} style={{marginTop: 20}} />
      <KineticText text="Even [build furniture] together" at={200} size={100} hl={C.yellow} />
    </AbsoluteFill>
    <Flash at={110} />
  </AbsoluteFill>
);
