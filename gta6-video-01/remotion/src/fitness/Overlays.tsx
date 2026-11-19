import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FX} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const useSec = () => useCurrentFrame() / 30;

/** Big cinematic text that slams in (scale+blur), optional sub-line. */
export const Slam: React.FC<{at: number; out?: number; text: React.ReactNode; size?: number; color?: string; sub?: string; top?: number; glow?: string}> = ({at, out, text, size = 170, color = FX.white, sub, top = 560, glow = 'rgba(0,0,0,.6)'}) => {
  const t = useSec();
  if (t < at || (out !== undefined && t > out + 0.25)) return null;
  const p = interpolate(t, [at, at + 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.25], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: p * o, transform: `scale(${1.7 - 0.7 * p})`, filter: `blur(${(1 - p) * 14}px)`}}>
      <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: size, lineHeight: 0.92, color, letterSpacing: -3, textShadow: `0 0 40px ${glow}, 0 10px 30px rgba(0,0,0,.7)`}}>{text}</div>
      {sub && <div style={{fontFamily: FX.font, fontWeight: 800, fontSize: size * 0.22, color: FX.white, letterSpacing: 8, marginTop: 14, opacity: 0.9}}>{sub}</div>}
    </div>
  );
};
/** Character name tag with coloured bar. */
export const NameTag: React.FC<{at: number; out?: number; name: string; sub: string; color: string; x: number; y: number; align?: 'left' | 'right'}> = ({at, out, name, sub, color, x, y, align = 'left'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  if (t < at || (out !== undefined && t > out + 0.2)) return null;
  const p = spring({frame: f - at * fps, fps, config: {damping: 14, stiffness: 160}});
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.2], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p * o, transform: `translateX(${(1 - p) * (align === 'left' ? -80 : 80)}px)`, textAlign: align}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(8,10,14,.72)', border: `2px solid ${color}`, borderRadius: 18, padding: '10px 20px', boxShadow: `0 0 30px ${color}55`}}>
        <div style={{width: 12, height: 44, borderRadius: 6, background: color}} />
        <div><div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 42, color: FX.white, lineHeight: 1}}>{name}</div><div style={{fontFamily: FX.font, fontWeight: 800, fontSize: 22, color, letterSpacing: 2, marginTop: 4}}>{sub}</div></div>
      </div>
    </div>
  );
};
/** Persistent experiment progress bar: DAY n / 90. */
export const DayBar: React.FC<{day: number; show?: number}> = ({day, show = 1}) => (
  <div style={{position: 'absolute', left: 70, right: 160, top: 120, opacity: show}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FX.font, fontWeight: 900, color: FX.white, fontSize: 34, letterSpacing: 2}}><span>DAY <span style={{color: FX.gold}}>{Math.round(day)}</span></span><span style={{opacity: 0.6}}>/ 90</span></div>
    <div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,.14)', marginTop: 10, overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(day / 90) * 100}%`, background: `linear-gradient(90deg, ${FX.blue}, ${FX.gold})`, boxShadow: `0 0 18px ${FX.gold}`}} />
      {[30, 60].map((d) => <div key={d} style={{position: 'absolute', left: `${(d / 90) * 100}%`, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,.5)'}} />)}
    </div>
  </div>
);
/** Glass pill. */
export const Chip: React.FC<{at: number; text: string; icon?: string; color?: string; x: number; y: number; out?: number}> = ({at, text, icon, color = FX.white, x, y, out}) => {
  const f = useCurrentFrame(); const t = f / 30;
  if (t < at || (out !== undefined && t > out + 0.2)) return null;
  const p = spring({frame: f - at * 30, fps: 30, config: {damping: 12, stiffness: 180}});
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${0.5 + 0.5 * p})`, opacity: p, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,12,16,.75)', border: `2px solid ${color}`, borderRadius: 999, padding: '12px 26px', fontFamily: FX.font, fontWeight: 900, fontSize: 34, color: FX.white, letterSpacing: 1, backdropFilter: 'blur(8px)'}}>{icon && <span style={{fontSize: 38}}>{icon}</span>}{text}</div>;
};
/** Rep counter card. */
export const Reps: React.FC<{n: number; color: string; x: number; y: number; fail?: boolean; label: string}> = ({n, color, x, y, fail, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 300, textAlign: 'center', background: 'rgba(8,10,14,.78)', border: `3px solid ${fail ? FX.red : color}`, borderRadius: 26, padding: '14px 0 18px', boxShadow: `0 0 34px ${(fail ? FX.red : color)}66`}}>
    <div style={{fontFamily: FX.font, fontWeight: 800, fontSize: 24, color, letterSpacing: 4}}>{label}</div>
    <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 120, color: FX.white, lineHeight: 1}}>{n}</div>
    <div style={{fontFamily: FX.font, fontWeight: 800, fontSize: 24, color: fail ? FX.red : 'rgba(255,255,255,.6)', letterSpacing: 4}}>{fail ? 'FAILED' : 'REPS'}</div>
  </div>
);
/** Calendar page with flip on change. */
export const Calendar: React.FC<{day: number; label?: string}> = ({day, label = 'DAY'}) => {
  const d = Math.floor(day); const fr = day - d;
  return (
    <div style={{width: 360, height: 400, perspective: 900, position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, background: '#F4F4F2', borderRadius: 30, boxShadow: '0 30px 60px rgba(0,0,0,.6)', overflow: 'hidden'}}>
        <div style={{height: 100, background: FX.red, fontFamily: FX.font, fontWeight: 900, fontSize: 44, color: '#fff', textAlign: 'center', lineHeight: '100px', letterSpacing: 6}}>{label}</div>
        <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 210, color: '#111', textAlign: 'center', lineHeight: '290px'}}>{d}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 100, height: 300, background: '#EDEDEA', borderRadius: '0 0 30px 30px', transformOrigin: 'top', transform: `rotateX(${fr * 110}deg)`, opacity: fr > 0.02 ? 1 - fr * 0.6 : 0, fontFamily: FX.font, fontWeight: 900, fontSize: 210, color: '#111', textAlign: 'center', lineHeight: '290px'}}>{d}</div>
    </div>
  );
};
/** Bathroom-scale style readout. */
export const ScaleCard: React.FC<{kg: number; delta: number; color: string; name: string; note?: string}> = ({kg, delta, color, name, note}) => (
  <div style={{width: 420, background: 'rgba(8,10,14,.82)', border: `3px solid ${color}`, borderRadius: 30, padding: '20px 26px', boxShadow: `0 0 40px ${color}55`, textAlign: 'center'}}>
    <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 30, color, letterSpacing: 4}}>{name}</div>
    <div style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 96, color: '#B8FFCF', textShadow: '0 0 20px #25D07D', background: '#0C1A12', borderRadius: 16, margin: '12px 0', padding: '6px 0'}}>{kg.toFixed(1)}<span style={{fontSize: 40}}> kg</span></div>
    <div style={{fontFamily: FX.font, fontWeight: 900, fontSize: 44, color: FX.white}}>+{delta.toFixed(1)} kg</div>
    {note && <div style={{fontFamily: FX.font, fontWeight: 800, fontSize: 24, color: '#7FD3FF', letterSpacing: 2, marginTop: 6}}>{note}</div>}
  </div>
);
/** Animated ATP cycle: ATP → ADP + energy; phosphocreatine hands back a phosphate → ATP. */
export const AtpCycle: React.FC<{t: number}> = ({t}) => {
  const ph = (t % 2.4) / 2.4; // one cycle every 2.4 s
  const split = interpolate(ph, [0.15, 0.4], [0, 1], clamp), give = interpolate(ph, [0.55, 0.85], [0, 1], clamp);
  const p3x = 640 + split * 150 - give * 150, p3y = 520 - split * 120 + give * 120;
  const pcrX = interpolate(ph, [0.4, 0.6], [260, 520], clamp);
  const burst = ph > 0.3 && ph < 0.55 ? 1 - Math.abs(ph - 0.42) * 8 : 0;
  return (
    <svg width={1080} height={1000} viewBox="0 0 1080 1000" style={{position: 'absolute', left: 0, top: 360}}>
      <defs><filter id="gl"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <rect x={60} y={150} width={960} height={640} rx={44} fill="rgba(8,6,12,.72)" stroke="rgba(255,255,255,.18)" strokeWidth={3} />
      <text x={540} y={230} textAnchor="middle" fill={FX.white} fontFamily={FX.font} fontWeight={900} fontSize={52} letterSpacing={4}>ENERGY CYCLE</text>
      {/* adenosine */}
      <rect x={300} y={470} width={190} height={100} rx={30} fill="#3D7BFF" stroke="#fff" strokeWidth={5} filter="url(#gl)" />
      <text x={395} y={533} textAnchor="middle" fill="#fff" fontFamily={FX.font} fontWeight={900} fontSize={34}>ADENOSINE</text>
      {[0, 1].map((i) => <circle key={i} cx={520 + i * 60} cy={520} r={28} fill={FX.gold} stroke="#fff" strokeWidth={4} filter="url(#gl)" />)}
      <circle cx={p3x} cy={p3y} r={28} fill={FX.gold} stroke="#fff" strokeWidth={4} filter="url(#gl)" />
      <text x={p3x} y={p3y + 10} textAnchor="middle" fill="#3A2400" fontFamily={FX.font} fontWeight={900} fontSize={26}>P</text>
      {burst > 0 && <g opacity={burst} filter="url(#gl)"><path d={`M${p3x + 40} ${p3y - 60} l-30 60 h30 l-30 60`} stroke={FX.gold} strokeWidth={10} fill="none" strokeLinejoin="round" /><circle cx={p3x} cy={p3y} r={70 + 90 * burst} fill="none" stroke={FX.gold} strokeWidth={6} /></g>}
      {/* phosphocreatine shuttle */}
      <g transform={`translate(${pcrX} 680)`} opacity={ph > 0.35 && ph < 0.9 ? 1 : 0.25}><rect x={-90} y={-36} width={180} height={72} rx={36} fill="#25D07D" stroke="#fff" strokeWidth={4} /><text x={0} y={12} textAnchor="middle" fill="#032" fontFamily={FX.font} fontWeight={900} fontSize={30}>CREATINE</text></g>
      <text x={540} y={420} textAnchor="middle" fill={split > 0.5 && give < 0.5 ? FX.gold : FX.white} fontFamily={FX.font} fontWeight={900} fontSize={64}>{split > 0.5 && give < 0.6 ? 'ADP + ⚡' : 'ATP'}</text>
      <text x={540} y={760} textAnchor="middle" fill="rgba(255,255,255,.75)" fontFamily={FX.font} fontWeight={800} fontSize={30} letterSpacing={2}>PHOSPHOCREATINE REBUILDS ATP</text>
    </svg>
  );
};
/** Vignette + film grain + subtle chromatic edge, unifying 3D and graphics. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.6) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{opacity: 0.08, pointerEvents: 'none', backgroundImage: `radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)`, backgroundSize: '3px 3px', transform: `translate(${random(`gx${f}`) * 3}px, ${random(`gy${f}`) * 3}px)`}} />
    </>
  );
};
/** White flash. */
export const Flash: React.FC<{at: number; len?: number; color?: string}> = ({at, len = 0.18, color = '#fff'}) => {
  const t = useSec();
  const o = interpolate(t, [at, at + 0.03, at + len], [0, 0.85, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};
