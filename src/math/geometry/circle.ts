import { distance, Vector2 } from '../vector2';
import { AABB } from './aabb';

export interface Circle {
  position: Vector2;
  radius: number;
}

export function isCircleInCircle(circle1: Circle, circle2: Circle): boolean {
  return distance(circle1.position, circle2.position) <= circle1.radius + circle2.radius;
}

export function pointInCircle(point: Vector2, circle: Circle): boolean {
  return distance(point, circle.position) <= circle.radius;
}

export function isCircleInAABB(circle: Circle, aabb: AABB): boolean {
  const [minX, minY] = aabb.min;
  const [maxX, maxY] = aabb.max;
  const [cx, cy] = circle.position;
  const r = circle.radius;
  return cx - r >= minX && cx + r <= maxX && cy - r >= minY && cy + r <= maxY;
}
