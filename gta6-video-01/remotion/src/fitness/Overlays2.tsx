import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring} from 'remotion';
import {FX} from './theme';

/* Episode 2 (sleep) motion graphics. All take the scene-local time t (seconds). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = {...clamp, easing: Easing.out(Easing.cubic)};
const pop = (t: number, at: number) => (t < at ? 0 : spring({frame: (t - at) * 30, fps: 30, config: {damping: 12, stiffness: 170}}));
const F = (size: number, weight = 900): React.CSSProperties => ({fontFamily: FX.font, fontWeight: weight, fontSize: size, lineHeight: 1});
const card: React.CSSProperties = {background: 'rgba(8,10,16,.82)', border: '2px solid rgba(255,255,255,.14)', borderRadius: 34, boxShadow: '0 20px 60px rgba(0,0,0,.5)'};
const hhmm = (h: number) => { const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.floor((h - Math.floor(h)) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

/** Source line, bottom of a graphic. */
export const Source: React.FC<{text: string; top?: number; o?: number}> = ({text, top = 1290, o = 1}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', ...F(22, 700), color: 'rgba(255,255,255,.55)', letterSpacing: 2, opacity: o}}>{text}</div>
);

/** Two nights side by side: Alex sleeps 23:00→07:00, Daniel scrolls until ~02:00 and the alarm rings at 07:00. */
export const NightSplit: React.FC<{t: number}> = ({t}) => {
  const aH = interpolate(t, [0, 1.35], [23, 31], ease); // Alex clock (hours, wraps)
  const dScroll = interpolate(t, [1.5, 2.9], [0.5, 2.0], ease); // Daniel still on phone until 02:00
  const dH = t < 2.9 ? 23 + dScroll + 0.5 : interpolate(t, [2.9, 3.4], [26, 31], ease);
  const alarm = t > 3.4;
  const shake = alarm ? Math.sin(t * 70) * 10 : 0;
  const aSleep = interpolate(t, [0, 1.35], [0, 8], clamp), dSleep = interpolate(t, [2.9, 3.4], [0, 5], clamp);
  const panel = (i: 0 | 1) => {
    const c = i ? FX.red : FX.blue, name = i ? 'DANIEL' : 'ALEX', h = i ? dH : aH, sl = i ? dSleep : aSleep;
    const phone = i === 1 && t > 1.5 && t < 2.95;
    return (
      <div style={{position: 'absolute', left: i * 540, top: 0, width: 540, height: 1920, overflow: 'hidden', background: `radial-gradient(circle at 50% 30%, ${i ? '#1E0E1A' : '#0B1630'}, #04060C 75%)`}}>
        {Array.from({length: 40}).map((_, k) => <div key={k} style={{position: 'absolute', left: random(`sx${i}${k}`) * 540, top: random(`sy${i}${k}`) * 900, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.2 + 0.6 * Math.abs(Math.sin(t * 2 + k))}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...F(46), color: c, letterSpacing: 6}}>{name}</div>
        {/* moon */}
        <div style={{position: 'absolute', left: 190, top: 350, width: 160, height: 160, borderRadius: 80, background: '#F4E7B5', boxShadow: '0 0 80px #F4E7B5aa', opacity: phone ? 0.35 : 1}}><div style={{position: 'absolute', left: 45, top: -10, width: 150, height: 150, borderRadius: 75, background: i ? '#1E0E1A' : '#0B1630'}} /></div>
        {/* digital clock */}
        <div style={{position: 'absolute', left: 40, right: 40, top: 600, textAlign: 'center', transform: `translateX(${i ? shake : 0}px)`}}>
          <div style={{display: 'inline-block', padding: '18px 34px', borderRadius: 26, background: '#05070B', border: `3px solid ${i && alarm ? FX.red : 'rgba(255,255,255,.18)'}`, boxShadow: i && alarm ? `0 0 60px ${FX.red}` : 'none'}}>
            <span style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 108, color: i && alarm ? '#FF6A5E' : '#7CF3B4', textShadow: `0 0 24px ${i && alarm ? FX.red : '#25D07D'}`}}>{hhmm(h)}</span>
          </div>
          {i === 1 && alarm && <div style={{...F(44), color: FX.red, marginTop: 18, letterSpacing: 4, opacity: Math.sin(t * 20) > 0 ? 1 : 0.4}}>⏰ ALARM</div>}
        </div>
        {/* phone glow + scrolling feed */}
        {phone && (
          <div style={{position: 'absolute', left: 150, top: 830, width: 240, height: 420, borderRadius: 34, background: '#0F1116', border: '6px solid #2A2D35', boxShadow: '0 0 120px rgba(120,170,255,.55)', overflow: 'hidden'}}>
            {Array.from({length: 9}).map((_, k) => { const y = ((k * 110 - (t - 1.5) * 600) % 990 + 990) % 990 - 100; return <div key={k} style={{position: 'absolute', left: 16, right: 16, top: y, height: 90, borderRadius: 14, background: ['#3D8BFF', '#FF4747', '#FFC23D', '#25D07D'][k % 4], opacity: 0.75}} />; })}
          </div>
        )}
        {!phone && <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', ...F(70), color: 'rgba(255,255,255,.75)', opacity: sl > 0.3 && !(i && alarm) ? 0.4 + 0.6 * Math.abs(Math.sin(t * 3)) : 0}}>z z z</div>}
        {/* sleep bar */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 1080}}>
          <div style={{display: 'flex', justifyContent: 'space-between', ...F(30), color: '#fff', letterSpacing: 2}}><span>SLEEP</span><span style={{color: c}}>{sl.toFixed(0)} H</span></div>
          <div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,.12)', marginTop: 10, overflow: 'hidden'}}><div style={{width: `${(sl / 8) * 100}%`, height: '100%', background: c, boxShadow: `0 0 24px ${c}`}} /></div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: '#04060C'}}>
      {panel(0)}{panel(1)}
      <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: 1920, background: `linear-gradient(${FX.blue}, ${FX.gold}, ${FX.red})`, boxShadow: `0 0 30px ${FX.gold}`}} />
    </AbsoluteFill>
  );
};

/** Two horizontal bars that animate to values (0..1 of width) with labels. */
const Bar: React.FC<{label: string; v: number; color: string; val: string; top: number}> = ({label, v, color, val, top}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top}}>
    <div style={{display: 'flex', justifyContent: 'space-between', ...F(30), color, letterSpacing: 3}}><span>{label}</span><span style={{color: '#fff'}}>{val}</span></div>
    <div style={{height: 44, borderRadius: 22, background: 'rgba(255,255,255,.1)', marginTop: 10, overflow: 'hidden'}}><div style={{width: `${v * 100}%`, height: '100%', borderRadius: 22, background: color, boxShadow: `0 0 26px ${color}`}} /></div>
  </div>
);

/** Testosterone after one week of 5-hour nights (Leproult & Van Cauter 2011: −10–15%). */
export const TestoCard: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 0.9), drop = interpolate(t, [3.6, 5.2], [0, 1], ease);
  const dv = 1 - 0.13 * drop;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, height: 600, ...card, opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', ...F(54), color: '#fff', letterSpacing: 2}}>TESTOSTERONE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 108, textAlign: 'center', ...F(24, 800), color: 'rgba(255,255,255,.55)', letterSpacing: 4}}>AFTER 1 WEEK</div>
      <Bar label="8 H SLEEP" v={0.86} color={FX.blue} val="100%" top={190} />
      <Bar label="5 H SLEEP" v={0.86 * dv} color={FX.red} val={`${Math.round(100 * dv)}%`} top={320} />
      {drop > 0.5 && <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', ...F(64), color: FX.red, textShadow: `0 0 30px ${FX.red}`, transform: `scale(${interpolate(t, [4.2, 4.45], [1.6, 1], clamp)})`}}>−10 to 15%</div>}
      <Source text="LEPROULT & VAN CAUTER · JAMA 2011 · YOUNG MEN · 1 WEEK AT 5 H" top={540} />
    </div>
  );
};

/** Hunger hormones: ghrelin (hungry) up, leptin (full) down. */
export const HormoneCard: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 0.1);
  const g = interpolate(t, [2.8, 3.6], [0.45, 0.9], ease), l = interpolate(t, [3.8, 4.6], [0.7, 0.32], ease);
  const meter = (name: string, sub: string, v: number, c: string, up: boolean, x: number, on: boolean) => (
    <div style={{position: 'absolute', left: x, top: 230, width: 400, textAlign: 'center'}}>
      <div style={{...F(52), color: c}}>{name}</div>
      <div style={{...F(24, 800), color: 'rgba(255,255,255,.7)', letterSpacing: 3, marginTop: 10}}>{sub}</div>
      <div style={{position: 'relative', margin: '30px auto 0', width: 140, height: 560, borderRadius: 70, background: 'rgba(255,255,255,.08)', border: '3px solid rgba(255,255,255,.18)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: `linear-gradient(0deg, ${c}, ${c}99)`, boxShadow: `0 0 40px ${c}`}} />
      </div>
      <div style={{...F(140), color: c, marginTop: 20, opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 30}px)`, textShadow: `0 0 30px ${c}`}}>{up ? '▲' : '▼'}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #241018, #07080D 72%)', opacity: p}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', ...F(46), color: '#fff', letterSpacing: 3}}>HUNGER HORMONES</div>
      {meter('GHRELIN', '“I’M HUNGRY”', g, '#FF8A3D', true, 90, t > 2.9)}
      {meter('LEPTIN', '“I’M FULL”', l, '#3DD6FF', false, 590, t > 3.9)}
    </AbsoluteFill>
  );
};

/** Junk food raining toward the tired character + hunger stat. */
export const Cravings: React.FC<{t: number}> = ({t}) => {
  const foods = ['🍩', '🍕', '🍫', '🍟', '🍔', '🧁', '🍪', '🥤'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {t > 3.2 && foods.map((f, i) => {
        const at = 3.2 + i * 0.22; const k = interpolate(t, [at, at + 0.7], [0, 1], ease); if (t < at) return null;
        const ang = (i / foods.length) * Math.PI * 2 + 0.4; const R = 520 - 180 * k;
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * R - 60, top: 900 + Math.sin(ang) * R * 0.9 - 60, fontSize: 120, transform: `rotate(${Math.sin(t * 3 + i) * 15}deg) scale(${0.6 + 0.4 * k})`, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,.6))'}}>{f}</div>;
      })}
    </AbsoluteFill>
  );
};

/** Generic night: hypnogram with deep-sleep blocks and growth-hormone pulses during deep sleep. */
export const GHGraph: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 0), draw = interpolate(t, [0.2, 2.6], [0, 1], ease);
  const W = 860, H = 380, X0 = 110, Y0 = 640;
  // stage depth per 15 min over 8 h (0 = awake, 3 = deep): deep sleep mostly in the first half of the night
  const st = [0, 1, 2, 3, 3, 3, 2, 1, 2, 3, 3, 2, 1, 1, 2, 3, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1];
  const xs = (i: number) => X0 + (i / (st.length - 1)) * W, ys = (d: number) => Y0 + 40 + d * 90;
  const path = st.map((d, i) => `${i ? 'L' : 'M'}${xs(i)} ${ys(d)}${i < st.length - 1 ? ` L${xs(i + 1)} ${ys(d)}` : ''}`).join(' ');
  const gh = st.map((d, i) => `${i ? 'L' : 'M'}${xs(i)} ${Y0 - 40 - (d === 3 ? 240 : d === 2 ? 70 : 20) * (0.8 + 0.2 * Math.sin(i))}`).join(' ');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #0E1A30, #05070C 72%)', opacity: p}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', ...F(54), color: '#fff'}}>GROWTH HORMONE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', ...F(30, 800), color: FX.gold, letterSpacing: 3}}>PEAKS DURING DEEP SLEEP</div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs><clipPath id="drw"><rect x={0} y={0} width={X0 + W * draw} height={1920} /></clipPath><filter id="gw"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        {[0, 1, 2, 3].map((d) => <text key={d} x={X0 - 18} y={ys(d) + 10} textAnchor="end" fill="rgba(255,255,255,.5)" fontFamily={FX.font} fontWeight={800} fontSize={22}>{['AWAKE', 'LIGHT', 'N2', 'DEEP'][d]}</text>)}
        <g clipPath="url(#drw)">
          {st.map((d, i) => d === 3 && i < st.length - 1 ? <rect key={i} x={xs(i)} y={ys(3) - 26} width={xs(i + 1) - xs(i)} height={52} fill="#5B6CFF" opacity={0.45} /> : null)}
          <path d={path} stroke="#9FB2FF" strokeWidth={6} fill="none" />
          <path d={gh} stroke={FX.gold} strokeWidth={8} fill="none" filter="url(#gw)" strokeLinejoin="round" />
        </g>
        <text x={X0} y={Y0 + 420} fill="rgba(255,255,255,.55)" fontFamily={FX.font} fontWeight={800} fontSize={24}>FALL ASLEEP</text>
        <text x={X0 + W} y={Y0 + 420} textAnchor="end" fill="rgba(255,255,255,.55)" fontFamily={FX.font} fontWeight={800} fontSize={24}>WAKE UP</text>
        <text x={X0} y={Y0 - 330} fill={FX.gold} fontFamily={FX.font} fontWeight={900} fontSize={28}>GH ▲</text>
      </svg>
      {t > 2.8 && (
        <div style={{position: 'absolute', left: 70, right: 70, top: 1180, ...card, padding: '26px 40px', opacity: pop(t, 2.8)}}>
          <div style={{...F(30), color: '#fff', letterSpacing: 3, textAlign: 'center'}}>RECOVERY</div>
          {[['ALEX · 8 H', FX.blue, 0.95], ['DANIEL · 5 H', FX.red, 0.68]].map(([n, c, v], i) => (
            <div key={i} style={{marginTop: 16}}><div style={{...F(22, 800), color: c as string, letterSpacing: 3}}>{n}</div><div style={{height: 30, borderRadius: 15, background: 'rgba(255,255,255,.1)', marginTop: 6, overflow: 'hidden'}}><div style={{width: `${(v as number) * 100 * interpolate(t, [2.9, 3.8], [0, 1], ease)}%`, height: '100%', background: c as string, boxShadow: `0 0 18px ${c}`}} /></div></div>
          ))}
          <div style={{...F(18, 700), color: 'rgba(255,255,255,.5)', letterSpacing: 2, textAlign: 'center', marginTop: 14}}>ILLUSTRATIVE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Nedeltcheva et al. 2010: same weight lost, but 5.5 h sleepers lost 0.6 kg fat vs 1.4 kg, and 2.4 kg lean vs 1.5 kg. */
export const StudyBars: React.FC<{t: number; split: number}> = ({t, split}) => {
  const p = pop(t, 0), grow = interpolate(t, [0.4, 1.6], [0, 1], ease);
  const S = 150; // px per kg
  const col = (x: number, label: string, c: string, fat: number, lean: number) => {
    const tot = (fat + lean) * S * grow;
    return (
      <div style={{position: 'absolute', left: x, top: 380, width: 300, height: 760}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', ...F(46), color: c}}>{label}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', ...F(22, 800), color: 'rgba(255,255,255,.6)', letterSpacing: 3}}>SLEEP / NIGHT</div>
        <div style={{position: 'absolute', left: 50, width: 200, top: 130, height: tot, borderRadius: 24, overflow: 'hidden', background: c, boxShadow: `0 0 34px ${c}88`}}>
          {/* split into fat (top, gold) and lean mass (bottom) */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: fat * S * grow * split + (1 - split) * tot, background: split > 0 ? FX.gold : c}} />
          {split > 0.6 && <>
            <div style={{position: 'absolute', left: 0, right: 0, top: fat * S * grow / 2 - 16, textAlign: 'center', ...F(30), color: '#2A1800'}}>FAT {fat.toFixed(1)}</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: fat * S * grow + (lean * S * grow) / 2 - 16, textAlign: 'center', ...F(30), color: '#fff'}}>LEAN {lean.toFixed(1)}</div>
          </>}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150 + tot, textAlign: 'center', ...F(44), color: '#fff'}}>−{(fat + lean).toFixed(1)} kg</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1A1424, #06070C 72%)', opacity: p}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...F(50), color: '#fff'}}>DIET STUDY</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center', ...F(26, 800), color: 'rgba(255,255,255,.6)', letterSpacing: 3}}>SAME CALORIE DEFICIT · 14 DAYS</div>
      {col(120, '8.5 H', FX.blue, 1.4, 1.5)}
      {col(660, '5.5 H', FX.red, 0.6, 2.4)}
      {t > 4.4 && split < 0.3 && <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', ...F(56), color: FX.gold, transform: `scale(${interpolate(t, [4.4, 4.65], [1.5, 1], clamp)})`}}>SAME WEIGHT LOST</div>}
      {split > 0.6 && <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center'}}>
        <div style={{...F(60), color: FX.red, textShadow: `0 0 30px ${FX.red}`}}>−55% FAT LOST</div>
        <div style={{...F(44), color: '#fff', marginTop: 16, opacity: split > 0.95 ? 1 : 0}}>+60% LEAN MASS LOST</div>
      </div>}
      <Source text="NEDELTCHEVA ET AL. · ANNALS OF INTERNAL MEDICINE 2010" top={1330} />
    </AbsoluteFill>
  );
};

/** "Sleep is the cheapest supplement" product shot. */
export const SleepSupplement: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 0);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #142A55, #05070C 70%)'}}>
      {Array.from({length: 50}).map((_, k) => <div key={k} style={{position: 'absolute', left: random(`ss${k}`) * 1080, top: random(`st${k}`) * 1300, width: 4, height: 4, borderRadius: 2, background: '#fff', opacity: 0.2 + 0.6 * Math.abs(Math.sin(t * 2 + k))}} />)}
      <div style={{position: 'absolute', left: 340, top: 430, width: 400, height: 560, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -12}deg)`}}>
        <div style={{position: 'absolute', left: 20, right: 20, top: 0, height: 90, borderRadius: 24, background: '#0D0F16', border: '3px solid #2A2E3A'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, bottom: 0, borderRadius: 40, background: 'linear-gradient(90deg, #F2F4FA, #FFFFFF 40%, #D9DCE6)', boxShadow: '0 0 90px rgba(140,170,255,.55)'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 280, background: 'linear-gradient(135deg, #1E2C6B, #3D5BFF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: 90}}>🌙</div>
            <div style={{...F(84), color: '#fff', letterSpacing: 2}}>SLEEP</div>
            <div style={{...F(30, 800), color: '#BFD0FF', letterSpacing: 6, marginTop: 6}}>7–9 HOURS</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 700, top: 400, width: 220, height: 220, borderRadius: 110, background: FX.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(t, 0.6)}) rotate(14deg)`, boxShadow: `0 0 50px ${FX.gold}`}}>
        <div style={{textAlign: 'center'}}><div style={{...F(80), color: '#2A1800'}}>$0</div><div style={{...F(26, 800), color: '#2A1800', letterSpacing: 3}}>FREE</div></div>
      </div>
    </AbsoluteFill>
  );
};

/** Comment poll. */
export const SleepPoll: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: 360, ...card, padding: '36px 40px', opacity: pop(t, 0), transform: `translateY(${(1 - pop(t, 0)) * 60}px)`}}>
    <div style={{...F(50), color: '#fff', textAlign: 'center'}}>HOW MANY HOURS<br />DO YOU SLEEP?</div>
    {['😵 5 H OR LESS', '🥱 6 H', '🙂 7 H', '😴 8 H+'].map((o, i) => (
      <div key={i} style={{marginTop: 22, padding: '20px 30px', borderRadius: 24, border: `3px solid ${[FX.red, '#FF8A3D', FX.gold, FX.blue][i]}`, background: 'rgba(255,255,255,.04)', ...F(42), color: '#fff', opacity: pop(t, 0.25 + i * 0.18), transform: `translateX(${(1 - pop(t, 0.25 + i * 0.18)) * -80}px)`}}>{o}</div>
    ))}
    <div style={{...F(34), color: FX.gold, textAlign: 'center', marginTop: 26, letterSpacing: 3}}>COMMENT BELOW 👇</div>
  </div>
);

/** Pointer label (chip + line) for facial features. */
export const Callout: React.FC<{t: number; at: number; text: string; x: number; y: number; tx: number; ty: number; color?: string}> = ({t, at, text, x, y, tx, ty, color = FX.red}) => {
  const p = pop(t, at); if (p <= 0) return null;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={color} strokeWidth={5} /><circle cx={tx} cy={ty} r={12 * p} fill={color} /></svg>
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p})`, background: 'rgba(8,10,14,.85)', border: `3px solid ${color}`, borderRadius: 999, padding: '12px 26px', ...F(32), color: '#fff', whiteSpace: 'nowrap'}}>{text}</div>
    </>
  );
};
