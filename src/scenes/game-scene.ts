import { ResourceManager } from '../managers/resource-manager';
import { clamp } from '../math/util';
import { Sprite } from '../rendering/sprite';
import { Background, onPush, Scene } from './scene';
import { Camera } from '../rendering/camera';
import { AABB, clone, merge } from '../math/geometry/aabb';
import { Settings } from '../settings';
import { SceneManager } from '../managers/scene-manager';
import { NORMALIZED_BASE00 } from '../palette';
import { Label } from '../ui/label';
import { AbsoluteLayout } from '../ui/absolute-layout';
import { getCurrentHole, State } from '../game/state';
import { fixedIntegerDigits } from '../util/util';
import { Hole } from '../game/golf';
import { calculateBoundingBox, drawSpline, getSpline, Spline } from '../math/geometry/spline';
import { add, copy, scale, subtract, Vector2 } from '../math/vector2';
import { Circle, isCircleInAABB } from '../math/geometry/circle';
import { drawCircle } from '../rendering/canvas';
import { getSpriteId, gl } from '../game';
import { generateTextureFromCanvas } from '../textures/textures';
import { calculateBezierBoundingBox, findBezierCircleIntersections } from '../math/geometry/bezier';
import { clearDebug, drawAABB } from '../debug/debug';

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
  private _currentHole: Hole;
  private _currentHoleLabel: Label;
  private _currentHoleSprite: Sprite;
  private _currentHoleSplines: Spline[] = [];
  private _currentHoleSplineBoundingBoxes: AABB[] = [];
  private _ball: Sprite;

  public constructor(sceneManager: SceneManager, resourceManager: ResourceManager) {
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManager;
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.camera.followSpeed = [0.3, 0.3];
    this._ui = new AbsoluteLayout();
    this._currentHole = getCurrentHole();
    this._currentHoleSprite = this.getCurrentHoleSprite();
    this._currentHoleLabel = new Label(this.getHoleText(), 48, Settings.fontFamily, [255, 255, 255], [26, 26]);
    this._ui.add(this._currentHoleLabel);

    let ballPosition: Vector2 = [0, 0];
    copy(ballPosition, this._currentHole.start);
    add(ballPosition, ballPosition, this._currentHoleSprite.position);
    this._ball = new Sprite(getSpriteId(), [10, 10], ballPosition, resourceManager.textures.get('ball')!);
    this._ball.velocity = [1, 1];

    this.sprites.push(this._currentHoleSprite, this._ball, ...this._ui.sprites);
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

  public fixedTick(): void {
    clearDebug();

    this._currentHoleLabel.text = this.getHoleText();

    if (this._ball.velocity[0] === 0 && this._ball.velocity[1] === 0) {
      return;
    }

    const ballPosition: Vector2 = [0, 0];
    subtract(ballPosition, this._ball.position, this._currentHoleSprite.position);

    const ball: Circle = { position: ballPosition, radius: 5 };

    let isOutOfBounds = true;

    for (let i = 0; i < this._currentHoleSplines.length; i++) {
      let aabb = this._currentHoleSplineBoundingBoxes[i];
      let spline = this._currentHoleSplines[i];
      // course-grained collision detection
      if (!isCircleInAABB(ball, aabb)) {
        continue;
      }

      let debugAABB = clone(aabb);
      add(debugAABB.min, debugAABB.min, this._currentHoleSprite.position);
      add(debugAABB.max, debugAABB.max, this._currentHoleSprite.position);
      drawAABB(debugAABB, 'green');

      isOutOfBounds = false;

      for (let bezier of spline) {
        let baabb = calculateBezierBoundingBox(bezier);

        if (!isCircleInAABB(ball, baabb)) {
          continue;
        }

        let debugAABB = clone(baabb);
        add(debugAABB.min, debugAABB.min, this._currentHoleSprite.position);
        add(debugAABB.max, debugAABB.max, this._currentHoleSprite.position);
        drawAABB(debugAABB);
        // fine=grained collision detection
        let intersections = findBezierCircleIntersections(bezier, ball);
        if (intersections.length > 0) {
          console.info('fine-grained collision hit', intersections);
          this._ball.velocity = [0, 0];
        }
      }
    }
    if (isOutOfBounds) {
      copy(this._ball.position, this._currentHole.start);
      add(this._ball.position, this._ball.position, this._currentHoleSprite.position);
    }
    add(this._ball.position, this._ball.position, this._ball.velocity);
  }

  private getCurrentHoleSprite(): Sprite {
    const linewidth = 4;
    let splines: Spline[] = [];
    for (let shape of this._currentHole.design) {
      const tension = shape[0];
      const points = shape.slice(1);
      splines.push(getSpline(points, tension));
    }
    let aabb = splines
      .map((spline) => calculateBoundingBox(spline))
      .reduce((acc: AABB, val: AABB) => merge(acc, val), { min: [Infinity, Infinity], max: [-Infinity, -Infinity] });

    // Correct for linewidth
    subtract(aabb.min, aabb.min, [linewidth / 2, linewidth / 2]);
    add(aabb.max, aabb.max, [linewidth / 2, linewidth / 2]);

    let correction: Vector2 = [aabb.min[0], aabb.min[1]];
    aabb.min = [0, 0];
    subtract(aabb.max, aabb.max, correction);

    const padding = 100;
    let scaleFactor = Math.min(
      (Settings.resolution[0] - padding) / aabb.max[0],
      (Settings.resolution[1] - padding) / aabb.max[1],
    );
    aabb.max = [aabb.max[0] * scaleFactor, aabb.max[1] * scaleFactor];

    for (let spline of splines) {
      for (let i = 0; i < spline.length; i++) {
        for (let j = 0; j < 8; j++) {
          spline[i][j] -= correction[j % 2];
          spline[i][j] *= scaleFactor;
        }
      }
    }

    subtract(this._currentHole.finish, this._currentHole.finish, correction);
    subtract(this._currentHole.start, this._currentHole.start, correction);
    scale(this._currentHole.finish, this._currentHole.finish, scaleFactor);
    scale(this._currentHole.start, this._currentHole.start, scaleFactor);

    this._currentHoleSplineBoundingBoxes = splines.map((spline) => calculateBoundingBox(spline));
    this._currentHoleSplines = splines;

    let canvas = new OffscreenCanvas(aabb.max[0], aabb.max[1]);
    let ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = linewidth;
    for (let spline of splines) {
      drawSpline(ctx, spline);
    }

    const finish: Circle = {
      position: this._currentHole.finish,
      radius: 5,
    };
    ctx.fillStyle = '#a6e3a1';
    drawCircle(ctx, finish);

    const position: Vector2 = [
      Settings.resolution[0] / 2 - aabb.max[0] / 2,
      Settings.resolution[1] / 2 - aabb.max[1] / 2,
    ];

    return new Sprite(getSpriteId(), aabb.max, position, generateTextureFromCanvas(gl, canvas, aabb.max));
  }

  private getHoleText(): string {
    return `C${fixedIntegerDigits(State.course, 2)}H${fixedIntegerDigits(State.hole, 2)}P${fixedIntegerDigits(this._currentHole.par, 2)}`;
  }
}
