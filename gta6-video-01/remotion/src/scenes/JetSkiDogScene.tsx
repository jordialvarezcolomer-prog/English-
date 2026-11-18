import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, random} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Whip} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C} from '../theme';
import {PhotoCard} from '../components/PhotoCard';
import {VideoCard} from '../components/VideoCard';

const Wave: React.FC<{y: number; color: string; amp: number; speed: number; o?: number}> = ({y, color, amp, speed, o = 0.0}) => {
  const frame = useCurrentFrame();
  const pts = Array.from({length: 33}, (_, i) => `${i * 36},${y + Math.sin(i * 0.7 + frame * speed) * amp}`).join(' ');
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: o}}><polygon points={`0,1920 ${pts} 1152,1920`} fill={color} /></svg>;
};
export const JetSkiDogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase2 = frame >= 150; // dog / fetch half
  const ballX = interpolate(frame, [190, 260], [-100, 1180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ballY = 760 - Math.sin(interpolate(frame, [190, 260], [0, Math.PI], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})) * 360;
  return (
    <ClipSlot k="jetski" fallback={
      <AbsoluteFill style={{background: 'transparent'}}>
        {!phase2 && (<>
          {Array.from({length: 26}).map((_, i) => { const t = (frame * (6 + random(`s${i}`) * 8) + random(`o${i}`) * 1000) % 1300; return <div key={i} style={{position: 'absolute', left: 80 + random(`l${i}`) * 900, top: 1500 - t, width: 14, height: 14, borderRadius: 14, background: 'white', opacity: 0.8 - t / 1700}} />; })}
          <VideoCard src="clips/dog_jetski.mp4" at={0} out={142} w={940} ratio={0.95} left={70} top={400} rotate={-1.5} focus="52% 85%" zoom={[1.5, 1.75]} />
          <Wave y={1340} color="#0CB3C8" amp={26} speed={0.25} /><Wave y={1420} color="#0A8FB5" amp={34} speed={0.33} /><Wave y={1500} color="#075E92" amp={40} speed={0.4} />
        </>)}
        {phase2 && (<>
          <PhotoCard src="images/boat_duo.jpg" at={150} w={900} left={90} top={540} rotate={2} zoom={[1.05, 1.4]} focus="72% 50%" from="right" />
          <Wave y={1450} color={C.turquoise} amp={16} speed={0.2} />
          <div style={{position: 'absolute', left: ballX, top: ballY, width: 120, height: 120, borderRadius: 60, background: `radial-gradient(circle at 35% 30%, ${C.white}, ${C.pink})`, boxShadow: '0 20px 0 rgba(0,0,0,.2)'}} />
        </>)}
      </AbsoluteFill>}
    />
  );
};
export const JetSkiDogOverlay: React.FC = () => (
  <AbsoluteFill>
    <NumberBadge n="01" label="LEONIDA LIFE" color={C.turquoise} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
      <KineticText text="[Jet skis]" at={20} out={140} size={190} hl={C.yellow} from="left" />
      <KineticText text="Dog [interactions]" at={160} out={235} size={130} hl={C.pink} from="right" />
      <KineticText text="Even play [fetch]" at={240} size={140} hl={C.turquoise} />
    </AbsoluteFill>
    <Flash at={20} color={C.turquoise} /><Whip at={146} /><Flash at={160} />
  </AbsoluteFill>
);
