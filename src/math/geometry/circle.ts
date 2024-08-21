import { distance, Vector2 } from '../vector2';

export interface Circle {
  position: Vector2;
  radius: number;
}

export function pointInCircle(point: Vector2, circle: Circle): boolean {
  return distance(point, circle.position) <= circle.radius;
}
