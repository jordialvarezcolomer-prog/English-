import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {EP1_CAPTIONS} from './ep01_timeline';
import {FX} from './theme';

type Card = {t0: number; t1: number; words: {w: string; a: number; hl: boolean}[]};
const build = (): Card[] => {
  const out: Card[] = [];
  for (const [a, b, text, hl] of EP1_CAPTIONS) {
    const w = text.split(' '); const k = Math.ceil(w.length / 3); const size = Math.ceil(w.length / k);
    const chunks: string[][] = []; for (let i = 0; i < w.length; i += size) chunks.push(w.slice(i, i + size));
    const tot = chunks.reduce((s, c) => s + c.join(' ').length + 1, 0); let t = a;
    for (const c of chunks) { const d = ((b - a) * (c.join(' ').length + 1)) / tot; const L = c.reduce((s, x) => s + x.length + 1, 0); let acc = t; out.push({t0: t, t1: t + d, words: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st, hl: hl.includes(x) || /^\d/.test(x) || x === x.toUpperCase() && x.length > 2}; })}); t += d; }
  }
  return out;
};
const CARDS = build();
/** Bold phrase captions (<=3 words), active word lifts; keywords & numbers in gold. Safe zone y 1360-1560. */
export const Subs: React.FC = () => {
  const s = useCurrentFrame() / 30;
  const c = CARDS.find((x) => s >= x.t0 && s < x.t1 + 0.05);
  if (!c) return null;
  const pop = interpolate(s, [c.t0, c.t0 + 0.1], [0.82, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 60, width: 880, top: 1380, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 18px', transform: `scale(${pop})`}}>
      {c.words.map((x, i) => { const on = s >= x.a; return (
        <span key={i} style={{fontFamily: FX.font, fontWeight: 900, fontSize: 80, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: -1, color: x.hl ? FX.gold : FX.white, opacity: on ? 1 : 0.55, transform: `translateY(${on ? 0 : 8}px)`, WebkitTextStroke: '3px rgba(0,0,0,.9)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,.85)'}}>{x.w}</span>
      ); })}
    </div>
  );
};
