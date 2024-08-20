import { Vector2, add } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { getSpriteId, gl, pointerManager, resourceManager } from '../game';
import { generateTextureFromText } from '../textures/textures';
import { UIElement } from './ui-element';
import { Texture } from '../textures/texture';
import { rgbaString, RgbColor } from '../math/color';
import { BASE01, BASE02, BASE05, BASE07 } from '../palette';

type ButtonClickHandler = (btn: IButton) => void;

export interface IButton extends UIElement {
  disabled: boolean;
}

interface ButtonStyling {
  baseColor: RgbColor;
  hoverColor: RgbColor;
  disabledColor: RgbColor;
}

export class ImageButton extends UIElement implements IButton {
  disabled = false;
  onClick: ButtonClickHandler;
  private _fg: Sprite;
  private _styling: ButtonStyling;

  constructor(
    texture: Texture,
    position: Vector2,
    size: Vector2,
    styling: Partial<ButtonStyling> = {},
    onClick: ButtonClickHandler = (btn) => (btn.disabled = false),
  ) {
    super(position, size);
    this._fg = new Sprite(getSpriteId(), size, position, texture);
    this._fg.flipy = true;
    this._sprites.push(this._fg);
    this.onClick = onClick;
    this._styling = {
      baseColor: [1, 1, 1],
      hoverColor: [1, 0, 0],
      disabledColor: [0, 1, 0],
      ...styling,
    };
  }

  public override tick() {
    if (
      pointerManager.hasPointerUp() &&
      this._sprites[0].contains(pointerManager.getPointerLocation()) &&
      !this.disabled
    ) {
      this.disabled = true;
      this.onClick(this);
    }

    if (this.disabled) {
      this._fg.grayscale = true;
      this._fg.color = this._styling.disabledColor;
    } else if (this._fg.contains(pointerManager.getPointerLocation())) {
      this._fg.grayscale = true;
      this._fg.color = this._styling.hoverColor;
    } else {
      this._fg.grayscale = false;
      this._fg.color = this._styling.baseColor;
    }
  }
}

export class Button extends UIElement implements IButton {
  onClick: ButtonClickHandler;
  fg: Texture;
  disabled = false;

  constructor(
    text: string,
    private fontSize: number,
    position: Vector2,
    size: Vector2,
    onClick: ButtonClickHandler = (btn) => (btn.disabled = false),
  ) {
    if (position == undefined) {
      console.log('position is undefined');
    }
    super(position, size);
    this._size = size;
    const texture = resourceManager.textures.get('sc')!;
    this._sprites.push(new Sprite(getSpriteId(), size, position, texture));
    this.fg = generateTextureFromText(gl, text, {
      fontSize: fontSize,
      fillStyle: rgbaString(BASE05, 255),
      fontFamily: 'monospace',
    });
    const pos: Vector2 = [...position];
    pos[0] += size[0] * 0.5 - this.fg.size[0] * 0.5;
    pos[1] += size[1] * 0.5 - fontSize * 0.5;
    this._sprites.push(new Sprite(getSpriteId(), this.fg.size, pos, this.fg));
    this.onClick = onClick;
  }

  public override get position(): Vector2 {
    return this._sprites[0].position;
  }

  public override set position(pos: Vector2) {
    this._sprites[0].position = [...pos];
    const textDisplacement: Vector2 = [
      this._size[0] * 0.5 - this.fg.size[0] * 0.5,
      this._size[1] * 0.5 - this.fontSize * 0.5,
    ];
    this._sprites[1].position = [...this._sprites[0].position];
    add(this._sprites[1].position, this._sprites[1].position, textDisplacement);
  }

  public override tick() {
    if (
      pointerManager.hasPointerUp() &&
      this._sprites[0].contains(pointerManager.getPointerLocation()) &&
      !this.disabled
    ) {
      this.disabled = true;
      this.onClick(this);
    }
    if (this.disabled) {
      this._sprites[0].color = BASE07;
    } else if (this._sprites[0].contains(pointerManager.getPointerLocation())) {
      this._sprites[0].color = BASE02;
    } else {
      this._sprites[0].color = BASE01;
    }
  }
}
