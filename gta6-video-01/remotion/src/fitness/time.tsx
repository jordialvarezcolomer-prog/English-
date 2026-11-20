import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import T from './ep01_tight.json';

/** Piecewise map between the original narration timeline and the tightened one (pauses removed). */
const OLD = T.old as [number, number][], NEW = T.new as [number, number][];
export const NEW_VOICE_END = T.total;
const map = (t: number, A: [number, number][], B: [number, number][]) => {
  if (t <= A[0][0]) return B[0][0] + (t - A[0][0]);
  for (let i = 0; i < A.length; i++) {
    const [a, b] = A[i], [c, d] = B[i];
    if (t <= b) return c + ((t - a) * (d - c)) / Math.max(1e-6, b - a);
    if (i + 1 < A.length && t < A[i + 1][0]) { const [a2] = A[i + 1], [c2] = B[i + 1]; return d + ((t - b) * (c2 - d)) / Math.max(1e-6, a2 - b); }
  }
  const [, b] = A[A.length - 1], [, d] = B[B.length - 1]; return d + (t - b);
};
export const toNew = (tOld: number) => map(tOld, OLD, NEW);
export const toOld = (tNew: number) => map(tNew, NEW, OLD);

export const TimeCtx = createContext<{newStart: number; oldStart: number} | null>(null);
/** Seconds since the scene start, expressed on the ORIGINAL narration clock (so scene beats stay on their words). */
export const useLocalOld = () => {
  const f = useCurrentFrame(); const c = useContext(TimeCtx);
  if (!c) return f / 30;
  return toOld(c.newStart + f / 30) - c.oldStart;
};
export const SceneClock: React.FC<{newStart: number; oldStart: number; children: React.ReactNode}> = ({newStart, oldStart, children}) => <TimeCtx.Provider value={{newStart, oldStart}}>{children}</TimeCtx.Provider>;
