// 7-bag piece generator for fair random distribution

import { Piece } from './Piece';
import { PieceType } from './constants';

export class PieceGenerator {
  private bag: PieceType[] = [];
  private preview: Piece[] = [];
  private readonly previewCount: number;

  constructor(previewCount: number = 1) {
    this.previewCount = previewCount;
    // Fill initial preview queue
    for (let i = 0; i < previewCount; i++) {
      this.preview.push(this.generatePiece());
    }
  }

  /**
   * Get the next piece and refill the preview queue
   */
  public next(): Piece {
    const piece = this.preview.shift()!;
    this.preview.push(this.generatePiece());
    return piece;
  }

  /**
   * Get the preview queue (next pieces to come)
   */
  public getPreview(): Piece[] {
    return [...this.preview];
  }

  /**
   * Generate a piece using 7-bag algorithm
   */
  private generatePiece(): Piece {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    const type = this.bag.pop()!;
    return new Piece(type);
  }

  /**
   * Refill the bag with all 7 piece types in random order (Fisher-Yates shuffle)
   */
  private refillBag(): void {
    const pieces = Object.values(PieceType);
    this.bag = this.shuffleArray(pieces);
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Reset the generator
   */
  public reset(): void {
    this.bag = [];
    this.preview = [];
    for (let i = 0; i < this.previewCount; i++) {
      this.preview.push(this.generatePiece());
    }
  }
}
