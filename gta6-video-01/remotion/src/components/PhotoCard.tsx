import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

/** Soft blurred, graded version of an image filling the frame (hides low source resolution). */
export const BlurBg: React.FC<{src: string; tint?: string; opacity?: number}> = ({src, tint = '#7B2CFF', opacity = 0.65}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(34px) saturate(1.6) brightness(1.05)', transform: `scale(${1.35 + frame / 900})`}} />
      <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light', opacity: 0.6}} />
    </AbsoluteFill>
  );
};
type CardProps = {src: string; at?: number; out?: number; w?: number; left?: number; top?: number; rotate?: number; zoom?: [number, number]; focus?: string; ratio?: number; shine?: boolean; radius?: number; from?: 'left' | 'right' | 'bottom' | 'top'};
/** Framed photo card: spring entrance, tilt, Ken Burns inside the frame, light sweep, drop shadow. */
export const PhotoCard: React.FC<CardProps> = ({src, at = 0, out, w = 900, left = 90, top = 500, rotate = 0, zoom = [1.05, 1.3], focus = '50% 50%', ratio = 0.5625, shine = true, radius = 36, from = 'bottom'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0 || (out !== undefined && frame > out + 10)) return null;
  const p = spring({frame: t, fps, config: {damping: 13, stiffness: 140, mass: 0.8}});
  const exit = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const dx = from === 'left' ? (1 - p) * -900 : from === 'right' ? (1 - p) * 900 : 0;
  const dy = from === 'bottom' ? (1 - p) * 700 : from === 'top' ? (1 - p) * -700 : 0;
  const z = interpolate(t, [0, 150], zoom, {extrapolateRight: 'clamp'});
  const sx = interpolate(t, [12, 40], [-120, 220], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h = w * ratio;
  return (
    <div style={{position: 'absolute', left, top, width: w, height: h, opacity: p * exit, transform: `translate(${dx}px,${dy}px) rotate(${rotate + (1 - p) * 6}deg) scale(${0.85 + 0.15 * p})`, borderRadius: radius, overflow: 'hidden', border: '10px solid #fff', boxShadow: '0 40px 80px rgba(11,6,32,.55), 0 0 0 4px rgba(11,6,32,.35)'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${z})`, filter: 'saturate(1.12) contrast(1.05)'}} />
      {shine && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sx}%`, width: '18%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)', transform: 'skewX(-18deg)'}} />}
    </div>
  );
};
