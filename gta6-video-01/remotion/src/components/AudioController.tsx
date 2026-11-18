import React from 'react';
import {Audio, staticFile, interpolate} from 'remotion';
import {ASSETS} from '../timeline';
import {FPS} from '../theme';

/** Voice always on top. Music is ducked ~11 dB (x0.28) under the voice; when no voice file exists the music plays at a neutral level. */
export const AudioController: React.FC = () => {
  const musicVol = ASSETS.voice ? 0.28 : 0.5;
  return (
    <>
      {ASSETS.music && <Audio src={staticFile(ASSETS.music)} volume={(f) => musicVol * interpolate(f, [0, 10, 77 * FPS - 30, 77 * FPS], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />}
      {ASSETS.sfx && <Audio src={staticFile(ASSETS.sfx)} volume={0.9} />}
      {ASSETS.voice && <Audio src={staticFile(ASSETS.voice)} volume={1} />}
    </>
  );
};
