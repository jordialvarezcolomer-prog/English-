import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {KineticText} from '../components/KineticText';
import {Flash, NumberBadge} from '../components/Fx';
import {ClipSlot} from '../components/ClipSlot';
import {C, FONT} from '../theme';

const POSTS = [['@sunset.cruiser', '🌴 neon night in the Keys', C.pink], ['@gator_watch', 'ok that gator is NOT a pet', C.green], ['@vc_beach', 'who left a boat on the highway??', C.turquoise], ['@leonida_live', 'traffic is wild today', C.orange], ['@palm.patrol', 'sunsets > everything', C.purple], ['@keys_daily', 'you will not believe this one', C.yellow]] as const;
/** Illustrative (NOT the real in-game UI) phone feed: scroll + follow, no posting. */
export const SocialMediaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [30, 230], [0, 1200], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const phoneIn = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  return (
    <ClipSlot k="social" fallback={
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.purple}, ${C.pink})`}}>
        <div style={{position: 'absolute', left: 210, top: 330, width: 660, height: 1000, borderRadius: 70, background: '#0B0620', border: '12px solid #fff', overflow: 'hidden', transform: `scale(${0.7 + phoneIn * 0.3}) translateY(${(1 - phoneIn) * 600}px)`, boxShadow: '0 40px 90px rgba(0,0,0,.45)'}}>
          <div style={{transform: `translateY(${-scroll}px)`, padding: 24}}>
            {[...POSTS, ...POSTS].map(([u, t, c], i) => (
              <div key={i} style={{marginBottom: 20, borderRadius: 28, background: '#1a1238', padding: 20}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 54, height: 54, borderRadius: 27, background: c}} /><div style={{fontFamily: FONT, color: '#fff', fontSize: 28}}>{u}</div><div style={{marginLeft: 'auto', fontFamily: FONT, fontSize: 22, color: c, border: `3px solid ${c}`, borderRadius: 14, padding: '2px 12px'}}>FOLLOW</div></div>
                <div style={{height: 200, borderRadius: 20, marginTop: 14, background: `linear-gradient(135deg, ${c}, #0B0620)`}} />
                <div style={{fontFamily: FONT, color: '#fff', fontSize: 28, marginTop: 12}}>{t}</div>
                <div style={{fontFamily: FONT, color: '#ffffffaa', fontSize: 24, marginTop: 6}}>♥ {1200 + i * 337}   💬 {40 + i * 9}</div>
              </div>))}
          </div>
        </div>
      </AbsoluteFill>}
    />
  );
};
export const SocialMediaOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [292, 306], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <NumberBadge n="03" label="SOCIAL MEDIA" color={C.purple} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1000, gap: 0}}>
        <KineticText text="You can [scroll.]" at={170} out={225} size={110} hl={C.turquoise} from="left" />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1000}}>
        <KineticText text="You can [follow.]" at={232} out={285} size={110} hl={C.green} from="right" />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1000}}>
        <div style={{position: 'relative'}}>
          <KineticText text="But you can't [post.]" at={290} size={110} hl={C.red} />
          <div style={{position: 'absolute', left: 0, top: 120, height: 14, width: `${strike}%`, background: C.red, transform: 'rotate(-3deg)'}} />
        </div>
      </AbsoluteFill>
      <Flash at={290} color={C.red} />
    </AbsoluteFill>
  );
};
