// Game constants - zero dependencies, pure data

export const BOARD_WIDTH = 12;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 30;

// Piece types
export enum PieceType {
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  J = 'J',
  L = 'L',
}

// Piece colors
export const PIECE_COLORS: Record<PieceType, string> = {
  [PieceType.I]: '#00f0f0', // Cyan
  [PieceType.O]: '#f0f000', // Yellow
  [PieceType.T]: '#a000f0', // Purple
  [PieceType.S]: '#00f000', // Green
  [PieceType.Z]: '#f00000', // Red
  [PieceType.J]: '#0000f0', // Blue
  [PieceType.L]: '#f0a000', // Orange
};

// Piece shapes (4x4 grid for each rotation state)
// 1 = filled cell, 0 = empty cell
export const PIECE_SHAPES: Record<PieceType, number[][][]> = {
  [PieceType.I]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    // Rotation 3
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [PieceType.O]: [
    // O piece doesn't rotate
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],
  [PieceType.T]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    // Rotation 3
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [PieceType.S]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
    ],
    // Rotation 3
    [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [PieceType.Z]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
    ],
    // Rotation 3
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
    ],
  ],
  [PieceType.J]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
    ],
    // Rotation 3
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
    ],
  ],
  [PieceType.L]: [
    // Rotation 0
    [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
    ],
    // Rotation 3
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
};

// Initial spawn position
export const SPAWN_X = Math.floor(BOARD_WIDTH / 2) - 2; // Center horizontally
export const SPAWN_Y = 0;

// Scoring
export const SCORE_VALUES: Record<number, number> = {
  0: 0,
  1: 100, // Single
  2: 300, // Double
  3: 500, // Triple
  4: 800, // Tetris
};

export const SOFT_DROP_SCORE = 1;
export const HARD_DROP_SCORE = 2;

// Level and speed
export const LINES_PER_LEVEL = 10;
export const INITIAL_DROP_INTERVAL = 1000; // milliseconds
export const MIN_DROP_INTERVAL = 100;
export const DROP_INTERVAL_DECREASE = 50; // decrease per level

// Input handling
export const DAS_DELAY = 170; // Delayed Auto Shift delay in ms
export const ARR_INTERVAL = 50; // Auto Repeat Rate in ms

// Keys
export enum KeyCode {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  DOWN = 'ArrowDown',
  UP = 'ArrowUp',
  SPACE = 'Space',
  Z = 'KeyZ',
  X = 'KeyX',
  C = 'KeyC',
  P = 'KeyP',
  ESCAPE = 'Escape',
  // Alternative keys
  A = 'KeyA',
  D = 'KeyD',
  S = 'KeyS',
  W = 'KeyW',
  SHIFT = 'ShiftLeft',
  CTRL = 'ControlLeft',
}
