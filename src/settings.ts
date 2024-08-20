import { TAU } from './math/const';
import { Vector2 } from './math/vector2';

export const Settings = {
  resolution: [1920, 1080] as Vector2,
  fixedDeltaTime: 1000 / 30,
  minLoadingTimeMs: 100,
  maxRotationalShake: TAU * 0.1,
  maxTranslationalShake: 25,
  seed: 1337,
  timeScale: 1,
  fontFamily: "'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif",
};
