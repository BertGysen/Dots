export const BOARD_SIZE = 7;

export const MINIMUM_CHAIN_LENGTH = 3;

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
  return !isSamePosition(a, b) && Math.abs(a.row - b.row) <= 1 && Math.abs(a.column - b.column) <= 1;
}

/** True when the link from the chain's last dot to `position` would cross a diagonal link already in the chain. */
export function isCrossingLink(chain: readonly Position[], position: Position): boolean {
  const lastDot = chain.at(-1);
  if (!lastDot || lastDot.row === position.row || lastDot.column === position.column) return false;
  // The only diagonal that can cross this one is the other diagonal of the same 2×2 square.
  const corner1 = { row: lastDot.row, column: position.column };
  const corner2 = { row: position.row, column: lastDot.column };
  return chain.some((dot, i) => {
    const next = chain[i + 1];
    if (!next) return false;
    return (
      (isSamePosition(dot, corner1) && isSamePosition(next, corner2)) ||
      (isSamePosition(dot, corner2) && isSamePosition(next, corner1))
    );
  });
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.column === b.column;
}

/** A valid move is a group of at least MINIMUM_CHAIN_LENGTH same-color dots connected through adjacent dots. */
export function hasValidMove(board: Board): boolean {
  const visited = new Set<number>();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      if (visited.has(row * BOARD_SIZE + column)) continue;
      if (connectedGroupSize(board, { row, column }, visited) >= MINIMUM_CHAIN_LENGTH) return true;
    }
  }
  return false;
}

function connectedGroupSize(board: Board, start: Position, visited: Set<number>): number {
  const color = board[start.row][start.column]?.color;
  visited.add(start.row * BOARD_SIZE + start.column);
  if (!color) return 0;
  const toVisit = [start];
  let size = 0;
  while (toVisit.length) {
    const { row, column } = toVisit.pop()!;
    size++;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = column - 1; c <= column + 1; c++) {
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
        if (visited.has(r * BOARD_SIZE + c) || board[r][c]?.color !== color) continue;
        visited.add(r * BOARD_SIZE + c);
        toVisit.push({ row: r, column: c });
      }
    }
  }
  return size;
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
