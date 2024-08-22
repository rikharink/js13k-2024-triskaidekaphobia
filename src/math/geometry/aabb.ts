import { Vector2, add, scale, subtract } from '../vector2';
import { Rectangle } from './rectangle';

export interface AABB {
  min: Vector2;
  max: Vector2;
}

export function size(aabb: AABB): Vector2 {
  return subtract([0, 0], aabb.max, aabb.min);
}

export function center(aabb: AABB): Vector2 {
  const a = aabb.min;
  const b = scale([0, 0], aabb.max, 0.5);
  return add([0, 0], a, b);
}

export function toRectangle(aabb: AABB): Rectangle {
  return {
    position: aabb.min,
    size: size(aabb),
  };
}

export function grow(out: AABB, aabb: AABB, amount: Vector2): AABB {
  subtract(out.min, aabb.min, amount);
  add(out.max, aabb.max, amount);
  return out;
}

export function shrink(out: AABB, aabb: AABB, amount: Vector2): AABB {
  add(out.min, aabb.min, amount);
  subtract(out.max, aabb.max, amount);
  return out;
}

export function clone(aabb: AABB): AABB {
  return { min: [...aabb.min], max: [...aabb.max] };
}

export function intersects(a: AABB, b: AABB): boolean {
  return a.max[0] > b.min[0] && a.min[0] < b.max[0] && a.max[1] > a.min[1] && a.min[1] < b.max[1];
}

export function merge(a: AABB, b: AABB): AABB {
  return {
    min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1])],
    max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1])],
  };
}

export function fromPoints(points: Vector2[]): AABB {
  let min: Vector2 = [Infinity, Infinity];
  let max: Vector2 = [-Infinity, -Infinity];
  for (const point of points) {
    min = [Math.min(min[0], point[0]), Math.min(min[1], point[1])];
    max = [Math.max(max[0], point[0]), Math.max(max[1], point[1])];
  }
  return { min, max };
}

export function fromFlatPoints(points: number[]): AABB {
  let min: Vector2 = [Infinity, Infinity];
  let max: Vector2 = [-Infinity, -Infinity];
  for (let i = 0; i < points.length; i += 2) {
    min = [Math.min(min[0], points[i]), Math.min(min[1], points[i + 1])];
    max = [Math.max(max[0], points[i]), Math.max(max[1], points[i + 1])];
  }
  return { min, max };
}
