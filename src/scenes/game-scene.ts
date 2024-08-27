import { ResourceManager } from '../managers/resource-manager';
import { clamp, lerp } from '../math/util';
import { Sprite } from '../rendering/sprite';
import { Background, onPush, Scene } from './scene';
import { Camera } from '../rendering/camera';
import { AABB, clone, grow, merge } from '../math/geometry/aabb';
import { Settings } from '../settings';
import { SceneManager } from '../managers/scene-manager';
import { NORMALIZED_BASE00 } from '../palette';
import { Label } from '../ui/label';
import { AbsoluteLayout } from '../ui/absolute-layout';
import { getCurrentCourse, getCurrentHole, State } from '../game/state';
import { fixedIntegerDigits } from '../util/util';
import { Courses, Hole } from '../game/golf';
import { calculateBoundingBox, drawSpline, getSpline, Spline } from '../math/geometry/spline';
import { add, copy, reflect, scale, subtract, tangentToVector, Vector2 } from '../math/vector2';
import { Circle, isCircleInAABB, isCircleInCircle } from '../math/geometry/circle';
import { drawCircle } from '../rendering/canvas';
import { dbgCtx, getSpriteId, gl, keyboardManager, pointerManager } from '../game';
import { generateTextureFromCanvas } from '../textures/textures';
import { calculateBezierBoundingBox, calculateTangent, findBezierCircleIntersections } from '../math/geometry/bezier';
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

  private _isShooting: boolean = false;
  private _startShootingPosition: Vector2 = [0, 0];

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
    this._ball = new Sprite(getSpriteId(), [16, 16], ballPosition, resourceManager.textures.get('ball')!);
    this._ball.velocity = [0, 0];
    this._ball.acceleration = [0, 0];

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
    if (keyboardManager.hasKeyUp('KeyN')) {
      this.nextHole();
    }
    if (!this._isShooting && pointerManager.hasPointerDown()) {
      this._isShooting = true;
      copy(this._startShootingPosition, pointerManager.getPointerLocation());
    } else if (this._isShooting && pointerManager.hasPointerUp()) {
      this._isShooting = false;
      State.shots.set(State.hole, (State.shots.get(State.hole) ?? 0) + 1);
      let end: Vector2 = pointerManager.getPointerLocation();
      let velocity: Vector2 = [0, 0];
      subtract(velocity, end, this._startShootingPosition);
      scale(velocity, velocity, -Settings.velocityMultiplier);
      this._ball.velocity = velocity;
    } else if (this._isShooting) {
      let end: Vector2 = pointerManager.getPointerLocation();
      let distance: Vector2 = [0, 0];
      subtract(distance, end, this._startShootingPosition);
    }
  }

  public fixedTick(dt: number): void {
    if (dbgCtx !== null) {
      clearDebug(dbgCtx);
    }

    this._currentHoleLabel.text = this.getHoleText();

    const ballPosition: Vector2 = [0, 0];
    subtract(ballPosition, this._ball.position, this._currentHoleSprite.position);
    const ball: Circle = { position: ballPosition, radius: this._ball.size[0] / 2 };
    let isOutOfBounds = true;

    //TODO: collision doesn't really work yet, maybe something with line thickness or moving it out of the line on collision
    //TODO: maybe also not move it with the whole velocity but move it pixel by pixel and check for collisions in between
    //TODO: collision response (dont stay in the line)
    //TODO: maybe do out of bounds with raycasting so we also detect when we glitch inside of a shape?

    for (let i = 0; i < this._currentHoleSplines.length; i++) {
      let aabb = this._currentHoleSplineBoundingBoxes[i];
      let spline = this._currentHoleSplines[i];
      // course-grained collision detection
      if (!isCircleInAABB(ball, aabb)) {
        continue;
      }

      if (dbgCtx !== null) {
        let debugAABB = clone(aabb);
        add(debugAABB.min, debugAABB.min, this._currentHoleSprite.position);
        add(debugAABB.max, debugAABB.max, this._currentHoleSprite.position);
        drawAABB(dbgCtx, debugAABB, 'green');
      }

      isOutOfBounds = false;

      for (let bezier of spline) {
        let baabb = calculateBezierBoundingBox(bezier);
        grow(baabb, baabb, [8, 8]);
        if (!isCircleInAABB(ball, baabb)) {
          continue;
        }

        if (dbgCtx !== null) {
          let debugAABB = clone(baabb);
          add(debugAABB.min, debugAABB.min, this._currentHoleSprite.position);
          add(debugAABB.max, debugAABB.max, this._currentHoleSprite.position);
          drawAABB(dbgCtx, debugAABB);
        }

        // fine=grained collision detection
        let intersections = findBezierCircleIntersections(bezier, ball, 0.001, 2);
        if (intersections.length > 0) {
          reflect(
            this._ball.velocity,
            this._ball.velocity,
            tangentToVector([0, 0], calculateTangent(bezier, intersections[0][2])),
          );
          scale(this._ball.velocity, this._ball.velocity, Settings.bounceFriction);
        }
      }
    }
    if (isOutOfBounds) {
      copy(this._ball.position, this._currentHole.start);
      add(this._ball.position, this._ball.position, this._currentHoleSprite.position);
    }

    // friction
    scale(this._ball.velocity, this._ball.velocity, Settings.friction);

    // SEMI IMPLICIT EULER
    let tmp: Vector2 = [0, 0];
    add(this._ball.velocity, this._ball.velocity, scale(tmp, this._ball.acceleration, dt));
    add(this._ball.position, this._ball.position, scale(tmp, this._ball.velocity, dt));

    // collision with finish
    // TODO: do we want to only accept this on velocity [0, 0] or sufficiently small velocity?
    const finishCircle: Circle = {
      position: this._currentHole.finish,
      radius: this.getHoleSize(),
    };

    if (isCircleInCircle(ball, finishCircle)) {
      this.nextHole();
    }
  }

  private nextHole() {
    this._ball.velocity = [0, 0];
    this._ball.acceleration = [0, 0];

    const currentCourse = getCurrentCourse();
    State.hole++;
    if (State.hole == currentCourse.holes.length) {
      State.hole = 0;
      State.course++;
      if (State.course == Courses.length) {
        //TODO: winning screen instead of looping
        State.course = 0;
      }
    }

    this._currentHole = getCurrentHole();
    this._currentHoleSprite = this.getCurrentHoleSprite();

    let ballPosition: Vector2 = [0, 0];
    copy(ballPosition, this._currentHole.start);
    add(ballPosition, ballPosition, this._currentHoleSprite.position);
    this._ball.position = ballPosition;

    this.sprites = [];
    this.sprites.push(this._currentHoleSprite, this._ball, ...this._ui.sprites);
  }

  private getCurrentHoleSprite(): Sprite {
    const linewidth = 4;
    let splines: Spline[] = [];
    for (let shape of this._currentHole.design) {
      const tension = shape[0];
      const points = shape.slice(2);
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

    this._currentHoleSplineBoundingBoxes = splines.map((spline) => {
      let aabb = calculateBoundingBox(spline);
      return grow(aabb, aabb, [linewidth * 10, linewidth * 10]);
    });

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
      radius: this.getHoleSize(),
    };

    ctx.fillStyle = '#a6e3a1';
    drawCircle(ctx, finish);

    const position: Vector2 = [
      Settings.resolution[0] / 2 - aabb.max[0] / 2,
      Settings.resolution[1] / 2 - aabb.max[1] / 2,
    ];

    return new Sprite(getSpriteId(), aabb.max, position, generateTextureFromCanvas(gl, canvas, aabb.max));
  }

  private getHoleSize(): number {
    return lerp(13, 3, State.hole / 12);
  }

  private getHoleText(): string {
    return `HOLE ${fixedIntegerDigits(State.hole + 1, 2)} SHOTS ${State.shots.get(State.hole) ?? 0}`;
  }
}
