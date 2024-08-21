import { ResourceManager } from '../managers/resource-manager';
import { clamp } from '../math/util';
import { Sprite } from '../rendering/sprite';
import { Background, onPush, Scene } from './scene';
import { Camera } from '../rendering/camera';
import { AABB } from '../math/geometry/aabb';
import { Settings } from '../settings';
import { SceneManager } from '../managers/scene-manager';
import { NORMALIZED_BASE00 } from '../palette';
import { Label } from '../ui/label';
import { AbsoluteLayout } from '../ui/absolute-layout';
import { getCurrentHole, State } from '../game/state';
import { fixedIntegerDigits } from '../util/util';

export class GameScene implements Scene {
  public name = 'game';
  public bg: Background = { type: 'color', color: [...NORMALIZED_BASE00, 1] };
  public camera: Camera;
  public sprites: Sprite[] = [];
  public trauma: number = 0;
  public traumaDampening: number = 0.007;
  public bounds: AABB = {
    min: [0, 0],
    max: [Settings.resolution[0] * 1, Settings.resolution[1] * 1],
  };
  public sceneTime: number = 0;

  public resourceManager: ResourceManager;
  public sceneManager: SceneManager;

  private _ui: AbsoluteLayout;
  private _currentHole: Label;

  public constructor(sceneManager: SceneManager, resourceManager: ResourceManager) {
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManager;
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.camera.followSpeed = [0.3, 0.3];
    this._ui = new AbsoluteLayout();

    this._currentHole = new Label(this.getHoleText(), 48, Settings.fontFamily, [255, 255, 255], [26, 26]);

    this._ui.add(this._currentHole);

    this.sprites.push(...this._ui.sprites);
  }

  public onPush(): void {
    onPush(this);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  public variableTick(): void {
    this._ui.tick();
    this.trauma -= this.traumaDampening;
    this.trauma = clamp(0, 1, this.trauma);
  }

  private getHoleText(): string {
    const currentHole = getCurrentHole();
    return `C${fixedIntegerDigits(State.course, 2)}H${fixedIntegerDigits(State.hole, 2)}P${fixedIntegerDigits(currentHole.par, 2)}`;
  }

  public fixedTick(): void {
    this._currentHole.text = this.getHoleText();
  }
}
