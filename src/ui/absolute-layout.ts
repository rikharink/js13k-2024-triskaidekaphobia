import { Sprite } from '../rendering/sprite';
import { UIElement } from './ui-element';

export class AbsoluteLayout extends UIElement {
  private _elements: UIElement[] = [];

  public constructor() {
    super([0, 0], [0, 0]);
  }

  public add(element: UIElement): void {
    this._elements.push(element);
  }

  public get sprites(): Sprite[] {
    return this._elements.flatMap((element) => element.sprites);
  }

  public tick(): void {}
}
