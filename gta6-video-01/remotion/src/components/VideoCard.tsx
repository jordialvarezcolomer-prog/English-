import React from 'react';
import {OffthreadVideo, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

/** Framed gameplay clip card (muted; voice/music carry the audio). Spring entrance, slow zoom inside, light sweep. */
export const VideoCard: React.FC<{src: string; at?: number; out?: number; w?: number; ratio?: number; left?: number; top?: number; rotate?: number; focus?: string; zoom?: [number, number]; startFrom?: number}> = ({src, at = 0, out, w = 960, ratio = 0.95, left = 60, top = 230, rotate = 0, focus = '40% 55%', zoom = [1.1, 1.25], startFrom = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0 || (out !== undefined && frame > out + 10)) return null;
  const p = spring({frame: t, fps, config: {damping: 14, stiffness: 150, mass: 0.8}});
  const exit = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const z = interpolate(t, [0, 150], zoom, {extrapolateRight: 'clamp'});
  const sx = interpolate(t, [10, 38], [-120, 220], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left, top, width: w, height: w * ratio, opacity: p * exit, transform: `translateY(${(1 - p) * 700}px) rotate(${rotate}deg) scale(${0.85 + 0.15 * p})`, borderRadius: 40, overflow: 'hidden', border: '10px solid #fff', boxShadow: '0 40px 80px rgba(11,6,32,.55)'}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${z})`, transformOrigin: focus}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sx}%`, width: '18%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)', transform: 'skewX(-18deg)'}} />
    </div>
  );
};
