import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, FPS} from '../theme';
import captions from '../captions.json';

type Cap = {t0: number; t1: number; words: string[]; hl?: number[]};
/** Phrase-by-phrase captions, keyword highlighted. captions.json times are seconds; replace with ElevenLabs word timestamps. */
export const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const cap = (captions as Cap[]).find((c) => s >= c.t0 && s < c.t1);
  if (!cap) return null;
  const pop = interpolate(s, [cap.t0, cap.t0 + 0.12], [0.85, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 70, right: 150, top: 1330, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 18px', transform: `scale(${pop})`}}>
      {cap.words.map((w, i) => (
        <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, textTransform: 'uppercase', color: cap.hl?.includes(i) ? C.yellow : C.white,
          textShadow: '0 6px 0 rgba(11,6,32,.85), 0 0 30px rgba(11,6,32,.7)', WebkitTextStroke: `4px ${C.ink}`, paintOrder: 'stroke fill'}}>{w}</span>
      ))}
    </div>
  );
};
