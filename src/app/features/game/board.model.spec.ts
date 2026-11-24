import {
  BOARD_SIZE,
  Board,
  COLOR_PALETTE,
  applyGravity,
  chainScore,
  clear,
  deal,
  hasValidMove,
  isAdjacent,
  isCrossingLink,
  refill,
} from './board.model';

/** A random source that picks the given palette indexes in order, then `fallback`. */
function pickColors(indexes: number[], fallback = 0): () => number {
  const queue = [...indexes];
  return () => ((queue.length ? queue.shift()! : fallback) + 0.5) / COLOR_PALETTE.length;
}

/** Palette index per cell such that no two adjacent cells (8 directions) share a color. */
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
      color: COLOR_PALETTE[indexes[row * BOARD_SIZE + column]],
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
      for (const dot of dots) expect(COLOR_PALETTE).toContain(dot!.color);
    }
    expect(new Set(COLOR_PALETTE).size).toBe(5);
  });

  it('AC_2_deal_without_valid_move_is_re_dealt', () => {
    const random = pickColors(noValidMoveIndexes(), 0);

    const board = deal(random);

    expect(board.flat().every((dot) => dot!.color === COLOR_PALETTE[0])).toBe(true);
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

  it('AC_5_distant_dots_and_the_dot_itself_are_not_adjacent', () => {
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
    expect(COLOR_PALETTE).toContain(full[0][5]!.color);
    expect(COLOR_PALETTE).toContain(full[1][5]!.color);
    expect(full[0][5]!.dropRows).toBe(2);
    expect(full[1][5]!.dropRows).toBe(2);
    expect(full[2][5]).toBe(fallen[2][5]);
    expect(full[6][0]).toBe(fallen[6][0]);
  });

  it('AC_15_board_without_two_adjacent_same_color_dots_has_no_valid_move', () => {
    expect(hasValidMove(boardFromIndexes(noValidMoveIndexes()))).toBe(false);
  });

  describe('DOTS-102', () => {
    const center = { row: 3, column: 3 };

    /** Blue (index 0) only at `cells`; elsewhere a 2×2 tiling of the other 4 colors, so no other dots touch. */
    function withBlueAt(cells: [number, number][]): Board {
      const indexes: number[] = [];
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let column = 0; column < BOARD_SIZE; column++) indexes.push(1 + (row % 2) * 2 + (column % 2));
      }
      for (const [row, column] of cells) indexes[row * BOARD_SIZE + column] = 0;
      return boardFromIndexes(indexes);
    }

    it('AC_1_adjacency_in_all_8_directions', () => {
      for (const [dRow, dColumn] of [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ]) {
        expect(isAdjacent(center, { row: 3 + dRow, column: 3 + dColumn })).toBe(true);
      }
    });

    it('AC_2_non_neighbours_are_rejected_including_across_the_board_edge', () => {
      expect(isAdjacent(center, center)).toBe(false);
      expect(isAdjacent(center, { row: 1, column: 1 })).toBe(false);
      expect(isAdjacent(center, { row: 5, column: 5 })).toBe(false);
      expect(isAdjacent(center, { row: 3, column: 5 })).toBe(false);
      expect(isAdjacent(center, { row: 1, column: 3 })).toBe(false);
      expect(isAdjacent(center, { row: 2, column: 5 })).toBe(false);
      // No wrap-around: the end of one row and the start of the next are not neighbours.
      expect(isAdjacent({ row: 0, column: 6 }, { row: 1, column: 0 })).toBe(false);
      expect(isAdjacent({ row: 1, column: 0 }, { row: 0, column: 6 })).toBe(false);
      expect(isAdjacent({ row: 3, column: 0 }, { row: 3, column: 6 })).toBe(false);
      expect(isAdjacent({ row: 0, column: 2 }, { row: 6, column: 2 })).toBe(false);
      expect(isAdjacent({ row: 0, column: 0 }, { row: 6, column: 6 })).toBe(false);
    });

    it('AC_5_a_link_across_the_other_diagonal_of_the_same_2x2_square_is_crossing', () => {
      const chain = [
        { row: 0, column: 0 },
        { row: 1, column: 1 },
        { row: 1, column: 0 },
      ];
      expect(isCrossingLink(chain, { row: 0, column: 1 })).toBe(true);

      const reversed = [
        { row: 1, column: 1 },
        { row: 0, column: 0 },
        { row: 0, column: 1 },
      ];
      expect(isCrossingLink(reversed, { row: 1, column: 0 })).toBe(true);
    });

    it('AC_5_diagonal_links_in_other_squares_and_straight_links_are_not_crossing', () => {
      const chain = [
        { row: 0, column: 0 },
        { row: 1, column: 1 },
        { row: 1, column: 2 },
      ];
      expect(isCrossingLink(chain, { row: 0, column: 3 })).toBe(false);
      expect(isCrossingLink(chain, { row: 2, column: 2 })).toBe(false);
      expect(isCrossingLink(chain, { row: 2, column: 1 })).toBe(false);
      // The corners 1,0 and 0,1 are in the chain but not linked to each other.
      const unlinkedCorners = [
        { row: 0, column: 1 },
        { row: 0, column: 2 },
        { row: 1, column: 2 },
        { row: 2, column: 1 },
        { row: 1, column: 0 },
        { row: 1, column: 1 },
      ];
      expect(isCrossingLink(unlinkedCorners, { row: 0, column: 0 })).toBe(false);
    });

    it('AC_6_chain_score_is_unchanged_for_3_or_more_dots', () => {
      expect(chainScore(3)).toBe(30);
      expect(chainScore(4)).toBe(50);
      expect(chainScore(5)).toBe(70);
    });

    it('AC_11_three_same_color_dots_touching_only_diagonally_are_a_valid_move', () => {
      expect(hasValidMove(withBlueAt([[1, 1], [2, 2], [3, 3]]))).toBe(true);
      expect(hasValidMove(withBlueAt([[4, 0], [5, 1], [4, 2]]))).toBe(true);
    });

    it('AC_11_three_same_color_dots_in_a_straight_line_are_a_valid_move', () => {
      expect(hasValidMove(withBlueAt([[6, 0], [6, 1], [6, 2]]))).toBe(true);
    });

    it('AC_11_pairs_alone_are_not_a_valid_move', () => {
      expect(hasValidMove(withBlueAt([[0, 0], [1, 1], [5, 5], [5, 6]]))).toBe(false);
      expect(hasValidMove(withBlueAt([[0, 6], [1, 0]]))).toBe(false);
      expect(hasValidMove(withBlueAt([[2, 2], [2, 4]]))).toBe(false);
    });

    it('AC_11_deal_re_deals_until_the_board_has_three_connected_same_color_dots', () => {
      const onlyAPair = noValidMoveIndexes();
      onlyAPair[0] = onlyAPair[1];
      const random = pickColors([...onlyAPair, ...noValidMoveIndexes()], 0);

      const board = deal(random);

      expect(board.flat().every((dot) => dot!.color === COLOR_PALETTE[0])).toBe(true);
      for (let i = 0; i < 200; i++) expect(hasValidMove(deal(Math.random))).toBe(true);
    });
  });
});
