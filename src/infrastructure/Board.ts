// Game board with collision detection and line clearing

import { Piece } from './Piece';
import { BOARD_WIDTH, BOARD_HEIGHT } from './constants';

export class Board {
  private grid: Uint8Array;
  public readonly width: number;
  public readonly height: number;

  constructor(width: number = BOARD_WIDTH, height: number = BOARD_HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
  }

  /**
   * Get the index in the 1D array from 2D coordinates
   */
  private getIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  /**
   * Get cell value at position
   */
  public getCell(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    return this.grid[this.getIndex(x, y)];
  }

  /**
   * Set cell value at position
   */
  public setCell(x: number, y: number, value: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[this.getIndex(x, y)] = value;
    }
  }

  /**
   * Check if a piece can be placed at given position
   */
  public isValidPosition(piece: Piece, x: number, y: number): boolean {
    const shape = piece.getShape();

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = x + col;
          const boardY = y + row;

          // Check boundaries
          if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
            return false;
          }

          // Allow pieces to spawn above the board (boardY < 0)
          if (boardY >= 0 && this.getCell(boardX, boardY) !== 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Place a piece on the board
   */
  public placePiece(piece: Piece, x: number, y: number): void {
    const shape = piece.getShape();

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = x + col;
          const boardY = y + row;

          if (boardY >= 0) {
            // Use piece type enum value as the cell value (1-7)
            this.setCell(boardX, boardY, piece.type.charCodeAt(0));
          }
        }
      }
    }
  }

  /**
   * Clear filled lines and return the number of lines cleared
   */
  public clearLines(): number {
    let linesCleared = 0;
    const linesToClear: number[] = [];

    // Find filled lines
    for (let y = 0; y < this.height; y++) {
      let isFilled = true;
      for (let x = 0; x < this.width; x++) {
        if (this.getCell(x, y) === 0) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        linesToClear.push(y);
      }
    }

    // Clear lines from bottom to top
    for (const lineY of linesToClear.reverse()) {
      // Move all lines above down by 1
      for (let y = lineY; y > 0; y--) {
        for (let x = 0; x < this.width; x++) {
          this.setCell(x, y, this.getCell(x, y - 1));
        }
      }
      // Clear top line
      for (let x = 0; x < this.width; x++) {
        this.setCell(x, 0, 0);
      }
      linesCleared++;
    }

    return linesCleared;
  }

  /**
   * Clear the entire board
   */
  public clear(): void {
    this.grid.fill(0);
  }

  /**
   * Get a copy of the grid as a 2D array (for rendering)
   */
  public getGrid(): number[][] {
    const grid: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = this.getCell(x, y);
      }
    }
    return grid;
  }

  /**
   * Clone the board
   */
  public clone(): Board {
    const cloned = new Board(this.width, this.height);
    cloned.grid = new Uint8Array(this.grid);
    return cloned;
  }

  /**
   * Calculate the hard drop distance (how far down the piece can go)
   */
  public getHardDropDistance(piece: Piece, x: number, y: number): number {
    let distance = 0;
    while (this.isValidPosition(piece, x, y + distance + 1)) {
      distance++;
    }
    return distance;
  }
}
