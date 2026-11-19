import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import {FONT} from './kit';
import {SEGMENTS} from './timeline';

type Card = {t0: number; t1: number; words: {w: string; a: number}[]};
const cards: Card[] = [];
for (const [a, b, text] of SEGMENTS) {
  const w = text.split(' '); const n = w.length; const k = Math.ceil(n / 4); const size = Math.ceil(n / k);
  const chunks: string[][] = []; for (let i = 0; i < n; i += size) chunks.push(w.slice(i, i + size));
  const tot = chunks.reduce((s, c) => s + c.join(' ').length + 1, 0); let t = a;
  for (const c of chunks) {
    const d = ((b - a) * (c.join(' ').length + 1)) / tot; const L = c.reduce((s, x) => s + x.length + 1, 0); let acc = t;
    cards.push({t0: t, t1: t + d, words: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st}; })}); t += d;
  }
}
/** Black caption bars; spoken words white, upcoming words grey (same reading cue as the reference). Safe zone: y 1330-1560. */
export const Subs: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const c = cards.find((x) => s >= x.t0 && s < x.t1 + 0.04);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top: 1340, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', borderRadius: 16, padding: '10px 28px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: -1, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,.18)'}}>
        {c.words.map((x, i) => <span key={i} style={{color: s >= x.a - 0.02 ? '#fff' : '#7d7d7d', marginRight: i < c.words.length - 1 ? 16 : 0}}>{x.w}</span>)}
      </div>
    </div>
  );
};
