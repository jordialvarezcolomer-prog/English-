import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, random} from 'remotion';
import {C} from '../theme';

/** Camera shake applied to children; amplitude can decay from `at`. */
export const Shake: React.FC<{amp?: number; at?: number; dur?: number; children: React.ReactNode}> = ({amp = 6, at = 0, dur = 999, children}) => {
  const frame = useCurrentFrame();
  const k = frame >= at && frame < at + dur ? interpolate(frame, [at, at + Math.min(dur, 20)], [1, 0.25], {extrapolateRight: 'clamp'}) : 0;
  const dx = (random(`x${frame}`) - 0.5) * 2 * amp * k, dy = (random(`y${frame}`) - 0.5) * 2 * amp * k;
  return <AbsoluteFill style={{transform: `translate(${dx}px,${dy}px)`}}>{children}</AbsoluteFill>;
};
/** White/pink impact flash on a given local frame. */
export const Flash: React.FC<{at: number; color?: string; len?: number}> = ({at, color = C.white, len = 7}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + len], [0, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};
/** Fast whip-pan wipe: coloured bar sweeping across the frame at `at`. */
export const Whip: React.FC<{at: number; color?: string}> = ({at, color = C.pink}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at, at + 9], [-1200, 1300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at || frame > at + 9) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', top: 0, bottom: 0, width: 1100, left: x, background: `linear-gradient(90deg, transparent, ${color}, ${C.white}, ${color}, transparent)`, transform: 'skewX(-18deg)', opacity: 0.95}} /></AbsoluteFill>;
};
/** Number badge "01" etc. */
export const NumberBadge: React.FC<{n: string; label: string; color?: string}> = ({n, label, color = C.pink}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 120, left: 60, display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - p) * -400}px)`, opacity: p}}>
      <div style={{background: color, color: C.white, fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 90, padding: '6px 26px', borderRadius: 18, boxShadow: '0 10px 0 rgba(0,0,0,.35)'}}>{n}</div>
      <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 40, color: C.white, textShadow: '0 4px 0 rgba(11,6,32,.6)', letterSpacing: 2}}>{label}</div>
    </div>
  );
};
