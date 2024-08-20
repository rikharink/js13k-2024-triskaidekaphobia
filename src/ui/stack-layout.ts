import { Vector2, copy, scale, subtract } from '../math/vector2';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { UIElement } from './ui-element';

export const enum Orientation {
  Horizontal = 1,
  Vertical = 2,
}

export class StackLayout extends UIElement {
  private elements: UIElement[] = [];
  private nextPosition: Vector2;

  constructor(
    public spacing = 0,
    _position: Vector2 = [0, 0],
    private orientation: Orientation = Orientation.Vertical,
  ) {
    super(_position, [0, 0]);
    this.nextPosition = [..._position];
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;
    this.size[sizeIndex] -= spacing;
  }

  public add(element: UIElement): void {
    this.elements.push(element);
    copy(element.position, this.nextPosition);
    const index = this.orientation === Orientation.Vertical ? 1 : 0;
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;
    this.nextPosition[index] += element.size[index] + this.spacing;
    this.size[index] += element.size[index] + this.spacing;
    if (element.size[sizeIndex] > this.size[sizeIndex]) {
      this.size[sizeIndex] = element.size[sizeIndex];
    }
  }

  public get sprites(): Sprite[] {
    return this.elements.flatMap((element) => element.sprites);
  }

  public override set position(pos: Vector2) {
    this._position = pos;
    this.nextPosition = [...pos];
    for (let element of this.elements) {
      copy(element.position, this.nextPosition);
      const index = this.orientation === Orientation.Vertical ? 1 : 0;
      this.nextPosition[index] += element.size[index] + this.spacing;
    }
  }

  public center(camera: Camera): void {
    const center = camera.center;
    const size = this.size;
    const pos: Vector2 = [...center];
    subtract(pos, pos, scale([0, 0], size, 0.5));
    this.position = pos;
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;

    for (let ele of this.elements) {
      const delta = size[sizeIndex] - ele.size[sizeIndex];
      if (this.orientation === Orientation.Vertical) {
        if (!ele.position) {
          console.log('ele.position is undefined', ele);
        }
        ele.position = [ele.position[0] + delta * 0.5, ele.position[1]];
      } else {
        ele.position = [ele.position[0], ele.position[1] + delta * 0.5];
      }
    }
  }

  public override tick(): void {
    this.elements.forEach((element) => element.tick());
  }
}
