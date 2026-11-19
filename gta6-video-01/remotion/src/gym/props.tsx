import React from 'react';
import {FONT, G, OL} from './kit';

/** Black gym plate seen face-on, white weight label. Use inside an <svg>. */
export const PlateG: React.FC<{cx: number; cy: number; r: number; label?: string; rot?: number}> = ({cx, cy, r, label = '20 KG', rot = 0}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <circle r={r} fill="#1C1D22" stroke={OL} strokeWidth={Math.max(3, r * 0.05)} />
    <circle r={r * 0.86} fill="none" stroke="#34363E" strokeWidth={r * 0.05} />
    <circle r={r * 0.5} fill="#25272D" stroke="#3B3D45" strokeWidth={r * 0.04} />
    <circle r={r * 0.17} fill="#C9CDD4" stroke={OL} strokeWidth={Math.max(2, r * 0.035)} /><circle r={r * 0.07} fill="#5A5E66" />
    {label && <><text y={-r * 0.68} textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={r * 0.2} letterSpacing={1}>{label}</text><text y={r * 0.68} textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={r * 0.2} letterSpacing={1}>{label}</text></>}
  </g>
);
/** Plate post ("the machine waiting for him"): base, post with holes, peg with a 20 KG plate. Screen coords. */
export const Rack: React.FC<{x: number; floor: number; top: number; plateY: number; r?: number; bob?: number}> = ({x, floor, top, plateY, r = 95, bob = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <rect x={x - 90} y={floor - 22} width={180} height={22} rx={8} fill="#3A3F4B" stroke={OL} strokeWidth={4} />
    <rect x={x - 16} y={top} width={32} height={floor - top - 18} rx={6} fill="#4C5260" stroke={OL} strokeWidth={4} />
    {Array.from({length: 9}).map((_, i) => <circle key={i} cx={x} cy={top + 40 + i * ((floor - top - 90) / 8)} r={5} fill="#2A2E38" />)}
    <rect x={x - 6} y={top - 26} width={12} height={30} rx={4} fill="#C9CDD4" stroke={OL} strokeWidth={3} />
    <PlateG cx={x} cy={plateY + bob} r={r} />
  </svg>
);
/** Glassy fuel cell with a wavy liquid surface (0..1). Screen coords via left/top. */
export const FuelCell: React.FC<{level: number; t: number; left: number; top: number; w?: number; h?: number; glow?: number}> = ({level, t, left, top, w = 210, h = 380, glow = 0}) => {
  const y = h - 20 - (h - 40) * level;
  const pts = Array.from({length: 21}, (_, i) => `${10 + (i * (w - 20)) / 20},${y + Math.sin(i * 0.9 + t * 7) * 7}`).join(' L');
  return (
    <svg width={w} height={h} style={{position: 'absolute', left, top, overflow: 'visible', filter: `drop-shadow(0 0 ${18 + 30 * glow}px rgba(255,200,60,${0.25 + 0.4 * glow}))`}}>
      <defs><linearGradient id="fuelg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD45E" /><stop offset="1" stopColor="#FF9A1F" /></linearGradient><clipPath id="fuelc"><rect x={10} y={10} width={w - 20} height={h - 20} rx={26} /></clipPath></defs>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={30} fill="rgba(10,30,70,.85)" stroke="#EAF6FF" strokeWidth={6} />
      <g clipPath="url(#fuelc)"><path d={`M${pts} L${w - 10},${h} L10,${h} Z`} fill="url(#fuelg)" />{Array.from({length: 6}).map((_, i) => <circle key={i} cx={30 + ((i * 37 + t * 40) % (w - 60))} cy={h - 30 - ((t * 90 + i * 53) % Math.max(10, h - y - 20))} r={4 + (i % 3)} fill="rgba(255,255,255,.55)" />)}</g>
      {[0.25, 0.5, 0.75].map((q) => <line key={q} x1={w - 52} x2={w - 22} y1={h - 20 - (h - 40) * q} y2={h - 20 - (h - 40) * q} stroke="#EAF6FF" strokeWidth={4} opacity={0.6} />)}
      <rect x={26} y={18} width={14} height={h - 60} rx={7} fill="rgba(255,255,255,.18)" />
    </svg>
  );
};
/** Detailed glowing skeleton (600x1100 units). `sweep` 0..1 moves a light streak down the femurs. */
export const Skeleton: React.FC<{left: number; top: number; s: number; sweep?: number; pulse?: number}> = ({left, top, s, sweep = 0, pulse = 0}) => {
  const C = '#7CC8FF', J = '#DDF2FF';
  const bone = (x1: number, y1: number, x2: number, y2: number, w = 18) => <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C} strokeWidth={w + 8} strokeLinecap="round" opacity={0.35} /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0F2A55" strokeWidth={w} strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C} strokeWidth={4} strokeLinecap="round" /></g>;
  const joint = (x: number, y: number, r = 16) => <circle cx={x} cy={y} r={r} fill={J} stroke={C} strokeWidth={5} />;
  const ribs = Array.from({length: 8}, (_, i) => { const y0 = 268 + i * 30, w = 118 - Math.abs(i - 2.5) * 9; return <g key={i}><path d={`M300 ${y0} C${300 - w * 0.7} ${y0 - 18} ${300 - w * 1.05} ${y0 + 10} ${300 - w} ${y0 + 46}`} stroke={C} strokeWidth={6} fill="none" strokeLinecap="round" /><path d={`M300 ${y0} C${300 + w * 0.7} ${y0 - 18} ${300 + w * 1.05} ${y0 + 10} ${300 + w} ${y0 + 46}`} stroke={C} strokeWidth={6} fill="none" strokeLinecap="round" /></g>; });
  const sy = 640 + 260 * sweep;
  return (
    <svg width={600 * s} height={1100 * s} viewBox="0 0 600 1100" style={{position: 'absolute', left, top, overflow: 'visible', filter: `drop-shadow(0 0 ${10 + 8 * pulse}px #3DA8FF)`}}>
      {/* skull */}
      <ellipse cx={300} cy={104} rx={74} ry={86} fill="rgba(80,170,255,.12)" stroke={C} strokeWidth={7} />
      <ellipse cx={272} cy={110} rx={18} ry={20} fill="#0B1E3F" stroke={C} strokeWidth={5} /><ellipse cx={328} cy={110} rx={18} ry={20} fill="#0B1E3F" stroke={C} strokeWidth={5} />
      <path d="M300 128 L290 148 L310 148 Z" fill="#0B1E3F" stroke={C} strokeWidth={4} strokeLinejoin="round" />
      <path d="M252 160 Q300 214 348 160" fill="none" stroke={C} strokeWidth={6} /><path d="M268 168 L268 182 M284 172 L284 188 M300 174 L300 190 M316 172 L316 188 M332 168 L332 182" stroke={C} strokeWidth={4} />
      {/* spine */}
      {Array.from({length: 17}).map((_, i) => <rect key={i} x={286} y={204 + i * 22} width={28} height={15} rx={6} fill="#0F2A55" stroke={C} strokeWidth={4} />)}
      {/* clavicles, sternum, ribs */}
      <path d="M300 236 Q250 222 196 228 M300 236 Q350 222 404 228" stroke={C} strokeWidth={9} fill="none" strokeLinecap="round" />
      <rect x={290} y={250} width={20} height={150} rx={9} fill="#0F2A55" stroke={C} strokeWidth={4} />
      {ribs}
      {/* arms */}
      {bone(190, 236, 158, 440)}{bone(410, 236, 442, 440)}{bone(160, 446, 140, 600, 10)}{bone(170, 448, 160, 602, 10)}{bone(440, 446, 460, 600, 10)}{bone(430, 448, 440, 602, 10)}
      {joint(190, 236, 20)}{joint(410, 236, 20)}{joint(158, 444, 14)}{joint(442, 444, 14)}
      {/* pelvis */}
      <path d="M300 560 C240 540 200 560 196 600 C194 640 236 660 262 676 L300 690 L338 676 C364 660 406 640 404 600 C400 560 360 540 300 560 Z" fill="rgba(80,170,255,.16)" stroke={C} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={262} cy={640} rx={20} ry={16} fill="#0B1E3F" stroke={C} strokeWidth={4} /><ellipse cx={338} cy={640} rx={20} ry={16} fill="#0B1E3F" stroke={C} strokeWidth={4} />
      {/* legs */}
      {bone(236, 668, 222, 900, 24)}{bone(364, 668, 378, 900, 24)}{bone(222, 912, 214, 1080, 18)}{bone(240, 916, 236, 1078, 8)}{bone(378, 912, 386, 1080, 18)}{bone(360, 916, 364, 1078, 8)}
      {joint(236, 666, 22)}{joint(364, 666, 22)}{joint(222, 906, 20)}{joint(378, 906, 20)}
      {/* light streak running down the femurs */}
      {sweep > 0 && sweep < 1 && <><line x1={232 - 4} y1={sy - 40} x2={229} y2={sy + 40} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.9} /><line x1={368 + 4} y1={sy - 40} x2={371} y2={sy + 40} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.9} /></>}
    </svg>
  );
};
/** Soft pulsing light behind a phone + floating reaction icons. Screen coords (phone centre). */
export const PhoneGlow: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <>
    <div style={{position: 'absolute', left: x - 170, top: y - 170, width: 340, height: 340, borderRadius: 170, background: 'radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,0) 68%)', opacity: 0.75 + 0.25 * Math.sin(t * 6)}} />
    {[0, 1, 2, 3].map((i) => { const p = (t * 0.9 + i * 0.25) % 1; const icon = ['♥', '👍', '🔥', '♥'][i]; return <div key={i} style={{position: 'absolute', left: x + 30 + (i % 2 ? 40 : -10) + Math.sin(p * 6 + i) * 16, top: y - 60 - p * 230, fontSize: 46, opacity: 1 - p, color: G.red, transform: `scale(${0.6 + p * 0.6})`}}>{icon}</div>; })}
  </>
);
