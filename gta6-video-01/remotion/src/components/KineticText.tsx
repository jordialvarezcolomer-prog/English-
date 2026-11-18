import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, FONT} from '../theme';

type Props = {
  text: string; at?: number; size?: number; color?: string; hl?: string;
  from?: 'bottom' | 'left' | 'right' | 'scale'; out?: number; rotate?: number; style?: React.CSSProperties;
};
/** Big uppercase text: spring scale-in + blur-to-sharp + optional exit at frame `out` (local frame). */
export const KineticText: React.FC<Props> = ({text, at = 0, size = 130, color = C.white, hl = C.yellow, from = 'scale', out, rotate = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < 0 || (out !== undefined && frame > out + 8)) return null;
  const p = spring({frame: t, fps, config: {damping: 11, stiffness: 160, mass: 0.7}});
  const blur = interpolate(t, [0, 8], [22, 0], {extrapolateRight: 'clamp'});
  const exit = out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const tx = from === 'left' ? (1 - p) * -500 : from === 'right' ? (1 - p) * 500 : 0;
  const ty = from === 'bottom' ? (1 - p) * 300 : 0;
  const sc = from === 'scale' ? 0.3 + 0.7 * p : 1;
  // words wrapped in [] are highlighted
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <div style={{fontFamily: FONT, fontSize: size, lineHeight: 0.95, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', letterSpacing: -2,
      color, opacity: p * exit, filter: `blur(${blur}px)`, transform: `translate(${tx}px,${ty}px) scale(${sc}) rotate(${rotate}deg)`,
      textShadow: '0 8px 0 rgba(11,6,32,.55), 0 0 40px rgba(11,6,32,.6)', WebkitTextStroke: `${size * 0.02}px ${C.ink}`, paintOrder: 'stroke fill', ...style}}>
      {parts.map((s, i) => s.startsWith('[') ? <span key={i} style={{color: hl}}>{s.slice(1, -1)}</span> : <span key={i}>{s}</span>)}
    </div>
  );
};
