import { ResourceManager } from '../managers/resource-manager';
import { clamp } from '../math/util';
import { Sprite } from '../rendering/sprite';
import { Background, onPush, Scene } from './scene';
import { Camera } from '../rendering/camera';
import { AABB } from '../math/geometry/aabb';
import { Settings } from '../settings';
import { SceneManager } from '../managers/scene-manager';
import { NORMALIZED_BASE00 } from '../palette';
import { StackLayout } from '../ui/stack-layout';
import { GridLayout } from '../ui/grid-layout';
import { ImageButton } from '../ui/button';

export class BaseScene implements Scene {
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

  private _ui: StackLayout;
  private _grid: GridLayout;

  public constructor(sceneManager: SceneManager, resourceManager: ResourceManager) {
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManager;
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.camera.followSpeed = [0.3, 0.3];
    const grass = this.resourceManager.textures.get('grass')!;
    const tomato = this.resourceManager.textures.get('tomato')!;

    this._ui = new StackLayout();
    this._grid = new GridLayout([1000, 1000], 10, 10, (_row, _column, _element) => {
      if (!_element) return;

      if (_element.sprites[0].texture === grass) {
        _element.sprites[0].texture = tomato;
      } else {
        _element.sprites[0].texture = grass;
      }
    });
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        this._grid.add(
          new ImageButton(grass, [0, 0], [100, 100], {
            hoverColor: [1, 0, 0],
          }),
          x,
          y,
        );
      }
    }

    this._ui.add(this._grid);
    this._ui.center(this.camera);
    this.sprites.push(...this._ui.sprites);
  }

  public onPush(): void {
    onPush(this);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  public variableTick(): void {
    this.trauma -= this.traumaDampening;
    this.trauma = clamp(0, 1, this.trauma);
    this._ui.tick();
  }

  public fixedTick(): void {}
}
