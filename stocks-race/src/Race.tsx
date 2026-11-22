import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COMPANIES, LAST, LEADER_CHANGES, SERIES, fmtCap, leaderAt, monthLabel, valueAt} from './data';

export const FPS = 30;
export const DURATION = 825; // 27.5 s
const START = 60, KNEE = 560, END = 660;
const font = 'Inter, "Helvetica Neue", Arial, sans-serif';

const progressAt = (f: number) =>
  Math.max(0, Math.min(LAST, f <= KNEE ? ((f - START) / (KNEE - START)) * 119 : 119 + ((f - KNEE) / (END - KNEE)) * (LAST - 119)));
const frameForMonth = (m: number) => { let f = START; while (f < END && progressAt(f) < m) f++; return f; };

// zonas
const LX = 70, LW = 940, LT = 1330, LB = 1640, LMAX = 5200;
const LXp = (p: number) => LX + (p / LAST) * LW;
const LY = (v: number) => LB - (v / LMAX) * (LB - LT);
const ROW = 112, BAR_X = 290, BAR_MAX = 520, TOP = 560;

export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progressAt(frame);
  const last = Math.floor(p);
  const vals = COMPANIES.map((_, i) => valueAt(i, p));
  const rankAt = (i: number, pp: number) => {
    const q = Math.max(0, pp);
    const vi = valueAt(i, q);
    return COMPANIES.reduce((a, _, j) => (j !== i && valueAt(j, q) > vi ? a + 1 : a), 0);
  };
  const pos = COMPANIES.map((_, i) => {
    let t = 0; for (let k = 0; k < 9; k++) t += rankAt(i, p - k * 0.18);
    return t / 9;
  });
  const maxV = Math.max(...vals);
  const total = vals.reduce((a, b) => a + b, 0);
  const {mon, year} = monthLabel(p);
  const leader = leaderAt(Math.min(LAST, Math.round(p)));
  const uiO = interpolate(frame, [40, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const introO = interpolate(frame, [0, 10, 40, 62], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const outroO = interpolate(frame, [END + 10, END + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const change = [...LEADER_CHANGES].reverse().find((c) => frame >= frameForMonth(c.m) && frame < frameForMonth(c.m) + 40);
  const finals = COMPANIES.map((c, i) => ({c, i, v0: SERIES[i][0], v: SERIES[i][LAST]})).sort((a, b) => b.v - a.v);

  const linePath = (ci: number) => {
    let d = '';
    for (let m = 0; m <= last; m++) d += `${m ? 'L' : 'M'}${LXp(m).toFixed(1)},${LY(SERIES[ci][m]).toFixed(1)} `;
    if (p > last) d += `L${LXp(p).toFixed(1)},${LY(vals[ci]).toFixed(1)}`;
    return d;
  };

  return (
    <AbsoluteFill style={{background: 'radial-gradient(1400px 1100px at 50% 15%, #16254a 0%, #070b16 70%)', fontFamily: font, color: '#fff'}}>
      <Html5Audio src={staticFile('sfx.mp3')} volume={0.9} />
      {LEADER_CHANGES.map((c) => (
        <Sequence key={c.m} from={frameForMonth(c.m)} durationInFrames={30}><Html5Audio src={staticFile('ding.mp3')} volume={0.4} /></Sequence>
      ))}

      {/* cabecera */}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', opacity: uiO}}>
        <div style={{fontSize: 44, fontWeight: 700, letterSpacing: 6, color: '#9fb0cc'}}>BIGGEST US COMPANIES</div>
        <div style={{fontSize: 36, color: '#6d7fa3', marginTop: 4}}>Market cap race</div>
      </div>
      <div style={{position: 'absolute', top: 270, left: 0, right: 0, textAlign: 'center', opacity: uiO, fontSize: 150, fontWeight: 900, letterSpacing: -4, lineHeight: 1}}>
        {mon} <span style={{color: '#ffd166'}}>{year}</span>
      </div>
      <div style={{position: 'absolute', top: 440, left: 0, right: 0, textAlign: 'center', opacity: uiO}}>
        <span style={{fontSize: 34, color: '#8696b5', letterSpacing: 3}}>COMBINED </span>
        <span style={{fontSize: 64, fontWeight: 800, color: '#7CFFB2', fontVariantNumeric: 'tabular-nums'}}>${(total / 1000).toFixed(2)}T</span>
      </div>

      {/* barras */}
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, opacity: uiO}}>
        {COMPANIES.map((c, i) => {
          const w = Math.max(8, (vals[i] / Math.max(maxV, 600)) * BAR_MAX);
          return (
            <div key={c.id} style={{position: 'absolute', left: 0, top: pos[i] * ROW, height: ROW - 18, width: 1080}}>
              <div style={{position: 'absolute', left: 60, width: 220, top: 0, height: ROW - 18, display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 700, color: c.color}}>{c.name}</div>
              <div style={{position: 'absolute', left: BAR_X, top: 8, height: ROW - 34, width: w, borderRadius: 14, background: `linear-gradient(90deg, ${c.color}99, ${c.color})`,
                boxShadow: i === leader ? `0 0 40px ${c.color}99` : `0 0 18px ${c.color}44`}} />
              <div style={{position: 'absolute', left: BAR_X + w + 16, top: 0, height: ROW - 18, display: 'flex', alignItems: 'center', fontSize: 42, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>{fmtCap(vals[i])}</div>
            </div>
          );
        })}
      </div>

      {/* línea inferior */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: uiO}}>
        {[0, 1000, 2000, 3000, 4000, 5000].map((g) => (
          <g key={g}>
            <line x1={LX} x2={LX + LW} y1={LY(g)} y2={LY(g)} stroke="#1d2a47" strokeWidth={1.5} />
            <text x={LX} y={LY(g) - 8} fill="#6d7fa3" fontSize={22}>{g ? `$${g / 1000}T` : ''}</text>
          </g>
        ))}
        {[2016, 2018, 2020, 2022, 2024, 2026].map((y) => (
          <text key={y} x={LXp((y - 2015) * 12)} y={LB + 40} fill="#6d7fa3" fontSize={24} textAnchor="middle">{y}</text>
        ))}
        {COMPANIES.map((c, i) => (
          <g key={c.id}>
            <path d={linePath(i)} fill="none" stroke={c.color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${c.color})`}} />
            <circle cx={LXp(p)} cy={LY(vals[i])} r={8} fill={c.color} />
          </g>
        ))}
      </svg>

      {change && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1235, textAlign: 'center',
          opacity: interpolate(frame - frameForMonth(change.m), [0, 5, 28, 40], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}}>
          <span style={{fontSize: 40, fontWeight: 800, padding: '8px 30px', borderRadius: 50, background: COMPANIES[change.ci].color, color: '#08101f'}}>
            {COMPANIES[change.ci].name} takes #1
          </span>
        </div>
      )}

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontSize: 22, color: '#5f6f8e', opacity: uiO}}>
        Approximate data · latest months estimated · not financial advice
      </div>

      {/* intro */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: introO, background: 'rgba(7,11,22,0.55)', textAlign: 'center'}}>
        <div style={{fontSize: 120, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3}}>THE 6 BIGGEST<br />US COMPANIES</div>
        <div style={{fontSize: 50, color: '#ffd166', marginTop: 40}}>2016 → today</div>
      </AbsoluteFill>

      {/* outro */}
      <AbsoluteFill style={{opacity: outroO, background: '#070b16', alignItems: 'center', paddingTop: 230}}>
        <div style={{fontSize: 64, fontWeight: 900}}>Dec 2015 → Nov 2026</div>
        <div style={{fontSize: 34, color: '#9fb0cc', margin: '10px 0 50px'}}>Final ranking · growth since Dec 2015</div>
        {finals.map((o, k) => {
          const a = interpolate(frame, [END + 30 + k * 10, END + 48 + k * 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const mult = o.v / o.v0;
          return (
            <div key={o.c.id} style={{width: 900, height: 128, display: 'flex', alignItems: 'center', opacity: a, transform: `translateX(${(1 - a) * 60}px)`, borderBottom: '1px solid #1d2a47'}}>
              <div style={{width: 70, fontSize: 46, fontWeight: 800, color: '#6d7fa3'}}>{k + 1}</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 46, fontWeight: 800, color: o.c.color}}>{o.c.name}</div>
                <div style={{fontSize: 28, color: '#8696b5'}}>{fmtCap(o.v0)} → {fmtCap(o.v)}</div>
              </div>
              <div style={{fontSize: 56, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{mult >= 10 ? `${Math.round(mult)}x` : `${mult.toFixed(1)}x`}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
