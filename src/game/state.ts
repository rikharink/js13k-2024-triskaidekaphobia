import { Vector2 } from '../math/vector2';
import { Courses, Hole } from './golf';

export interface GameState {
  course: number;
  hole: number;
  shots: number;
  ball: Vector2;
}

export const State: GameState = {
  course: 1,
  hole: 1,
  shots: 0,
  ball: [0, 0],
};

export function getCurrentHole(): Hole {
  return Courses[State.course - 1].holes[State.hole - 1];
}
