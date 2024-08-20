import { pointerManager } from '../game';
import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { UIElement } from './ui-element';

export type GridClickHandler = (row: number, column: number, element?: UIElement) => void;

export class GridLayout extends UIElement {
  private _columns: number = 1;
  private _rows: number = 1;
  private _cellWidth: number;
  private _cellHeight: number;
  private _elements: UIElement[] = [];
  private _onGridClick?: GridClickHandler;

  constructor(size: Vector2, columns: number, rows: number, onGridClick?: GridClickHandler) {
    super([0, 0], size);
    this._size = size;
    this._columns = columns;
    this._rows = rows;
    this._cellWidth = size[0] / this._columns;
    this._cellHeight = size[1] / this._rows;
    this._onGridClick = onGridClick;
  }

  public add(element: UIElement, column: number, row: number): void {
    if (column < 0 || column >= this._columns || row < 0 || row >= this._rows) {
      throw new Error('Invalid grid position');
    }
    element.size = [Math.min(this._cellWidth, element.size[0]), Math.min(this._cellHeight, element.size[1])];
    const i = row * this._columns + column;
    this.moveElementToCell(element, column, row);
    this._elements[i] = element;
  }

  public move(from: Vector2, to: Vector2): void {
    const element = this._elements.find(
      (element) => element.metadata.gridPosition[0] === from[0] && element.metadata.gridPosition[1] === from[1],
    );
    if (element) {
      this.moveElementToCell(element, to[0], to[1]);
    }
  }

  private moveElementToCell(element: UIElement, column: number, row: number): void {
    element.metadata.gridPosition = [column, row];
    element.position = [
      this._position[0] + column * this._cellWidth + (this._cellWidth - element.size[0]) / 2,
      this._position[1] + row * this._cellHeight + (this._cellHeight - element.size[1]) / 2,
    ];
  }

  public override get sprites(): Sprite[] {
    return this._elements.filter((ele) => ele).flatMap((element) => element.sprites);
  }

  public override get position(): Vector2 {
    return this._position;
  }

  public override set position(pos: Vector2) {
    this._position = pos;
    for (const element of this._elements) {
      this.moveElementToCell(element, element.metadata.gridPosition[0], element.metadata.gridPosition[1]);
    }
  }

  public override tick(): void {
    this._elements.forEach((element) => element?.tick());
    if (pointerManager.hasPointerUp() && this._onGridClick) {
      const pointerLocation = pointerManager.getPointerLocation();
      const column = Math.floor((pointerLocation[0] - this._position[0]) / this._cellWidth);
      const row = Math.floor((pointerLocation[1] - this._position[1]) / this._cellHeight);
      if (column >= 0 && column < this._columns && row >= 0 && row < this._rows) {
        this._onGridClick(row, column, this._elements[row * this._columns + column]);
      }
    }
  }
}
