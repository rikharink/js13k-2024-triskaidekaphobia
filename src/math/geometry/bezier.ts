import { Vector2 } from '../vector2';
import { AABB } from './aabb';
import { Circle } from './circle';

export type CubicBezier = [number, number, number, number, number, number, number, number];

export function calculateBezierBoundingBox(bezierCurve: CubicBezier): AABB {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = bezierCurve;

  const tx = cubicBezierExtrema(x0, x1, x2, x3);
  const ty = cubicBezierExtrema(y0, y1, y2, y3);

  const xValues = [x0, x3, ...tx.map((t) => bezierCoordinate(t, x0, x1, x2, x3))];
  const yValues = [y0, y3, ...ty.map((t) => bezierCoordinate(t, y0, y1, y2, y3))];

  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues);
  const maxY = Math.max(...yValues);

  return { min: [minX, minY], max: [maxX, maxY] };
}

export function isPointOnBezier(point: Vector2, bezierCurve: CubicBezier, epsilon = 0.001) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = bezierCurve;
  const [x, y] = point;

  for (let t = 0; t <= 1; t += 0.001) {
    const xCurve = bezierCoordinate(t, x0, x1, x2, x3);
    const yCurve = bezierCoordinate(t, y0, y1, y2, y3);

    if (Math.abs(xCurve - x) < epsilon && Math.abs(yCurve - y) < epsilon) {
      return true;
    }
  }

  return false;
}

export function findBezierCircleIntersections(
  bezier: CubicBezier,
  circle: Circle,
  discreteStepSize = 0.001,
  epsilon = 0.001,
) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = bezier;
  const [cx, cy] = circle.position;
  const r = circle.radius;
  const intersections = [];

  for (let t = 0; t <= 1; t += discreteStepSize) {
    const xCurve = bezierCoordinate(t, x0, x1, x2, x3);
    const yCurve = bezierCoordinate(t, y0, y1, y2, y3);

    const dx = xCurve - cx;
    const dy = yCurve - cy;
    const distanceSquared = dx * dx + dy * dy;

    if (Math.abs(distanceSquared - r * r) < epsilon) {
      intersections.push([xCurve, yCurve]);
    }
  }

  return intersections;
}

function cubicBezierExtrema(p0: number, p1: number, p2: number, p3: number) {
  const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
  const b = 6 * (p0 - 2 * p1 + p2);
  const c = 3 * (p1 - p0);

  const discriminant = b * b - 4 * a * c;

  if (Math.abs(a) < 1e-8) {
    // Handle linear or quadratic cases
    if (Math.abs(b) > 1e-8) {
      return [-c / b].filter((t) => t >= 0 && t <= 1);
    }
    return []; // Degenerate case: p0 == p1 == p2 == p3
  }

  if (discriminant < 0) {
    return []; // No real roots
  } else if (discriminant === 0) {
    const t = -b / (2 * a);
    return [t].filter((t) => t >= 0 && t <= 1);
  } else {
    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b + sqrtD) / (2 * a);
    const t2 = (-b - sqrtD) / (2 * a);
    return [t1, t2].filter((t) => t >= 0 && t <= 1);
  }
}

function bezierCoordinate(t: number, p0: number, p1: number, p2: number, p3: number): number {
  return (
    Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3
  );
}
