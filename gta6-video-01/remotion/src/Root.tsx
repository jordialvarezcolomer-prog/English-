import React from 'react';
import {Composition, staticFile} from 'remotion';
import {MainVideo} from './MainVideo';
import {GymRest} from './gym/GymRest';
import {Test3D} from './fitness/Test3D';
import {Episode01} from './fitness/Episode01';
import {EP1_TOTAL} from './fitness/ep01_timeline';
import {EP2_TOTAL, Episode02} from './fitness/Episode02';
import {SLEEPTOON_TOTAL, SleepToon} from './gym/SleepToon';
import {SHOULDERS_TOTAL, ShouldersUK} from './gym/Shoulders';
import {DIPS_TOTAL, DipsUK} from './gym/Dips';
import {HeroPushdown, HeroSheet, SHOTS} from './hero/HeroSheet';
import {GYM_TOTAL} from './gym/timeline';
import {TOTAL_FRAMES} from './timeline';
import {FPS, W, H} from './theme';
import {CoupleBoard} from './macaque/Couple';
import {CoupleFaster, COUPLE_TOTAL} from './macaque/CoupleVideo';
import {MacaqueFaster, MACAQUE_TOTAL} from './macaque/MacaqueVideo';

const fontCss = `@font-face{font-family:Montserrat;font-weight:900;src:url(${staticFile('fonts/montserrat-latin-900-normal.woff2')}) format('woff2');}`;
export const Root: React.FC = () => (
  <><style>{fontCss}</style><Composition id="GTA6Facts" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Creatine90" component={Episode01} durationInFrames={EP1_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="Sleep30" component={Episode02} durationInFrames={EP2_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="SleepToon" component={SleepToon} durationInFrames={SLEEPTOON_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="ShouldersUK" component={ShouldersUK} durationInFrames={SHOULDERS_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="DipsUK" component={DipsUK} durationInFrames={DIPS_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="HeroSheet" component={HeroSheet} durationInFrames={SHOTS.length} fps={FPS} width={720} height={1280} />
    <Composition id="HeroPushdown" component={HeroPushdown} durationInFrames={90} fps={FPS} width={720} height={1280} />
    <Composition id="Test3D" component={Test3D} durationInFrames={45} fps={FPS} width={W} height={H} />
    <Composition id="MacaqueUK" component={MacaqueFaster} durationInFrames={MACAQUE_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="CoupleUK" component={CoupleFaster} durationInFrames={COUPLE_TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="CoupleBoard" component={CoupleBoard} durationInFrames={180} fps={FPS} width={W} height={H} />
    <Composition id="GymRest" component={GymRest} durationInFrames={GYM_TOTAL} fps={FPS} width={W} height={H} /></>
);
