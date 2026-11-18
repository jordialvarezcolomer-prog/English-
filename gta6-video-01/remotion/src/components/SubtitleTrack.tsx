import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, FPS} from '../theme';
import captions from '../captions.json';

type Cap = {t0: number; t1: number; words: string[]; hl?: number[]};
/** Modern karaoke captions: <=3 words per card, active word in a gradient pill, no heavy outline.
 *  Safe zone: y 1290-1560 (above TikTok/Reels bottom UI), x 70-930 (clear of right-hand buttons).
 *  Word timing is proportional to letters inside each card; swap for real timestamps when the voice exists. */
export const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const cap = (captions as Cap[]).find((c) => s >= c.t0 && s < c.t1);
  if (!cap) return null;
  const letters = cap.words.map((w) => w.length + 1), total = letters.reduce((a, b) => a + b, 0);
  let acc = cap.t0; const spans = letters.map((l) => { const a = acc; acc += ((cap.t1 - cap.t0) * l) / total; return [a, acc]; });
  const enter = interpolate(s, [cap.t0, cap.t0 + 0.1], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 70, width: 860, top: 1330, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px 14px', opacity: enter, transform: `translateY(${(1 - enter) * 24}px)`}}>
      {cap.words.map((w, i) => {
        const active = s >= spans[i][0] && s < spans[i][1];
        const pop = active ? interpolate(s, [spans[i][0], spans[i][0] + 0.08], [0.9, 1.08], {extrapolateRight: 'clamp'}) : 1;
        return (
          <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 82, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: -1, padding: '2px 18px 6px', borderRadius: 22,
            color: '#fff', background: active ? `linear-gradient(135deg, ${C.pink}, ${C.purple})` : 'rgba(11,6,32,.38)', transform: `scale(${pop}) rotate(${active ? -1.5 : 0}deg)`,
            textShadow: '0 4px 14px rgba(11,6,32,.7)', boxShadow: active ? `0 10px 30px ${C.pink}88` : 'none', backdropFilter: 'blur(6px)'}}>{w}</span>
        );
      })}
    </div>
  );
};
