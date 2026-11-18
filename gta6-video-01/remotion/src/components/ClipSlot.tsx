import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {ASSETS} from '../timeline';

/** Plays real gameplay/trailer footage when provided in ASSETS.clips[key]; otherwise renders `fallback` motion graphics.
 *  Never fabricates gameplay. */
export const ClipSlot: React.FC<{k: string; fallback: React.ReactNode}> = ({k, fallback}) => {
  const src = ASSETS.clips[k];
  if (!src) return <>{fallback}</>;
  return <AbsoluteFill><OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>;
};
