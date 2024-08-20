import { Vector2 } from '../math/vector2';
import { Percentage } from '../types';
import { UIElement } from './ui-element';

export class ProgressBar extends UIElement {
  private _progress: Percentage = 0;

  constructor(position: Vector2, size: Vector2) {
    super(position, size);
  }

  public get progress(): Percentage {
    return this._progress;
  }

  public override tick(): void {}
}
