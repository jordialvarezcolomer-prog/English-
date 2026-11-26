import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {BG, FONT, G, OL, Person, Pose, V} from './kit';
import D from '../macaque/lpsegments.json';

/* VERTICAL vs HORIZONTAL leg press — Alex (vertical, lying) vs Daniel (horizontal, seated). UK English. Timeline driven by lpsegments.json.
   Technique/biomechanics claims are the owner-approved script; sources to verify: NSCA Essentials of Strength Training; Schoenfeld 2010 (squat kinematics). Cards are ILLUSTRATIVE. */
const FPS = 30;
const SEG = D.segs as {start: number; end: number; text: string}[];
const EV = D.events as Record<string, number>;
const A = (i: number) => SEG[i].start;
const END = D.dur + 0.9;
export const LEGPRESS_TOTAL = Math.round(END * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (u: number) => u * u * (3 - 2 * u);
const back = (u: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const BLUE = G.blue, RED = G.red, S = 0.8, REP = 1.7, CH = 1100, TOP = 230;
const rad = (d: number) => (d * Math.PI) / 180;

/* ---------------- camera over the two machines (container coords 1080 x 1100) ---------------- */
const AX: V = [540, 440], DX: V = [420, 980];
const CAM: [number, number, number, number][] = ([
  [0, 1.12, 540, 550], [0.5, 1.0, 540, 550], [EV.vertical - 0.1, 1.0, 540, 550], [EV.vertical, 1.55, 540, 330], [EV.horizontal - 0.1, 1.55, 540, 330], [EV.horizontal, 1.55, 470, 880], [3.2, 1.0, 540, 550],
  [EV.alex - 0.1, 1.0, 540, 550], [EV.alex, 1.5, 520, 360], [EV.daniel - 0.1, 1.5, 520, 360], [EV.daniel, 1.5, 460, 900], [EV.r1 - 0.2, 1.0, 540, 550],
  [EV.deeper - 0.3, 1.0, 540, 550], [EV.deeper, 1.9, 500, 330], [EV.but - 0.05, 1.9, 500, 330], [EV.but + 0.15, 2.0, 520, 430], [EV.danger + 1.0, 2.0, 520, 430], [EV.r2 - 0.2, 1.0, 540, 550],
  [EV.seat - 0.3, 1.0, 540, 550], [EV.seat, 1.8, 330, 900], [EV.pointD2 - 0.2, 1.8, 330, 900], [EV.r3 - 0.1, 1.0, 540, 550], [EV.stops, 1.4, 700, 550], [EV.lock - 0.1, 1.4, 700, 550], [EV.draw3, 1.0, 540, 550],
  [EV.r4 - 0.1, 1.0, 540, 550], [EV.higher, 1.5, 640, 520], [EV.lower, 1.5, 640, 560], [EV.both, 1.0, 540, 550], [EV.r5 - 0.1, 1.0, 540, 550],
  [EV.bonus - 0.1, 1.0, 540, 550], [EV.light, 1.2, 540, 550], [EV.wins - 0.2, 1.0, 540, 550], [EV.horiz - 0.1, 1.0, 540, 550], [EV.horiz, 1.5, 470, 880], [EV.vert - 0.1, 1.5, 470, 880], [EV.vert, 1.5, 540, 360],
  [EV.control - 0.1, 1.5, 540, 360], [EV.control + 0.4, 1.1, 540, 550], [EV.tell, 1.0, 540, 550], [END, 1.0, 540, 550]] as [number, number, number, number][]).sort((a, b) => a[0] - b[0]);
const camAt = (t: number): [number, number, number] => {
  let i = 0; while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], u = a === b ? 0 : sm(c01((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
  const z = lerp(a[1], b[1], u), hx = 540 / z, hy = 550 / z;
  return [z, Math.min(1080 - hx, Math.max(hx, lerp(a[2], b[2], u))), Math.min(CH - hy, Math.max(hy, lerp(a[3], b[3], u)))];
};

/* ---------------- poses (local 400x600 box, athlete facing right) ---------------- */
const pressPose = (kind: 'v' | 'h', d: number, lift = 0): {pose: Pose; n: V; foot: V} => {
  const b = kind === 'h' ? 28 : 0, g = kind === 'h' ? 22 : 0;
  const H: V = [150 + (kind === 'v' ? lift * 26 : 0), 380];
  const sh: V = [150 - 150 * Math.sin(rad(b)), 380 - 150 * Math.cos(rad(b))];
  const head: V = [sh[0] + 6 * Math.cos(rad(b)) - 56 * Math.sin(rad(b)), sh[1] - 6 * Math.sin(rad(b)) - 56 * Math.cos(rad(b))];
  const n: V = [Math.cos(rad(g)), -Math.sin(rad(g))], foot: V = [H[0] + d * n[0], H[1] + d * n[1]];
  const hand: V = kind === 'v' ? [H[0] + 26, H[1] + 26] : [H[0] + 30, H[1] - 34];
  return {pose: {hip: H, sh, head, handL: hand, handR: [hand[0] + 8, hand[1] + 4], footL: foot, footR: [foot[0] + 6, foot[1] + 6], legBend: 1, armBend: -1}, n, foot};
};
const repU = (t: number, off = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (t + off)) / REP);

/* ---------------- machines ---------------- */
const VertMachine: React.FC<{d: number}> = ({d}) => {
  const footY = AX[1] - d * S, py = footY - 16 * S - 8;
  return (
    <g>
      <rect x={300} y={470} width={380} height={34} rx={14} fill="#2B2F3A" stroke={OL} strokeWidth={4} /><rect x={330} y={504} width={20} height={16} fill="#4C5260" stroke={OL} strokeWidth={3} /><rect x={620} y={504} width={20} height={16} fill="#4C5260" stroke={OL} strokeWidth={3} />
      <rect x={790} y={60} width={44} height={460} rx={10} fill="#4C5260" stroke={OL} strokeWidth={4} /><rect x={770} y={500} width={84} height={22} rx={8} fill="#3A3F4B" stroke={OL} strokeWidth={4} />
      <rect x={AX[0] + 100} y={py - 4} width={700 - AX[0] + 130} height={16} rx={6} fill="#6A707E" stroke={OL} strokeWidth={4} />
      <rect x={766} y={py - 30} width={92} height={62} rx={10} fill="#C9CDD4" stroke={OL} strokeWidth={4} />
      <rect x={AX[0] - 150} y={py - 8} width={310} height={18} rx={8} fill="#9AA0AC" stroke={OL} strokeWidth={4} />
      {[70, 58].map((r, i) => <g key={i} transform={`translate(${AX[0] + 190} ${py + 4 - i * 0})`}><circle r={r} fill={i ? '#25272D' : '#1C1D22'} stroke={OL} strokeWidth={4} /></g>)}
      <circle cx={AX[0] + 190} cy={py + 4} r={14} fill="#C9CDD4" stroke={OL} strokeWidth={3} />
      <line x1={80} x2={1000} y1={520} y2={520} stroke="#B9B9B5" strokeWidth={6} />
    </g>
  );
};
const HorizMachine: React.FC<{d: number}> = ({d}) => {
  const n: V = [Math.cos(rad(22)), -Math.sin(rad(22))], H = DX, foot: V = [H[0] + d * S * n[0], H[1] + d * S * n[1]], c: V = [foot[0] + n[0] * (16 * S + 8), foot[1] + n[1] * (16 * S + 8)];
  const far: V = [H[0] + 620 * n[0], H[1] + 620 * n[1] + 50];
  return (
    <g>
      <rect x={250} y={1052} width={620} height={18} rx={8} fill="#2B2F3A" stroke={OL} strokeWidth={4} />
      <line x1={H[0] - 40} y1={H[1] + 58} x2={far[0]} y2={far[1] + 8} stroke="#4C5260" strokeWidth={22} strokeLinecap="round" /><line x1={H[0] - 40} y1={H[1] + 58} x2={far[0]} y2={far[1] + 8} stroke={OL} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      <rect x={H[0] - 50} y={H[1] + 60} width={26} height={Math.max(8, 1052 - H[1] - 60)} fill="#4C5260" stroke={OL} strokeWidth={3} /><rect x={H[0] + 280} y={far[1] - 6 + 0} width={22} height={Math.max(8, 1052 - far[1] - 6)} fill="#4C5260" stroke={OL} strokeWidth={3} />
      <g transform={`translate(${H[0] - 6} ${H[1] + 34}) rotate(-8)`}><rect x={-70} y={-12} width={140} height={26} rx={12} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <g transform={`translate(${H[0] - 70} ${H[1] - 46}) rotate(-28)`}><rect x={-16} y={-150} width={34} height={240} rx={14} fill="#2B2F3A" stroke={OL} strokeWidth={4} /></g>
      <g transform={`translate(${c[0] + n[0] * 8} ${c[1] + n[1] * 8}) rotate(-22)`}><rect x={-8} y={-130} width={16} height={260} rx={7} fill="#9AA0AC" stroke={OL} strokeWidth={4} /></g>
      <line x1={c[0]} y1={c[1] + 50} x2={c[0] + 120 * n[0]} y2={c[1] + 50 + 120 * n[1]} stroke="#6A707E" strokeWidth={12} />
      {[64, 52].map((r, i) => <circle key={i} cx={c[0] + 130 * n[0]} cy={c[1] + 50 + 130 * n[1]} r={r} fill={i ? '#25272D' : '#1C1D22'} stroke={OL} strokeWidth={4} />)}
      <circle cx={c[0] + 130 * n[0]} cy={c[1] + 50 + 130 * n[1]} r={13} fill="#C9CDD4" stroke={OL} strokeWidth={3} />
      <line x1={80} x2={1000} y1={1070} y2={1070} stroke="#B9B9B5" strokeWidth={6} />
    </g>
  );
};

/* ---------------- athletes ---------------- */
const Alex: React.FC<{t: number}> = ({t}) => {
  const lift = sm(c01((t - EV.but) / 0.9)) * (1 - sm(c01((t - EV.danger - 0.8) / 0.5))), u = repU(t);
  const d = lerp(lerp(82, 186, u), 64, lift), pp = pressPose('v', d, lift), bottom = u < 0.3 || lift > 0.3;
  return (
    <div style={{position: 'absolute', left: AX[0], top: AX[1], width: 0, height: 0, transform: 'rotate(-90deg)'}}>
      <Person pose={pp.pose} shirt={BLUE} phones hair="short" mood={bottom ? 'strain' : 'flat'} sweat={c01(t / 60)} shoeRot={-90} fists s={S} x={-150 * S} y={-380 * S} />
    </div>
  );
};
const Daniel: React.FC<{t: number}> = ({t}) => {
  const u = repU(t, 0.15), pp = pressPose('h', lerp(118, 186, u)), bottom = u < 0.3;
  return <Person pose={pp.pose} shirt={RED} phones={false} cap beard mood={bottom ? 'strain' : 'flat'} sweat={c01(t / 60)} shoeRot={-112} fists s={S} x={DX[0] - 150 * S} y={DX[1] - 380 * S} />;
};

/* ---------------- overlays ---------------- */
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
      {w(4.6, EV.r1 - 0.2) && <Card t={t} at={4.6} title="TWO MACHINES, ONE QUESTION" sub="Lying, push UP  vs  sitting, push FORWARD"><text x={90} y={1700} fontFamily={FONT} fontWeight={900} fontSize={60} fill={BLUE}>VERTICAL</text><text x={90} y={1780} fontFamily={FONT} fontWeight={900} fontSize={60} fill={RED}>HORIZONTAL</text><text x={560} y={1740} fontFamily={FONT} fontWeight={900} fontSize={120} fill="#17181C">VS</text></Card>}
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

/* ---------------- composition ---------------- */
export const LegPressVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const [z, cx, cy] = camAt(t), shake = t < 0.5 ? 4 : t >= EV.but && t < EV.danger + 1 ? 5 : 0;
  const ox = Math.sin(t * 53) * shake, oy = Math.cos(t * 47) * shake;
  const danger = t >= EV.but && t < EV.danger + 1.4;
  const flash = Math.max(0, ...[EV.r1, EV.r2, EV.r3, EV.r4, EV.r5, EV.bonus, EV.pointA, EV.pointD2, EV.pointD5, EV.draw3, EV.draw4].map((a) => 1 - (t - (a - 0.05)) / 0.12).filter((v) => v < 1)) * 0.28;
  const hookK = t < 4.6 ? sm(c01((t - 0.35) / 0.3)) * (1 - sm(c01((t - 4.0) / 0.5))) : 0;
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <BG />
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: CH, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: CH, transformOrigin: '0 0', transform: `translate(${540 - cx * z + ox}px, ${550 - cy * z + oy}px) scale(${z})`}}>
          <svg width={1080} height={CH} style={{position: 'absolute', left: 0, top: 0}}>
            <rect x={0} y={10} width={1080} height={530} rx={28} fill="#E3EDFF" stroke="#17181C" strokeWidth={5} /><rect x={0} y={560} width={1080} height={530} rx={28} fill="#FFE6E3" stroke="#17181C" strokeWidth={5} />
            <VertMachine d={lerp(lerp(82, 186, repU(t)), 64, sm(c01((t - EV.but) / 0.9)) * (1 - sm(c01((t - EV.danger - 0.8) / 0.5))))} /><HorizMachine d={lerp(118, 186, repU(t, 0.15))} />
            <rect x={24} y={28} width={330} height={62} rx={20} fill={BLUE} stroke="#17181C" strokeWidth={5} /><text x={46} y={72} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">VERTICAL · ALEX</text>
            <rect x={24} y={578} width={410} height={62} rx={20} fill={RED} stroke="#17181C" strokeWidth={5} /><text x={46} y={622} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">HORIZONTAL · DANIEL</text>
            {danger && <g><ellipse cx={AX[0] + 4} cy={AX[1] + 30} rx={90} ry={50} fill="none" stroke={RED} strokeWidth={8} opacity={0.5 + 0.5 * Math.sin(t * 20)} /></g>}
          </svg>
          <Alex t={t} /><Daniel t={t} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <Score t={t} />
        <Cards t={t} />
        <g opacity={hookK}><g transform={`translate(540 ${TOP + 555}) rotate(-4) scale(${0.62 + 0.03 * Math.sin(t * 8)})`}><rect x={-440} y={-170} width={880} height={340} rx={44} fill="#fff" stroke="#17181C" strokeWidth={8} /><text textAnchor="middle" y={-40} fontFamily={FONT} fontWeight={900} fontSize={120} fill={BLUE}>VERTICAL</text><text textAnchor="middle" y={40} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#17181C">or</text><text textAnchor="middle" y={130} fontFamily={FONT} fontWeight={900} fontSize={120} fill={RED}>HORIZONTAL?</text></g></g>
        <Stamp t={t} at={EV.r1 - 0.05} text="ROUND 1" fill="#17181C" /><Stamp t={t} at={EV.r2 - 0.05} text="ROUND 2" fill="#17181C" /><Stamp t={t} at={EV.r3 - 0.05} text="ROUND 3" fill="#17181C" /><Stamp t={t} at={EV.r4 - 0.05} text="ROUND 4" fill="#17181C" /><Stamp t={t} at={EV.r5 - 0.05} text="ROUND 5" fill="#17181C" /><Stamp t={t} at={EV.bonus - 0.05} text="BONUS" fill="#8E6FD1" />
        <Stamp t={t} at={EV.pointA - 0.05} text="POINT: ALEX" fill={BLUE} y={1250} size={72} rot={4} dur={1.2} /><Stamp t={t} at={EV.pointD2 - 0.05} text="POINT: DANIEL" fill={RED} y={1250} size={72} rot={-4} dur={1.2} /><Stamp t={t} at={EV.pointD5 - 0.05} text="POINT: DANIEL" fill={RED} y={1250} size={72} rot={4} dur={1.2} />
        <Stamp t={t} at={EV.draw3 - 0.1} text="DRAW!" fill="#8A8A90" y={1250} size={84} dur={1.3} /><Stamp t={t} at={EV.draw4 - 0.1} text="DRAW!" fill="#8A8A90" y={1250} size={84} dur={1.3} rot={5} />
        <Stamp t={t} at={EV.but} text="DANGER!" fill={RED} y={1000} size={120} dur={2.2} rot={-6} />
        <Stamp t={t} at={EV.wins - 0.2} text="WHO WINS?" fill="#8E6FD1" y={1000} size={96} dur={1.8} />
        {danger && <rect width={1080} height={1920} fill={RED} opacity={0.08 + 0.08 * Math.sin(t * 18)} />}
      </svg>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Subs />
      <Audio src={staticFile('audio/lp_voice.wav')} />
      <Audio src={staticFile('audio/lp_sfx.wav')} volume={0.3} />
      <Audio src={staticFile('audio/lp_music_frantic.wav')} volume={(fr) => 0.5 * (1 - calmW(fr / FPS))} />
      <Audio src={staticFile('audio/lp_music_calm.wav')} volume={(fr) => 0.5 * calmW(fr / FPS)} />
    </AbsoluteFill>
  );
};
