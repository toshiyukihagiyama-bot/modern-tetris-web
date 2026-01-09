// Canvas 2D renderer - stateless, optimized for 60 FPS

import { GameState } from '@domain/types';
import { Piece } from '@infrastructure/Piece';
import { CELL_SIZE, BOARD_WIDTH, BOARD_HEIGHT, PIECE_COLORS, PieceType } from '@infrastructure/constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private nextCtx: CanvasRenderingContext2D;
  private holdCtx: CanvasRenderingContext2D;
  private readonly cellSize: number;
  private backgroundCanvas: HTMLCanvasElement;
  private backgroundCtx: CanvasRenderingContext2D;

  constructor(
    private canvas: HTMLCanvasElement,
    private nextCanvas: HTMLCanvasElement,
    private holdCanvas: HTMLCanvasElement
  ) {
    this.cellSize = CELL_SIZE;

    // Setup main canvas
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Setup next piece canvas
    const nextCtx = nextCanvas.getContext('2d', { alpha: true });
    if (!nextCtx) throw new Error('Could not get next canvas 2D context');
    this.nextCtx = nextCtx;

    // Setup hold piece canvas
    const holdCtx = holdCanvas.getContext('2d', { alpha: true });
    if (!holdCtx) throw new Error('Could not get hold canvas 2D context');
    this.holdCtx = holdCtx;

    // Create offscreen canvas for background
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = canvas.width;
    this.backgroundCanvas.height = canvas.height;
    const bgCtx = this.backgroundCanvas.getContext('2d');
    if (!bgCtx) throw new Error('Could not create background canvas context');
    this.backgroundCtx = bgCtx;

    // Handle high DPI displays
    this.setupHighDPI();

    // Render static background once
    this.renderBackground();
  }

  /**
   * Setup high DPI support
   */
  private setupHighDPI(): void {
    const dpr = window.devicePixelRatio || 1;

    // Main canvas
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Background canvas
    this.backgroundCanvas.width = width * dpr;
    this.backgroundCanvas.height = height * dpr;
    this.backgroundCtx.scale(dpr, dpr);
  }

  /**
   * Render the complete game state
   */
  public render(state: GameState): void {
    // Draw background
    this.ctx.drawImage(this.backgroundCanvas, 0, 0);

    // Draw locked pieces on board
    this.renderBoard(state);

    // Draw ghost piece (preview of where piece will land)
    if (state.currentPiece) {
      this.renderGhostPiece(state);
    }

    // Draw current piece
    if (state.currentPiece) {
      this.renderPiece(state.currentPiece, state.currentX, state.currentY);
    }

    // Draw next piece
    this.renderNextPiece(state);

    // Draw hold piece
    this.renderHoldPiece(state);
  }

  /**
   * Render static background (grid lines)
   */
  private renderBackground(): void {
    const ctx = this.backgroundCtx;
    const width = BOARD_WIDTH * this.cellSize;
    const height = BOARD_HEIGHT * this.cellSize;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.cellSize, 0);
      ctx.lineTo(x * this.cellSize, height);
      ctx.stroke();
    }

    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cellSize);
      ctx.lineTo(width, y * this.cellSize);
      ctx.stroke();
    }
  }

  /**
   * Render the board (locked pieces)
   */
  private renderBoard(state: GameState): void {
    const grid = state.board.getGrid();

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cellValue = grid[y][x];
        if (cellValue !== 0) {
          const color = this.getCellColor(cellValue);
          this.renderCell(x, y, color);
        }
      }
    }
  }

  /**
   * Render a single cell
   */
  private renderCell(x: number, y: number, color: string, alpha: number = 1): void {
    const ctx = this.ctx;
    const cellX = x * this.cellSize;
    const cellY = y * this.cellSize;
    const size = this.cellSize;

    // Main color
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(cellX + 1, cellY + 1, size - 2, size - 2);

    // 3D effect - highlight
    ctx.fillStyle = this.lightenColor(color, 30);
    ctx.fillRect(cellX + 1, cellY + 1, size - 2, 3);
    ctx.fillRect(cellX + 1, cellY + 1, 3, size - 2);

    // 3D effect - shadow
    ctx.fillStyle = this.darkenColor(color, 30);
    ctx.fillRect(cellX + 1, cellY + size - 4, size - 2, 3);
    ctx.fillRect(cellX + size - 4, cellY + 1, 3, size - 2);

    ctx.globalAlpha = 1;
  }

  /**
   * Render a piece at given position
   */
  private renderPiece(piece: Piece, x: number, y: number, alpha: number = 1): void {
    const shape = piece.getShape();
    const color = piece.getColor();

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = x + col;
          const boardY = y + row;

          // Only render if within visible area
          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            this.renderCell(boardX, boardY, color, alpha);
          }
        }
      }
    }
  }

  /**
   * Render ghost piece (preview of where piece will land)
   */
  private renderGhostPiece(state: GameState): void {
    if (!state.currentPiece) return;

    const distance = state.board.getHardDropDistance(
      state.currentPiece,
      state.currentX,
      state.currentY
    );

    if (distance > 0) {
      const ghostY = state.currentY + distance;
      this.renderPiece(state.currentPiece, state.currentX, ghostY, 0.3);
    }
  }

  /**
   * Render next piece preview
   */
  private renderNextPiece(state: GameState): void {
    const ctx = this.nextCtx;
    const canvas = this.nextCanvas;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.nextPieces.length === 0) return;

    const nextPiece = state.nextPieces[0];
    const color = nextPiece.getColor();
    const shape = nextPiece.getShape();

    // Center the piece in the preview canvas
    const previewSize = 4;
    const cellSize = canvas.width / (previewSize + 2);
    const offsetX = cellSize;
    const offsetY = cellSize;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          ctx.fillStyle = color;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

          // 3D effect
          ctx.fillStyle = this.lightenColor(color, 30);
          ctx.fillRect(x + 1, y + 1, cellSize - 2, 2);
          ctx.fillRect(x + 1, y + 1, 2, cellSize - 2);
        }
      }
    }
  }

  /**
   * Render hold piece preview
   */
  private renderHoldPiece(state: GameState): void {
    const ctx = this.holdCtx;
    const canvas = this.holdCanvas;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.holdPiece) return;

    const color = state.holdPiece.getColor();
    const shape = state.holdPiece.getShape();

    // Center the piece in the preview canvas
    const previewSize = 4;
    const cellSize = canvas.width / (previewSize + 2);
    const offsetX = cellSize;
    const offsetY = cellSize;

    // Dim if cannot hold
    const alpha = state.canHold ? 1.0 : 0.5;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

          // 3D effect
          ctx.fillStyle = this.lightenColor(color, 30);
          ctx.fillRect(x + 1, y + 1, cellSize - 2, 2);
          ctx.fillRect(x + 1, y + 1, 2, cellSize - 2);
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  /**
   * Get color for a cell value
   */
  private getCellColor(cellValue: number): string {
    // Cell value is the char code of the piece type
    const pieceChar = String.fromCharCode(cellValue);
    return PIECE_COLORS[pieceChar as PieceType] || '#888';
  }

  /**
   * Lighten a color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  /**
   * Darken a color
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}
