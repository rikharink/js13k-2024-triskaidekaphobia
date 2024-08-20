import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { AABB } from '../math/geometry/aabb';
import { sat } from '../math/util';
import { Vector2 } from '../math/vector2';
import { BASE05, NORMALIZED_BASE00 } from '../palette';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Button, IButton } from '../ui/button';
import { Label } from '../ui/label';
import { Orientation, StackLayout } from '../ui/stack-layout';
import { UIElement } from '../ui/ui-element';
import { AboutScene } from './about-scene';
import { BaseScene } from './base-scene';
import { Background, onPush, Scene } from './scene';
import { SettingsScene } from './settings-scene';

export class MainMenuScene implements Scene {
  public bg: Background = { type: 'color', color: [...NORMALIZED_BASE00, 1] };
  public name: string = 'main';
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

    const menu = new StackLayout(16, [0, 0], Orientation.Vertical);
    const buttonSize: Vector2 = [176, 50];

    const play = new Button('play', 32, [0, 0], buttonSize, (btn) =>
      this.shakeAndPush(btn, new BaseScene(sceneManager, resourceManger), 0.7, 200),
    );
    const settings = new Button('settings', 32, [0, 0], buttonSize, (btn) =>
      this.shakeAndPush(btn, new SettingsScene(sceneManager, resourceManger), 0.7, 200),
    );

    const about = new Button('about', 32, [0, 0], buttonSize, (btn) =>
      this.shakeAndPush(btn, new AboutScene(sceneManager, resourceManger), 0.7, 200),
    );

    menu.add(new Label('<TITLE>', 72, Settings.fontFamily, BASE05, [0, 0]));
    menu.add(new Label('A JS13K 2024 GAME BY RIK HARINK', 32, Settings.fontFamily, BASE05, [0, 0]));
    menu.add(play);
    menu.add(about);
    menu.add(settings);
    menu.center(this.camera);
    this.ui.push(menu);
    this.sprites.push(...menu.sprites);
  }

  private shakeAndPush(button: IButton, scene: Scene, intensity: number, duration: number): void {
    this.trauma = intensity;
    setTimeout(() => this.sceneManager.pushScene(scene), duration);
    setTimeout(
      (() => {
        button.disabled = false;
        this.trauma = 0;
      }).bind(this),
      200,
    );
  }

  onPush(): void {
    onPush(this);
  }

  onPop(): void {
    console.debug(`Scene ${this.name} ran for ${this.sceneTime}ms`);
  }

  fixedTick(): void {
    this.sceneTime += Settings.fixedDeltaTime * Settings.timeScale;
  }

  variableTick(): void {
    this.trauma -= this.traumaDampening;
    this.trauma = sat(this.trauma);
    for (let ele of this.ui) {
      ele.tick();
    }
  }
}
