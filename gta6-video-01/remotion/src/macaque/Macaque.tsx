import React from 'react';
import {random} from 'remotion';

/* The macaque: painted-look SVG character (gradients, fur tufts, stitched arms), plus room, blanket, gauge, fire.  Canvas = 1080x1920. */
export type Ex = {mouth: 'smile' | 'flat' | 'o' | 'scream' | 'grin' | 'sleep' | 'worry'; eye: number; pupil: number; brow: number; sweat: number; blush: number; look?: number};
export const CALM: Ex = {mouth: 'smile', eye: 1, pupil: 1, brow: 0, sweat: 0, blush: 0.6};
const FUR = '#8A5A2B', FUR_D = '#5E3A1B', FUR_L = '#B98245', PINK = '#F0A898', PINK_D = '#D9806F', PINK_L = '#F8C9BB';

export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="mFur" cx="50%" cy="40%" r="65%"><stop offset="0" stopColor={FUR_L} /><stop offset="0.6" stopColor={FUR} /><stop offset="1" stopColor={FUR_D} /></radialGradient>
      <radialGradient id="mFace" cx="50%" cy="42%" r="62%"><stop offset="0" stopColor={PINK_L} /><stop offset="0.7" stopColor={PINK} /><stop offset="1" stopColor={PINK_D} /></radialGradient>
      <radialGradient id="mEar" cx="50%" cy="50%" r="55%"><stop offset="0" stopColor={PINK_L} /><stop offset="1" stopColor={PINK_D} /></radialGradient>
      <linearGradient id="mArm" x1="0" x2="1"><stop offset="0" stopColor={FUR_D} /><stop offset="0.45" stopColor={FUR_L} /><stop offset="1" stopColor={FUR_D} /></linearGradient>
      <linearGradient id="mTank" x1="0" x2="1" y1="0" y2="0.2"><stop offset="0" stopColor="#CFD6E6" /><stop offset="0.35" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F2F5FA" /><stop offset="1" stopColor="#B9C3D8" /></linearGradient>
      <linearGradient id="mBlanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3558B8" /><stop offset="1" stopColor="#1B2F78" /></linearGradient>
      <linearGradient id="mChair" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6B3F1E" /><stop offset="0.5" stopColor="#B07236" /><stop offset="1" stopColor="#6B3F1E" /></linearGradient>
      <linearGradient id="mWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2A42" /><stop offset="1" stopColor="#5F4350" /></linearGradient>
      <radialGradient id="mLamp" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE6A0" stopOpacity={0.85} /><stop offset="1" stopColor="#FFE6A0" stopOpacity={0} /></radialGradient>
      <linearGradient id="mFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FFE45A" /><stop offset="0.5" stopColor="#FF9A1A" /><stop offset="1" stopColor="#E02A12" /></linearGradient>
      <radialGradient id="mGold" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#FFF4C2" /><stop offset="0.5" stopColor="#F2C14E" /><stop offset="1" stopColor="#A8641A" /></radialGradient>
    </defs>
  </svg>
);

/* ---------------- head ---------------- */
export const Head: React.FC<{ex: Ex; t?: number}> = ({ex, t = 0}) => {
  const e = ex.eye, px = (ex.look ?? 0) * 7;
  const tufts = Array.from({length: 46}).map((_, i) => { const a = (i / 46) * Math.PI * 2, r0 = 118, r1 = 142 + random(`tf${i}`) * 14; const da = 0.07; return `${Math.cos(a - da) * r0},${Math.sin(a - da) * r0 * 0.98} ${Math.cos(a) * r1},${Math.sin(a) * r1 * 0.97} ${Math.cos(a + da) * r0},${Math.sin(a + da) * r0 * 0.98}`; });
  const mouth = (() => {
    switch (ex.mouth) {
      case 'smile': return <path d="M-26 62 Q0 82 26 62" fill="none" stroke="#7A3A32" strokeWidth={5} strokeLinecap="round" />;
      case 'sleep': return <path d="M-28 62 Q0 90 28 62" fill="none" stroke="#7A3A32" strokeWidth={5.5} strokeLinecap="round" />;
      case 'flat': return <path d="M-22 68 L22 68" stroke="#7A3A32" strokeWidth={5} strokeLinecap="round" />;
      case 'worry': return <path d="M-24 74 Q0 56 24 74" fill="none" stroke="#7A3A32" strokeWidth={5} strokeLinecap="round" />;
      case 'o': return <ellipse cx={0} cy={72} rx={13} ry={16} fill="#4A1A18" stroke="#7A3A32" strokeWidth={4} />;
      case 'scream': return <><ellipse cx={0} cy={76} rx={26} ry={30} fill="#4A1A18" stroke="#7A3A32" strokeWidth={4} /><ellipse cx={0} cy={90} rx={15} ry={9} fill="#C8605A" /><rect x={-20} y={50} width={40} height={9} rx={3} fill="#fff" /></>;
      case 'grin': return <><path d="M-30 62 Q0 92 30 62 Z" fill="#4A1A18" stroke="#7A3A32" strokeWidth={4} strokeLinejoin="round" /><path d="M-24 64 Q0 70 24 64 L22 71 Q0 78 -22 71Z" fill="#fff" /></>;
    }
  })();
  return (
    <g>
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 136} 14)`}><circle r={48} fill={FUR_D} /><circle r={44} fill="url(#mFur)" /><circle r={32} fill="url(#mEar)" /><path d={`M${-sd * 14} -14 Q${sd * 10} 0 ${-sd * 14} 16`} fill="none" stroke={PINK_D} strokeWidth={4} opacity={0.6} /></g>)}
      <ellipse cx={0} cy={0} rx={140} ry={136} fill="url(#mFur)" stroke={FUR_D} strokeWidth={3} />
      <polygon points={tufts.join(' ')} fill={FUR} opacity={0.0} />
      {tufts.map((tf, i) => <polygon key={i} points={tf} fill={i % 3 ? FUR : FUR_L} stroke={FUR_D} strokeWidth={1.5} strokeLinejoin="round" />)}
      <path d="M-86 -62 Q0 -118 86 -62 Q70 -30 0 -36 Q-70 -30 -86 -62Z" fill={FUR} opacity={0.9} />
      <ellipse cx={0} cy={14} rx={104} ry={106} fill="url(#mFace)" stroke={PINK_D} strokeWidth={2} />
      <ellipse cx={0} cy={-52} rx={70} ry={20} fill="#E9C9A6" opacity={0.7} />
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 62} cy={36} rx={34} ry={26} fill="#E2606A" opacity={0.18 + 0.4 * ex.blush} />)}
      <ellipse cx={0} cy={50} rx={58} ry={44} fill={PINK_L} opacity={0.65} />
      {/* eyes */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 42} -4)`}>
          <ellipse rx={22} ry={19 * Math.max(0.12, e)} fill="#F6EEE6" stroke="#6B3A2A" strokeWidth={3} />
          <clipPath id={`eyec${sd}`}><ellipse rx={22} ry={19 * Math.max(0.12, e)} /></clipPath>
          <g clipPath={`url(#eyec${sd})`}><circle cx={px} cy={0} r={11 * ex.pupil + 3} fill="#5A3318" /><circle cx={px} cy={0} r={5 * ex.pupil + 1} fill="#120805" /><circle cx={px + 4} cy={-4} r={3.4} fill="#fff" /></g>
          <path d={`M-24 ${-19 * Math.max(0.12, e)} Q0 ${-26 * Math.max(0.2, e)} 24 ${-19 * Math.max(0.12, e)}`} fill="none" stroke="#6B3A2A" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${-24 * sd * -1 - 0} ${-38 - ex.brow * 10 * -sd * 0} L0 -38`} stroke="none" />
          <path d={`M-22 ${-34 - ex.brow * 8 * (sd > 0 ? 1 : 1)} Q0 ${-44 + ex.brow * 4} 22 ${-34 + ex.brow * 12 * sd * 0 + ex.brow * 6}`} fill="none" stroke="#8A8A8A" strokeWidth={6} strokeLinecap="round" opacity={0.85} transform={sd > 0 ? 'scale(-1 1)' : ''} />
        </g>
      ))}
      {/* nose + mouth */}
      <path d="M-16 44 Q0 36 16 44 Q14 56 0 58 Q-14 56 -16 44Z" fill={PINK_D} opacity={0.85} />
      <ellipse cx={-6} cy={48} rx={3.4} ry={4.4} fill="#7A3A32" /><ellipse cx={6} cy={48} rx={3.4} ry={4.4} fill="#7A3A32" />
      <path d="M0 56 L0 64" stroke="#B05A4A" strokeWidth={3} strokeLinecap="round" />
      {mouth}
      {ex.sweat > 0 && [0, 1, 2].map((i) => { const ph = (t * 1.6 + i / 3) % 1; return <path key={i} d={`M${-96 + i * 90} ${-60 + ph * 120} q-10 18 0 24 q10 -6 0 -24z`} fill="#BFE6FF" stroke="#7DB7DD" strokeWidth={2} opacity={ex.sweat * (1 - ph * 0.5)} />; })}
    </g>
  );
};

/* ---------------- torso + arms ---------------- */
const Arm: React.FC<{sd: number; hx: number; hy: number; shake: number; t: number}> = ({sd, hx, hy, shake, t}) => {
  const sx = sd * 150, sy = 0;
  const j = Math.sin(t * 38 + sd) * shake;
  const ex = sd * 190 + j * 0.3, ey = 190;
  const hx2 = hx + j, hy2 = hy + Math.abs(j) * 0.6;
  return (
    <g>
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx2} ${hy2}`} fill="none" stroke={FUR_D} strokeWidth={74} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx2} ${hy2}`} fill="none" stroke="url(#mArm)" strokeWidth={66} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx2} ${hy2}`} fill="none" stroke="#C99560" strokeWidth={3} strokeDasharray="9 9" strokeLinecap="round" opacity={0.6} transform="translate(0 -2)" />
      <g transform={`translate(${hx2} ${hy2 + 6})`}><ellipse rx={36} ry={30} fill="#C38E6C" stroke={FUR_D} strokeWidth={3} />{[-18, 0, 18].map((x) => <ellipse key={x} cx={x} cy={22} rx={10} ry={13} fill="#C38E6C" stroke={FUR_D} strokeWidth={2.5} />)}</g>
    </g>
  );
};
export const Macaque: React.FC<{ex: Ex; shake?: number; t: number; x?: number; y?: number; s?: number; hands?: [number, number]; tilt?: number; head?: boolean}> = ({ex, shake = 0, t, x = 540, y = 620, s = 1, hands = [230, 590], tilt = 0, head = true}) => {
  const bob = Math.sin(t * 2.2) * 2 + Math.sin(t * 41) * shake * 0.4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* torso: fur shoulders + white tank top */}
      <path d="M-210 180 Q-190 90 -120 70 L120 70 Q190 90 210 180 L190 700 L-190 700Z" fill="url(#mFur)" stroke={FUR_D} strokeWidth={4} />
      <path d="M-150 120 Q-120 80 -70 80 L-50 190 Q0 230 50 190 L70 80 Q120 80 150 120 L170 700 L-170 700Z" fill="url(#mTank)" stroke="#9AA6BE" strokeWidth={3} />
      <path d="M-110 260 Q-60 330 0 320 Q60 330 110 260" fill="none" stroke="#B6C0D6" strokeWidth={4} opacity={0.8} />
      <path d="M-140 420 Q-130 520 -150 640" fill="none" stroke="#B6C0D6" strokeWidth={4} opacity={0.6} /><path d="M140 420 Q130 520 150 640" fill="none" stroke="#B6C0D6" strokeWidth={4} opacity={0.6} />
      <g transform="translate(0 120)"><Arm sd={-1} hx={-hands[0] * 0.8} hy={hands[1]} shake={shake * 0.5} t={t} /><Arm sd={1} hx={hands[0] * 0.8} hy={hands[1]} shake={shake} t={t} /></g>
      <g transform={`translate(0 -40) rotate(${tilt})`}><Head ex={ex} t={t} /></g>
    </g>
  );
};

/* ---------------- room ---------------- */
const CARS = Array.from({length: 22}).map((_, i) => ({x: 120 + (i % 6) * 150 + (Math.floor(i / 6) % 2) * 70, y: 1420 + Math.floor(i / 6) * 110, bolt: i % 3 === 0}));
export const Blanket: React.FC<{shake: number; t: number; dark?: number; y?: number}> = ({shake, t, dark = 0, y = 1180}) => {
  const j = Math.sin(t * 36) * shake, k = Math.sin(t * 29 + 1) * shake;
  return (
    <g transform={`translate(0 ${y - 1180})`}>
      <path d={`M150 1240 Q330 ${1170 + j * 2} 540 ${1220 + k} Q760 ${1170 - j} 930 1240 L1000 1920 L80 1920Z`} fill="url(#mBlanket)" stroke="#142A6A" strokeWidth={4} />
      <path d={`M150 1240 Q330 ${1170 + j * 2} 540 ${1220 + k} Q760 ${1170 - j} 930 1240 L930 1290 Q760 ${1230 - j} 540 ${1280 + k} Q330 ${1230 + j * 2} 150 1290Z`} fill="#F4F6FC" stroke="#AEB8D0" strokeWidth={3} />
      {Array.from({length: 24}).map((_, i) => <rect key={i} x={110 + i * 36} y={1352 + (i % 2) * 22 + k * 0.5} width={36} height={22} fill={i % 2 ? '#fff' : '#15151B'} opacity={0.95} />)}
      {CARS.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y + (i % 2) * 20 + j * 0.6})`} opacity={0.95}>
          {c.bolt ? <polygon points="0,-26 16,-26 6,-4 20,-4 -8,32 0,6 -12,6" fill="#FFC93C" stroke="#B07A10" strokeWidth={2} /> : <><path d="M-30 6 L-24 -10 Q-8 -20 14 -10 L30 4 L32 14 L-32 14Z" fill="#D8352A" stroke="#7A1810" strokeWidth={2.5} /><path d="M-14 -8 L-4 -15 L8 -8Z" fill="#BFE4FF" /><circle cx={-16} cy={16} r={6} fill="#222" /><circle cx={16} cy={16} r={6} fill="#222" /></>}
        </g>
      ))}
      <rect x={0} y={1180} width={1080} height={740} fill="#06081A" opacity={dark} />
    </g>
  );
};
export const Room: React.FC<{t: number; night?: number; scene?: 'night' | 'day' | 'volcano'; clock?: number; lamp?: number; children?: React.ReactNode; blanket?: React.ReactNode}> = ({t, night = 1, scene = 'night', clock = 1, lamp = 1, children, blanket}) => {
  const clockAng = (t * clock * 6) % 360;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#mWall)" />
      {Array.from({length: 14}).map((_, i) => <rect key={i} x={i * 80 + 20} y={0} width={4} height={1100} fill="#000" opacity={0.08} />)}
      <rect y={1480} width={1080} height={440} fill="#6A4223" /><rect y={1470} width={1080} height={16} fill="#3F2814" />
      {/* window */}
      <g transform="translate(790 330)"><rect width={220} height={300} rx={8} fill="#2B1B22" /><rect x={14} y={14} width={192} height={272} fill={scene === 'night' ? '#0D1738' : scene === 'volcano' ? '#F7B25A' : '#8FC6F2'} />
        {scene === 'night' && <><g fill="#0A0F26">{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={14 + i * 32} y={196 - (i % 3) * 30} width={30} height={90 + (i % 3) * 30} />)}</g>{Array.from({length: 26}).map((_, i) => <rect key={i} x={20 + random(`wx${i}`) * 180} y={150 + random(`wy${i}`) * 130} width={4} height={5} fill="#FFD66B" opacity={0.5 + 0.5 * random(`wo${i}`)} />)}{Array.from({length: 14}).map((_, i) => <circle key={i} cx={22 + random(`sx${i}`) * 176} cy={24 + random(`sy${i}`) * 110} r={1.8} fill="#fff" opacity={0.4 + 0.5 * Math.sin(t * 2 + i) ** 2} />)}</>}
        {scene === 'volcano' && <><rect x={14} y={186} width={192} height={100} fill="#3E8A2C" /><path d="M40 196 L100 110 L150 196Z" fill="#6B2E1C" /><path d="M86 118 L114 118 L100 100Z" fill="#FF5A1A" /></>}
        <rect x={104} y={14} width={12} height={272} fill="#2B1B22" /><rect x={14} y={140} width={192} height={10} fill="#2B1B22" /></g>
      {/* clock */}
      <g transform="translate(900 860)"><circle r={50} fill="#FBFBFB" stroke="#D8352A" strokeWidth={7} />{Array.from({length: 12}).map((_, i) => <line key={i} x1={0} y1={-40} x2={0} y2={-34} stroke="#333" strokeWidth={3} transform={`rotate(${i * 30})`} />)}<line x1={0} y1={0} x2={0} y2={-28} stroke="#222" strokeWidth={5} strokeLinecap="round" transform={`rotate(${clockAng / 12})`} /><line x1={0} y1={0} x2={0} y2={-38} stroke="#D8352A" strokeWidth={3} strokeLinecap="round" transform={`rotate(${clockAng})`} /><circle r={4} fill="#222" /></g>
      {/* nightstand + lamp + calendar */}
      <rect x={0} y={1150} width={230} height={380} fill="#6F4727" stroke="#3F2814" strokeWidth={4} /><rect x={20} y={1180} width={190} height={150} fill="#5A3820" /><circle cx={115} cy={1255} r={7} fill="#E2B456" />
      <g transform="translate(110 1010)"><circle r={200} fill="url(#mLamp)" opacity={0.7 * lamp} /><path d="M-60 -10 L-34 -80 L34 -80 L60 -10Z" fill="#F4D58A" stroke="#B88A30" strokeWidth={3} /><rect x={-8} y={-10} width={16} height={110} fill="#6B4A1E" /><ellipse cx={0} cy={140} rx={50} ry={10} fill="#6B4A1E" /></g>
      <g transform="translate(70 800) rotate(-4)"><rect width={110} height={120} rx={6} fill="#fff" stroke="#999" strokeWidth={2} /><rect width={110} height={30} rx={6} fill="#D8352A" /><text x={55} y={22} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={700} fontSize={18} fill="#fff">TUE</text><text x={55} y={92} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={900} fontSize={54} fill="#222">18</text></g>
      {/* headboard chair */}
      <path d="M230 1240 L230 640 Q230 470 400 450 L680 450 Q850 470 850 640 L850 1240Z" fill="url(#mChair)" stroke="#3F2814" strokeWidth={6} />
      <path d="M270 1240 L270 660 Q270 520 410 500 L670 500 Q810 520 810 660 L810 1240Z" fill="none" stroke="#D9A260" strokeWidth={3} opacity={0.5} />
      {[0, 1].map((i) => <g key={i}><path d={`M${i ? 790 : 290} 1000 Q${i ? 880 : 200} 1040 ${i ? 860 : 220} 1240`} fill="none" stroke="#2E4F9A" strokeWidth={46} strokeLinecap="round" opacity={0.0} /></g>)}
      {children}
      {blanket}
      <rect width={1080} height={1920} fill="#06081A" opacity={1 - night} />
    </g>
  );
};

/* ---------------- gauge, fire, flash ---------------- */
export const Gauge: React.FC<{value: number; max: number; label: string; unit: string; x?: number; y?: number; shake?: number; t?: number}> = ({value, max, label, unit, x = 120, y = 560, shake = 0, t = 0}) => {
  const a = -130 + 260 * Math.min(1, value / max) + Math.sin(t * 60) * shake;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={84} fill="#0B0B10" stroke="#C9CBD6" strokeWidth={5} />
      {Array.from({length: 11}).map((_, i) => <line key={i} x1={0} y1={-72} x2={0} y2={i % 5 === 0 ? -58 : -64} stroke="#E7E7EE" strokeWidth={3} transform={`rotate(${-130 + i * 26})`} />)}
      <path d="M-62 40 A74 74 0 0 1 62 40" fill="none" stroke="#C8202A" strokeWidth={5} opacity={0.0} />
      <line x1={0} y1={0} x2={0} y2={-62} stroke="#FF3B30" strokeWidth={5} strokeLinecap="round" transform={`rotate(${a})`} /><circle r={9} fill="#FF3B30" stroke="#000" strokeWidth={2} />
      <text y={38} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={900} fontSize={30} fill="#fff">{label}</text>
      <text y={60} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={700} fontSize={15} fill="#9AA0B4" letterSpacing={2}>{unit}</text>
    </g>
  );
};
export const Fire: React.FC<{k: number; t: number; y0?: number}> = ({k, t, y0 = 1180}) => (
  <g opacity={Math.min(1, k * 1.3)}>
    {Array.from({length: 34}).map((_, i) => {
      const bx = 140 + random(`fx${i}`) * 820, by = y0 + 40 + random(`fy${i}`) * 700, h = (90 + random(`fh${i}`) * 200) * k, w = 40 + random(`fw${i}`) * 50;
      const fl = 0.7 + 0.3 * Math.sin(t * (9 + random(`fs${i}`) * 8) + i);
      return <path key={i} d={`M${bx - w} ${by} Q${bx - w * 0.6} ${by - h * 0.5 * fl} ${bx} ${by - h * fl} Q${bx + w * 0.6} ${by - h * 0.5 * fl} ${bx + w} ${by} Z`} fill="url(#mFlame)" opacity={0.9} />;
    })}
  </g>
);
export const Burst: React.FC<{k: number; x?: number; y?: number}> = ({k, x = 540, y = 1100}) => (
  <g>{[0, 1, 2].map((i) => <circle key={i} cx={x} cy={y} r={Math.max(0, k * 1300 - i * 160)} fill="none" stroke="#fff" strokeWidth={30 - i * 8} opacity={Math.max(0, 1 - k) * 0.9} />)}<circle cx={x} cy={y} r={k * 500} fill="#fff" opacity={Math.max(0, 1 - k * 1.1)} /></g>
);
