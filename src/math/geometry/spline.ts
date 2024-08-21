import { CubicBezier } from './bezier';

export type Spline = CubicBezier[];

export function scale(out: Spline, spline: Spline, scale: number): Spline {
  for (let i = 0; i < spline.length; i++) {
    for (let j = 0; j < 8; j++) {
      out[i][j] = spline[i][j] * scale;
    }
  }
  return out;
}

export function drawSpline(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, spline: Spline) {
  for (let i = 0; i < spline.length; i++) {
    ctx.beginPath();
    ctx.moveTo(spline[i][0], spline[i][1]);
    ctx.bezierCurveTo(spline[i][2], spline[i][3], spline[i][4], spline[i][5], spline[i][6], spline[i][7]);
    ctx.stroke();
    ctx.closePath();
  }
}

export function getSpline(points: number[], tension: number, closed: boolean = true): Spline {
  let cp: number[] = [];
  let beziers: Spline = [];
  let n = points.length;

  if (closed) {
    points.push(points[0], points[1], points[2], points[3]);
    points.unshift(points[n - 1]);
    points.unshift(points[n - 1]);
  }

  for (let i = 0; i < n; i += 2) {
    cp = cp.concat(
      getControlPoints(points[i], points[i + 1], points[i + 2], points[i + 3], points[i + 4], points[i + 5], tension),
    );
  }
  if (closed) {
    cp = cp.concat(cp[0], cp[1]);
  }
  let stop = closed ? n + 2 : n - 4;

  for (let i = 2; i < stop; i += 2) {
    beziers.push([
      points[i],
      points[i + 1],
      cp[2 * i - 2],
      cp[2 * i - 1],
      cp[2 * i],
      cp[2 * i + 1],
      points[i + 2],
      points[i + 3],
    ]);
  }
  return beziers;
}

function getControlPoints(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, tension: number) {
  const d01 = Math.hypot(x1 - x0, y1 - y0);
  const d12 = Math.hypot(x2 - x1, y2 - y1);
  const fa = (tension * d01) / (d01 + d12);
  const fb = tension - fa;
  return [x1 + fa * (x0 - x2), y1 + fa * (y0 - y2), x1 - fb * (x0 - x2), y1 - fb * (y0 - y2)];
}
