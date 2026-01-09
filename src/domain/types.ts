// Core domain types

import { Piece } from '@infrastructure/Piece';
import { Board } from '@infrastructure/Board';

/**
 * Game status (Finite State Machine states)
 */
export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/**
 * Game events for the EventBus
 */
export enum GameEvent {
  GAME_START = 'GAME_START',
  GAME_PAUSE = 'GAME_PAUSE',
  GAME_RESUME = 'GAME_RESUME',
  GAME_OVER = 'GAME_OVER',
  PIECE_SPAWN = 'PIECE_SPAWN',
  PIECE_MOVE = 'PIECE_MOVE',
  PIECE_ROTATE = 'PIECE_ROTATE',
  PIECE_LOCK = 'PIECE_LOCK',
  LINE_CLEARED = 'LINE_CLEARED',
  LEVEL_UP = 'LEVEL_UP',
  SCORE_UPDATE = 'SCORE_UPDATE',
  HOLD_PIECE = 'HOLD_PIECE',
}

/**
 * Complete game state
 */
export interface GameState {
  // Game status
  status: GameStatus;

  // Board
  board: Board;

  // Current piece
  currentPiece: Piece | null;
  currentX: number;
  currentY: number;

  // Hold piece
  holdPiece: Piece | null;
  canHold: boolean; // Can only hold once per piece

  // Next pieces preview
  nextPieces: Piece[];

  // Score and statistics
  score: number;
  lines: number;
  level: number;

  // Timing
  dropInterval: number; // milliseconds between automatic drops
  lastDropTime: number; // timestamp of last drop

  // Flags
  isDirty: boolean; // Whether the board needs to be re-rendered
}

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Store subscriber type
 */
export type StoreSubscriber<T> = (state: T) => void;
