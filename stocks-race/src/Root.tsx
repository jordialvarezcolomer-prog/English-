import {Composition} from 'remotion';
import {Race, DURATION, FPS} from './Race';

export const RemotionRoot: React.FC = () => (
  <Composition id="Reel" component={Race} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
