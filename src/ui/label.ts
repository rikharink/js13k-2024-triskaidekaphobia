import { getSpriteId, gl } from '../game';
import { RgbColor, rgbaString } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { generateTextureFromText } from '../textures/textures';
import { UIElement } from './ui-element';

export class Label extends UIElement {
  public fontSize: number;
  public fontFamily: string;
  public color: RgbColor;

  constructor(text: string, fontSize: number, fontFamily: string, color: RgbColor, position: Vector2) {
    super(position, [0, 0]);

    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

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

  public set text(text: string) {
    const texture = generateTextureFromText(gl, text, {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fillStyle: rgbaString(this.color, 255),
    });
    this.size = texture.size;
    this.sprites[0].texture = texture;
    this.sprites[0].size = texture.size;
  }

  public override tick(): void {}
}
