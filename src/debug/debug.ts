import { dbgCtx } from '../game';
import { AABB } from '../math/geometry/aabb';

export function clearDebug() {
  dbgCtx?.clearRect(0, 0, dbgCtx!.canvas.width, dbgCtx!.canvas.height);
}

export function drawAABB(aabb: AABB, color: string = 'red') {
  if (dbgCtx == null) return;
  dbgCtx.strokeStyle = color;
  dbgCtx.lineWidth = 1;
  dbgCtx.strokeRect(aabb.min[0], aabb.min[1], aabb.max[0] - aabb.min[0], aabb.max[1] - aabb.min[1]);
}
