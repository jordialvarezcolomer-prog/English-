import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';

/** Permanent GTA VI-style backdrop: Vice City aerial (blurred, darkened) under the signature purple→magenta sunset gradient,
 *  neon horizon glow, film grain and vignette. Identical in every scene so the whole video feels like one world. */
export const GlobalBg: React.FC = () => {
  const frame = useCurrentFrame();
  const z = 1.45 + 0.1 * Math.sin(frame / 140);
  const x = interpolate(frame, [0, 2310], [-80, 80]);
  const gx = (frame * 3) % 400;
  return (
    <AbsoluteFill style={{background: '#14042e'}}>
      <Img src={staticFile('images/vicecity_dusk_aerial.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) saturate(1.3) brightness(0.8) contrast(1.1)', transform: `translateX(${x}px) scale(${z})`}} />
      {/* GTA VI purple -> hot pink sunset wash */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(30,6,76,.88) 0%, rgba(86,24,160,.62) 38%, rgba(214,40,140,.5) 78%, rgba(255,120,70,.55) 100%)'}} />
      {/* soft neon glow bands */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 45% at 50% 100%, rgba(255,120,60,.55), transparent 70%), radial-gradient(ellipse 90% 35% at 50% 0%, rgba(140,70,255,.5), transparent 70%)'}} />
      {/* slow diagonal light streaks */}
      <AbsoluteFill style={{opacity: 0.12, background: `repeating-linear-gradient(115deg, transparent 0 ${160}px, rgba(255,255,255,.9) ${160}px ${166}px)`, transform: `translateX(${gx}px)`}} />
      {/* film grain */}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay'}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(8,0,24,.65) 100%)'}} />
    </AbsoluteFill>
  );
};
