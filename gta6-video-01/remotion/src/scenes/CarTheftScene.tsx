import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge, Shake, Whip} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C, FONT} from '../theme';
import {PhotoCard} from '../components/PhotoCard';
import {VideoCard} from '../components/VideoCard';

const Panel: React.FC<{title: string; sub: string; color: string; at: number}> = ({title, sub, color, at}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  return (
    <div style={{width: 400, padding: '30px 26px', borderRadius: 30, background: '#0B0620ee', border: `6px solid ${color}`, transform: `scale(${p}) rotate(${(1 - p) * 8}deg)`, opacity: p, textAlign: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color, lineHeight: 1}}>{title}</div>
      <div style={{fontFamily: FONT, fontSize: 28, color: '#fff', marginTop: 10}}>{sub}</div>
    </div>
  );
};
/** Stylised lock interaction. Fictional UI representation, not a real-world how-to. */
export const CarTheftScene: React.FC = () => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame, [170, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const go = interpolate(frame, [270, 360], [-300, 1400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const R = 170, circ = 2 * Math.PI * R;
  return (
    <ClipSlot k="theft" fallback={
      <AbsoluteFill style={{background: 'transparent'}}>
        <VideoCard src="clips/truck_lock.mp4" at={0} out={262} w={960} ratio={0.82} left={60} top={470} rotate={-1.5} focus="50% 55%" zoom={[1.15, 1.45]} />
        <PhotoCard src="images/car_meet.jpg" at={270} w={960} left={60} top={560} rotate={-1.5} zoom={[1.0, 1.7]} focus="55% 70%" from="bottom" />
        <div style={{position: 'absolute', left: 190, top: 700, width: 700, height: 340, display: 'none'}}>
          <svg viewBox="0 0 700 340" width="700" height="340"><path d="M20 260 Q40 120 220 100 L440 90 Q640 110 680 250 L680 290 L20 290Z" fill={C.turquoise} /><path d="M250 112 L440 104 Q560 120 600 200 L250 200Z" fill="#0B0620" opacity=".75" /><circle cx="160" cy="292" r="48" fill="#111" /><circle cx="540" cy="292" r="48" fill="#111" /></svg>
        </div>
        <div style={{position: 'absolute', left: go, top: 760, width: 560, display: 'none'}}><svg viewBox="0 0 700 340"><path d="M20 260 Q40 120 220 100 L440 90 Q640 110 680 250 L680 290 L20 290Z" fill={C.yellow} /><circle cx="160" cy="292" r="48" fill="#111" /><circle cx="540" cy="292" r="48" fill="#111" /></svg></div>
        <div style={{position: 'absolute', left: 540 - R - 20, top: 700, opacity: 0}}>
          <svg width={R * 2 + 40} height={R * 2 + 40}><circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke="#ffffff33" strokeWidth="26" /><circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke={C.yellow} strokeWidth="26" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform={`rotate(-90 ${R + 20} ${R + 20})`} /><text x={R + 20} y={R + 50} textAnchor="middle" fontFamily={FONT} fontSize="90" fill="#fff">{Math.round(prog * 100)}%</text></svg>
        </div>
      </AbsoluteFill>}
    />
  );
};
export const CarTheftOverlay: React.FC = () => (
  <Shake amp={4} at={0} dur={20}>
    <NumberBadge n="06" label="CAR THEFT" color={C.red} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 270}}>
      <KineticText text="Not every car is [easy] to steal." at={6} out={92} size={96} hl={C.red} from="bottom" />
    </AbsoluteFill>
    <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 30, paddingTop: 280, paddingRight: 80, paddingLeft: 0}}>
      <Panel title="SLIM JIM" sub="for some locked doors" color={C.turquoise} at={162} />
      <Panel title="KEY CLONER" sub="for certain vehicles" color={C.pink} at={228} />
    </AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 1050}}>
      <KineticText text="[Tools.]" at={98} out={158} size={130} hl={C.yellow} from="left" />
      <KineticText text="[Interactions.]" at={296} out={336} size={110} hl={C.turquoise} from="right" />
    </AbsoluteFill>
    <Flash at={10} color={C.red} /><Whip at={262} color={C.yellow} />
  </Shake>
);
