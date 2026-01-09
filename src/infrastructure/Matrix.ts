// Matrix utilities - pure functions for 2D array operations

/**
 * Rotate a 2D matrix 90 degrees clockwise
 */
export function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];

  for (let col = 0; col < cols; col++) {
    rotated[col] = [];
    for (let row = rows - 1; row >= 0; row--) {
      rotated[col].push(matrix[row][col]);
    }
  }

  return rotated;
}

/**
 * Rotate a 2D matrix 90 degrees counter-clockwise
 */
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];

  for (let col = cols - 1; col >= 0; col--) {
    rotated[cols - 1 - col] = [];
    for (let row = 0; row < rows; row++) {
      rotated[cols - 1 - col].push(matrix[row][col]);
    }
  }

  return rotated;
}

/**
 * Clone a 2D matrix
 */
export function cloneMatrix(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

/**
 * Create an empty matrix filled with zeros
 */
export function createEmptyMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Get the bounding box of non-zero cells in a matrix
 */
export function getBoundingBox(matrix: number[][]): {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
} {
  let minRow = matrix.length;
  let maxRow = -1;
  let minCol = matrix[0].length;
  let maxCol = -1;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] !== 0) {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    }
  }

  return { minRow, maxRow, minCol, maxCol };
}
