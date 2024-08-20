import { copy, Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';

export abstract class UIElement {
  public metadata: Record<string, any> = {};
  protected _position: Vector2 = [0, 0];
  protected _size: Vector2 = [0, 0];
  protected _sprites: Sprite[] = [];

  protected constructor(position: Vector2, size: Vector2) {
    this._position = position;
    this._size = size;
  }

  public get size(): Vector2 {
    return this._size;
  }

  public set size(size: Vector2) {
    copy(this._size, size);
  }

  public get position(): Vector2 {
    return this._position;
  }

  public set position(position: Vector2) {
    copy(this._position, position);
  }

  public get sprites(): Sprite[] {
    return this._sprites;
  }

  public abstract tick(): void;
}
