import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BOARD_SIZE, Board, PALETTE } from './board.model';
import { GameComponent } from './game.component';
import { FALL_DURATION_MS, GameService, RANDOM_SOURCE } from './game.service';

const [B, O, G, P, Y] = [0, 1, 2, 3, 4];

/** The board drawn in the mock (rows top to bottom). */
const MOCK_BOARD = [
  [O, G, Y, P, G, O, B],
  [P, Y, O, G, B, P, Y],
  [G, O, B, B, Y, G, O],
  [Y, B, B, O, P, Y, G],
  [O, P, G, Y, G, O, P],
  [B, G, P, O, Y, B, Y],
  [Y, O, Y, G, P, O, G],
];

/** No two adjacent cells share a color, except the pair at row 6, columns 0 and 1. */
const ONE_PAIR_BOARD = Array.from({ length: BOARD_SIZE }, (_, row) =>
  Array.from({ length: BOARD_SIZE }, (_, column) =>
    row === 6 && column === 1 ? 1 : (row + 2 * column) % 5,
  ),
);

let nextId = 1000;
function toBoard(indexes: number[][]): Board {
  return indexes.map((cells) =>
    cells.map((index) => ({ id: nextId++, color: PALETTE[index], dropRows: 0 })),
  );
}

describe('GameComponent', () => {
  let fixture: ComponentFixture<GameComponent>;
  let game: GameService;
  let pickedColors: number[];

  function render(): void {
    fixture.detectChanges();
  }

  function dotAt(row: number, column: number): SVGGElement {
    const dot = (fixture.nativeElement as HTMLElement).querySelector<SVGGElement>(
      `[data-testid="dot"][data-row="${row}"][data-column="${column}"]`,
    );
    if (!dot) throw new Error(`no dot at ${row},${column}`);
    return dot;
  }

  function pointer(type: string, target: EventTarget, pointerType = 'mouse'): void {
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, pointerType }));
    render();
  }

  /** A mouse click is a press and release on the same dot without entering another dot. */
  function click(row: number, column: number, pointerType = 'mouse'): void {
    pointer('pointerdown', dotAt(row, column), pointerType);
    pointer('pointerup', document, pointerType);
  }

  function press(row: number, column: number, pointerType = 'mouse'): void {
    pointer('pointerdown', dotAt(row, column), pointerType);
  }

  /** jsdom has no layout, so the dot under the pointer is stubbed. */
  function moveOver(target: Element | null, pointerType = 'mouse'): void {
    document.elementFromPoint = () => target;
    pointer('pointermove', document, pointerType);
  }

  function moveTo(row: number, column: number, pointerType = 'mouse'): void {
    moveOver(dotAt(row, column).querySelector('.fill'), pointerType);
  }

  function releasePointer(pointerType = 'mouse'): void {
    pointer('pointerup', document, pointerType);
  }

  function board(): SVGSVGElement {
    return (fixture.nativeElement as HTMLElement).querySelector('[data-testid="board"]')!;
  }

  function key(name: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    board().dispatchEvent(event);
    render();
    return event;
  }

  function focusCursor(): string | null {
    const cursor = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="focus-cursor"]');
    return cursor && `${cursor.getAttribute('data-row')},${cursor.getAttribute('data-column')}`;
  }

  function chainDots(): string[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"].in-chain'),
    ).map((dot) => `${dot.getAttribute('data-row')},${dot.getAttribute('data-column')}`);
  }

  function text(testId: string): string | undefined {
    return (fixture.nativeElement as HTMLElement)
      .querySelector(`[data-testid="${testId}"]`)
      ?.textContent?.trim();
  }

  function useBoard(indexes: number[][]): void {
    game.board.set(toBoard(indexes));
    render();
  }

  /** Refills with blue only, so the game cannot end by chance after a clear. */
  function refillWithBlue(): void {
    pickedColors = Array<number>(BOARD_SIZE * BOARD_SIZE).fill(B);
  }

  function finishAnimation(): void {
    vi.advanceTimersByTime(2 * FALL_DURATION_MS);
    render();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    pickedColors = [];
    TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        {
          provide: RANDOM_SOURCE,
          useValue: () =>
            pickedColors.length ? (pickedColors.shift()! + 0.5) / PALETTE.length : Math.random(),
        },
      ],
    });
    fixture = TestBed.createComponent(GameComponent);
    game = TestBed.inject(GameService);
    render();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (document as { elementFromPoint?: unknown }).elementFromPoint;
  });

  it('AC_1_new_game_shows_7x7_board_of_palette_colors_and_score_0', () => {
    const dots = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"]');

    expect(dots.length).toBe(49);
    dots.forEach((dot) => expect(PALETTE).toContain(dot.getAttribute('data-color')));
    expect(text('score')).toBe('0');
    expect(PALETTE).toEqual(['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#F0E442']);
  });

  it('AC_2_new_game_board_has_a_valid_move', () => {
    const board = game.board();
    const hasPair = board.some((dots, row) =>
      dots.some(
        (dot, column) =>
          board[row + 1]?.[column]?.color === dot!.color || dots[column + 1]?.color === dot!.color,
      ),
    );
    expect(hasPair).toBe(true);
  });

  it('AC_3_clicking_a_dot_with_no_chain_starts_a_chain', () => {
    useBoard(MOCK_BOARD);

    click(3, 1);

    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);
    expect(chainDots()).toEqual(['3,1']);
  });

  it('AC_4_clicking_adjacent_dot_of_chain_color_adds_it', () => {
    useBoard(MOCK_BOARD);

    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 3);

    expect(chainDots().sort()).toEqual(['2,2', '2,3', '3,1', '3,2']);
    expect(game.chain().at(-1)).toEqual({ row: 2, column: 3 });
  });

  it('AC_5_clicks_on_other_color_non_adjacent_or_chain_dots_are_ignored', () => {
    useBoard(MOCK_BOARD);
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 3);
    const before = game.chain();

    click(2, 4); // adjacent but yellow
    click(1, 4); // blue but diagonal
    click(0, 6); // blue but far away
    click(3, 1); // already in the chain, not last or previous

    expect(game.chain()).toEqual(before);
    expect(text('score')).toBe('0');
  });

  it('AC_6_clicking_the_previous_dot_steps_back', () => {
    useBoard(MOCK_BOARD);
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 3);

    click(2, 2);

    expect(game.chain()).toEqual([
      { row: 3, column: 1 },
      { row: 3, column: 2 },
      { row: 2, column: 2 },
    ]);
    expect(chainDots()).not.toContain('2,3');
  });

  it('AC_7_clicking_the_last_dot_of_a_2_plus_chain_clears_it', () => {
    useBoard(MOCK_BOARD);
    const chainIds = [game.board()[3][1]!.id, game.board()[3][2]!.id];
    click(3, 1);
    click(3, 2);

    click(3, 2);

    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('20');
    const idsOnBoard = game.board().flat().map((dot) => dot?.id);
    expect(idsOnBoard).not.toContain(chainIds[0]);
    expect(idsOnBoard).not.toContain(chainIds[1]);
  });

  it('AC_8_clicking_the_only_dot_of_a_1_dot_chain_ends_it_without_removing', () => {
    useBoard(MOCK_BOARD);
    const before = game.board();
    click(3, 1);

    click(3, 1);

    expect(game.chain()).toEqual([]);
    expect(chainDots()).toEqual([]);
    expect(game.board()).toBe(before);
    expect(text('score')).toBe('0');
    expect(game.animating()).toBe(false);
  });

  it('AC_10_clearing_4_dots_adds_50_points_and_updates_the_score_display', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 3);

    click(2, 3);

    expect(text('score')).toBe('50');
    expect(text('points-earned')).toBe('+50');
    finishAnimation();
    click(0, 0);
    click(0, 0);
    expect(text('score')).toBe('50');
  });

  it('AC_10_score_adds_up_over_several_clears', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);
    click(3, 2);
    finishAnimation();
    useBoard(MOCK_BOARD);
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 2);

    expect(text('score')).toBe('50');
  });

  it('AC_11_after_a_clear_dots_above_fall_down_keeping_their_order', () => {
    useBoard(MOCK_BOARD);
    const column2Ids = game.board().map((dots) => dots[2]!.id);
    click(3, 2);
    click(2, 2);
    click(2, 2);

    const remainingIds = column2Ids.filter((_, row) => row !== 2 && row !== 3);
    expect(game.board().map((dots) => dots[2]?.id ?? null)).toEqual([null, null, ...remainingIds]);
  });

  it('AC_12_after_gravity_new_palette_dots_fill_the_board_from_the_top', () => {
    useBoard(MOCK_BOARD);
    click(3, 2);
    click(2, 2);
    click(2, 2);

    finishAnimation();

    const dots = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"]');
    expect(dots.length).toBe(49);
    expect(PALETTE).toContain(dotAt(0, 2).getAttribute('data-color'));
    expect(PALETTE).toContain(dotAt(1, 2).getAttribute('data-color'));
    expect(game.board()[0][2]!.dropRows).toBe(2);
  });

  it('AC_13_input_is_ignored_during_the_animation_which_lasts_under_half_a_second', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);
    click(3, 2);

    click(0, 0);
    expect(game.chain()).toEqual([]);
    vi.advanceTimersByTime(FALL_DURATION_MS);
    render();
    click(0, 0);
    expect(game.chain()).toEqual([]);

    vi.advanceTimersByTime(FALL_DURATION_MS);
    render();
    expect(2 * FALL_DURATION_MS).toBeLessThan(500);
    click(0, 0);
    expect(game.chain()).toEqual([{ row: 0, column: 0 }]);
  });

  it('AC_14_chain_dots_are_highlighted_and_joined_by_a_line_in_the_chain_color', () => {
    useBoard(MOCK_BOARD);
    const blue = PALETTE[B];
    click(3, 1);

    expect(dotAt(3, 1).querySelector('.ring')?.getAttribute('stroke')).toBe(blue);
    expect(dotAt(3, 1).querySelector('.fill')?.getAttribute('r')).toBe('17');
    expect(dotAt(3, 2).querySelector('.fill')?.getAttribute('r')).toBe('13');

    click(3, 2);
    click(2, 2);
    const line = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="chain-line"]');
    expect(line?.getAttribute('stroke')).toBe(blue);
    expect(line?.getAttribute('points')).toBe('79,171 125,171 125,125');

    click(3, 2);
    expect(line?.getAttribute('points')).toBe('79,171 125,171');
    expect(dotAt(2, 2).querySelector('.ring')).toBeNull();
  });

  it('AC_15_no_valid_move_after_refill_ends_the_game_with_final_score_and_play_again', () => {
    useBoard(ONE_PAIR_BOARD);
    pickedColors = [3, 1];
    click(6, 0);
    click(6, 1);
    click(6, 1);
    expect(text('game-over')).toBeUndefined();

    finishAnimation();

    expect(game.gameOver()).toBe(true);
    expect(text('final-score')).toBe('20');
    expect(text('play-again')).toBe('Play again');
    const before = game.board();
    click(5, 0);
    expect(game.chain()).toEqual([]);
    expect(game.board()).toBe(before);
  });

  it('AC_15_game_continues_when_the_refill_leaves_a_valid_move', () => {
    useBoard(ONE_PAIR_BOARD);
    pickedColors = [0, 0];
    click(6, 0);
    click(6, 1);
    click(6, 1);

    finishAnimation();

    expect(game.gameOver()).toBe(false);
    expect(text('game-over')).toBeUndefined();
  });

  it('AC_16_play_again_resets_score_and_deals_a_new_board', () => {
    useBoard(ONE_PAIR_BOARD);
    pickedColors = [3, 1];
    click(6, 0);
    click(6, 1);
    click(6, 1);
    finishAnimation();
    const oldIds = new Set(game.board().flat().map((dot) => dot!.id));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="play-again"]')!
      .click();
    render();

    expect(text('score')).toBe('0');
    expect(text('game-over')).toBeUndefined();
    const newDots = game.board().flat();
    expect(newDots.length).toBe(49);
    expect(newDots.some((dot) => oldIds.has(dot!.id))).toBe(false);
    click(0, 0);
    expect(game.chain()).toEqual([{ row: 0, column: 0 }]);
  });

  it('AC_9_dragging_over_valid_dots_adds_them_and_release_clears_the_chain', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();

    press(3, 1);
    moveTo(3, 2);
    moveTo(2, 2);
    expect(game.chain().length).toBe(3);
    expect(chainDots().sort()).toEqual(['2,2', '3,1', '3,2']);

    releasePointer();
    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('30');
  });

  it('AC_9_dragging_back_onto_the_previous_dot_steps_back', () => {
    useBoard(MOCK_BOARD);
    press(3, 1);
    moveTo(3, 2);
    moveTo(2, 2);

    moveTo(3, 2);

    expect(game.chain()).toEqual([
      { row: 3, column: 1 },
      { row: 3, column: 2 },
    ]);
  });

  it('AC_9_invalid_dots_entered_during_a_drag_are_ignored', () => {
    useBoard(MOCK_BOARD);
    press(3, 1);
    moveTo(3, 2);

    moveTo(3, 3); // adjacent but orange
    moveTo(2, 1); // orange, diagonal to (3,2)
    moveTo(5, 0); // blue but far away
    moveOver(null); // between dots

    expect(game.chain()).toEqual([
      { row: 3, column: 1 },
      { row: 3, column: 2 },
    ]);
    expect(text('score')).toBe('0');
  });

  it('AC_9_re_entering_the_last_dot_during_a_drag_does_nothing', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    press(3, 1);
    moveTo(3, 2);
    moveTo(2, 2);

    moveTo(1, 2); // orange: ignored
    moveTo(2, 2); // back onto the last dot

    expect(game.chain().length).toBe(3);
    expect(text('score')).toBe('0');
    releasePointer();
    expect(text('score')).toBe('30');
  });

  it('AC_9_release_with_a_1_dot_chain_after_entering_other_dots_removes_nothing', () => {
    useBoard(MOCK_BOARD);
    const before = game.board();
    press(3, 1);
    moveTo(3, 2);
    moveTo(3, 1); // step back to a 1-dot chain

    releasePointer();

    expect(game.chain()).toEqual([]);
    expect(game.board()).toBe(before);
    expect(text('score')).toBe('0');
  });

  it('AC_9_press_and_release_without_entering_another_dot_acts_as_a_single_click', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();

    press(3, 1);
    moveTo(3, 1);
    releasePointer();
    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);

    click(3, 2);
    expect(game.chain().length).toBe(2);

    press(3, 2);
    releasePointer();
    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('20');
  });

  it('AC_9_press_on_the_last_dot_continues_the_chain', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);

    press(3, 2);
    moveTo(2, 2);
    moveTo(2, 3);
    expect(game.chain().length).toBe(4);
    releasePointer();

    expect(text('score')).toBe('50');
  });

  it('AC_9_press_on_another_dot_during_a_chain_acts_as_a_click_and_the_drag_continues_from_the_last_dot', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);

    press(0, 0); // orange, not adjacent: ignored
    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);
    moveTo(3, 2);
    releasePointer();
    expect(text('score')).toBe('20');
    finishAnimation();

    useBoard(MOCK_BOARD);
    click(3, 1);
    press(3, 2); // adjacent blue: added by the press
    expect(game.chain().length).toBe(2);
    moveTo(2, 2);
    releasePointer();
    expect(text('score')).toBe('50');
  });

  it('AC_9_release_outside_the_board_ends_the_chain', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    press(3, 1);
    moveTo(3, 2);
    moveOver(document.body);

    releasePointer();

    expect(text('score')).toBe('20');
  });

  it('AC_9_a_faint_line_runs_from_the_last_dot_to_the_pointer_while_dragging', () => {
    useBoard(MOCK_BOARD);
    board().getBoundingClientRect = () => ({ left: 0, top: 0, width: 342, height: 342 }) as DOMRect;
    press(3, 1);
    document.elementFromPoint = () => null;
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 156, clientY: 132 }));
    render();

    const line = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="drag-line"]');
    expect(line?.getAttribute('x1')).toBe('79');
    expect(line?.getAttribute('y1')).toBe('171');
    expect(line?.getAttribute('x2')).toBe('156');
    expect(line?.getAttribute('y2')).toBe('132');
    expect(line?.getAttribute('stroke')).toBe(PALETTE[B]);

    releasePointer();
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="drag-line"]')).toBeNull();
  });

  it('AC_17_tapping_acts_as_a_click_and_dragging_a_finger_acts_as_a_mouse_drag', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();

    click(3, 1, 'touch');
    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);
    click(3, 2, 'touch');
    expect(game.chain().length).toBe(2);

    press(3, 2, 'touch');
    moveTo(2, 2, 'touch');
    moveTo(1, 2, 'touch'); // ignored
    moveTo(2, 2, 'touch'); // last dot again: nothing
    moveTo(2, 3, 'touch');
    releasePointer('touch');

    expect(text('score')).toBe('50');
  });

  it('AC_13_key_presses_during_the_animation_are_ignored', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    board().dispatchEvent(new FocusEvent('focus'));
    click(3, 1);
    click(3, 2);
    click(3, 2);

    key('ArrowRight');
    key('Enter');

    expect(game.focusCursor()).toEqual({ row: 0, column: 0 });
    expect(game.chain()).toEqual([]);
  });

  it('AC_13_an_arrow_key_during_the_animation_does_not_show_the_focus_cursor', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);
    click(3, 2);

    key('ArrowDown');
    expect(focusCursor()).toBeNull();

    finishAnimation();
    key('ArrowDown');
    expect(focusCursor()).toBe('1,0');
  });

  it('AC_18_focus_cursor_starts_top_left_and_shows_only_while_the_board_has_keyboard_focus', () => {
    expect(focusCursor()).toBeNull();
    expect(board().getAttribute('tabindex')).toBe('0');

    board().dispatchEvent(new FocusEvent('focus'));
    render();
    expect(focusCursor()).toBe('0,0');
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="hint"]')!.classList)
      .toContain('visible');

    board().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(focusCursor()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="hint"]')!.classList)
      .not.toContain('visible');
  });

  it('AC_18_focus_from_a_click_or_tap_does_not_show_the_cursor_until_an_arrow_key', () => {
    useBoard(MOCK_BOARD);
    pointer('pointerdown', dotAt(3, 1));
    board().dispatchEvent(new FocusEvent('focus'));
    pointer('pointerup', document);
    expect(focusCursor()).toBeNull();

    key('ArrowRight');
    expect(focusCursor()).toBe('0,1');
  });

  it('AC_18_arrow_keys_move_the_cursor_and_it_stays_within_the_board', () => {
    board().dispatchEvent(new FocusEvent('focus'));
    render();

    key('ArrowLeft');
    key('ArrowUp');
    expect(focusCursor()).toBe('0,0');

    for (let i = 0; i < 3; i++) key('ArrowRight');
    expect(focusCursor()).toBe('0,3');
    for (let i = 0; i < 10; i++) key('ArrowDown');
    expect(focusCursor()).toBe('6,3');
    for (let i = 0; i < 10; i++) key('ArrowRight');
    expect(focusCursor()).toBe('6,6');
    expect(key('ArrowUp').defaultPrevented).toBe(true);
    expect(focusCursor()).toBe('5,6');
  });

  it('AC_18_enter_and_space_act_as_a_click_on_the_focused_dot', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    board().dispatchEvent(new FocusEvent('focus'));
    for (let i = 0; i < 3; i++) key('ArrowDown');
    key('ArrowRight');

    key('Enter');
    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);

    key('ArrowRight');
    expect(key(' ').defaultPrevented).toBe(true);
    expect(game.chain().length).toBe(2);

    key('ArrowLeft');
    key('Enter'); // previous dot: step back
    expect(game.chain()).toEqual([{ row: 3, column: 1 }]);

    key('Enter'); // only dot of a 1-dot chain: ended
    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('0');

    key('Enter');
    key('ArrowRight');
    key('Enter');
    key('Enter'); // last dot of a 2-dot chain: cleared
    expect(text('score')).toBe('20');
  });

  it('AC_18_other_keys_do_nothing', () => {
    board().dispatchEvent(new FocusEvent('focus'));
    render();

    expect(key('a').defaultPrevented).toBe(false);
    expect(key('Escape').defaultPrevented).toBe(false);
    expect(game.chain()).toEqual([]);
    expect(focusCursor()).toBe('0,0');
  });

  it('AC_18_focus_cursor_stays_on_the_same_cell_after_a_clear', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    board().dispatchEvent(new FocusEvent('focus'));
    for (let i = 0; i < 3; i++) key('ArrowDown');
    key('ArrowRight');
    key('Enter');
    key('ArrowRight');
    key('Enter');
    key('Enter');

    finishAnimation();

    expect(focusCursor()).toBe('3,2');
  });

  it('AC_18_focus_cursor_starts_top_left_again_after_play_again', () => {
    useBoard(ONE_PAIR_BOARD);
    pickedColors = [3, 1];
    board().dispatchEvent(new FocusEvent('focus'));
    for (let i = 0; i < 6; i++) key('ArrowDown');
    key('Enter');
    key('ArrowRight');
    key('Enter');
    key('Enter');
    finishAnimation();
    expect(game.gameOver()).toBe(true);
    expect(focusCursor()).toBeNull();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="play-again"]')!
      .click();
    render();

    expect(focusCursor()).toBe('0,0');
  });
});
