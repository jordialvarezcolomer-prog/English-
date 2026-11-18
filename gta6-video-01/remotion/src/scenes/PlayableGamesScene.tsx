import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Shake} from '../components/Fx';
import {PhotoCard} from '../components/PhotoCard';
import {C} from '../theme';
import {OffthreadVideo} from 'remotion';

/** Climax: Jason at the console -> TV powers on -> REAL mini-game footage (zombie game, "DAY 54") expands with glitch + bass hit. */
export const PlayableGamesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const on = spring({frame: frame - 88, fps, config: {damping: 12, stiffness: 120}});
  const grow = interpolate(frame, [146, 200], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const glitch = frame > 200 && frame < 216 ? (random(`g${frame}`) - 0.5) * 50 : 0;
  const w = 660 + 280 * grow, h = 470 + 360 * grow;
  const bright = frame < 100 ? 0 : 1;
  return (
    <AbsoluteFill>
      {frame < 100 && <PhotoCard src="images/bar_jason.jpg" at={0} out={92} w={900} ratio={0.67} left={90} top={520} rotate={-2} zoom={[1.0, 1.35]} focus="55% 40%" from="left" />}
      {frame >= 88 && (
        <div style={{position: 'absolute', left: 540 - w / 2 + glitch, top: 930 - h / 2, width: w, height: h, borderRadius: 34, overflow: 'hidden', border: '12px solid #0B0620', outline: `6px solid ${C.turquoise}`, boxShadow: `0 0 ${50 + 70 * grow}px ${C.turquoise}, 0 0 120px ${C.pink}88`, transform: `scale(${0.5 + 0.5 * on})`, opacity: on}}>
          <OffthreadVideo src={staticFile('clips/zombie_game.mp4')} muted startFrom={0} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1.25 * bright}) contrast(1.1) saturate(1.2)`}} />
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 6px)'}} />
        </div>
      )}
    </AbsoluteFill>
  );
};
export const PlayableGamesOverlay: React.FC = () => (
  <Shake amp={14} at={200} dur={40}>
    <NumberBadge n="06" label="THE BIG ONE" color={C.pink} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 215}}>
      <KineticText text="The [last one]" at={4} out={78} size={118} hl={C.yellow} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 215}}>
      <KineticText text="[Fully playable] games" at={84} out={142} size={84} hl={C.turquoise} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 215}}>
      <KineticText text="Not [fake.]" at={146} out={188} size={130} hl={C.red} />
      <KineticText text="[Real] mini-games" at={192} out={250} size={96} hl={C.pink} />
      <KineticText text="A [game] inside a [game.]" at={256} size={100} hl={C.yellow} />
    </AbsoluteFill>
    <Flash at={146} /><Flash at={292} color={C.yellow} len={12} />
  </Shake>
);
