import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {Ex, Head, CALM, Defs} from './Macaque';

/* "Los dos monos" building blocks: partner, wide bed, creative success-o-meter, tally marks, thermometer. Canvas 1080x1920. */
const F = 'DejaVu Sans, sans-serif';
const FUR_D = '#5E3A1B';

export const Partner: React.FC<{state: 'front' | 'mask' | 'back'; t: number; breathe?: number}> = ({state, t, breathe = 1}) => {
  const z = (i: number) => { const ph = (t * 0.5 + i / 3) % 1; return <text key={i} x={120 + ph * 70} y={-90 - ph * 150} fontFamily={F} fontWeight={900} fontSize={34 + i * 10} fill="#CFE0FF" opacity={(1 - ph) * 0.9}>Z</text>; };
  return (
    <g>
      {state === 'back' ? (
        <g>
          {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 136} 14)`}><circle r={48} fill={FUR_D} /><circle r={44} fill="url(#mFur)" /></g>)}
          <ellipse rx={140} ry={136} fill="url(#mFur)" stroke={FUR_D} strokeWidth={3} />
          {Array.from({length: 40}).map((_, i) => { const a = random(`pb${i}`) * 6.283, r = 20 + random(`pr${i}`) * 100; return <path key={i} d={`M${Math.cos(a) * r} ${Math.sin(a) * r * 0.95} q${6} ${-14} ${14} ${-4}`} stroke="#C99560" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />; })}
        </g>
      ) : (
        <>
          <g style={{filter: 'brightness(1.2) saturate(0.85)'}}><Head ex={{mouth: 'sleep', eye: state === 'mask' ? 0.0 : 0.06, pupil: 1, brow: 0.3, sweat: 0, blush: 1}} t={t} /></g>
          {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 42} -4)`}><path d={`M${sd * 14} -3 L${sd * 30} -12 M${sd * 18} 4 L${sd * 34} 4 M${sd * 14} 10 L${sd * 28} 18`} stroke="#2A1710" strokeWidth={3.5} strokeLinecap="round" fill="none" /></g>)}
          {state === 'mask' && <g><path d="M-112 -24 Q0 -50 112 -24 L108 24 Q0 44 -108 24Z" fill="#7E57C2" stroke="#4A2D8A" strokeWidth={3} />{[-1, 1].map((sd) => <path key={sd} d={`M${sd * 42 - 18} -2 Q${sd * 42} 12 ${sd * 42 + 18} -2`} stroke="#EDE3FF" strokeWidth={4} fill="none" strokeLinecap="round" />)}<path d="M-140 0 L-112 -2 M112 -2 L140 0" stroke="#4A2D8A" strokeWidth={6} /></g>}
        </>
      )}
      <g transform="translate(92 -112) rotate(18)"><path d="M0 0 L-46 -30 L-46 30Z M0 0 L46 -30 L46 30Z" fill="#FF7AA8" stroke="#C23C6E" strokeWidth={3} /><circle r={12} fill="#FF9EC0" stroke="#C23C6E" strokeWidth={3} /></g>
      {state !== 'back' && [0, 1, 2].map(z)}
    </g>
  );
};

/** success-o-meter: heart with ZZZ that cracks with every failed attempt */
export const HeartMeter: React.FC<{pct: number; cracks: number; t: number; x?: number; y?: number}> = ({pct, cracks, t, x = 120, y = 560}) => {
  const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 5)) * (0.3 + pct / 10);
  const H = 'M0 62 C-120 -10 -78 -92 0 -42 C78 -92 120 -10 0 62Z';
  const CR = ['M-6 -40 L8 -14 L-10 4 L6 26', 'M-44 -50 L-30 -20 L-46 0', 'M40 -52 L26 -22 L44 2', 'M-70 -8 L-48 6 L-60 28', 'M62 -4 L40 12 L52 34', 'M-18 30 L2 40 L-8 58'];
  const fill = Math.max(0.04, Math.min(1, pct / 100 * 2.2));
  return (
    <g transform={`translate(${x} ${y}) scale(${beat * 0.85})`}>
      <clipPath id="hmc"><path d={H} /></clipPath>
      <path d={H} fill="#5A2038" stroke="#FFD1DC" strokeWidth={5} />
      <g clipPath="url(#hmc)"><rect x={-130} y={62 - fill * 150} width={260} height={150} fill="#FF4D7D" /><rect x={-130} y={62 - fill * 150} width={260} height={10} fill="#FF9EB8" opacity={0.7} /></g>
      <text x={0} y={-8} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill="#fff" opacity={0.95}>Z z z</text>
      {CR.slice(0, cracks).map((d, i) => <path key={i} d={d} stroke="#0B0610" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      <text x={0} y={-62} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={13} fill="#FFD1DC" letterSpacing={1.5}>SUCCESS-O-METER</text>
      <text x={0} y={-48} textAnchor="middle" fontFamily={F} fontWeight={600} fontSize={10} fill="#E3C2CD">made-up numbers, just a joke</text>
      <text x={0} y={104} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill="#fff">{pct}%</text>
    </g>
  );
};
/** prisoner-style tally on the headboard, one mark per attempt (every 5th is a strike-through) */
export const Tally: React.FC<{n: number; x?: number; y?: number}> = ({n, x = 540, y = 500}) => (
  <g transform={`translate(${x} ${y})`}>
    <text x={0} y={-56} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={18} fill="#2A1710" opacity={0.7} letterSpacing={3}>ATTEMPTS</text>
    {Array.from({length: n}).map((_, i) => { const g = Math.floor(i / 5), k = i % 5; return k < 4 ? <line key={i} x1={-120 + g * 90 + k * 16} y1={-36} x2={-120 + g * 90 + k * 16} y2={22} stroke="#2A1710" strokeWidth={6} strokeLinecap="round" /> : <line key={i} x1={-130 + g * 90} y1={14} x2={-60 + g * 90} y2={-28} stroke="#2A1710" strokeWidth={6} strokeLinecap="round" />; })}
  </g>
);
export const Thermo: React.FC<{deg: number; t: number; x?: number; y?: number}> = ({deg, t, x = 985, y = 430}) => {
  const k = Math.min(1, Math.max(0.1, (deg - 18) / 14));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-16} y={0} width={32} height={190} rx={16} fill="#EEF3FA" stroke="#9AA6BE" strokeWidth={4} />
      <circle cx={0} cy={204} r={28} fill="#EEF3FA" stroke="#9AA6BE" strokeWidth={4} />
      <circle cx={0} cy={204} r={20} fill="#E8263A" />
      <rect x={-8} y={190 - k * 170} width={16} height={k * 170 + 14} rx={8} fill="#E8263A" />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={16} y1={14 + i * 40} x2={30} y2={14 + i * 40} stroke="#9AA6BE" strokeWidth={3} />)}
      <text x={0} y={262} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill="#fff">{Math.round(deg)}°</text>
      {deg > 27 && [0, 1, 2].map((i) => { const ph = (t * 1.3 + i / 3) % 1; return <path key={i} d={`M${-20 + i * 20} ${-10 - ph * 60} q10 -14 0 -26 q-10 -12 0 -24`} stroke="#fff" strokeWidth={4} fill="none" opacity={(1 - ph) * 0.7} strokeLinecap="round" />; })}
    </g>
  );
};

export type CoupleState = {t: number; shake: number; ex: Ex; her: 'front' | 'mask' | 'back'; pct: number; cracks: number; tries: number; deg: number; hour: number; zoom?: [number, number, number]; bubble?: string; lights?: number};
export const CoupleScene: React.FC<CoupleState> = ({t, shake, ex, her, pct, cracks, tries, deg, hour, zoom = [1, 540, 960], bubble, lights = 1}) => {
  const bmp = (2 + shake * 2.4) * (0.5 + 0.5 * Math.abs(Math.sin(t * 19))), j = Math.sin(t * 36) * shake, breath = Math.sin(t * 1.6) * 5;
  const hh = (hour % 12) * 30 + 0, hm = 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B2040" /><stop offset="1" stopColor="#4C3552" /></linearGradient>
        <linearGradient id="cWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A3418" /><stop offset="0.5" stopColor="#9A6330" /><stop offset="1" stopColor="#5A3418" /></linearGradient>
        <linearGradient id="cBlanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3558B8" /><stop offset="1" stopColor="#1B2F78" /></linearGradient>
        <linearGradient id="cRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2584B" /><stop offset="0.6" stopColor="#D13228" /><stop offset="1" stopColor="#8E1812" /></linearGradient>
        <linearGradient id="cPillow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#C9D2E6" /></linearGradient>
        <radialGradient id="cLamp"><stop offset="0" stopColor="#FFE6A0" stopOpacity={0.8} /><stop offset="1" stopColor="#FFE6A0" stopOpacity={0} /></radialGradient>
      </defs>
      <g transform={`translate(540 960) scale(${zoom[0]}) translate(${-zoom[1]} ${-zoom[2]})`}>
        <rect width={1080} height={1920} fill="url(#cWall)" />
        {Array.from({length: 14}).map((_, i) => <rect key={i} x={i * 80 + 20} y={0} width={4} height={1100} fill="#000" opacity={0.08} />)}
        <rect y={1500} width={1080} height={420} fill="#5E3D22" />
        {/* window: night skyline with lit windows */}
        <g transform="translate(70 80)"><rect width={230} height={270} rx={8} fill="#1A1126" />
          <defs><linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1236" /><stop offset="1" stopColor="#3A3470" /></linearGradient></defs>
          <rect x={12} y={12} width={206} height={246} fill="url(#cSky)" />
          {Array.from({length: 8}).map((_, i) => <circle key={i} cx={24 + random(`cs${i}`) * 180} cy={24 + random(`ct${i}`) * 80} r={1.5} fill="#fff" opacity={0.7} />)}
          {Array.from({length: 9}).map((_, i) => { const bw = 24, bx = 12 + i * 22.5, bh = 70 + random(`bh${i}`) * 110, by = 258 - bh; return <g key={i}><rect x={bx} y={by} width={bw} height={bh} fill={i % 2 ? '#0A0F26' : '#12183A'} />{Array.from({length: Math.floor(bh / 15)}).map((_, r) => [0, 1].map((c) => random(`w${i}${r}${c}`) > 0.42 ? <rect key={`${r}${c}`} x={bx + 4 + c * 10} y={by + 6 + r * 15} width={6} height={8} fill="#FFD66B" opacity={0.9} /> : null))}</g>; })}
          <rect x={111} y={12} width={8} height={246} fill="#1A1126" /><rect x={12} y={130} width={206} height={8} fill="#1A1126" /></g>
        {/* bedside table lamp next to the window */}
        <g transform="translate(372 330)"><circle cy={-60} r={170} fill="url(#cLamp)" opacity={0.8 * lights} />
          <rect x={-50} y={-6} width={100} height={12} rx={4} fill="#6B4A1E" /><rect x={-40} y={6} width={80} height={86} fill="#5A3820" stroke="#3A210E" strokeWidth={3} /><circle cx={0} cy={48} r={6} fill="#E2B456" />
          <rect x={-6} y={-70} width={12} height={66} fill="#8A6A2E" /><path d="M-52 -66 L-30 -134 L30 -134 L52 -66Z" fill="#F4D58A" stroke="#B88A30" strokeWidth={3} /></g>
        {/* wall clock */}
        <g transform="translate(900 200)"><circle r={62} fill="#FBFBFB" stroke="#D8352A" strokeWidth={8} />{Array.from({length: 12}).map((_, i) => <line key={i} x1={0} y1={-50} x2={0} y2={-43} stroke="#333" strokeWidth={3} transform={`rotate(${i * 30})`} />)}<line y2={-32} stroke="#222" strokeWidth={6} strokeLinecap="round" transform={`rotate(${hh})`} /><line y2={-46} stroke="#D8352A" strokeWidth={3} strokeLinecap="round" transform={`rotate(${hm})`} /><circle r={5} fill="#222" /></g>
        {/* headboard + pillows */}
        <rect x={50} y={420} width={980} height={620} rx={46} fill="url(#cWood)" stroke="#3A210E" strokeWidth={6} />
        <rect x={86} y={456} width={908} height={548} rx={30} fill="none" stroke="#D9A260" strokeWidth={3} opacity={0.4} />
        <Tally n={tries} x={540} y={540} />
        <rect x={110} y={700} width={420} height={190} rx={70} fill="url(#cPillow)" stroke="#9AA6BE" strokeWidth={3} /><rect x={550} y={700} width={420} height={190} rx={70} fill="url(#cPillow)" stroke="#9AA6BE" strokeWidth={3} />
        {/* him */}
        <g transform={`translate(${320 + Math.sin(t * 41) * shake * 0.4} ${840})`}>
          <path d="M-190 120 Q-170 -10 -80 -26 L80 -26 Q170 -10 190 120Z" fill="url(#mFur)" stroke={FUR_D} strokeWidth={4} />
          <path d="M-120 110 Q-100 0 -50 -14 L-34 50 Q0 80 34 50 L50 -14 Q100 0 120 110Z" fill="url(#mTank)" stroke="#9AA6BE" strokeWidth={3} />
          <g transform={`translate(0 -150) scale(0.84) rotate(${Math.sin(t * 31) * shake * 0.25})`}><Head ex={ex} t={t} /></g>
        </g>
        {/* her */}
        <g transform={`translate(760 ${860 + breath * 0.4})`}>
          <path d="M-190 120 Q-170 -10 -80 -26 L80 -26 Q170 -10 190 120Z" fill="url(#mFur)" stroke={FUR_D} strokeWidth={4} opacity={her === 'back' ? 1 : 1} />
          <path d="M-150 112 Q-130 4 -70 -14 L-50 20 Q0 40 50 20 L70 -14 Q130 4 150 112Z" fill="#B49CE6" stroke="#6E58B0" strokeWidth={3} /><path d="M-70 -14 Q-60 -40 -52 -14M70 -14 Q60 -40 52 -14" stroke="#6E58B0" strokeWidth={6} fill="none" />
          <g transform={`translate(10 -142) scale(0.84) rotate(${her === 'back' ? 0 : 8})`}><Partner state={her} t={t} /></g>
          {bubble && (() => { const w = Math.max(260, bubble.length * 17 + 60); return <g transform="translate(-20 -330)"><rect x={-w / 2 + 20} y={-34} width={w} height={64} rx={32} fill="#fff" stroke="#999" strokeWidth={3} /><path d="M-40 28 L-56 56 L-10 28Z" fill="#fff" stroke="#999" strokeWidth={3} /><text x={20} y={8} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={26} fill="#222">{bubble}</text></g>; })()}
        </g>
        {/* blanket over both with cars + his bump */}
        <g>
          <path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1060 1920 L20 1920Z" fill="url(#cBlanket)" stroke="#142A6A" strokeWidth={4} />
          <path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1020 1066 Q780 1020 540 1060 Q300 1020 60 1066Z" fill="#F4F6FC" stroke="#AEB8D0" strokeWidth={3} />
          <clipPath id="cQuilt"><path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1060 1920 L20 1920Z" /></clipPath>
          <g clipPath="url(#cQuilt)">
            {Array.from({length: 30}).map((_, i) => <rect key={i} x={30 + i * 36} y={1190 + (i % 2) * 22} width={36} height={22} fill={i % 2 ? '#fff' : '#15151B'} opacity={0.95} />)}
            {Array.from({length: 40}).map((_, i) => <circle key={i} cx={random(`qx${i}`) * 1080} cy={1090 + random(`qy${i}`) * 830} r={1.8 + random(`qr${i}`) * 2.2} fill="#fff" opacity={0.45} />)}
            {[0, 1, 2, 3].map((row) => [0, 1, 2].map((col) => { const cx = 150 + col * 340 + (row % 2) * 170, cy = 1350 + row * 190; return (
              <g key={`${row}${col}`}>
                <g transform={`translate(${cx} ${cy}) scale(0.44)`}>
                  <path d="M-290 40 L-270 -20 Q-240 -40 -170 -45 L-90 -110 Q-60 -135 0 -135 L110 -135 Q160 -135 190 -100 L230 -50 L285 -35 Q310 -30 312 0 L312 50 Q312 72 290 72 L-270 72 Q-295 72 -290 40Z" fill="url(#cRed)" stroke="#5A0E0A" strokeWidth={9} />
                  <path d="M-80 -100 L-40 -126 L100 -126 L150 -94 L140 -50 L-95 -50Z" fill="#BFE4F6" stroke="#5A0E0A" strokeWidth={7} />
                  <polygon points="-215,-8 -105,-8 -128,18 -30,18 -165,64 -138,34 -220,34" fill="#FFC93C" stroke="#B07A10" strokeWidth={5} />
                  <circle cx={50} cy={20} r={32} fill="#fff" stroke="#5A0E0A" strokeWidth={5} /><text x={50} y={34} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={40} fill="#C21F1F">95</text>
                  {[-170, 190].map((wx) => <g key={wx} transform={`translate(${wx} 72)`}><circle r={54} fill="#1B1B1B" /><circle r={28} fill="#C9CBD6" /></g>)}
                </g>
                <polygon transform={`translate(${cx + 175} ${cy + 70}) scale(1.1)`} points="0,-26 16,-26 6,-4 20,-4 -8,32 0,6 -12,6" fill="#FFC93C" stroke="#B07A10" strokeWidth={2} />
              </g>); }))}
          </g>
          {/* her breathing mound + his bump */}
          <ellipse cx={780} cy={1100 + breath * 0.5} rx={220} ry={46} fill="#9DB8FF" opacity={0.18} /><path d="M580 1090 Q780 1040 980 1090" fill="none" stroke="#DCE6FF" strokeWidth={4} opacity={0.35} />
          {(() => { const w = 150 + shake * 9, hgt = 38 + bmp * 2.2, cx = 330, cy = 1110 - bmp * 0.9; return <><ellipse cx={cx} cy={cy + hgt * 0.35} rx={w} ry={hgt} fill="#07123A" opacity={0.5} /><ellipse cx={cx - 12} cy={cy - hgt * 0.1} rx={w * 0.85} ry={hgt * 0.8} fill="#9DB8FF" opacity={0.4} /><path d={`M${cx - w} ${cy + hgt * 0.4} Q${cx} ${cy - hgt * 1.25} ${cx + w} ${cy + hgt * 0.4}`} fill="none" stroke="#DCE6FF" strokeWidth={4} opacity={0.5} /></>; })()}
        </g>
        <rect x={0} y={0} width={1080} height={1920} fill="#0A0614" opacity={0.0 + (1 - lights) * 0.6} />
      </g>
      <HeartMeter pct={pct} cracks={cracks} t={t} x={118} y={595} />
      <Thermo deg={deg} t={t} />
    </svg>
  );
};

/** review board: one still per 30 frames (NOT the final video) */
export const CoupleBoard: React.FC = () => {
  const f = useCurrentFrame(), i = Math.min(5, Math.floor(f / 30)), t = f / 30;
  const S: CoupleState[] = [
    {t, shake: 6, ex: {mouth: 'o', eye: 1.1, pupil: 0.8, brow: -0.5, sweat: 0.3, blush: 0.8}, her: 'front', pct: 5, cracks: 0, tries: 0, deg: 21, hour: 11, zoom: [2.6, 380, 780]},
    {t, shake: 6, ex: {mouth: 'o', eye: 1.1, pupil: 0.8, brow: -0.5, sweat: 0.3, blush: 0.8}, her: 'front', pct: 5, cracks: 0, tries: 0, deg: 21, hour: 11},
    {t, shake: 5, ex: {mouth: 'flat', eye: 1, pupil: 1.1, brow: 0.3, sweat: 0.2, blush: 0.7}, her: 'mask', pct: 5, cracks: 1, tries: 3, deg: 24, hour: 1, bubble: 'Mmmf… tomorrow…'},
    {t, shake: 10, ex: {mouth: 'scream', eye: 1.15, pupil: 0.55, brow: -1, sweat: 1, blush: 1}, her: 'back', pct: 1, cracks: 4, tries: 5, deg: 30, hour: 2},
    {t, shake: 0, ex: {mouth: 'worry', eye: 0.5, pupil: 1, brow: 0.4, sweat: 0.2, blush: 0.9}, her: 'back', pct: 1, cracks: 6, tries: 7, deg: 30, hour: 6},
    {t, shake: 0, ex: {mouth: 'sleep', eye: 0.1, pupil: 1, brow: 0.2, sweat: 0, blush: 0.9}, her: 'front', pct: 1, cracks: 6, tries: 7, deg: 22, hour: 6},
  ];
  return <div style={{position: 'absolute', inset: 0, background: '#000'}}><Defs /><CoupleScene {...S[i]} /></div>;
};
void CALM;
