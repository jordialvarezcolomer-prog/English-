import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Shake, Whip} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C} from '../theme';
import {PhotoCard, BlurBg} from '../components/PhotoCard';

export const RandomEventsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const frozen = frame >= 150 && frame < 165;
  const f = frozen ? 150 : frame;
  const lineY = (f * 40) % 200;
  const zoom = interpolate(frame, [165, 260], [1, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const alertP = interpolate(frame, [140, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <ClipSlot k="events" fallback={
      <AbsoluteFill style={{background: `linear-gradient(${C.orange}88, ${C.pink}88 55%, ${C.purple}aa)`, transform: `scale(${zoom})`}}>
        {/* perspective road */}
        <div style={{position: 'absolute', left: -200, right: -200, top: 760, bottom: 0, background: '#2a2147cc', transform: 'perspective(700px) rotateX(58deg)', transformOrigin: 'top'}}>
          {Array.from({length: 12}).map((_, i) => <div key={i} style={{position: 'absolute', left: '49.2%', width: '1.6%', height: 110, top: i * 200 + lineY - 200, background: C.yellow}} />)}
        </div>
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', top: 820 + i * 150, left: ((f * (8 + i * 4) + i * 400) % 1500) - 200, width: 220, height: 90, borderRadius: 24, background: [C.turquoise, C.white, C.yellow][i], boxShadow: '0 16px 0 rgba(0,0,0,.3)'}} />)}
        <PhotoCard src="images/duo_bike_chase.jpg" at={6} out={150} w={860} left={110} top={640} rotate={2.5} zoom={[1.05, 1.35]} focus="55% 50%" from="right" />
        <PhotoCard src="images/car_meet.jpg" at={160} w={900} left={90} top={680} rotate={-2} zoom={[1.0, 1.5]} focus="40% 60%" from="bottom" />
        <div style={{position: 'absolute', top: 300, left: 740, width: 220, height: 200, opacity: alertP, transform: `scale(${0.6 + alertP * 0.4}) rotate(${(1 - alertP) * 20}deg)`}}>
          <svg viewBox="0 0 100 90"><polygon points="50,4 96,86 4,86" fill={C.red} stroke={C.white} strokeWidth="5" /><text x="50" y="72" textAnchor="middle" fontSize="54" fontWeight="900" fill={C.white} fontFamily="Montserrat">!</text></svg>
        </div>
      </AbsoluteFill>}
    />
  );
};
export const RandomEventsOverlay: React.FC = () => (
  <Shake amp={9} at={150} dur={60}>
    <NumberBadge n="02" label="LIVING WORLD" color={C.orange} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <KineticText text="[Random] events" at={14} out={130} size={140} hl={C.yellow} from="bottom" />
      <KineticText text="[Unexpected] crashes" at={150} out={235} size={120} hl={C.red} />
      <KineticText text="Every drive is [different]" at={245} size={115} hl={C.turquoise} />
    </AbsoluteFill>
    <Whip at={138} color={C.yellow} /><Flash at={150} />
  </Shake>
);
