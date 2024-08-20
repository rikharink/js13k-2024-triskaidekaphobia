import { getSpriteId, gl } from '../game';
import { RgbColor, rgbaString } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { generateTextureFromParagraph } from '../textures/textures';
import { UIElement } from './ui-element';

export class Paragraph extends UIElement {
  constructor(size: Vector2, text: string, fontSize: number, fontFamily: string, color: RgbColor, position: Vector2) {
    super(position, size);
    generateTextureFromParagraph(gl, text, size, {
      fontSize,
      fontFamily,
      fillStyle: rgbaString(color, 255),
    }).then((texture) => {
      this.sprites[0] = new Sprite(getSpriteId(), texture.size, position, texture);
    });
    this.size = size;
    this.position = position;
  }

  public override set position(pos: Vector2) {
    if (this.sprites.length > 0) {
      this.sprites[0].position = pos;
    }
  }

  public override get position(): Vector2 {
    if (this.sprites.length > 0) {
      return this.sprites[0].position;
    }
    return [0, 0];
  }

  public override tick(): void {}
}
