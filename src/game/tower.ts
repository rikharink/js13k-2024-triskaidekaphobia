import { PlanetaryMetal } from './alchemy';

export const enum TowerType {
  tomato = 0,
  potato = 1,
  aubergine = 2,
  paprika = 3,
  pepper = 4,
}

export abstract class Tower {
  public type: TowerType;
  public rank: PlanetaryMetal = PlanetaryMetal.Lead;

  protected constructor(type: TowerType) {
    this.type = type;
  }
}
