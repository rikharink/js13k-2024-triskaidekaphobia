import { Milliseconds } from './types';

export type Entity = number;
export abstract class Component {}
export abstract class System {
  public abstract update(deltaFrameTime: Milliseconds): void;
  public abstract updateFixed(deltaTime: Milliseconds): void;
}
