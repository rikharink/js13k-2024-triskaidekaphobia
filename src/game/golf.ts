import { Vector2 } from '../math/vector2';

export interface Shape {
  tension: number;
  points: Vector2[];
}

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
        start: [0, 0],
        finish: [10, 0],
        design: [],
      },
    ],
  },
];
