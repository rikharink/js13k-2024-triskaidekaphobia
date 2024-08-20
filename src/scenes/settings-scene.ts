import { keyboardManager } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { AABB } from '../math/geometry/aabb';
import { sat } from '../math/util';
import { BASE05, NORMALIZED_BASE00 } from '../palette';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { StackLayout } from '../ui/stack-layout';
import { UIElement } from '../ui/ui-element';
import { Background, onPush, Scene } from './scene';

export class SettingsScene implements Scene {
  public bg: Background = { type: 'color', color: [...NORMALIZED_BASE00, 1] };
  public name: string = 'settings';
  public sprites: Sprite[] = [];
  public bounds: AABB = {
    min: [0, 0],
    max: [Settings.resolution[0], Settings.resolution[1]],
  };
  public trauma: number = 0;
  public traumaDampening = 0.02;
  public camera: Camera;
  public sceneTime: number = 0;
  public sceneManager: SceneManager;
  public resourceManager: ResourceManager;
  private ui: UIElement[] = [];

  constructor(sceneManager: SceneManager, resourceManger: ResourceManager) {
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManger;
    const settings = new StackLayout(16);
    settings.add(new Label('Settings', 72, Settings.fontFamily, BASE05, [0, 0]));
    settings.add(
      new Button('Back', 24, [0, 0], [200, 40], (btn) => {
        btn.disabled = false;
        this.sceneManager.popScene();
      }),
    );
    settings.center(this.camera);
    this.ui.push(settings);
    this.sprites.push(...settings.sprites);
  }

  onPush(): void {
    onPush(this);
  }

  onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  fixedTick(): void {
    this.sceneTime += Settings.fixedDeltaTime * Settings.timeScale;
  }

  variableTick(): void {
    if (keyboardManager.hasKeyUp('Escape')) {
      this.sceneManager.popScene();
    }

    this.trauma -= this.traumaDampening;
    this.trauma = sat(this.trauma);
    for (let ele of this.ui) {
      ele.tick();
    }
  }
}
