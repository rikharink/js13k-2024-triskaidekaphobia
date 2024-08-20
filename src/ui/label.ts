import { getSpriteId, gl } from '../game';
import { RgbColor, rgbaString } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { generateTextureFromText } from '../textures/textures';
import { UIElement } from './ui-element';

export class Label extends UIElement {
  constructor(text: string, fontSize: number, fontFamily: string, color: RgbColor, position: Vector2) {
    super(position, [0, 0]);
    const texture = generateTextureFromText(gl, text, {
      fontSize,
      fontFamily,
      fillStyle: rgbaString(color, 255),
    });
    this.size = texture.size;
    this.sprites.push(new Sprite(getSpriteId(), texture.size, position, texture));
  }

  public override get position(): Vector2 {
    return this.sprites[0].position;
  }

  public override set position(pos: Vector2) {
    this.sprites[0].position = pos;
  }

  public override tick(): void {}
}
