import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {Ex, Head, CALM, Defs} from './Macaque';

/* "Los dos monos" building blocks: partner, wide bed, creative success-o-meter, tally marks, thermometer. Canvas 1080x1920. */
const F = 'DejaVu Sans, sans-serif';
const FUR_D = '#5E3A1B';

export const Partner: React.FC<{state: 'front' | 'mask' | 'back' | 'awake'; t: number; breathe?: number}> = ({state, t, breathe = 1}) => {
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
          <g style={{filter: 'brightness(1.2) saturate(0.85)'}}><Head ex={{mouth: state === 'awake' ? 'flat' : 'sleep', eye: state === 'mask' ? 0.0 : state === 'awake' ? 0.55 : 0.06, pupil: 1, brow: state === 'awake' ? -0.2 : 0.3, sweat: 0, blush: 1}} t={t} /></g>
          {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 42} -4)`}><path d={`M${sd * 14} -3 L${sd * 30} -12 M${sd * 18} 4 L${sd * 34} 4 M${sd * 14} 10 L${sd * 28} 18`} stroke="#2A1710" strokeWidth={3.5} strokeLinecap="round" fill="none" /></g>)}
          {state === 'awake' && <g><path d="M-108 -100 Q0 -130 108 -100 L104 -62 Q0 -84 -104 -62Z" fill="#7E57C2" stroke="#4A2D8A" strokeWidth={3} /></g>}
          {state === 'mask' && <g><path d="M-112 -24 Q0 -50 112 -24 L108 24 Q0 44 -108 24Z" fill="#7E57C2" stroke="#4A2D8A" strokeWidth={3} />{[-1, 1].map((sd) => <path key={sd} d={`M${sd * 42 - 18} -2 Q${sd * 42} 12 ${sd * 42 + 18} -2`} stroke="#EDE3FF" strokeWidth={4} fill="none" strokeLinecap="round" />)}<path d="M-140 0 L-112 -2 M112 -2 L140 0" stroke="#4A2D8A" strokeWidth={6} /></g>}
        </>
      )}
      <g transform="translate(92 -112) rotate(18)"><path d="M0 0 L-46 -30 L-46 30Z M0 0 L46 -30 L46 30Z" fill="#FF7AA8" stroke="#C23C6E" strokeWidth={3} /><circle r={12} fill="#FF9EC0" stroke="#C23C6E" strokeWidth={3} /></g>
      {state !== 'back' && state !== 'awake' && [0, 1, 2].map(z)}
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


type Car = {x: number; y: number; s: number; rot: number; flip?: boolean; face: 'smile' | 'grin' | 'wink' | 'wow'; look: number; trail?: boolean; hop?: number};
const LAYOUT: Car[] = [
  {x: 150, y: 1345, s: 0.62, rot: -7, face: 'smile', look: -4, trail: true}, {x: 520, y: 1310, s: 0.46, rot: 5, flip: true, face: 'wink', look: 3},
  {x: 880, y: 1360, s: 0.66, rot: -3, face: 'grin', look: 5, hop: 18}, {x: 330, y: 1520, s: 0.54, rot: 9, flip: true, face: 'wow', look: -2},
  {x: 700, y: 1540, s: 0.6, rot: -9, face: 'smile', look: 4, trail: true}, {x: 150, y: 1710, s: 0.6, rot: 6, face: 'grin', look: 3},
  {x: 520, y: 1720, s: 0.7, rot: -4, flip: true, face: 'smile', look: -5, trail: true}, {x: 890, y: 1750, s: 0.5, rot: 8, face: 'wink', look: -3},
];
const SPARKS: {t: 'star' | 'bolt' | 'twinkle'; x: number; y: number; r: number; rot: number; fill?: string}[] = [
  {t: 'star', x: 330, y: 1330, r: 20, rot: 10, fill: '#FFE27A'}, {t: 'bolt', x: 690, y: 1330, r: 1.1, rot: 12}, {t: 'star', x: 1010, y: 1470, r: 15, rot: -8, fill: '#fff'},
  {t: 'bolt', x: 100, y: 1520, r: 0.8, rot: -14}, {t: 'star', x: 520, y: 1460, r: 26, rot: 4, fill: '#FFD34D'}, {t: 'twinkle', x: 860, y: 1560, r: 12, rot: 0},
  {t: 'bolt', x: 960, y: 1620, r: 1.2, rot: 10}, {t: 'star', x: 330, y: 1650, r: 14, rot: 14, fill: '#fff'}, {t: 'bolt', x: 330, y: 1790, r: 0.9, rot: -10},
  {t: 'star', x: 720, y: 1860, r: 22, rot: -6, fill: '#FFE27A'}, {t: 'twinkle', x: 80, y: 1850, r: 14, rot: 20}, {t: 'star', x: 1000, y: 1890, r: 12, rot: 0, fill: '#fff'},
  {t: 'twinkle', x: 440, y: 1600, r: 10, rot: 0}, {t: 'bolt', x: 760, y: 1700, r: 0.75, rot: -18}, {t: 'star', x: 130, y: 1420, r: 11, rot: 0, fill: '#fff'},
];
const Star: React.FC<{x: number; y: number; r: number; rot: number; fill?: string}> = ({x, y, r, rot, fill}) => (
  <polygon transform={`translate(${x} ${y}) rotate(${rot})`} fill={fill} stroke="#B58A18" strokeWidth={1.5} strokeLinejoin="round" points={Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ')} />
);
/** small cartoon race car, 3/4 front view, hand-varied (flip, tilt, expression, gaze) */
const McCar: React.FC<Car> = ({x, y, s, rot, flip, face, look, hop = 0}) => {
  const fx = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y - hop}) rotate(${rot}) scale(${s * fx * 0.7} ${s * 0.7})`}>
      <ellipse cx={20} cy={134 + hop / s} rx={220 - hop} ry={13} fill="#000" opacity={0.28} />
      {/* spoiler + side panel */}
      <path d="M200 -50 L262 -58 L266 -30 L214 -18Z" fill="#8E1812" stroke="#5A0E0A" strokeWidth={5} />
      <path d="M150 -6 L252 -40 L264 92 L160 114Z" fill="#B8231C" stroke="#5A0E0A" strokeWidth={6} />
      <path d="M160 8 L236 -14 L240 12 L164 34Z" fill="#7FB8E6" stroke="#5A0E0A" strokeWidth={4} />
      <polygon points="170,40 232,26 214,56 246,52 196,104 204,70 172,76" fill="#FFC93C" stroke="#B07A10" strokeWidth={3} />
      <g transform={`translate(226 104) scale(${fx} 1) rotate(-8)`}><text textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill="#fff" stroke="#8E1812" strokeWidth={1}>95</text></g>
      {/* roof + body */}
      <path d="M-90 -100 Q0 -160 96 -104 L152 -6 L-152 -6Z" fill="#C62A22" stroke="#5A0E0A" strokeWidth={6} /><path d="M-40 -128 Q20 -146 70 -118" fill="none" stroke="#FF8A7E" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
      <path d="M-160 44 Q-164 -16 -110 -34 L106 -34 Q158 -16 162 44 L162 100 Q162 118 142 118 L-142 118 Q-162 118 -162 100Z" fill="url(#cRed)" stroke="#5A0E0A" strokeWidth={7} />
      <path d="M-120 -8 Q0 -30 120 -8" fill="none" stroke="#FF9A8E" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      {/* windshield + eyes */}
      <path d="M-112 -28 Q-92 -104 0 -108 Q92 -104 112 -28Z" fill="#F7FBFF" stroke="#5A0E0A" strokeWidth={6} />
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 44} -62)`}>
        {face === 'wink' && sd === 1 ? <path d="M-26 6 Q0 -16 26 6" fill="none" stroke="#5A0E0A" strokeWidth={7} strokeLinecap="round" /> : <><ellipse rx={32} ry={30} fill="#fff" /><circle cx={look} cy={5} r={face === 'wow' ? 12 : 16} fill="#3A8FD8" /><circle cx={look} cy={5} r={face === 'wow' ? 5 : 7} fill="#0B1B33" /><circle cx={look + 5} cy={-1} r={4} fill="#fff" /><path d={`M-32 ${face === 'wow' ? -18 : -6} Q0 -40 32 ${face === 'wow' ? -18 : -6} L32 -16 Q0 -46 -32 -16Z`} fill="#C62A22" /></>}
      </g>)}
      {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 122} cy={52} rx={26} ry={17} fill="#FFE27A" stroke="#7A5A10" strokeWidth={4} /><ellipse cx={sd * 116} cy={48} rx={9} ry={5} fill="#fff" opacity={0.8} /></g>)}
      {/* mouth */}
      {face === 'wow' ? <ellipse cx={0} cy={92} rx={34} ry={22} fill="#3A0F12" stroke="#5A0E0A" strokeWidth={5} /> : face === 'grin' ? <><path d="M-96 72 Q0 150 96 72Z" fill="#3A0F12" stroke="#5A0E0A" strokeWidth={5} strokeLinejoin="round" /><path d="M-82 76 Q0 98 82 76 L78 88 Q0 108 -78 88Z" fill="#F4F4F4" /></> : <><path d="M-96 72 Q0 140 96 72 L90 86 Q0 122 -90 86Z" fill="#F2F2F2" stroke="#5A0E0A" strokeWidth={5} /><path d="M-90 80 Q0 108 90 80" fill="none" stroke="#9AA0AA" strokeWidth={3} /></>}
      {/* wheels */}
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 166} 112)`}><ellipse rx={24} ry={46} fill="#1B1B1B" stroke="#000" strokeWidth={3} /><ellipse rx={13} ry={26} fill="#E8E8E8" /><ellipse rx={8} ry={16} fill="#D13228" /></g>)}
    </g>
  );
};
export type CoupleState = {t: number; shake: number; ex: Ex; her: 'front' | 'mask' | 'back' | 'awake'; pct: number; cracks: number; tries: number; deg: number; hour: number; zoom?: [number, number, number]; bubble?: string; lights?: number; hisDx?: number; hisRot?: number; herDx?: number; herRot?: number; herUp?: number; blanketDx?: number; blanketRot?: number; bags?: number; dawn?: number; tint?: number; hideMeter?: number; hideThermo?: number; hideTally?: number; hisBubble?: string; extra?: React.ReactNode; over?: React.ReactNode};
export const CoupleScene: React.FC<CoupleState> = ({t, shake, ex, her, pct, cracks, tries, deg, hour, zoom = [1, 540, 960], bubble, lights = 1, hisDx = 0, hisRot = 0, herDx = 0, herRot = 0, herUp = 0, blanketDx = 0, blanketRot = 0, bags = 0, dawn = 0, tint = 0, hideMeter = 0, hideThermo = 0, hideTally = 0, hisBubble, extra, over}) => {
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
          <rect x={12} y={12} width={206} height={246} fill="url(#cSky)" /><rect x={12} y={12} width={206} height={246} fill="#FFB35C" opacity={0.75 * dawn} />
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
        <g opacity={1 - hideTally}><Tally n={tries} x={540} y={540} /></g>
        <rect x={110} y={700} width={420} height={190} rx={70} fill="url(#cPillow)" stroke="#9AA6BE" strokeWidth={3} /><rect x={550} y={700} width={420} height={190} rx={70} fill="url(#cPillow)" stroke="#9AA6BE" strokeWidth={3} />
        {/* him */}
        <g transform={`translate(${320 + hisDx + Math.sin(t * 41) * shake * 0.4} ${840}) rotate(${hisRot} 0 120)`}>
          <path d="M-190 120 Q-170 -10 -80 -26 L80 -26 Q170 -10 190 120Z" fill="url(#mFur)" stroke={FUR_D} strokeWidth={4} />
          <path d="M-120 110 Q-100 0 -50 -14 L-34 50 Q0 80 34 50 L50 -14 Q100 0 120 110Z" fill="url(#mTank)" stroke="#9AA6BE" strokeWidth={3} />
          <g transform={`translate(0 -150) scale(0.84) rotate(${Math.sin(t * 31) * shake * 0.25})`}><Head ex={ex} t={t} />{bags > 0 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 42} cy={26} rx={28} ry={9} fill="#4A2D5A" opacity={0.55 * bags} />)}</g>
          {hisBubble && (() => { const w = Math.max(260, hisBubble.length * 17 + 60); return <g transform="translate(90 -330)"><rect x={-w / 2} y={-34} width={w} height={64} rx={32} fill="#fff" stroke="#999" strokeWidth={3} /><path d="M20 28 L40 58 L56 28Z" fill="#fff" stroke="#999" strokeWidth={3} /><text textAnchor="middle" y={8} fontFamily={F} fontWeight={800} fontSize={26} fill="#222">{hisBubble}</text></g>; })()}
        </g>
        {/* her */}
        <g transform={`translate(${760 + herDx} ${860 + breath * 0.4 - herUp}) rotate(${herRot} 0 120)`}>
          <path d="M-190 120 Q-170 -10 -80 -26 L80 -26 Q170 -10 190 120Z" fill="url(#mFur)" stroke={FUR_D} strokeWidth={4} opacity={her === 'back' ? 1 : 1} />
          <path d="M-150 112 Q-130 4 -70 -14 L-50 20 Q0 40 50 20 L70 -14 Q130 4 150 112Z" fill="#B49CE6" stroke="#6E58B0" strokeWidth={3} /><path d="M-70 -14 Q-60 -40 -52 -14M70 -14 Q60 -40 52 -14" stroke="#6E58B0" strokeWidth={6} fill="none" />
          <g transform={`translate(10 -142) scale(0.84) rotate(${her === 'back' ? 0 : 8})`}><Partner state={her} t={t} /></g>
          {bubble && (() => { const w = Math.max(260, bubble.length * 17 + 60); return <g transform="translate(-20 -330)"><rect x={-w / 2 + 20} y={-34} width={w} height={64} rx={32} fill="#fff" stroke="#999" strokeWidth={3} /><path d="M-40 28 L-56 56 L-10 28Z" fill="#fff" stroke="#999" strokeWidth={3} /><text x={20} y={8} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={26} fill="#222">{bubble}</text></g>; })()}
        </g>
        {/* blanket over both with cars + his bump */}
        <g transform={`translate(${blanketDx} 0) rotate(${blanketRot} 540 1500)`}>
          <path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1060 1920 L20 1920Z" fill="url(#cBlanket)" stroke="#142A6A" strokeWidth={4} />
          <path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1020 1066 Q780 1020 540 1060 Q300 1020 60 1066Z" fill="#F4F6FC" stroke="#AEB8D0" strokeWidth={3} />
          <clipPath id="cQuilt"><path d="M60 1010 Q300 960 540 1000 Q780 960 1020 1010 L1060 1920 L20 1920Z" /></clipPath>
          <g clipPath="url(#cQuilt)">
            {Array.from({length: 30}).map((_, i) => <rect key={i} x={30 + i * 36} y={1190 + (i % 2) * 22} width={36} height={22} fill={i % 2 ? '#fff' : '#15151B'} opacity={0.95} />)}
            {Array.from({length: 40}).map((_, i) => <circle key={i} cx={random(`qx${i}`) * 1080} cy={1090 + random(`qy${i}`) * 830} r={1.8 + random(`qr${i}`) * 2.2} fill="#fff" opacity={0.45} />)}
            {LAYOUT.map((c, i) => <g key={i}>{c.trail && <g opacity={0.5}>{[0, 1, 2].map((k) => <line key={k} x1={c.x - (c.flip ? -1 : 1) * (110 + k * 6) * c.s * 0.7} y1={c.y + (k - 1) * 22 * c.s * 0.7 + 26} x2={c.x - (c.flip ? -1 : 1) * (200 + k * 18) * c.s * 0.7} y2={c.y + (k - 1) * 22 * c.s * 0.7 + 26} stroke="#fff" strokeWidth={5} strokeLinecap="round" />)}</g>}<McCar {...c} /></g>)}
            {SPARKS.map((k, i) => k.t === 'star' ? <Star key={i} x={k.x} y={k.y} r={k.r} rot={k.rot} fill={k.fill} /> : k.t === 'bolt' ? <polygon key={i} transform={`translate(${k.x} ${k.y}) rotate(${k.rot}) scale(${k.r})`} points="0,-26 16,-26 6,-4 20,-4 -8,32 0,6 -12,6" fill="#FFC93C" stroke="#B07A10" strokeWidth={2} /> : <g key={i} transform={`translate(${k.x} ${k.y}) rotate(${k.rot})`} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8}><line x1={-k.r} x2={k.r} /><line y1={-k.r} y2={k.r} /></g>)}
          </g>
          {/* her breathing mound + his bump */}
          <ellipse cx={780} cy={1100 + breath * 0.5} rx={220} ry={46} fill="#9DB8FF" opacity={0.18} /><path d="M580 1090 Q780 1040 980 1090" fill="none" stroke="#DCE6FF" strokeWidth={4} opacity={0.35} />
          {(() => { const w = 150 + shake * 9, hgt = 38 + bmp * 2.2, cx = 330, cy = 1110 - bmp * 0.9; return <><ellipse cx={cx} cy={cy + hgt * 0.35} rx={w} ry={hgt} fill="#07123A" opacity={0.5} /><ellipse cx={cx - 12} cy={cy - hgt * 0.1} rx={w * 0.85} ry={hgt * 0.8} fill="#9DB8FF" opacity={0.4} /><path d={`M${cx - w} ${cy + hgt * 0.4} Q${cx} ${cy - hgt * 1.25} ${cx + w} ${cy + hgt * 0.4}`} fill="none" stroke="#DCE6FF" strokeWidth={4} opacity={0.5} /></>; })()}
        </g>
        <rect x={0} y={0} width={1080} height={1920} fill="#0A0614" opacity={0.0 + (1 - lights) * 0.6} />
        <rect x={0} y={0} width={1080} height={1920} fill="#FF8A3A" opacity={0.28 * dawn + 0.22 * tint} style={{mixBlendMode: 'soft-light'}} />
        {extra}
      </g>
      <g opacity={1 - hideMeter}><HeartMeter pct={pct} cracks={cracks} t={t} x={118} y={595} /></g>
      <g opacity={1 - hideThermo}><Thermo deg={deg} t={t} /></g>
      {over}
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
