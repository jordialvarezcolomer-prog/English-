import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {sceneFrom, sceneLen} from './timeline';
import {IntroScene} from './scenes/IntroScene';
import {JetSkiDogScene, JetSkiDogOverlay} from './scenes/JetSkiDogScene';
import {PlanesScene, PlanesOverlay} from './scenes/PlanesScene';
import {RandomEventsScene, RandomEventsOverlay} from './scenes/RandomEventsScene';
import {SocialMediaScene, SocialMediaOverlay} from './scenes/SocialMediaScene';
import {HouseDecorationScene, HouseOverlay} from './scenes/HouseDecorationScene';
import {CarTheftScene, CarTheftOverlay} from './scenes/CarTheftScene';
import {PlayableGamesScene, PlayableGamesOverlay} from './scenes/PlayableGamesScene';
import {FinalCTA} from './scenes/FinalCTA';
import {SubtitleTrack} from './components/SubtitleTrack';
import {AudioController} from './components/AudioController';
import {GlobalBg} from './components/GlobalBg';
import {Pulse} from './components/Pulse';
import {Whip, Flash} from './components/Fx';
import {SCENES, f} from './timeline';

const S: React.FC<{k: Parameters<typeof sceneFrom>[0]; children: React.ReactNode}> = ({k, children}) => (
  <Sequence from={sceneFrom(k)} durationInFrames={sceneLen(k)}>{children}</Sequence>
);
export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{background: '#0B0620'}}>
    <GlobalBg />
    <Pulse>
    <S k="intro"><IntroScene /></S>
    <S k="jetski"><JetSkiDogScene /><JetSkiDogOverlay /></S>
    <S k="planes"><PlanesScene /><PlanesOverlay /></S>
    <S k="events"><RandomEventsScene /><RandomEventsOverlay /></S>
    <S k="social"><SocialMediaScene /><SocialMediaOverlay /></S>
    <S k="house"><HouseDecorationScene /><HouseOverlay /></S>
    <S k="theft"><CarTheftScene /><CarTheftOverlay /></S>
    <S k="games"><PlayableGamesScene /><PlayableGamesOverlay /></S>
    <S k="outro"><FinalCTA /></S>
    </Pulse>
    {Object.values(SCENES).slice(1).map(([a], i) => <Sequence key={i} from={f(a) - 3} durationInFrames={14}><Whip at={0} color={i % 2 ? '#19E3D0' : '#FF2E93'} /><Flash at={3} len={6} /></Sequence>)}
    <SubtitleTrack />
    <AudioController />
  </AbsoluteFill>
);
