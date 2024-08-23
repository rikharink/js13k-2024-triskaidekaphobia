import { Vector2 } from '../math/vector2';

export type Tension = number;

export type Shape = [Tension, ...number[]];

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
      {
        par: 3,
        start: [51, 33],
        finish: [1162, 248],
        design: [
          [
            0.2, 33, 28, 367, 65, 905, 15, 1291, 13, 1906, 54, 1885, 323, 1684, 195, 1534, 288, 1386, 200, 1289, 451,
            988, 733, 130, 765,
          ],
          [0.8, 1150, 153, 1235, 206, 1215, 322, 1178, 308, 1182, 239, 1153, 226, 1130, 285, 1089, 254],
          [0.45, 407, 178, 636, 134, 635, 349, 504, 373, 492, 497, 613, 465, 592, 675, 372, 562, 394, 399],
        ],
      },
    ],
  },
];
