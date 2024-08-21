export type CubicBezier = [number, number, number, number, number, number, number, number];

export function calculateMinMax(bezier: CubicBezier): [number, number, number, number] {
  let [x0, y0, x1, y1, x2, y2, x3, y3] = bezier;
  let tArr = [],
    xArr = [x0, x3],
    yArr = [y0, y3],
    a,
    b,
    c,
    t,
    t1,
    t2,
    b2ac,
    sqrt_b2ac;
  for (let i = 0; i < 2; ++i) {
    if (i == 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if (0 < t && t < 1) {
        tArr.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    if (b2ac < 0) {
      if (Math.abs(b2ac) < 1e-12) {
        t = -b / (2 * a);
        if (0 < t && t < 1) {
          tArr.push(t);
        }
      }
      continue;
    }
    sqrt_b2ac = Math.sqrt(b2ac);
    t1 = (-b + sqrt_b2ac) / (2 * a);
    if (0 < t1 && t1 < 1) {
      tArr.push(t1);
    }
    t2 = (-b - sqrt_b2ac) / (2 * a);
    if (0 < t2 && t2 < 1) {
      tArr.push(t2);
    }
  }

  let j = tArr.length,
    mt;
  while (j--) {
    t = tArr[j];
    mt = 1 - t;
    xArr[j] = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    yArr[j] = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
  }
  return [Math.min.apply(0, xArr), Math.min.apply(0, yArr), Math.max.apply(0, xArr), Math.max.apply(0, yArr)];
}
