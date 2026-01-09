// Game business logic - all state mutations

import { Store } from './Store';
import { GameState, GameStatus, GameEvent } from './types';
import { EventBus } from './EventBus';
import { Piece } from '@infrastructure/Piece';
import { PieceGenerator } from '@infrastructure/PieceGenerator';
import {
  SPAWN_X,
  SPAWN_Y,
  SCORE_VALUES,
  SOFT_DROP_SCORE,
  HARD_DROP_SCORE,
  LINES_PER_LEVEL,
  INITIAL_DROP_INTERVAL,
  MIN_DROP_INTERVAL,
  DROP_INTERVAL_DECREASE,
} from '@infrastructure/constants';

export class GameActions {
  constructor(
    private store: Store<GameState>,
    private eventBus: EventBus,
    private pieceGenerator: PieceGenerator
  ) {}

  /**
   * Start a new game
   */
  public startGame(): void {
    const state = this.store.getState();

    if (state.status === GameStatus.PLAYING) {
      return; // Already playing
    }

    // Reset piece generator
    this.pieceGenerator.reset();

    // Reset board
    state.board.clear();

    // Get first piece
    const firstPiece = this.pieceGenerator.next();
    const nextPieces = this.pieceGenerator.getPreview();

    this.store.setState({
      status: GameStatus.PLAYING,
      currentPiece: firstPiece,
      currentX: SPAWN_X,
      currentY: SPAWN_Y,
      holdPiece: null,
      canHold: true,
      nextPieces,
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: INITIAL_DROP_INTERVAL,
      lastDropTime: Date.now(),
      isDirty: true,
    });

    this.eventBus.emit(GameEvent.GAME_START);
    this.eventBus.emit(GameEvent.PIECE_SPAWN, firstPiece);
  }

  /**
   * Pause the game
   */
  public pause(): void {
    const state = this.store.getState();
    if (state.status === GameStatus.PLAYING) {
      this.store.setState({ status: GameStatus.PAUSED, isDirty: true });
      this.eventBus.emit(GameEvent.GAME_PAUSE);
    }
  }

  /**
   * Resume the game
   */
  public resume(): void {
    const state = this.store.getState();
    if (state.status === GameStatus.PAUSED) {
      this.store.setState({
        status: GameStatus.PLAYING,
        lastDropTime: Date.now(),
        isDirty: true,
      });
      this.eventBus.emit(GameEvent.GAME_RESUME);
    }
  }

  /**
   * Move piece left
   */
  public moveLeft(): void {
    const state = this.store.getState();
    if (!this.canMove(state)) return;

    const newX = state.currentX - 1;
    if (state.board.isValidPosition(state.currentPiece!, newX, state.currentY)) {
      this.store.setState({ currentX: newX, isDirty: true });
      this.eventBus.emit(GameEvent.PIECE_MOVE, { direction: 'left' });
    }
  }

  /**
   * Move piece right
   */
  public moveRight(): void {
    const state = this.store.getState();
    if (!this.canMove(state)) return;

    const newX = state.currentX + 1;
    if (state.board.isValidPosition(state.currentPiece!, newX, state.currentY)) {
      this.store.setState({ currentX: newX, isDirty: true });
      this.eventBus.emit(GameEvent.PIECE_MOVE, { direction: 'right' });
    }
  }

  /**
   * Move piece down (soft drop) - returns true if moved, false if locked
   */
  public moveDown(): boolean {
    const state = this.store.getState();
    if (!this.canMove(state)) return false;

    const newY = state.currentY + 1;
    if (state.board.isValidPosition(state.currentPiece!, state.currentX, newY)) {
      this.store.setState({
        currentY: newY,
        lastDropTime: Date.now(),
        isDirty: true,
      });
      this.eventBus.emit(GameEvent.PIECE_MOVE, { direction: 'down' });
      return true;
    } else {
      // Piece can't move down, lock it
      this.lockPiece();
      return false;
    }
  }

  /**
   * Soft drop (move down with score)
   */
  public softDrop(): void {
    const state = this.store.getState();
    if (!this.canMove(state)) return;

    if (this.moveDown()) {
      // Award soft drop points
      const newScore = state.score + SOFT_DROP_SCORE;
      this.store.setState({ score: newScore });
      this.eventBus.emit(GameEvent.SCORE_UPDATE, newScore);
    }
  }

  /**
   * Hard drop (instant drop to bottom)
   */
  public hardDrop(): void {
    const state = this.store.getState();
    if (!this.canMove(state)) return;

    const distance = state.board.getHardDropDistance(
      state.currentPiece!,
      state.currentX,
      state.currentY
    );

    if (distance > 0) {
      const newY = state.currentY + distance;
      const dropScore = distance * HARD_DROP_SCORE;

      this.store.setState({
        currentY: newY,
        score: state.score + dropScore,
        isDirty: true,
      });

      this.eventBus.emit(GameEvent.SCORE_UPDATE, state.score + dropScore);
    }

    // Lock piece immediately
    this.lockPiece();
  }

  /**
   * Rotate piece clockwise
   */
  public rotate(direction: 'clockwise' | 'counterclockwise' = 'clockwise'): void {
    const state = this.store.getState();
    if (!this.canMove(state)) return;

    const piece = state.currentPiece!.clone();
    piece.rotate(direction);

    // Try basic rotation
    if (state.board.isValidPosition(piece, state.currentX, state.currentY)) {
      state.currentPiece!.rotate(direction);
      this.store.setState({ isDirty: true });
      this.eventBus.emit(GameEvent.PIECE_ROTATE, { direction });
      return;
    }

    // Basic rotation failed - try wall kicks (simplified SRS)
    const wallKickOffsets = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
    ];

    for (const offset of wallKickOffsets) {
      const newX = state.currentX + offset.x;
      const newY = state.currentY + offset.y;

      if (state.board.isValidPosition(piece, newX, newY)) {
        state.currentPiece!.rotate(direction);
        this.store.setState({
          currentX: newX,
          currentY: newY,
          isDirty: true,
        });
        this.eventBus.emit(GameEvent.PIECE_ROTATE, { direction });
        return;
      }
    }

    // Rotation failed completely - do nothing
  }

  /**
   * Hold the current piece
   */
  public hold(): void {
    const state = this.store.getState();
    if (!this.canMove(state) || !state.canHold) return;

    const currentPiece = state.currentPiece!;
    const holdPiece = state.holdPiece;

    if (holdPiece === null) {
      // First hold - get next piece
      const nextPiece = this.pieceGenerator.next();
      const nextPieces = this.pieceGenerator.getPreview();

      this.store.setState({
        currentPiece: nextPiece,
        currentX: SPAWN_X,
        currentY: SPAWN_Y,
        holdPiece: new Piece(currentPiece.type),
        canHold: false,
        nextPieces,
        isDirty: true,
      });
    } else {
      // Swap with hold piece
      this.store.setState({
        currentPiece: new Piece(holdPiece.type),
        currentX: SPAWN_X,
        currentY: SPAWN_Y,
        holdPiece: new Piece(currentPiece.type),
        canHold: false,
        isDirty: true,
      });
    }

    this.eventBus.emit(GameEvent.HOLD_PIECE);
  }

  /**
   * Lock the current piece to the board
   */
  private lockPiece(): void {
    const state = this.store.getState();
    if (!state.currentPiece) return;

    // Place piece on board
    state.board.placePiece(state.currentPiece, state.currentX, state.currentY);

    this.eventBus.emit(GameEvent.PIECE_LOCK, state.currentPiece);

    // Clear lines
    const linesCleared = state.board.clearLines();
    if (linesCleared > 0) {
      const lineScore = this.calculateLineScore(linesCleared, state.level);
      const newLines = state.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const leveledUp = newLevel > state.level;

      this.store.setState({
        score: state.score + lineScore,
        lines: newLines,
        level: newLevel,
        dropInterval: this.calculateDropInterval(newLevel),
      });

      this.eventBus.emit(GameEvent.LINE_CLEARED, linesCleared);
      this.eventBus.emit(GameEvent.SCORE_UPDATE, state.score + lineScore);

      if (leveledUp) {
        this.eventBus.emit(GameEvent.LEVEL_UP, newLevel);
      }
    }

    // Spawn next piece
    this.spawnNextPiece();
  }

  /**
   * Spawn the next piece
   */
  private spawnNextPiece(): void {
    const state = this.store.getState();
    const nextPiece = this.pieceGenerator.next();
    const nextPieces = this.pieceGenerator.getPreview();

    // Check if piece can spawn (game over check)
    if (!state.board.isValidPosition(nextPiece, SPAWN_X, SPAWN_Y)) {
      this.gameOver();
      return;
    }

    this.store.setState({
      currentPiece: nextPiece,
      currentX: SPAWN_X,
      currentY: SPAWN_Y,
      canHold: true,
      nextPieces,
      lastDropTime: Date.now(),
      isDirty: true,
    });

    this.eventBus.emit(GameEvent.PIECE_SPAWN, nextPiece);
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.store.setState({
      status: GameStatus.GAME_OVER,
      currentPiece: null,
      isDirty: true,
    });
    this.eventBus.emit(GameEvent.GAME_OVER);
  }

  /**
   * Calculate score for cleared lines
   */
  private calculateLineScore(lines: number, level: number): number {
    return SCORE_VALUES[lines] * level;
  }

  /**
   * Calculate drop interval based on level
   */
  private calculateDropInterval(level: number): number {
    const interval = INITIAL_DROP_INTERVAL - (level - 1) * DROP_INTERVAL_DECREASE;
    return Math.max(interval, MIN_DROP_INTERVAL);
  }

  /**
   * Check if piece can move (game is playing and piece exists)
   */
  private canMove(state: Readonly<GameState>): boolean {
    return state.status === GameStatus.PLAYING && state.currentPiece !== null;
  }
}
