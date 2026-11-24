export const BOARD_SIZE = 7;

/** Okabe-Ito colors as fixed in the mock: blue, orange, green, pink, yellow. */
export const COLOR_PALETTE = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#F0E442'] as const;

export type DotColor = (typeof COLOR_PALETTE)[number];

export interface Dot {
  readonly id: number;
  readonly color: DotColor;
  /** How many rows above the board a refilled dot starts its fall from; 0 for dealt dots. */
  readonly dropRows: number;
}

export interface Position {
  readonly row: number;
  readonly column: number;
}

/** Indexed as board[row][column]; row 0 is the top. A null cell is empty. */
export type Board = (Dot | null)[][];

/** Returns a number in [0, 1), like Math.random. */
export type RandomSource = () => number;

let nextDotId = 1;

export function createDot(random: RandomSource, dropRows = 0): Dot {
  const color = COLOR_PALETTE[Math.floor(random() * COLOR_PALETTE.length)];
  return { id: nextDotId++, color, dropRows };
}

export function deal(random: RandomSource): Board {
  let board: Board;
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => createDot(random)),
    );
  } while (!hasValidMove(board));
  return board;
}

export function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.column - b.column) === 1;
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.column === b.column;
}

export function hasValidMove(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const color = board[row][column]?.color;
      if (!color) continue;
      if (row + 1 < BOARD_SIZE && board[row + 1][column]?.color === color) return true;
      if (column + 1 < BOARD_SIZE && board[row][column + 1]?.color === color) return true;
    }
  }
  return false;
}

export function chainScore(dotCount: number): number {
  return dotCount * 10 + Math.max(0, dotCount - 3) * 10;
}

export function clear(board: Board, chain: readonly Position[]): Board {
  const cleared = board.map((cells) => [...cells]);
  for (const { row, column } of chain) cleared[row][column] = null;
  return cleared;
}

export function applyGravity(board: Board): Board {
  const fallen: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Dot | null>(BOARD_SIZE).fill(null),
  );
  for (let column = 0; column < BOARD_SIZE; column++) {
    let targetRow = BOARD_SIZE - 1;
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      const dot = board[row][column];
      if (dot) fallen[targetRow--][column] = dot;
    }
  }
  return fallen;
}

export function refill(board: Board, random: RandomSource): Board {
  return board.map((cells) =>
    cells.map((dot, column) => {
      if (dot) return dot;
      const emptyInColumn = board.filter((r) => r[column] === null).length;
      // New dots start stacked above the board, so each falls as far as its column's gap.
      return createDot(random, emptyInColumn);
    }),
  );
}
