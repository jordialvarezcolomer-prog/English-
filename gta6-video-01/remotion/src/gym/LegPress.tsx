import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import {BG, FONT, G, OL, Person, POSES, Pose, V, ik} from './kit';
import D from '../macaque/lpsegments.json';
import SH from '../macaque/lpshots.json';

/* VERTICAL (45-degree sled) vs HORIZONTAL (flat seated) leg press — Alex vs Daniel. UK English. Timeline from lpsegments.json + lpshots.json.
   Sources to verify before claiming anything on screen: NSCA Essentials of Strength Training; Schoenfeld 2010. Cards/diagrams are ILLUSTRATIVE (no invented numbers). */
const FPS = 30;
const SEG = D.segs as {start: number; end: number; text: string}[];
const EV = D.events as Record<string, number>;
const SHOTS = SH as {name: string; from: number; to: number; speed: number}[];
const A = (i: number) => SEG[i].start;
const END = D.dur + 0.9;
export const LEGPRESS_TOTAL = Math.round(END * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (u: number) => u * u * (3 - 2 * u);
const back = (u: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const BLUE = G.blue, RED = G.red, S = 0.8, REP = 1.05, CH = 1100, TOP = 230;
const rad = (d: number) => (d * Math.PI) / 180;
const repU = (t: number, off = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (t + off)) / REP);

/* ---------------- athlete geometry (rig canvas 800x560, hip at HIPR) ---------------- */
const HIPR: V = [260, 360];
const CFG = {v: {b: 50, g: 45}, h: {b: 24, g: 10}};
const rigGeo = (kind: 'v' | 'h', d: number, lift = 0, footOff = 0) => {
  const {b, g} = CFG[kind];
  const H: V = [150 + lift * (kind === 'v' ? 10 : 4), 380 - lift * (kind === 'v' ? 18 : 6)];
  const sh: V = [150 - 150 * Math.sin(rad(b)), 380 - 150 * Math.cos(rad(b))];
  const head: V = [sh[0] + 6 * Math.cos(rad(b)) - 56 * Math.sin(rad(b)), sh[1] - 6 * Math.sin(rad(b)) - 56 * Math.cos(rad(b))];
  const n: V = [Math.cos(rad(g)), -Math.sin(rad(g))], tdir: V = [Math.sin(rad(g)), Math.cos(rad(g))], base: V = [H[0] + d * n[0], H[1] + d * n[1]], foot: V = [base[0] + footOff * tdir[0], base[1] + footOff * tdir[1]];
  const hand: V = [H[0] + 30, H[1] - 34];
  const pose: Pose = {hip: H, sh, head, handL: hand, handR: [hand[0] + 8, hand[1] + 4], footL: foot, footR: [foot[0] + 6, foot[1] + 6], legBend: 1, armBend: -1};
  const R = (p: V): V => [HIPR[0] + (p[0] - 150) * S, HIPR[1] + (p[1] - 380) * S];
  const knee = ik(H, foot, 98, 96, 1);
  return {pose, n, g, b, hipR: R(H), shR: R(sh), headR: R(head), kneeR: R(knee), footR: R(foot), baseR: R(base), R};
};

/* ---------------- machines (rig coords) ---------------- */
const Pegs: React.FC<{on: boolean; t: number}> = ({on, t}) => on ? <g><rect x={272} y={392} width={54} height={20} rx={6} fill="#FFC93C" stroke={OL} strokeWidth={4} opacity={0.7 + 0.3 * Math.sin(t * 14)} /><text x={340} y={408} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#7A5A10">← STOP</text></g> : null;
const PlateTxt: React.FC<{r: number}> = ({r}) => <text textAnchor="middle" y={r * 0.12} fontFamily={FONT} fontWeight={900} fontSize={r * 0.36} fill="#fff" letterSpacing={1}>20 KG</text>;
const SledMachine: React.FC<{geo: ReturnType<typeof rigGeo>; plates: number; stops?: boolean; t: number; band?: boolean}> = ({geo, plates, stops, t, band}) => {
  const n = geo.n, c: V = [geo.baseR[0] + n[0] * (16 * S + 8), geo.baseR[1] + n[1] * (16 * S + 8)], pd: V = [0.707, 0.707];
  const rs: V = [HIPR[0] + 30, HIPR[1] + 70], re: V = [rs[0] + 330 * n[0], rs[1] + 330 * n[1]], car: V = [c[0] + pd[0] * 62, c[1] + pd[1] * 62];
  return (
    <g>
      <rect x={120} y={462} width={520} height={16} rx={7} fill="#2B2F3A" stroke={OL} strokeWidth={4} />
      <rect x={rs[0] - 12} y={rs[1]} width={24} height={462 - rs[1]} fill="#4C5260" stroke={OL} strokeWidth={3} /><rect x={re[0] - 12} y={re[1] + 10} width={24} height={452 - re[1]} fill="#4C5260" stroke={OL} strokeWidth={3} />
      <line x1={rs[0]} y1={rs[1]} x2={re[0]} y2={re[1]} stroke={OL} strokeWidth={30} strokeLinecap="round" /><line x1={rs[0]} y1={rs[1]} x2={re[0]} y2={re[1]} stroke="#5C6372" strokeWidth={22} strokeLinecap="round" />
      <Pegs on={!!stops} t={t} />
      <g transform={`translate(${geo.hipR[0] - 8} ${geo.hipR[1] + 34}) rotate(-18)`}><rect x={-64} y={-14} width={128} height={28} rx={13} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <g transform={`translate(${geo.hipR[0] - 56} ${geo.hipR[1] - 52}) rotate(-50)`}><rect x={-17} y={-150} width={34} height={250} rx={15} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <line x1={car[0]} y1={car[1]} x2={c[0]} y2={c[1]} stroke="#9AA0AC" strokeWidth={14} strokeLinecap="round" />
      <g transform={`translate(${c[0] + n[0] * 8} ${c[1] + n[1] * 8}) rotate(-45)`}><rect x={-8} y={-130} width={16} height={260} rx={7} fill="#9AA0AC" stroke={OL} strokeWidth={4} /></g>
      <rect x={car[0] - 30} y={car[1] - 24} width={60} height={48} rx={10} fill="#C9CDD4" stroke={OL} strokeWidth={4} transform={`rotate(-45 ${car[0]} ${car[1]})`} />
      {Array.from({length: plates}).map((_, i) => <g key={i} transform={`translate(${car[0] + 34 + i * 9} ${car[1] - 30 - i * 9})`}><circle r={64 - i * 2} fill={i % 2 ? '#25272D' : '#1C1D22'} stroke={OL} strokeWidth={4} />{i === plates - 1 && <PlateTxt r={64 - i * 2} />}<circle r={13} fill="#C9CDD4" stroke={OL} strokeWidth={3} opacity={0.0} /></g>)}
      {band && <g transform={`translate(${geo.footR[0] + n[0] * 14} ${geo.footR[1] + n[1] * 14}) rotate(-45)`}><rect x={-10} y={-40} width={20} height={80} rx={8} fill="none" stroke="#FFC93C" strokeWidth={7} /></g>}
    </g>
  );
};
const FlatMachine: React.FC<{geo: ReturnType<typeof rigGeo>; plates: number}> = ({geo, plates}) => {
  const n = geo.n, c: V = [geo.baseR[0] + n[0] * (16 * S + 8), geo.baseR[1] + n[1] * (16 * S + 8)], rs: V = [HIPR[0] - 20, HIPR[1] + 66], re: V = [rs[0] + 470 * n[0], rs[1] + 470 * n[1]];
  return (
    <g>
      <rect x={120} y={462} width={600} height={16} rx={7} fill="#2B2F3A" stroke={OL} strokeWidth={4} />
      <rect x={rs[0] - 12} y={rs[1]} width={24} height={462 - rs[1]} fill="#4C5260" stroke={OL} strokeWidth={3} /><rect x={re[0] - 12} y={re[1]} width={24} height={462 - re[1]} fill="#4C5260" stroke={OL} strokeWidth={3} />
      <line x1={rs[0]} y1={rs[1]} x2={re[0]} y2={re[1]} stroke={OL} strokeWidth={30} strokeLinecap="round" /><line x1={rs[0]} y1={rs[1]} x2={re[0]} y2={re[1]} stroke="#5C6372" strokeWidth={22} strokeLinecap="round" />
      <g transform={`translate(${geo.hipR[0] - 6} ${geo.hipR[1] + 34}) rotate(-6)`}><rect x={-66} y={-14} width={132} height={28} rx={13} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <g transform={`translate(${geo.hipR[0] - 50} ${geo.hipR[1] - 58}) rotate(-24)`}><rect x={-17} y={-140} width={34} height={240} rx={15} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <g transform={`translate(${c[0] + n[0] * 8} ${c[1] + n[1] * 8}) rotate(-10)`}><rect x={-8} y={-130} width={16} height={260} rx={7} fill="#9AA0AC" stroke={OL} strokeWidth={4} /></g>
      <line x1={c[0]} y1={c[1] + 60} x2={c[0] + 90} y2={c[1] + 60 + 90 * n[1]} stroke="#6A707E" strokeWidth={14} />
      {Array.from({length: plates}).map((_, i) => <g key={i} transform={`translate(${c[0] + 100 + i * 9} ${c[1] + 54 + 90 * n[1] - i * 9})`}><circle r={62 - i * 2} fill={i % 2 ? '#25272D' : '#1C1D22'} stroke={OL} strokeWidth={4} />{i === plates - 1 && <PlateTxt r={62 - i * 2} />}<circle r={13} fill="#C9CDD4" stroke={OL} strokeWidth={3} opacity={0.0} /></g>)}
    </g>
  );
};
/** One athlete on one machine (rig canvas scaled by K and placed at x,y in the stage). */
const RigBox: React.FC<{kind: 'v' | 'h'; t: number; K: number; x: number; y: number; dmin?: number; lift?: number; plates?: number; angle?: boolean; lumbar?: number; stops?: boolean; off?: number; freeze?: number; padGlow?: boolean; speed?: number; footOff?: number; muscles?: 'high' | 'low' | 'all' | null}> = ({kind, t, K, x, y, dmin, lift = 0, plates = 2, angle, lumbar = 0, stops, off = 0, freeze, padGlow, speed = 1, footOff = 0, muscles = null}) => {
  const u = freeze !== undefined ? freeze : repU(t * speed, off), d = lerp(dmin ?? (kind === 'v' ? 80 : 118), 186, u), geo = rigGeo(kind, d, lift, footOff), bottom = u < 0.3, phase = (((t * speed + off) / REP) % 1 + 1) % 1;
  const col = kind === 'v' ? BLUE : RED, ph = (t * 1.6) % 1;
  const a1 = Math.atan2(geo.shR[1] - geo.hipR[1], geo.shR[0] - geo.hipR[0]), a2 = Math.atan2(geo.kneeR[1] - geo.hipR[1], geo.kneeR[0] - geo.hipR[0]);
  const arc = (r: number) => `M${geo.hipR[0] + r * Math.cos(a1)} ${geo.hipR[1] + r * Math.sin(a1)} A${r} ${r} 0 0 ${((a2 - a1 + 6.2832) % 6.2832) > Math.PI ? 0 : 1} ${geo.hipR[0] + r * Math.cos(a2)} ${geo.hipR[1] + r * Math.sin(a2)}`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 800, height: 560, transformOrigin: '0 0', transform: `scale(${K})`}}>
      <svg width={800} height={560} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {kind === 'v' ? <SledMachine geo={geo} plates={plates} stops={stops} t={t} band={footOff !== 0} /> : <FlatMachine geo={geo} plates={plates} />}
        {padGlow && <g transform={`translate(${geo.hipR[0] - 50} ${geo.hipR[1] - 58}) rotate(-24)`}><rect x={-26} y={-146} width={52} height={250} rx={20} fill="none" stroke="#22A861" strokeWidth={9} opacity={0.5 + 0.5 * Math.sin(t * 9)} /></g>}
      </svg>
      <Person pose={geo.pose} shirt={kind === 'v' ? BLUE : RED} phones={kind === 'v'} cap={kind === 'h'} beard={kind === 'h'} hair="short" mood={bottom ? 'strain' : 'flat'} sweat={ph} shoeRot={-(90 + geo.g)} fists s={S} x={HIPR[0] - 150 * S} y={HIPR[1] - 380 * S} />
      <svg width={800} height={560} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {[0, 1, 2, 3, 4].map((i) => { const p = (t * 1.5 + i / 5) % 1; return <path key={i} transform={`translate(${geo.headR[0] - 40 - p * 70 * (i % 2 ? 1 : 0.6)} ${geo.headR[1] - 30 - p * 50 + i * 8})`} d="M0 0 q-6 11 0 14 q6 -3 0 -14z" fill="#8FD3FF" stroke={OL} strokeWidth={2} opacity={(1 - p) * 0.9} />; })}
        {phase < 0.25 && <circle cx={geo.baseR[0] + geo.n[0] * 22} cy={geo.baseR[1] + geo.n[1] * 22} r={20 + 100 * (phase / 0.25)} fill="none" stroke="#FFC93C" strokeWidth={7} opacity={1 - phase / 0.25} />}
        {muscles && (() => {
          const vx = geo.kneeR[0] - geo.hipR[0], vy = geo.kneeR[1] - geo.hipR[1], L = Math.hypot(vx, vy) || 1; let p: V = [vy / L, -vx / L]; if (p[1] > 0) p = [-p[0], -p[1]];
          const at = (a: V, b: V, k: number, m: number): V => [lerp(a[0], b[0], k) + p[0] * m, lerp(a[1], b[1], k) + p[1] * m];
          const pu = 0.65 + 0.35 * Math.sin(t * 9), hi = muscles === 'high', lo = muscles === 'low', all = muscles === 'all';
          const oq = lo || all ? pu : 0.18, oh = hi || all ? pu : 0.18, og = hi || all ? pu : 0.18;
          const q0 = at(geo.hipR, geo.kneeR, 0.2, 11), q1 = at(geo.hipR, geo.kneeR, 0.92, 11), h0 = at(geo.hipR, geo.kneeR, 0.2, -11), h1 = at(geo.hipR, geo.kneeR, 0.92, -11), c0 = at(geo.kneeR, geo.footR, 0.16, -10), c1 = at(geo.kneeR, geo.footR, 0.8, -10);
          const lab = (txt: string, pt: V, col: string, dx = 0) => <text x={pt[0] + dx} y={pt[1]} fontFamily={FONT} fontWeight={900} fontSize={26} fill={col} stroke="#fff" strokeWidth={6} paintOrder="stroke">{txt}</text>;
          return (
            <g>
              <line x1={q0[0]} y1={q0[1]} x2={q1[0]} y2={q1[1]} stroke="#22A861" strokeWidth={19} strokeLinecap="round" opacity={oq} />
              <line x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]} stroke="#FF8A1E" strokeWidth={19} strokeLinecap="round" opacity={oh} />
              <ellipse cx={geo.hipR[0] - 10} cy={geo.hipR[1] + 10} rx={34} ry={28} fill="#FF4D8D" opacity={og * 0.85} />
              {all && <line x1={c0[0]} y1={c0[1]} x2={c1[0]} y2={c1[1]} stroke="#3AA0FF" strokeWidth={15} strokeLinecap="round" opacity={pu} />}
              {(lo || all) && lab('QUADS', at(geo.hipR, geo.kneeR, 0.5, 58), '#117A3A', -40)}
              {(hi || all) && lab('HAMSTRINGS', at(geo.hipR, geo.kneeR, 0.45, -66), '#C25E00', -20)}
              {(hi || all) && lab('GLUTES', [geo.hipR[0] - 150, geo.hipR[1] + 60], '#C2185B')}
              {all && lab('CALVES', at(geo.kneeR, geo.footR, 0.5, -52), '#1565C0')}
            </g>
          );
        })()}
        {angle && <g><path d={arc(64)} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" /><line x1={geo.kneeR[0]} y1={geo.kneeR[1]} x2={lerp(geo.shR[0], geo.hipR[0], 0.2)} y2={lerp(geo.shR[1], geo.hipR[1], 0.2)} stroke={col} strokeWidth={5} strokeDasharray="10 8" /><circle cx={geo.kneeR[0]} cy={geo.kneeR[1]} r={22} fill="none" stroke={col} strokeWidth={6} opacity={0.5 + 0.5 * Math.sin(t * 12)} /></g>}
        {lumbar > 0 && <g><path d={`M${geo.shR[0]} ${geo.shR[1]} Q${lerp(geo.shR[0], geo.hipR[0], 0.5) - 34 * lumbar} ${lerp(geo.shR[1], geo.hipR[1], 0.5) + 24 * lumbar} ${geo.hipR[0] - 20} ${geo.hipR[1] + 6}`} fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" opacity={0.9} /><ellipse cx={geo.hipR[0] - 22} cy={geo.hipR[1] + 8} rx={46} ry={34} fill="none" stroke={RED} strokeWidth={7} opacity={0.5 + 0.5 * Math.sin(t * 20)} /></g>}
      </svg>
    </div>
  );
};
const headStage = (kind: 'v' | 'h', K: number, x: number, y: number): V => { const g = rigGeo(kind, 140); return [x + K * g.headR[0], y + K * g.headR[1]]; };

const Stamp: React.FC<{t: number; at: number; text: string; fill: string; dur?: number; y?: number; rot?: number; size?: number}> = ({t, at, text, fill, dur = 1.3, y = 1000, rot = -5, size = 96}) => {
  const lt = t - at; if (lt < 0 || lt > dur) return null;
  const k = lt < 0.3 ? back(lt / 0.3) : 1, o = lt > dur - 0.25 ? (dur - lt) / 0.25 : 1, w = text.length * size * 0.62 + 80;
  return <g transform={`translate(540 ${y}) rotate(${rot}) scale(${k})`} opacity={o}><rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.5} rx={26} fill={fill} stroke="#fff" strokeWidth={8} /><text textAnchor="middle" y={size * 0.28} fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff" stroke="#17181C" strokeWidth={8} paintOrder="stroke">{text}</text></g>;
};
const scoreAt = (t: number) => ({a: t >= EV.pointA ? 1 : 0, d: (t >= EV.pointD2 ? 1 : 0) + (t >= EV.pointD5 ? 1 : 0)});
const Score: React.FC<{t: number}> = ({t}) => {
  const sc = scoreAt(t);
  const dots = [[EV.pointA, BLUE], [EV.pointD2, RED], [EV.draw3, '#9A9AA2'], [EV.draw4, '#9A9AA2'], [EV.pointD5, RED]] as [number, string][];
  return (
    <g>
      <rect x={40} y={36} width={300} height={120} rx={34} fill={BLUE} stroke="#17181C" strokeWidth={6} /><text x={70} y={86} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">ALEX</text><text x={310} y={126} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#fff">{sc.a}</text>
      <rect x={740} y={36} width={300} height={120} rx={34} fill={RED} stroke="#17181C" strokeWidth={6} /><text x={770} y={86} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">DANIEL</text><text x={1010} y={126} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#fff">{sc.d}</text>
      {dots.map(([at, col], i) => <g key={i}><circle cx={400 + i * 70} cy={96} r={26} fill={t >= at ? col : '#fff'} stroke="#17181C" strokeWidth={5} /><text x={400 + i * 70} y={106} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={t >= at ? '#fff' : '#17181C'}>{i + 1}</text></g>)}
    </g>
  );
};
const Bar: React.FC<{y: number; label: string; v: number; col: string; t0: number; t: number}> = ({y, label, v, col, t0, t}) => {
  const k = sm(c01((t - t0) / 0.7)) * v;
  return <g><text x={90} y={y + 36} fontFamily={FONT} fontWeight={900} fontSize={38} fill="#17181C">{label}</text><rect x={420} y={y} width={540} height={54} rx={27} fill="#fff" stroke="#17181C" strokeWidth={5} /><rect x={424} y={y + 4} width={Math.max(0, 532 * k)} height={46} rx={23} fill={col} /></g>;
};
const Card: React.FC<{t: number; at: number; title: string; sub?: string; bg?: string; children?: React.ReactNode}> = ({t, at, title, sub, bg = '#fff', children}) => {
  const k = sm(c01((t - at) / 0.35));
  return (
    <g transform={`translate(0 ${(1 - k) * 80})`} opacity={k}>
      <rect x={50} y={1480} width={980} height={400} rx={40} fill={bg} stroke="#17181C" strokeWidth={6} />
      <text x={90} y={1550} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#17181C">{title}</text>
      {sub && <text x={90} y={1590} fontFamily={FONT} fontWeight={700} fontSize={28} fill="#5A5A60">{sub}</text>}
      {children}
    </g>
  );
};
const Cards: React.FC<{t: number}> = ({t}) => {
  const w = (a: number, b: number) => t >= a && t < b;
  return (
    <g>
      {w(4.6, 7.8) && <Card t={t} at={4.6} title="TWO MACHINES, ONE QUESTION" sub="Lying, push UP  vs  sitting, push FORWARD"><text x={90} y={1700} fontFamily={FONT} fontWeight={900} fontSize={60} fill={BLUE}>VERTICAL</text><text x={90} y={1780} fontFamily={FONT} fontWeight={900} fontSize={60} fill={RED}>HORIZONTAL</text><text x={560} y={1740} fontFamily={FONT} fontWeight={900} fontSize={120} fill="#17181C">VS</text></Card>}
      {w(7.8, 11.0) && <Card t={t} at={7.8} title="ALEX: LYING BACK, PUSHES UP" sub="45° sled leg press" />}
      {w(11.0, EV.r1 - 0.2) && <Card t={t} at={11.0} title="DANIEL: SEATED, PUSHES FORWARD" sub="Flat seated leg press" />}
      {w(EV.r1 - 0.2, EV.but) && <Card t={t} at={EV.r1 - 0.2} title="ROUND 1: RANGE OF MOTION" sub="Illustrative"><Bar y={1640} label="VERTICAL" v={0.92} col={BLUE} t0={EV.r1} t={t} /><Bar y={1730} label="HORIZONTAL" v={0.6} col={RED} t0={EV.r1 + 0.3} t={t} /></Card>}
      {w(EV.but, EV.r2 - 0.2) && <Card t={t} at={EV.but} title="DANGER: TOO DEEP" sub="Pelvis lifts off the pad, lower back ROUNDS" bg="#FFE4E1"><path d="M 220 1790 Q 330 1630 440 1790" fill="none" stroke={RED} strokeWidth={22} strokeLinecap="round" /><text x={520} y={1760} fontFamily={FONT} fontWeight={900} fontSize={64} fill={RED}>ROUNDS!</text></Card>}
      {w(EV.r2 - 0.2, EV.r3 - 0.2) && <Card t={t} at={EV.r2 - 0.2} title="ROUND 2: BACK SUPPORT" sub="Illustrative"><Bar y={1640} label="HORIZONTAL" v={0.92} col={RED} t0={EV.r2} t={t} /><Bar y={1730} label="VERTICAL" v={0.6} col={BLUE} t0={EV.r2 + 0.3} t={t} /></Card>}
      {w(EV.r3 - 0.2, EV.r4 - 0.2) && <Card t={t} at={EV.r3 - 0.2} title="ROUND 3: SAFETY" sub="Same rules for BOTH"><g fontFamily={FONT} fontWeight={900} fontSize={46}><text x={90} y={1700} fill="#22A861">✔ USE THE SAFETY STOPS</text>{t >= EV.lock - 0.2 && <text x={90} y={1780} fill={RED}>✖ NEVER LOCK YOUR KNEES</text>}</g></Card>}
      {w(EV.r4 - 0.2, EV.r5 - 0.2) && <Card t={t} at={EV.r4 - 0.2} title="ROUND 4: THE MUSCLES" sub="Same for BOTH machines"><g fontFamily={FONT} fontWeight={900} fontSize={42}><text x={90} y={1690} fill={t >= EV.higher - 0.1 && t < EV.lower - 0.2 ? '#17181C' : '#9A9AA2'}>FEET HIGHER → GLUTES + HAMSTRINGS</text><text x={90} y={1770} fill={t >= EV.lower - 0.2 ? '#17181C' : '#9A9AA2'}>FEET LOWER → QUADS</text></g></Card>}
      {w(EV.r5 - 0.2, EV.bonus - 0.2) && <Card t={t} at={EV.r5 - 0.2} title="ROUND 5: CONVENIENCE" sub="In most gyms. Illustrative"><Bar y={1640} label="HORIZONTAL" v={0.95} col={RED} t0={EV.r5} t={t} /><Bar y={1730} label="VERTICAL" v={0.3} col={BLUE} t0={EV.r5 + 0.3} t={t} /></Card>}
      {w(EV.bonus - 0.2, EV.wins - 0.6) && <Card t={t} at={EV.bonus - 0.2} title="BONUS: WARM-UP" sub="Light set first, add weight slowly">{[0, 1, 2, 3].map((i) => <circle key={i} cx={200 + i * 150} cy={1740} r={30 + i * 12} fill="#1C1D22" stroke="#17181C" strokeWidth={5} opacity={t >= EV.bonus + 1.2 + i * 0.7 ? 1 : 0.2} />)}</Card>}
      {w(EV.wins - 0.6, EV.control - 0.2) && <Card t={t} at={EV.wins - 0.6} title="WHO WINS? IT DEPENDS ON YOU" sub="Your level and your back decide"><g fontFamily={FONT} fontWeight={900} fontSize={37}>{t >= EV.horiz - 0.2 ? <><text x={90} y={1690} fill={RED}>BEGINNER / SORE BACK → HORIZONTAL</text></> : null}{t >= EV.vert - 0.2 ? <text x={90} y={1770} fill={BLUE}>EXPERIENCED + MOBILE → VERTICAL</text> : null}</g></Card>}
      {w(EV.control - 0.2, EV.tell - 0.2) && <Card t={t} at={EV.control - 0.2} title="PICK THE ONE YOU CONTROL" sub="Add weight little by little. Quality reps beat ego">{[0, 1, 2, 3].map((i) => <rect key={i} x={120 + i * 200} y={1790 - (i + 1) * 40} width={150} height={(i + 1) * 40} rx={10} fill={i % 2 ? RED : BLUE} stroke="#17181C" strokeWidth={5} opacity={t >= EV.control + 0.3 + i * 0.5 ? 1 : 0.2} />)}</Card>}
      {t >= EV.tell - 0.2 && <Card t={t} at={EV.tell - 0.2} title="WHICH DO YOU USE?" sub="Tell me in the comments"><rect x={150} y={1660} width={780} height={150} rx={75} fill={G.yellow} stroke="#17181C" strokeWidth={6} /><text x={540} y={1760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#17181C">SEND IT TO YOUR GYM BUDDY</text></Card>}
    </g>
  );
};
const Subs: React.FC = () => {
  const s = useCurrentFrame() / FPS, i = SEG.findIndex((x) => s >= x.start - 0.05 && s <= x.end + 0.12);
  if (i < 0) return null;
  const sg = SEG[i], words = sg.text.split(/\s+/), n = words.length, k = Math.ceil(n / 4), size = Math.ceil(n / k), chunks: string[][] = [];
  for (let j = 0; j < n; j += size) chunks.push(words.slice(j, j + size));
  const tot = chunks.reduce((a, c) => a + c.join(' ').length + 1, 0); let tt = sg.start; const cards: {t0: number; t1: number; w: {w: string; a: number}[]}[] = [];
  for (const c of chunks) { const d = ((sg.end - sg.start) * (c.join(' ').length + 1)) / tot, L = c.reduce((a, x) => a + x.length + 1, 0); let acc = tt; cards.push({t0: tt, t1: tt + d, w: c.map((x) => { const st = acc; acc += (d * (x.length + 1)) / L; return {w: x, a: st}; })}); tt += d; }
  const card = cards.find((c) => s >= c.t0 && s < c.t1 + 0.04) ?? cards[cards.length - 1];
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: 1346, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', borderRadius: 16, padding: '10px 28px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 54, letterSpacing: -1, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,.18)'}}>
        {card.w.map((x, j) => <span key={j} style={{color: s >= x.a - 0.02 ? '#fff' : '#7d7d7d', marginRight: j < card.w.length - 1 ? 16 : 0}}>{x.w}</span>)}
      </div>
    </div>
  );
};
const calmW = (t: number) => sm(c01((t - (EV.wins - 0.6)) / 1.2));


/* ---------------- diagrams (stage coords 1080 x 1100) ---------------- */
const SKIN = '#F3B78E', SKIN_D = '#D29467';
const Capsule: React.FC<{a: V; b: V; w: number; c: string}> = ({a, b, w, c}) => <g><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={OL} strokeWidth={w + 8} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" /></g>;
const LegSide: React.FC<{hip: V; foot: V; k?: number; glow?: 'hams' | 'quads' | null; t: number; locked?: boolean}> = ({hip, foot, k = 2.2, glow, t, locked}) => {
  const knee = ik(hip, foot, 98 * k, 96 * k, 1), dx = knee[0] - hip[0], dy = knee[1] - hip[1], L = Math.hypot(dx, dy) || 1, p: V = [dy / L, -dx / L];
  const off = (a: V, b: V, m: number): [V, V] => [[a[0] + p[0] * m, a[1] + p[1] * m], [b[0] + p[0] * m, b[1] + p[1] * m]];
  const pulse = 0.55 + 0.35 * Math.sin(t * 8);
  return (
    <g>
      <Capsule a={knee} b={foot} w={84} c={SKIN} /><Capsule a={hip} b={knee} w={118} c={SKIN} />
      {glow === 'quads' && (() => { const [a, b] = off(hip, knee, -34); return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#22A861" strokeWidth={46} strokeLinecap="round" opacity={pulse} />; })()}
      {glow === 'hams' && (() => { const [a, b] = off(hip, knee, 34); return <g><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#FF8A1E" strokeWidth={46} strokeLinecap="round" opacity={pulse} /><circle cx={hip[0] + p[0] * 40} cy={hip[1] + p[1] * 40} r={66} fill="#FF8A1E" opacity={pulse * 0.8} /></g>; })()}
      <circle cx={knee[0]} cy={knee[1]} r={locked ? 30 : 0} fill="none" stroke={RED} strokeWidth={8} opacity={0.6 + 0.4 * Math.sin(t * 14)} />
      <rect x={foot[0] - 22} y={foot[1] - 56} width={44} height={112} rx={16} fill="#fff" stroke={OL} strokeWidth={6} />
    </g>
  );
};
const SpineDiagram: React.FC<{t: number; lt: number}> = ({t, lt}) => {
  const k = 0.5 - 0.5 * Math.cos(Math.min(lt, 2.4) * 2.6), pel: V = [620, 760 - 70 * k], sho: V = [230, 700];
  const pts = Array.from({length: 10}).map((_, i) => { const s = i / 9, bx = lerp(pel[0], sho[0], s), by = lerp(pel[1], sho[1], s), cur = (s < 0.5 ? 1 - s * 2 : 0) * 60 * k + Math.sin(s * Math.PI) * 14; return [bx, by + cur] as V; });
  return (
    <g>
      <rect x={140} y={800} width={600} height={46} rx={20} fill="#2B2F3A" stroke={OL} strokeWidth={5} /><rect x={150} y={846} width={40} height={80} fill="#4C5260" stroke={OL} strokeWidth={4} /><rect x={690} y={846} width={40} height={80} fill="#4C5260" stroke={OL} strokeWidth={4} />
      <ellipse cx={pel[0]} cy={pel[1] + 10} rx={80} ry={56} fill="#EADBC8" stroke={OL} strokeWidth={6} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={24 - i * 0.6} fill="#F6EEDD" stroke={OL} strokeWidth={5} />)}
      <circle cx={sho[0] - 20} cy={sho[1] - 6} r={34} fill="#F6EEDD" stroke={OL} strokeWidth={5} />
      <path d={`M${pel[0] - 60} ${pel[1] + 60} Q${pel[0] - 20} ${pel[1] + 130} ${pel[0] + 20} ${pel[1] + 60}`} fill="none" stroke="#9A9AA2" strokeWidth={0} />
      <path d={`M${pel[0] - 110} ${pel[1] + 40} l0 0`} stroke="none" />
      <g opacity={k}><path d="M 700 780 L 700 690" stroke={RED} strokeWidth={14} strokeLinecap="round" /><polygon points="680,700 700,660 720,700" fill={RED} /></g>
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={k > 0.5 ? RED : '#22A861'}>{k > 0.5 ? 'BACK ROUNDS!' : 'NEUTRAL BACK'}</text>
      <text x={540} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#5A5A60">pelvis lifts off the pad</text>
    </g>
  );
};
const FloorPlan: React.FC<{lt: number}> = ({lt}) => (
  <g>
    <rect x={50} y={120} width={980} height={860} rx={36} fill="#D9C7A6" stroke={OL} strokeWidth={6} />
    <text x={540} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#17181C">A TYPICAL GYM (illustrative)</text>
    {[0, 1, 2, 3, 4, 5].map((i) => { const k = back(c01((lt - 0.2 - i * 0.45) / 0.35)); const x = 130 + (i % 3) * 300, y = 260 + Math.floor(i / 3) * 190; return lt > 0.2 + i * 0.45 ? <g key={i} transform={`translate(${x} ${y}) scale(${k})`}><rect width={230} height={120} rx={18} fill={RED} stroke={OL} strokeWidth={6} /><rect x={20} y={20} width={150} height={26} rx={10} fill="#fff" opacity={0.85} /><polygon points="190,60 220,60 205,40" fill="#fff" /><text x={115} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">HORIZONTAL</text></g> : null; })}
    {lt > 3.4 && (() => { const k = back(c01((lt - 3.4) / 0.4)); return <g transform={`translate(380 700) scale(${k})`}><polygon points="0,150 60,0 300,0 240,150" fill={BLUE} stroke={OL} strokeWidth={6} /><text x={150} y={96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">VERTICAL</text></g>; })()}
    {lt > 4.6 && <text x={540} y={940} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#17181C">rarer to find</text>}
    {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${160 + i * 190 + Math.sin(lt * 3 + i) * 20} ${650 + Math.cos(lt * 2 + i) * 14})`}><circle r={18} fill={SKIN} stroke={OL} strokeWidth={4} /><rect x={-14} y={16} width={28} height={30} rx={8} fill={i % 2 ? BLUE : '#22A861'} stroke={OL} strokeWidth={4} /></g>)}
  </g>
);
const Wins: React.FC<{t: number; lt: number}> = ({t, lt}) => (
  <g>
    {Array.from({length: 24}).map((_, i) => <polygon key={i} transform={`translate(540 520) rotate(${i * 15 + lt * 20})`} points="0,-60 18,-520 -18,-520" fill="#FFE27A" opacity={0.55} />)}
    {[['ALEX', 1, BLUE, 80], ['DRAWS', 2, '#8A8A90', 400], ['DANIEL', 2, RED, 720]].map(([n, v, c, x], i) => { const k = back(c01((lt - 0.2 - i * 0.25) / 0.35)); return <g key={i} transform={`translate(${x} 360) scale(${k})`}><rect width={280} height={320} rx={36} fill={c as string} stroke={OL} strokeWidth={8} /><text x={140} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#fff">{n}</text><text x={140} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill="#fff">{v}</text></g>; })}
    <text x={540} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#17181C" transform={`rotate(${Math.sin(t * 6) * 4} 540 130)`}>WHO WINS?</text>
    {lt > 2.2 && <text x={540} y={820} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#8E6FD1" opacity={c01((lt - 2.2) / 0.3)}>IT DEPENDS ON YOU</text>}
  </g>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const Chip: React.FC<{text: string; color: string; x?: number; y?: number}> = ({text, color, x = 40, y = 20}) => <div style={{position: 'absolute', left: x, top: y, background: color, color: '#fff', borderRadius: 22, border: '5px solid #17181C', padding: '8px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 38, whiteSpace: 'nowrap'}}>{text}</div>;


const MuscleMap: React.FC<{lt: number; t: number}> = ({lt, t}) => {
  const Hh: V = [330, 400], Kn: V = [470, 720], An: V = [400, 1010], vx = Kn[0] - Hh[0], vy = Kn[1] - Hh[1], L = Math.hypot(vx, vy), nf: V = [vy / L, -vx / L];
  const sx = Kn[0] - An[0], sy = Kn[1] - An[1], L2 = Math.hypot(sx, sy), nb: V = [-sy / L2, sx / L2];
  const pop = (a: number) => sm(c01((lt - a) / 0.35)), pulse = 0.7 + 0.3 * Math.sin(t * 9);
  const strip = (a: V, b: V, off: V, m: number, k0: number, k1: number): [V, V] => [[lerp(a[0], b[0], k0) + off[0] * m, lerp(a[1], b[1], k0) + off[1] * m], [lerp(a[0], b[0], k1) + off[0] * m, lerp(a[1], b[1], k1) + off[1] * m]];
  const [q0, q1] = strip(Hh, Kn, nf, 30, 0.15, 0.92), [h0, h1] = strip(Hh, Kn, nf, -30, 0.15, 0.92), [c0, c1] = strip(Kn, An, nb, 26, 0.12, 0.78);
  const lab = (txt: string, x: number, y: number, col: string, a: number) => <g opacity={pop(a)} transform={`translate(0 ${(1 - pop(a)) * 20})`}><text x={x} y={y} fontFamily={FONT} fontWeight={900} fontSize={56} fill={col} stroke="#fff" strokeWidth={10} paintOrder="stroke">{txt}</text></g>;
  return (
    <g>
      <text x={540} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#17181C">SAME MUSCLES, BOTH MACHINES</text>
      <g transform="translate(110 0)">
      <Capsule a={[200, 330]} b={Hh} w={190} c={BLUE} /><Capsule a={Kn} b={An} w={96} c={SKIN} /><Capsule a={Hh} b={Kn} w={150} c={SKIN} />
      <rect x={An[0] - 30} y={An[1] - 10} width={150} height={56} rx={22} fill="#fff" stroke={OL} strokeWidth={6} />
      <g opacity={pop(1.0) * pulse}><ellipse cx={Hh[0] - 30} cy={Hh[1] + 10} rx={96} ry={104} fill="#FF4D8D" /></g>
      <line x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]} stroke="#FF8A1E" strokeWidth={44} strokeLinecap="round" opacity={pop(0.6) * pulse} />
      <line x1={q0[0]} y1={q0[1]} x2={q1[0]} y2={q1[1]} stroke="#22A861" strokeWidth={44} strokeLinecap="round" opacity={pop(0.2) * pulse} />
      <line x1={c0[0]} y1={c0[1]} x2={c1[0]} y2={c1[1]} stroke="#3AA0FF" strokeWidth={34} strokeLinecap="round" opacity={pop(1.4) * pulse} />
      {lab('QUADS', 600, 560, '#117A3A', 0.2)}{lab('HAMSTRINGS', 20, 760, '#C25E00', 0.6)}{lab('GLUTES', 20, 340, '#C2185B', 1.0)}{lab('CALVES', 560, 900, '#1565C0', 1.4)}
      </g>
      {lt > 1.8 && <g opacity={pop(1.8)}><rect x={560} y={190} width={420} height={80} rx={40} fill={BLUE} stroke={OL} strokeWidth={6} /><text x={770} y={245} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">VERTICAL ✔</text></g>}
      {lt > 2.1 && <g opacity={pop(2.1)}><rect x={560} y={290} width={420} height={80} rx={40} fill={RED} stroke={OL} strokeWidth={6} /><text x={770} y={345} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">HORIZONTAL ✔</text></g>}
    </g>
  );
};

const celeb = (t: number, ph: number): Pose => { const b = (0.5 + 0.5 * Math.sin(t * 6 + ph)) * 26; return {...POSES.flex, hip: [200, 365 + b], sh: [200, 215 + b], head: [200, 158 + b], handL: [100 + Math.sin(t * 7 + ph) * 26, 110 + Math.cos(t * 7 + ph) * 50], handR: [300 - Math.sin(t * 7 + ph + 1.2) * 26, 110 + Math.cos(t * 7 + ph + 1.2) * 50]}; };

/* ---------------- shot renderer ---------------- */
const KS = 1.4, SY = 144;      // solo rig scale + position in stage
const KH = 0.95;               // split rigs
type ShotOut = {node: React.ReactNode; bg: string; chip?: [string, string]; cam: [number, number, number]};
const shotAt = (name: string, t: number, lt: number, dur: number, sp: number): ShotOut => {
  const u = c01(lt / dur), drift = (z0: number, z1: number, cx: number, cy: number): [number, number, number] => [lerp(z0, z1, sm(u)), cx, cy];
  const badge = (sp: number) => { const n = Math.floor((lt * sp) / REP) + 1, ph = ((lt * sp) / REP) % 1, pop = ph < 0.2 ? 1 + 0.35 * (1 - ph / 0.2) : 1; return <div style={{position: 'absolute', right: 30, top: 24, background: '#17181C', color: '#fff', borderRadius: 24, padding: '6px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 44, transform: `scale(${pop})`, transformOrigin: '100% 0'}}>REP {n}</div>; };
  const solo = (kind: 'v' | 'h', o: Partial<React.ComponentProps<typeof RigBox>> = {}) => <><RigBox kind={kind} t={t} K={KS} x={kind === 'v' ? 78 : -6} y={SY} speed={sp} {...o} />{badge(o.speed ?? sp)}</>;
  const split = (oa: Partial<React.ComponentProps<typeof RigBox>> = {}, od: Partial<React.ComponentProps<typeof RigBox>> = {}) => <><RigBox kind="v" t={t} K={KH} x={227} y={0} speed={sp} {...oa} /><RigBox kind="h" t={t} K={KH} x={170} y={550} off={0.18} speed={sp} {...od} /></>;
  const hv = headStage('v', KS, 78, SY), hh = headStage('h', KS, -6, SY);
  const panels = (n: React.ReactNode) => <><svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0}}><rect x={0} y={10} width={1080} height={530} rx={28} fill="#E3EDFF" stroke="#17181C" strokeWidth={5} /><rect x={0} y={560} width={1080} height={530} rx={28} fill="#FFE6E3" stroke="#17181C" strokeWidth={5} /></svg>{n}</>;
  const BA = '#E3EDFF', BD = '#FFE6E3', BW = '#FFFFFF';
  switch (name) {
    case 'hook': {
      const onlyA = t >= EV.vertical && t < EV.horizontal, onlyD = t >= EV.horizontal && t < 3.4;
      const node = <><svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0}}>{!onlyD && <rect x={0} y={10} width={1080} height={530} rx={28} fill="#E3EDFF" stroke="#17181C" strokeWidth={5} />}{!onlyA && <rect x={0} y={560} width={1080} height={530} rx={28} fill="#FFE6E3" stroke="#17181C" strokeWidth={5} />}</svg>{!onlyD && <RigBox kind="v" t={t} K={KH} x={227} y={0} speed={sp} />}{!onlyA && <RigBox kind="h" t={t} K={KH} x={170} y={550} off={0.1} speed={sp} />}</>;
      return {node, bg: '#fff', cam: onlyA ? [1.9, 540, 280] : onlyD ? [1.9, 540, 830] : [1.0, 540, 550]};
    }
    case 'q1': return {node: solo('v'), bg: BA, cam: drift(1.5, 1.7, 470, 600)};
    case 'q2': return {node: solo('h'), bg: BD, cam: drift(1.5, 1.7, 340, 620)};
    case 'q3': return {node: panels(split()), bg: '#fff', cam: drift(1.0, 1.15, 540, 550)};
    case 'intro_a': return {node: <>{solo('v')}<Svg><text x={700} y={300} fontFamily={FONT} fontWeight={900} fontSize={56} fill={BLUE}>PUSH ↗</text></Svg></>, bg: BA, chip: ['ALEX · VERTICAL 45°', BLUE], cam: drift(1.0, 1.25, 540, 570)};
    case 'intro_d': return {node: <>{solo('h')}<Svg><text x={640} y={330} fontFamily={FONT} fontWeight={900} fontSize={56} fill={RED}>PUSH →</text></Svg></>, bg: BD, chip: ['DANIEL · HORIZONTAL', RED], cam: drift(1.25, 1.0, 540, 580)};
    case 'r1_a': return {node: solo('v', {angle: true, dmin: 74}), bg: BA, chip: ['VERTICAL: DEEPER', BLUE], cam: drift(1.0, 1.5, 470, 620)};
    case 'r1_d': return {node: solo('h', {angle: true}), bg: BD, chip: ['HORIZONTAL: LESS DEEP', RED], cam: drift(1.0, 1.4, 480, 640)};
    case 'r1_cmp': return {node: panels(split({angle: true, dmin: 74}, {angle: true})), bg: '#fff', cam: drift(1.0, 1.12, 540, 550)};
    case 'dng_a': return {node: solo('v', {dmin: 62, lift: sm(c01(lt / 0.8)), lumbar: sm(c01(lt / 0.8)), angle: false}), bg: '#FFE4E1', chip: ['TOO DEEP!', RED], cam: drift(1.0, 1.9, 430, 640)};
    case 'dng_spine': return {node: <Svg><g transform="translate(540 640) scale(1.12) translate(-540 -640)"><SpineDiagram t={t} lt={lt} /></g></Svg>, bg: '#FFE4E1', cam: drift(1.0, 1.1, 540, 600)};
    case 'r2_d': return {node: solo('h', {padGlow: true}), bg: BD, chip: ['HORIZONTAL: SEAT HOLDS YOU', RED], cam: drift(1.0, 1.7, 320, 580)};
    case 'r2_a': return {node: solo('v', {lumbar: 0.5}), bg: BA, chip: ['VERTICAL: PELVIS IS FREE', BLUE], cam: drift(1.0, 1.5, 430, 640)};
    case 'r3_stops': return {node: solo('v', {stops: true, dmin: 70}), bg: BA, chip: ['USE THE SAFETY STOPS', '#22A861'], cam: drift(1.0, 1.6, 450, 690)};
    case 'r3_knees': return {node: <Svg><g transform="translate(150 0)"><rect x={600} y={420} width={30} height={220} rx={12} fill="#9AA0AC" stroke={OL} strokeWidth={5} /><rect x={560} y={800} width={30} height={220} rx={12} fill="#9AA0AC" stroke={OL} strokeWidth={5} /><Capsule a={[230, 640]} b={[90, 520]} w={120} c={BLUE} /><Capsule a={[230, 940]} b={[90, 820]} w={120} c={BLUE} /><LegSide hip={[230, 640]} foot={[600, 520]} t={t} locked /><LegSide hip={[230, 940]} foot={[560, 880]} t={t} /></g><text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={RED}>✖ LOCKED</text><text x={540} y={1068} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#22A861">✔ SOFT KNEES</text></Svg>, bg: BW, cam: drift(1.0, 1.08, 540, 640)};
    case 'r4_high': return {node: solo('v', {footOff: -52, muscles: 'high'}), bg: BA, chip: ['FEET HIGH → GLUTES + HAMSTRINGS', '#E26A00'], cam: drift(1.0, 1.55, 470, 650)};
    case 'r4_low': return {node: solo('v', {footOff: 52, muscles: 'low'}), bg: BA, chip: ['FEET LOW → MORE QUADS', '#117A3A'], cam: drift(1.0, 1.55, 470, 650)};
    case 'r4_both': return {node: <Svg><MuscleMap lt={lt} t={t} /></Svg>, bg: BW, cam: drift(1.0, 1.08, 540, 600)};
    case 'r5_floor': {
      const popK = (i: number) => sm(c01((lt - 0.15 - i * 0.35) / 0.3));
      const D6: [number, number][] = [[-20, 110], [340, 110], [700, 110], [-20, 370], [340, 370], [700, 370]];
      return {node: <><svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 9}).map((_, i) => <line key={i} x1={0} x2={1080} y1={110 + i * 120} y2={110 + i * 120} stroke="#D9C7A6" strokeWidth={4} />)}<text x={540} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#17181C">A TYPICAL GYM (illustrative)</text></svg>
        {D6.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: popK(i) > 0 ? 1 : 0, transformOrigin: `${x + 200}px ${y + 140}px`, transform: `scale(${0.6 + 0.4 * popK(i)})`}}><RigBox kind="h" t={t} K={0.5} x={x} y={y} off={i * 0.19} speed={sp * (0.9 + 0.08 * (i % 3))} plates={1 + (i % 3)} /></div>)}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: lt > 2.6 ? 1 : 0, transformOrigin: '540px 860px', transform: `scale(${0.6 + 0.4 * sm(c01((lt - 2.6) / 0.35))})`}}><RigBox kind="v" t={t} K={0.78} x={230} y={640} speed={sp} /></div></>, bg: '#EFE6D2', cam: drift(1.0, 1.1, 540, 560)}; }
    case 'bonus': return {node: <>{solo('v', {plates: lt < 2.2 ? 1 : lt < 3.6 ? 2 : 3})}</>, bg: BA, chip: [lt < 2.2 ? 'LIGHT SET FIRST' : 'THEN ADD WEIGHT SLOWLY', '#8E6FD1'], cam: drift(1.0, 1.3, 480, 600)};
    case 'wins': return {node: <Svg><Wins t={t} lt={lt} /></Svg>, bg: '#FFF3C9', cam: drift(1.0, 1.1, 540, 550)};
    case 'beg': return {node: solo('h', {lumbar: 0.5}), bg: BD, chip: ['BEGINNER / SORE BACK → HORIZONTAL', RED], cam: drift(1.0, 1.35, 340, 600)};
    case 'exp': return {node: solo('v', {dmin: 70, angle: true}), bg: BA, chip: ['EXPERIENCED + MOBILE → VERTICAL', BLUE], cam: drift(1.0, 1.5, 470, 620)};
    case 'ctrl': { const pl = 1 + Math.min(3, Math.floor(lt / 1.3)); return {node: lt < 2.8 ? solo('v', {plates: pl}) : solo('h', {plates: pl}), bg: lt < 2.8 ? BA : BD, chip: [lt < 2.8 ? 'CONTROL THE REP...' : '...THEN ADD WEIGHT', lt < 2.8 ? BLUE : RED], cam: drift(1.0, 1.4, 520, 620)}; }
    case 'cta': return {node: <>{Array.from({length: 26}).map((_, i) => <div key={i} style={{position: 'absolute', left: random(`cf${i}`) * 1040, top: ((t * 220 * (0.6 + random(`cs${i}`)) + random(`cy${i}`) * 1100) % 1100) - 40, width: 18, height: 26, background: ['#2F7BF2', '#E5383B', '#FFC93C', '#22A861'][i % 4], transform: `rotate(${t * 200 + i * 40}deg)`, border: '3px solid #17181C'}} />)}<Person pose={celeb(t, 0)} shirt={BLUE} phones hair="short" mood="smile" s={1.2} x={40} y={260 - Math.abs(Math.sin(t * 6)) * 24} /><Person pose={celeb(t, 1.3)} shirt={RED} phones={false} cap beard mood="smile" flip s={1.2} x={480} y={260 - Math.abs(Math.sin(t * 6 + 1.3)) * 24} /></>, bg: '#FFF3C9', cam: drift(1.0, 1.1, 540, 550)};
    default: return {node: panels(split()), bg: '#fff', cam: drift(1.0, 1.1, 540, 550)};
  }
};

/* ---------------- composition ---------------- */
export const LegPressVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1], lt = t - shot.from, dur = shot.to - shot.from;
  const out = shotAt(shot.name, t, lt, dur, shot.speed);
  const dangerShot = shot.name === 'dng_a' || shot.name === 'dng_spine';
  const sh = shot.name === 'hook' && t < 0.5 ? 5 : dangerShot ? 6 : 0;
  let [z, cx, cy] = out.cam; { const hx = 540 / z, hy = 550 / z; cx = Math.min(1080 - hx, Math.max(hx, cx)); cy = Math.min(CH - hy, Math.max(hy, cy)); }
  const sway = ['intro_a', 'intro_d', 'r1_a', 'r1_d', 'dng_a', 'r2_d', 'r2_a', 'r3_stops', 'r4_high', 'r4_low', 'bonus', 'beg', 'exp', 'ctrl'].includes(shot.name) ? Math.sin(t * 2.4) * 1.1 : 0;
  const ox = Math.sin(t * 53) * sh, oy = Math.cos(t * 47) * sh, sl = lt < 0.2 && shot.name !== 'hook' ? 1 - lt / 0.2 : 0;
  const flash = Math.max(0, ...[EV.r1, EV.r2, EV.r3, EV.r4, EV.r5, EV.bonus, EV.pointA, EV.pointD2, EV.pointD5, EV.draw3, EV.draw4].map((a) => 1 - (t - (a - 0.05)) / 0.12).filter((v) => v < 1)) * 0.28 + (lt < 0.1 && shot.name !== 'hook' ? 0.3 * (1 - lt / 0.1) : 0);
  const hookK = t < 4.6 ? 1 : 0, scoreK = sm(c01((t - 4.4) / 0.3));
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <BG />
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: CH, overflow: 'hidden', borderRadius: 28, background: out.bg}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: CH, transformOrigin: '0 0', transform: `translate(${540 - cx * z + ox + sl * 150}px, ${550 - cy * z + oy}px) scale(${z}) rotate(${sway}deg)`, filter: sl > 0 ? `blur(${sl * 6}px)` : undefined}}>
          <svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{shot.name === 'hook' || shot.name === 'q3' || shot.name === 'r1_cmp' || shot.name === 'r4_both' || shot.name === 'ctrl' ? null : null}</svg>
          {out.node}
        </div>
        {out.chip && <Chip text={out.chip[0]} color={out.chip[1]} />}
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={scoreK}><Score t={t} /></g>
        {hookK > 0 && <g transform="translate(540 120)"><rect x={-500} y={-86} width={1000} height={172} rx={40} fill="#fff" stroke="#17181C" strokeWidth={8} /><text textAnchor="middle" y={-4} fontFamily={FONT} fontWeight={900} fontSize={66}><tspan fill={BLUE}>VERTICAL</tspan><tspan fill="#17181C"> or </tspan><tspan fill={RED}>HORIZONTAL?</tspan></text><text textAnchor="middle" y={54} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#5A5A60">which leg press is better?</text></g>}
        <Cards t={t} />
        <Stamp t={t} at={EV.r1 - 0.05} text="ROUND 1" fill="#17181C" /><Stamp t={t} at={EV.r2 - 0.05} text="ROUND 2" fill="#17181C" /><Stamp t={t} at={EV.r3 - 0.05} text="ROUND 3" fill="#17181C" /><Stamp t={t} at={EV.r4 - 0.05} text="ROUND 4" fill="#17181C" /><Stamp t={t} at={EV.r5 - 0.05} text="ROUND 5" fill="#17181C" /><Stamp t={t} at={EV.bonus - 0.05} text="BONUS" fill="#8E6FD1" />
        <Stamp t={t} at={EV.pointA - 0.05} text="POINT: ALEX" fill={BLUE} y={1250} size={72} rot={4} dur={1.2} /><Stamp t={t} at={EV.pointD2 - 0.05} text="POINT: DANIEL" fill={RED} y={1250} size={72} rot={-4} dur={1.2} /><Stamp t={t} at={EV.pointD5 - 0.05} text="POINT: DANIEL" fill={RED} y={1250} size={72} rot={4} dur={1.2} />
        <Stamp t={t} at={EV.draw3 - 0.1} text="DRAW!" fill="#8A8A90" y={1250} size={84} dur={1.3} /><Stamp t={t} at={EV.draw4 - 0.1} text="DRAW!" fill="#8A8A90" y={1250} size={84} dur={1.3} rot={5} />
        <Stamp t={t} at={EV.but} text="DANGER!" fill={RED} y={1250} size={110} dur={2.2} rot={-6} />
        {dangerShot && <rect width={1080} height={1920} fill={RED} opacity={0.07 + 0.07 * Math.sin(t * 18)} />}
      </svg>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Subs />
      <Audio src={staticFile('audio/lp_voice.wav')} />
      <Audio src={staticFile('audio/lp_sfx.wav')} volume={0.3} />
      <Audio src={staticFile('audio/lp_music_frantic.wav')} volume={(fr) => 0.45 * (1 - calmW(fr / FPS))} />
      <Audio src={staticFile('audio/lp_music_calm.wav')} volume={(fr) => 0.45 * calmW(fr / FPS)} />
    </AbsoluteFill>
  );
};
