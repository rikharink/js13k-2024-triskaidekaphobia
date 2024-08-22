import { AABB } from '../math/geometry/aabb';

export function clearDebug(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function drawAABB(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  aabb: AABB,
  color: string = 'red',
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(aabb.min[0], aabb.min[1], aabb.max[0] - aabb.min[0], aabb.max[1] - aabb.min[1]);
}
