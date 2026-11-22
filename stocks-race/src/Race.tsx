import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COMPANIES, EVENTS, LAST, LEADER_CHANGES, MONTHS, SERIES, PRICES, leaderAt, monthLabel, valueAt} from './data';

export const FPS = 30;
export const DURATION = 2220;
const START = 90, END = 1980;
const font = 'Inter, "Helvetica Neue", Arial, sans-serif';

const progressAt = (f: number) =>
  interpolate(f, [START, 1650, END], [0, 70, LAST], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear});
const frameForMonth = (m: number) => {
  let f = START; while (f < END && progressAt(f) < m) f++; return f;
};

// geometría
const PL = 170, PR = 1330, PT = 200, PB = 900;
const YMIN = 50, YMAX = 5000;
const X = (p: number) => PL + (p / LAST) * (PR - PL);
const Y = (v: number) => PB - ((Math.log(v) - Math.log(YMIN)) / (Math.log(YMAX) - Math.log(YMIN))) * (PB - PT);
const fmt = (v: number) => '$' + Math.round(v).toLocaleString('es-ES');

const GRID = [50, 100, 200, 500, 1000, 2000, 5000];

export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progressAt(frame);
  const last = Math.floor(p);

  const pathFor = (ci: number) => {
    let d = '';
    for (let m = 0; m <= last; m++) d += `${m === 0 ? 'M' : 'L'}${X(m).toFixed(1)},${Y(SERIES[ci][m]).toFixed(1)} `;
    if (p > last) d += `L${X(p).toFixed(1)},${Y(valueAt(ci, p)).toFixed(1)}`;
    return d;
  };

  // posición suave en el ranking
  const vals = COMPANIES.map((_, i) => Math.log(valueAt(i, p)));
  const pos = vals.map((vi, i) => vals.reduce((acc, vj, j) => (j === i ? acc : acc + 1 / (1 + Math.exp(-(vj - vi) / 0.07))), 0));
  const leader = leaderAt(Math.min(LAST, Math.round(p)));

  const introO = interpolate(frame, [0, 20, 70, 100], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const uiO = interpolate(frame, [60, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outroO = interpolate(frame, [END, END + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const recentChange = [...LEADER_CHANGES].reverse().find((c) => frame >= frameForMonth(c.m) && frame < frameForMonth(c.m) + 75);
  const ev = EVENTS.find((e) => frame >= frameForMonth(e.m) && frame < frameForMonth(e.m) + 110);

  const finalOrder = COMPANIES.map((c, i) => ({c, i, v: SERIES[i][LAST]})).sort((a, b) => b.v - a.v);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(1200px 800px at 30% 20%, #14213d 0%, #070b16 70%)', fontFamily: font, color: '#fff'}}>
      {/* ---- audio ---- */}
      <Html5Audio src={staticFile('music.mp3')} volume={(f) => interpolate(f, [0, 60], [0, 0.55], {extrapolateRight: 'clamp'})} />
      <Sequence from={0}><Html5Audio src={staticFile('whoosh.mp3')} volume={0.5} /></Sequence>
      {Array.from({length: MONTHS - 1}, (_, m) => m + 1).map((m) => (
        <Sequence key={m} from={frameForMonth(m)} durationInFrames={10}><Html5Audio src={staticFile('tick.mp3')} volume={0.22} /></Sequence>
      ))}
      {LEADER_CHANGES.map((c) => (
        <Sequence key={c.m} from={frameForMonth(c.m)} durationInFrames={60}><Html5Audio src={staticFile('ding.mp3')} volume={0.7} /></Sequence>
      ))}
      <Sequence from={END}><Html5Audio src={staticFile('chime.mp3')} volume={0.8} /></Sequence>

      {/* ---- título ---- */}
      <div style={{position: 'absolute', left: 80, top: 50, opacity: uiO}}>
        <div style={{fontSize: 54, fontWeight: 800, letterSpacing: -1}}>La carrera de los gigantes</div>
        <div style={{fontSize: 28, color: '#9fb0cc', marginTop: 6}}>Qué valdrían 100 $ invertidos en enero de 2020 · escala logarítmica</div>
      </div>

      {/* ---- gráfica ---- */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: uiO}}>
        {GRID.map((g) => (
          <g key={g}>
            <line x1={PL} x2={PR} y1={Y(g)} y2={Y(g)} stroke={g === 100 ? '#5b6b8c' : '#1d2a47'} strokeWidth={g === 100 ? 2 : 1.5} strokeDasharray={g === 100 ? '8 8' : undefined} />
            <text x={PL - 16} y={Y(g) + 8} fill="#8696b5" fontSize={22} textAnchor="end">{fmt(g)}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((y) => (
          <g key={y}>
            <line x1={X(y * 12)} x2={X(y * 12)} y1={PT} y2={PB} stroke="#16213a" strokeWidth={1.5} />
            <text x={X(y * 12)} y={PB + 40} fill="#8696b5" fontSize={24} textAnchor="middle">{2020 + y}</text>
          </g>
        ))}
        {COMPANIES.map((c, i) => {
          const hx = X(p), hy = Y(valueAt(i, p));
          const isLead = i === leader;
          return (
            <g key={c.id}>
              <path d={pathFor(i)} fill="none" stroke={c.color} strokeWidth={isLead ? 7 : 5} strokeLinejoin="round" strokeLinecap="round" opacity={0.95}
                style={{filter: `drop-shadow(0 0 ${isLead ? 14 : 6}px ${c.color})`}} />
              <circle cx={hx} cy={hy} r={isLead ? 13 : 9} fill={c.color} style={{filter: `drop-shadow(0 0 16px ${c.color})`}} />
              <text x={hx + 22} y={hy + 8} fill={c.color} fontSize={26} fontWeight={700}>{c.name}</text>
            </g>
          );
        })}
      </svg>

      {/* fecha */}
      <div style={{position: 'absolute', left: PL + 20, top: PT - 10, fontSize: 96, fontWeight: 800, opacity: uiO * 0.9, letterSpacing: -2, textShadow: '0 4px 30px #000'}}>
        {monthLabel(p)}
      </div>

      {/* evento */}
      {ev && (
        <div style={{position: 'absolute', left: PL + 20, top: PT + 110, fontSize: 32, color: '#ffd166', fontWeight: 600,
          opacity: interpolate(frame - frameForMonth(ev.m), [0, 12, 90, 110], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}}>
          ▸ {ev.text}
        </div>
      )}

      {/* ---- ranking ---- */}
      <div style={{position: 'absolute', left: 1400, top: 190, width: 450, opacity: uiO}}>
        <div style={{fontSize: 24, color: '#8696b5', marginBottom: 14, letterSpacing: 1}}>CLASIFICACIÓN — VALOR DE 100 $</div>
        {COMPANIES.map((c, i) => {
          const v = valueAt(i, p);
          return (
            <div key={c.id} style={{position: 'absolute', top: 60 + pos[i] * 100, left: 0, width: 450, height: 86, borderRadius: 18,
              background: 'rgba(255,255,255,0.06)', borderLeft: `10px solid ${c.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px',
              boxShadow: i === leader ? `0 0 34px ${c.color}66` : undefined}}>
              <div>
                <div style={{fontSize: 34, fontWeight: 700}}>{Math.round(pos[i]) + 1}. {c.name}</div>
                <div style={{fontSize: 21, color: '#8696b5'}}>{c.id === 'BTC' ? 'BTC' : c.id} · {fmt(PRICES[i][Math.max(0, Math.min(LAST, Math.round(p)))])}</div>
              </div>
              <div style={{fontSize: 38, fontWeight: 800, color: c.color, fontVariantNumeric: 'tabular-nums'}}>{fmt(v)}</div>
            </div>
          );
        })}
      </div>

      {/* cambio de líder */}
      {recentChange && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center',
          opacity: interpolate(frame - frameForMonth(recentChange.m), [0, 8, 60, 75], [0, 1, 1, 0], {extrapolateRight: 'clamp'}),
          transform: `scale(${interpolate(frame - frameForMonth(recentChange.m), [0, 10], [0.85, 1], {extrapolateRight: 'clamp'})})`}}>
          <span style={{fontSize: 52, fontWeight: 800, padding: '14px 40px', borderRadius: 60, background: COMPANIES[recentChange.ci].color, color: '#08101f'}}>
            👑 {COMPANIES[recentChange.ci].name} toma el liderato
          </span>
        </div>
      )}

      <div style={{position: 'absolute', left: 80, bottom: 28, fontSize: 19, color: '#5f6f8e', opacity: uiO}}>
        Datos mensuales aproximados (cierres ajustados por splits). Los últimos meses de 2026 son estimaciones. No es consejo financiero.
      </div>

      {/* ---- intro ---- */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: introO, background: 'rgba(7,11,22,0.6)'}}>
        <div style={{fontSize: 110, fontWeight: 900, letterSpacing: -3}}>La carrera de los gigantes</div>
        <div style={{fontSize: 40, color: '#9fb0cc', marginTop: 10}}>NVIDIA · Microsoft · Apple · Bitcoin · Tesla · Amazon</div>
        <div style={{fontSize: 32, color: '#ffd166', marginTop: 30}}>2020 → hoy</div>
      </AbsoluteFill>

      {/* ---- outro ---- */}
      <AbsoluteFill style={{opacity: outroO, background: 'rgba(7,11,22,0.985)', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontSize: 70, fontWeight: 900, marginBottom: 10}}>Resultado final · nov 2026</div>
        <div style={{fontSize: 30, color: '#9fb0cc', marginBottom: 40}}>100 $ de enero de 2020 se convirtieron en…</div>
        {finalOrder.map((o, k) => {
          const a = interpolate(frame, [END + 30 + k * 18, END + 55 + k * 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={o.c.id} style={{width: 900, height: 80, margin: '6px 0', display: 'flex', alignItems: 'center', opacity: a, transform: `translateX(${(1 - a) * 80}px)`}}>
              <div style={{width: 60, fontSize: 40, fontWeight: 800, color: '#8696b5'}}>{k + 1}</div>
              <div style={{width: 260, fontSize: 40, fontWeight: 700, color: o.c.color}}>{o.c.name}</div>
              <div style={{height: 36, borderRadius: 18, background: o.c.color, width: 330 * a * (Math.log(o.v) - Math.log(50)) / (Math.log(3500) - Math.log(50))}} />
              <div style={{marginLeft: 22, fontSize: 40, fontWeight: 800}}>{fmt(o.v)}</div>
            </div>
          );
        })}
        <div style={{fontSize: 26, color: '#ffd166', marginTop: 34, opacity: interpolate(frame, [END + 150, END + 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          Y ahora todo está cayendo… ¿quién liderará la próxima carrera?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
