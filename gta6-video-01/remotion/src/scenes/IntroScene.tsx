import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, Shake, Whip} from '../components/Fx';
import {C} from '../theme';
import {PhotoCard} from '../components/PhotoCard';
import {VideoCard} from '../components/VideoCard';

/** One tile of the hook mosaic: muted gameplay clip popping in with a spring, zoomed on its subject. */
const Tile: React.FC<{src: string; at: number; left: number; top: number; rot: number; focus: string; zoom: number; from: number}> = ({src, at, left, top, rot, focus, zoom, from}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 170, mass: 0.7}});
  const out = interpolate(frame, [88, 98], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at) return null;
  return (
    <div style={{position: 'absolute', left, top, width: 440, height: 340, opacity: p * out, transform: `scale(${0.6 + 0.4 * p}) rotate(${rot}deg)`, borderRadius: 30, overflow: 'hidden', border: '8px solid #fff', boxShadow: '0 30px 60px rgba(11,6,32,.55)'}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={from} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transformOrigin: focus, transform: `scale(${zoom})`}} />
    </div>
  );
};

/** Opening: fast aerial push-in over Vice City + kinetic title. Never static, never dark. */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 180], [1.0, 1.18], {easing: Easing.out(Easing.cubic)});
  const px = interpolate(frame, [0, 180], [-120, 140]);
  const layer = (scale: number, par: number, op = 1, filter = '') => (
    <AbsoluteFill style={{opacity: op, transform: `translateX(${px * par}px) scale(${z * scale})`, filter}}>
      <Img src={staticFile('images/cover_sunset.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%'}} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: C.purple}}>
      <Shake amp={5} at={0} dur={14}>
        {layer(1.12, 0.5, 1, 'saturate(1.25) contrast(1.05)')}
        <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.pink}55 0%, transparent 35%, ${C.turquoise}33 100%)`, mixBlendMode: 'screen'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(11,6,32,.45) 100%)'}} />
      </Shake>
      <Tile src="clips/dog_jetski.mp4" at={0} left={80} top={220} rot={-3} focus="52% 85%" zoom={1.5} from={20} />
      <Tile src="clips/road_crash.mp4" at={5} left={560} top={240} rot={3} focus="55% 55%" zoom={1.2} from={40} />
      <Tile src="clips/social_feed.mp4" at={10} left={80} top={600} rot={2} focus="86% 50%" zoom={1.35} from={10} />
      <Tile src="clips/paint_wall.mp4" at={15} left={560} top={620} rot={-2} focus="50% 40%" zoom={1.15} from={15} />
      <PhotoCard src="images/logo_hero.jpg" at={22} out={92} w={470} ratio={0.667} left={305} top={500} rotate={-4} zoom={[1.0, 1.15]} from="top" />
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, paddingTop: 960}}>
        <KineticText text="Did you know" at={4} out={92} size={104} />
        <KineticText text="these [6 things]" at={16} out={92} size={104} hl={C.turquoise} />
        <KineticText text="about [GTA 6]?" at={28} out={92} size={120} hl={C.pink} />
      </AbsoluteFill>
      <VideoCard src="clips/zombie_game.mp4" at={98} w={900} ratio={0.8} left={90} top={500} rotate={-2} focus="50% 50%" zoom={[1.1, 1.3]} startFrom={150} />
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 215}}>
        <KineticText text="The last one will" at={100} size={88} />
        <KineticText text="[blow your mind.]" at={106} size={96} hl={C.yellow} style={{whiteSpace: 'nowrap'}} />
      </AbsoluteFill>
      <Flash at={4} /><Flash at={100} color={C.yellow} /><Whip at={166} color={C.turquoise} />
    </AbsoluteFill>
  );
};
