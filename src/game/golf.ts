import { Vector2 } from '../math/vector2';

//                   tension   x0      y0     x1      y1        x2 y2...
export type Shape = [number, number, number, number, number, ...number[]];

export interface Course {
  holes: Hole[];
}

export interface Hole {
  par: number;
  start: Vector2;
  finish: Vector2;
  design: Shape[];
}

export const Courses: Course[] = [
  {
    holes: [
      {
        par: 3,
        start: [27, 30],
        finish: [362, 309],
        design: [
          [0.2, 16, 16, 172.5, 32.25, 329, 48.5, 651, 80, 502, 205, 366, 331, 249, 171, 16, 116],
          [0.85, 106, 73, 194, 71, 366, 111, 98, 105],
          [0.65, 496, 152, 458, 196, 396, 213, 467, 107, 509, 88, 557, 103],
        ],
      },
    ],
  },
];
