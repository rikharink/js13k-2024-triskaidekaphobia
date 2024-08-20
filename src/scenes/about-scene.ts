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
import { Paragraph } from '../ui/paragraph';
import { StackLayout } from '../ui/stack-layout';
import { UIElement } from '../ui/ui-element';
import { Background, onPush, Scene } from './scene';

export class AboutScene implements Scene {
  public bg: Background = { type: 'color', color: [...NORMALIZED_BASE00, 1] };
  public name: string = 'about';
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
  private about: StackLayout;

  constructor(sceneManager: SceneManager, resourceManger: ResourceManager) {
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManger;
    const about = new StackLayout(16);
    about.add(new Label('About <TITLE>', 72, Settings.fontFamily, BASE05, [0, 0]));
    about.add(
      new Paragraph(
        [640, 480],
        '<TITLE> is a game created by @rikharink for JS13K 2024.',
        32,
        Settings.fontFamily,
        BASE05,
        [0, 0],
      ),
    );
    about.add(
      new Button('Source Code', 24, [0, 0], [200, 40], (btn) => {
        btn.disabled = false;
        window.open('https://github.com/rikharink/js13k-2024-triskaidekaphobia', '_blank')?.focus();
      }),
    );
    about.add(
      new Button('Back', 24, [0, 0], [200, 40], (btn) => {
        btn.disabled = false;
        this.sceneManager.popScene();
      }),
    );
    about.center(this.camera);
    this.about = about;
    this.ui.push(about);
  }

  public get sprites(): Sprite[] {
    return this.ui.flatMap((element) => element.sprites);
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
    this.about.center(this.camera);
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
