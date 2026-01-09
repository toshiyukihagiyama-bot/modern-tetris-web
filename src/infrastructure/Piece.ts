// Tetromino piece with rotation system

import { PieceType, PIECE_SHAPES, PIECE_COLORS } from './constants';

export class Piece {
  public readonly type: PieceType;
  public rotation: number = 0; // 0-3
  private shapes: number[][][];

  constructor(type: PieceType) {
    this.type = type;
    this.shapes = PIECE_SHAPES[type];
  }

  /**
   * Get the current shape matrix based on rotation state
   */
  public getShape(): number[][] {
    return this.shapes[this.rotation];
  }

  /**
   * Get the color of this piece
   */
  public getColor(): string {
    return PIECE_COLORS[this.type];
  }

  /**
   * Rotate the piece clockwise
   */
  public rotate(direction: 'clockwise' | 'counterclockwise' = 'clockwise'): void {
    if (direction === 'clockwise') {
      this.rotation = (this.rotation + 1) % 4;
    } else {
      this.rotation = (this.rotation + 3) % 4; // +3 is same as -1 in mod 4
    }
  }

  /**
   * Get the shape after a rotation without actually rotating
   */
  public getShapeAfterRotation(direction: 'clockwise' | 'counterclockwise' = 'clockwise'): number[][] {
    const nextRotation =
      direction === 'clockwise' ? (this.rotation + 1) % 4 : (this.rotation + 3) % 4;
    return this.shapes[nextRotation];
  }

  /**
   * Clone the piece
   */
  public clone(): Piece {
    const cloned = new Piece(this.type);
    cloned.rotation = this.rotation;
    return cloned;
  }

  /**
   * Get all filled cells positions relative to piece origin
   */
  public getFilledCells(): Array<{ row: number; col: number }> {
    const shape = this.getShape();
    const cells: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          cells.push({ row, col });
        }
      }
    }

    return cells;
  }
}
