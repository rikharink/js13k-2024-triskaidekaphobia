import { TAU } from '../math/const';
import { Circle } from '../math/geometry/circle';

export function drawCircle(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, circle: Circle) {
  ctx.beginPath();
  ctx.arc(circle.position[0], circle.position[1], circle.radius, 0, TAU);
  ctx.fill();
  ctx.closePath();
}
