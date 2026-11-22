import {Composition} from 'remotion';
import {Race, DURATION, FPS} from './Race';

export const RemotionRoot: React.FC = () => (
  <Composition id="Race" component={Race} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
