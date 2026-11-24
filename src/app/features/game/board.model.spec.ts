import {
  BOARD_SIZE,
  Board,
  PALETTE,
  applyGravity,
  chainScore,
  clear,
  deal,
  hasValidMove,
  isAdjacent,
  refill,
} from './board.model';

/** A random source that picks the given palette indexes in order, then `fallback`. */
function pickColors(indexes: number[], fallback = 0): () => number {
  const queue = [...indexes];
  return () => ((queue.length ? queue.shift()! : fallback) + 0.5) / PALETTE.length;
}

/** Palette index per cell such that no two adjacent cells share a color. */
function noValidMoveIndexes(): number[] {
  const indexes: number[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) indexes.push((row + 2 * column) % 5);
  }
  return indexes;
}

function boardFromIndexes(indexes: number[]): Board {
  let id = 1;
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => ({
      id: id++,
      color: PALETTE[indexes[row * BOARD_SIZE + column]],
      dropRows: 0,
    })),
  );
}

describe('board model', () => {
  it('AC_1_deal_fills_7x7_board_with_palette_colors', () => {
    const board = deal(Math.random);

    expect(board.length).toBe(7);
    for (const dots of board) {
      expect(dots.length).toBe(7);
      for (const dot of dots) expect(PALETTE).toContain(dot!.color);
    }
    expect(new Set(PALETTE).size).toBe(5);
  });

  it('AC_2_deal_without_valid_move_is_re_dealt', () => {
    const random = pickColors(noValidMoveIndexes(), 0);

    const board = deal(random);

    expect(board.flat().every((dot) => dot!.color === PALETTE[0])).toBe(true);
    expect(hasValidMove(board)).toBe(true);
  });

  it('AC_2_dealt_board_always_has_a_valid_move', () => {
    for (let i = 0; i < 200; i++) expect(hasValidMove(deal(Math.random))).toBe(true);
  });

  it('AC_4_adjacent_means_orthogonal_neighbour', () => {
    expect(isAdjacent({ row: 3, column: 3 }, { row: 2, column: 3 })).toBe(true);
    expect(isAdjacent({ row: 3, column: 3 }, { row: 4, column: 3 })).toBe(true);
    expect(isAdjacent({ row: 3, column: 3 }, { row: 3, column: 2 })).toBe(true);
    expect(isAdjacent({ row: 3, column: 3 }, { row: 3, column: 4 })).toBe(true);
  });

  it('AC_5_diagonal_and_distant_dots_are_not_adjacent', () => {
    expect(isAdjacent({ row: 3, column: 3 }, { row: 2, column: 4 })).toBe(false);
    expect(isAdjacent({ row: 3, column: 3 }, { row: 3, column: 5 })).toBe(false);
    expect(isAdjacent({ row: 3, column: 3 }, { row: 3, column: 3 })).toBe(false);
  });

  it('AC_10_chain_score_is_10_per_dot_plus_10_per_dot_beyond_3', () => {
    expect(chainScore(2)).toBe(20);
    expect(chainScore(3)).toBe(30);
    expect(chainScore(4)).toBe(50);
    expect(chainScore(5)).toBe(70);
  });

  it('AC_10_clear_removes_exactly_the_chain_dots', () => {
    const board = boardFromIndexes(noValidMoveIndexes());
    const chain = [
      { row: 6, column: 0 },
      { row: 6, column: 1 },
    ];

    const cleared = clear(board, chain);

    expect(cleared[6][0]).toBeNull();
    expect(cleared[6][1]).toBeNull();
    expect(cleared.flat().filter((dot) => dot === null).length).toBe(2);
    expect(board[6][0]).not.toBeNull();
  });

  it('AC_11_gravity_drops_remaining_dots_keeping_their_order', () => {
    const board = boardFromIndexes(noValidMoveIndexes());
    const columnBefore = board.map((dots) => dots[2]!.id);
    const cleared = clear(board, [
      { row: 6, column: 2 },
      { row: 3, column: 2 },
    ]);

    const fallen = applyGravity(cleared);

    const columnAfter = fallen.map((dots) => dots[2]?.id ?? null);
    const expectedRemaining = columnBefore.filter((_, row) => row !== 6 && row !== 3);
    expect(columnAfter).toEqual([null, null, ...expectedRemaining]);
    expect(fallen.map((dots) => dots[0])).toEqual(board.map((dots) => dots[0]));
  });

  it('AC_12_refill_fills_every_empty_cell_from_the_top_with_palette_colors', () => {
    const board = boardFromIndexes(noValidMoveIndexes());
    const fallen = applyGravity(clear(board, [{ row: 4, column: 5 }, { row: 5, column: 5 }]));

    const full = refill(fallen, Math.random);

    expect(full.flat().every((dot) => dot !== null)).toBe(true);
    expect(PALETTE).toContain(full[0][5]!.color);
    expect(PALETTE).toContain(full[1][5]!.color);
    expect(full[0][5]!.dropRows).toBe(2);
    expect(full[1][5]!.dropRows).toBe(2);
    expect(full[2][5]).toBe(fallen[2][5]);
    expect(full[6][0]).toBe(fallen[6][0]);
  });

  it('AC_15_board_without_two_adjacent_same_color_dots_has_no_valid_move', () => {
    expect(hasValidMove(boardFromIndexes(noValidMoveIndexes()))).toBe(false);
  });
});
