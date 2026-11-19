import React from 'react';
import {Composition, staticFile} from 'remotion';
import {MainVideo} from './MainVideo';
import {GymRest} from './gym/GymRest';
import {Test3D} from './fitness/Test3D';
import {Episode01} from './fitness/Episode01';
import {EP1_TOTAL} from './fitness/ep01_timeline';
import {GYM_TOTAL} from './gym/timeline';
import {TOTAL_FRAMES} from './timeline';
import {FPS, W, H} from './theme';

const fontCss = `@font-face{font-family:Montserrat;font-weight:900;src:url(${staticFile('fonts/montserrat-latin-900-normal.woff2')}) format('woff2');}`;
export const Root: React.FC = () => (
  <><style>{fontCss}</style><Composition id="GTA6Facts" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Creatine90" component={Episode01} durationInFrames={EP1_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="Test3D" component={Test3D} durationInFrames={30} fps={FPS} width={W} height={H} />
    <Composition id="GymRest" component={GymRest} durationInFrames={GYM_TOTAL} fps={FPS} width={W} height={H} /></>
);
