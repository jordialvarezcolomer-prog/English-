import React from 'react';
import {Composition, staticFile} from 'remotion';
import {MainVideo} from './MainVideo';
import {GymRest} from './gym/GymRest';
import {GYM_TOTAL} from './gym/timeline';
import {TOTAL_FRAMES} from './timeline';
import {FPS, W, H} from './theme';

const fontCss = `@font-face{font-family:Montserrat;font-weight:900;src:url(${staticFile('fonts/montserrat-latin-900-normal.woff2')}) format('woff2');}`;
export const Root: React.FC = () => (
  <><style>{fontCss}</style><Composition id="GTA6Facts" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="GymRest" component={GymRest} durationInFrames={GYM_TOTAL} fps={FPS} width={W} height={H} /></>
);
