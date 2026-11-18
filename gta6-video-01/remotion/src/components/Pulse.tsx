import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
/** Beat-synced punch (100 BPM = every 18 frames): quick 1.4% scale kick that decays. */
export const Pulse: React.FC<{children: React.ReactNode; amp?: number}> = ({children, amp = 0.014}) => {
  const frame = useCurrentFrame();
  const ph = (frame % 18) / 18;
  return <AbsoluteFill style={{transform: `scale(${1 + amp * Math.exp(-ph * 6)})`}}>{children}</AbsoluteFill>;
};
