import { Vector2 } from '../math/vector2';
import { Course, Courses, Hole } from './golf';

export interface GameState {
  course: number;
  hole: number;
  shots: Map<number, number>;
  ball: Vector2;
}

export const State: GameState = {
  course: 0,
  hole: 0,
  shots: new Map(),
  ball: [0, 0],
};

export function getCurrentHole(): Hole {
  return Courses[State.course].holes[State.hole];
}

export function getCurrentCourse(): Course {
  return Courses[State.course];
}
