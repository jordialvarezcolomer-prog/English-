import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing, random} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Shake} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C, FONT} from '../theme';
import {PhotoCard, BlurBg} from '../components/PhotoCard';

const Pixel: React.FC<{c: string; i: number}> = ({c, i}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: ((i * 137 + frame * (3 + i % 5)) % 560) , top: (i * 83 + Math.sin(frame / 8 + i) * 60 + 100) % 440, width: 46, height: 46, background: c}} />;
};
/** Climax. Illustrative arcade-style cards (generic, NOT the real mini-games). */
export const PlayableGamesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tvP = interpolate(frame, [0, 90], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const expand = interpolate(frame, [150, 200], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const glitch = frame > 200 && frame < 214 ? (random(`g${frame}`) - 0.5) * 60 : 0;
  const cards = [C.pink, C.turquoise, C.yellow, C.green];
  return (
    <ClipSlot k="games" fallback={
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${C.purple}, ${C.ink})`}}>
        {frame < 100 && <PhotoCard src="images/bar_jason.jpg" at={0} out={92} w={900} ratio={0.67} left={90} top={520} rotate={-2} zoom={[1.0, 1.35]} focus="55% 40%" from="left" />}
        {frame >= 90 && <div style={{position: 'absolute', left: 540 - (330 + 400 * expand), top: 760 - (230 + 830 * expand), width: 660 + 800 * expand, height: 460 + 1660 * expand, borderRadius: 40 * (1 - expand), background: '#000', border: `${14 * (1 - expand)}px solid #2a2147`, overflow: 'hidden', transform: `scale(${0.4 + tvP * 0.6}) translateX(${glitch}px)`, boxShadow: `0 0 ${80 * tvP}px ${C.turquoise}`}}>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${C.ink}, #240a52)`}} />
          {frame > 100 && cards.map((c, i) => { const s = interpolate(frame, [100 + i * 14, 112 + i * 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}); return <div key={i} style={{position: 'absolute', left: 30 + (i % 2) * 300 * (1 + expand * 0.7), top: 40 + Math.floor(i / 2) * 200 * (1 + expand * 2), width: 270, height: 170, background: `linear-gradient(135deg, ${c}, ${C.ink})`, borderRadius: 20, transform: `scale(${s})`, overflow: 'hidden', border: '4px solid #fff'}}>{Array.from({length: 5}).map((_, k) => <Pixel key={k} c={c} i={k + i * 5} />)}</div>; })}
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 3px, transparent 3px 6px)'}} />
        </div>}
      </AbsoluteFill>}
    />
  );
};
export const PlayableGamesOverlay: React.FC = () => (
  <Shake amp={14} at={200} dur={40}>
    <NumberBadge n="06" label="THE BIG ONE" color={C.pink} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <KineticText text="[Wait...]" at={105} out={175} size={170} hl={C.yellow} />
      <KineticText text="You can play [video games...]" at={130} out={195} size={95} hl={C.turquoise} style={{marginTop: 20}} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 380}}>
      <KineticText text="Inside [GTA 6.]" at={215} out={290} size={150} hl={C.pink} />
      <KineticText text="A [game] inside a [game.]" at={298} size={140} hl={C.yellow} style={{marginTop: 30}} />
    </AbsoluteFill>
    <Flash at={200} /><Flash at={298} color={C.yellow} len={12} />
  </Shake>
);
