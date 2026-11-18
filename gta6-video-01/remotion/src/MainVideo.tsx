import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {sceneFrom, sceneLen} from './timeline';
import {IntroScene} from './scenes/IntroScene';
import {JetSkiDogScene, JetSkiDogOverlay} from './scenes/JetSkiDogScene';
import {RandomEventsScene, RandomEventsOverlay} from './scenes/RandomEventsScene';
import {SocialMediaScene, SocialMediaOverlay} from './scenes/SocialMediaScene';
import {HouseDecorationScene, HouseOverlay} from './scenes/HouseDecorationScene';
import {CarTheftScene, CarTheftOverlay} from './scenes/CarTheftScene';
import {PlayableGamesScene, PlayableGamesOverlay} from './scenes/PlayableGamesScene';
import {FinalCTA} from './scenes/FinalCTA';
import {SubtitleTrack} from './components/SubtitleTrack';
import {AudioController} from './components/AudioController';

const S: React.FC<{k: Parameters<typeof sceneFrom>[0]; children: React.ReactNode}> = ({k, children}) => (
  <Sequence from={sceneFrom(k)} durationInFrames={sceneLen(k)}>{children}</Sequence>
);
export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{background: '#0B0620'}}>
    <S k="intro"><IntroScene /></S>
    <S k="jetski"><JetSkiDogScene /><JetSkiDogOverlay /></S>
    <S k="events"><RandomEventsScene /><RandomEventsOverlay /></S>
    <S k="social"><SocialMediaScene /><SocialMediaOverlay /></S>
    <S k="house"><HouseDecorationScene /><HouseOverlay /></S>
    <S k="theft"><CarTheftScene /><CarTheftOverlay /></S>
    <S k="games"><PlayableGamesScene /><PlayableGamesOverlay /></S>
    <S k="outro"><FinalCTA /></S>
    <SubtitleTrack />
    <AudioController />
  </AbsoluteFill>
);
