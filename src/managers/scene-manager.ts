import { resourceManager } from '../game';
import { Scene } from '../scenes/scene';

export class SceneManager {
  private sceneStack: Scene[] = [];

  constructor() {
    window.addEventListener('popstate', () => {
      if (history.state?.scene) {
        this.gotoScene(history.state.scene);
      }
    });
  }

  public get currentScene(): Scene {
    if (this.sceneStack.length == 0 && resourceManager) {
      this.pushScene(resourceManager.getScene('main')!);
    }
    const scene = this.sceneStack[this.sceneStack.length - 1];
    return scene;
  }

  public replaceScene(scene: Scene): void {
    if (this.sceneStack.length > 0) {
      this.sceneStack.pop();
    }
    this.pushScene(scene);
  }

  public pushScene(scene: Scene): void {
    scene.onPush();
    this.sceneStack.push(scene);
  }

  public popScene(): Scene | undefined {
    if (this.sceneStack.length == 0) return;
    this.currentScene.onPop();
    const oldScene = this.sceneStack.pop();
    if (this.currentScene?.name) {
      history.pushState({ scene: this.currentScene.name }, this.currentScene.name, `#${this.currentScene.name}`);
    }
    return oldScene;
  }

  public gotoScene(name: string): void {
    const scene = resourceManager.getScene(name);
    if (scene) {
      this.replaceScene(scene);
    }
  }
}
