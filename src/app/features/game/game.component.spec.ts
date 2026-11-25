import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BOARD_SIZE, Board, COLOR_PALETTE, hasValidMove } from './board.model';
import { GameComponent } from './game.component';
import {
  COMPUTER_DRAW_MS,
  COMPUTER_HOLD_MS,
  COMPUTER_PAUSE_MS,
  FALL_DURATION_MS,
  GameService,
  RANDOM_SOURCE,
  SHAKE_DURATION_MS,
} from './game.service';

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

/**
 * No two adjacent cells (8 directions) share a color, except the 3 pink dots at row 6, columns 0–2:
 * the board's only valid move. After clearing them, refilling the top row with
 * ONLY_PAIRS_REFILL leaves a pair but no valid move; STILL_A_MOVE_REFILL leaves a group of 4.
 */
const ONE_MOVE_BOARD = Array.from({ length: BOARD_SIZE }, (_, row) =>
  Array.from({ length: BOARD_SIZE }, (_, column) =>
    row === 6 && column <= 2 ? P : (row + 2 * column) % 5,
  ),
);
const ONLY_PAIRS_REFILL = [O, P, O];
const STILL_A_MOVE_REFILL = [O, O, O];

let nextId = 1000;
function toBoard(indexes: number[][]): Board {
  return indexes.map((cells) =>
    cells.map((index) => ({ id: nextId++, color: COLOR_PALETTE[index], dropRows: 0 })),
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

  /** jsdom has no layout, so the board is stubbed to fill 342×342 px at the page's top-left. */
  function moveToPoint(x: number, y: number, pointerType = 'mouse'): void {
    board().getBoundingClientRect = () => ({ left: 0, top: 0, width: 342, height: 342 }) as DOMRect;
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType }));
    render();
  }

  function moveTo(row: number, column: number, pointerType = 'mouse'): void {
    moveToPoint(33 + column * 46, 33 + row * 46, pointerType);
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

  /** Plays out the computer's turn that follows a player's clear (DOTS-103), so the player can move again. */
  function finishComputerTurn(): void {
    vi.advanceTimersByTime(COMPUTER_PAUSE_MS + COMPUTER_DRAW_MS + COMPUTER_HOLD_MS + 2 * FALL_DURATION_MS);
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
            pickedColors.length ? (pickedColors.shift()! + 0.5) / COLOR_PALETTE.length : Math.random(),
        },
      ],
    });
    fixture = TestBed.createComponent(GameComponent);
    game = TestBed.inject(GameService);
    render();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('AC_1_new_game_shows_7x7_board_of_palette_colors_and_score_0', () => {
    const dots = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"]');

    expect(dots.length).toBe(49);
    dots.forEach((dot) => expect(COLOR_PALETTE).toContain(dot.getAttribute('data-color')));
    expect(text('score')).toBe('0');
    expect(COLOR_PALETTE).toEqual(['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#F0E442']);
  });

  it('AC_2_new_game_board_has_a_valid_move', () => {
    expect(hasValidMove(game.board())).toBe(true);
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

  it('AC_7_clicking_the_last_dot_of_a_3_plus_chain_clears_it', () => {
    useBoard(MOCK_BOARD);
    const chainIds = [game.board()[3][1]!.id, game.board()[3][2]!.id, game.board()[2][2]!.id];
    click(3, 1);
    click(3, 2);
    click(2, 2);

    click(2, 2);

    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('30');
    const idsOnBoard = game.board().flat().map((dot) => dot?.id);
    for (const id of chainIds) expect(idsOnBoard).not.toContain(id);
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
    click(2, 2);
    click(2, 2);
    finishAnimation();
    finishComputerTurn();
    useBoard(MOCK_BOARD);
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 3);
    click(2, 3);

    expect(text('score')).toBe('80');
  });

  it('AC_11_after_a_clear_dots_above_fall_down_keeping_their_order', () => {
    useBoard(MOCK_BOARD);
    const column2Ids = game.board().map((dots) => dots[2]!.id);
    click(3, 2);
    click(2, 2);
    click(2, 3);
    click(2, 3);

    const remainingIds = column2Ids.filter((_, row) => row !== 2 && row !== 3);
    expect(game.board().map((dots) => dots[2]?.id ?? null)).toEqual([null, null, ...remainingIds]);
  });

  it('AC_12_after_gravity_new_palette_dots_fill_the_board_from_the_top', () => {
    useBoard(MOCK_BOARD);
    click(3, 2);
    click(2, 2);
    click(2, 3);
    click(2, 3);

    finishAnimation();

    const dots = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"]');
    expect(dots.length).toBe(49);
    expect(COLOR_PALETTE).toContain(dotAt(0, 2).getAttribute('data-color'));
    expect(COLOR_PALETTE).toContain(dotAt(1, 2).getAttribute('data-color'));
    expect(game.board()[0][2]!.dropRows).toBe(2);
  });

  it('AC_13_input_is_ignored_during_the_animation_which_lasts_under_half_a_second', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    click(3, 1);
    click(3, 2);
    click(2, 2);
    click(2, 2);

    click(0, 0);
    expect(game.chain()).toEqual([]);
    vi.advanceTimersByTime(FALL_DURATION_MS);
    render();
    click(0, 0);
    expect(game.chain()).toEqual([]);

    vi.advanceTimersByTime(FALL_DURATION_MS);
    render();
    expect(2 * FALL_DURATION_MS).toBeLessThan(500);
    finishComputerTurn();
    click(0, 0);
    expect(game.chain()).toEqual([{ row: 0, column: 0 }]);
  });

  it('AC_14_chain_dots_are_highlighted_and_joined_by_a_line_in_the_chain_color', () => {
    useBoard(MOCK_BOARD);
    const blue = COLOR_PALETTE[B];
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
    useBoard(ONE_MOVE_BOARD);
    pickedColors = [...ONLY_PAIRS_REFILL];
    click(6, 0);
    click(6, 1);
    click(6, 2);
    click(6, 2);
    expect(text('game-over')).toBeUndefined();

    finishAnimation();

    expect(game.gameOver()).toBe(true);
    expect(text('final-score')).toBe('30');
    expect(text('play-again')).toBe('Play again');
    const before = game.board();
    click(5, 0);
    expect(game.chain()).toEqual([]);
    expect(game.board()).toBe(before);
  });

  it('AC_15_game_continues_when_the_refill_leaves_a_valid_move', () => {
    useBoard(ONE_MOVE_BOARD);
    pickedColors = [...STILL_A_MOVE_REFILL];
    click(6, 0);
    click(6, 1);
    click(6, 2);
    click(6, 2);

    finishAnimation();

    expect(game.gameOver()).toBe(false);
    expect(text('game-over')).toBeUndefined();
  });

  it('AC_16_play_again_resets_score_and_deals_a_new_board', () => {
    useBoard(ONE_MOVE_BOARD);
    pickedColors = [...ONLY_PAIRS_REFILL];
    click(6, 0);
    click(6, 1);
    click(6, 2);
    click(6, 2);
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
    moveToPoint(102, 148); // between dots

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
    click(2, 2);
    expect(game.chain().length).toBe(3);

    press(2, 2);
    releasePointer();
    expect(game.chain()).toEqual([]);
    expect(text('score')).toBe('30');
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
    moveTo(2, 2);
    releasePointer();
    expect(text('score')).toBe('30');
    finishAnimation();
    finishComputerTurn();

    useBoard(MOCK_BOARD);
    click(3, 1);
    press(3, 2); // adjacent blue: added by the press
    expect(game.chain().length).toBe(2);
    moveTo(2, 2);
    releasePointer();
    expect(text('score')).toBe('60');
  });

  it('AC_9_release_outside_the_board_ends_the_chain', () => {
    useBoard(MOCK_BOARD);
    refillWithBlue();
    press(3, 1);
    moveTo(3, 2);
    moveTo(2, 2);
    moveToPoint(500, 500); // outside the board

    releasePointer();

    expect(text('score')).toBe('30');
  });

  it('AC_9_a_faint_line_runs_from_the_last_dot_to_the_pointer_while_dragging', () => {
    useBoard(MOCK_BOARD);
    press(3, 1);
    moveToPoint(156, 132);

    const line = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="drag-line"]');
    expect(line?.getAttribute('x1')).toBe('79');
    expect(line?.getAttribute('y1')).toBe('171');
    expect(line?.getAttribute('x2')).toBe('156');
    expect(line?.getAttribute('y2')).toBe('132');
    expect(line?.getAttribute('stroke')).toBe(COLOR_PALETTE[B]);

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
    click(2, 2);
    click(2, 2);

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
    click(2, 2);
    click(2, 2);

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
    key('ArrowUp');
    key('Enter');
    key('Enter'); // last dot of a 3-dot chain: cleared
    expect(text('score')).toBe('30');
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
    key('ArrowUp');
    key('Enter');
    key('Enter');

    finishAnimation();

    expect(focusCursor()).toBe('2,2');
  });

  it('AC_18_focus_cursor_starts_top_left_again_after_play_again', () => {
    useBoard(ONE_MOVE_BOARD);
    pickedColors = [...ONLY_PAIRS_REFILL];
    board().dispatchEvent(new FocusEvent('focus'));
    for (let i = 0; i < 6; i++) key('ArrowDown');
    key('Enter');
    key('ArrowRight');
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

  describe('DOTS-102', () => {
    /** MOCK_BOARD with some cells recolored. */
    function useMockBoardWith(changes: [number, number, number][]): void {
      const indexes = MOCK_BOARD.map((cells) => [...cells]);
      for (const [row, column, color] of changes) indexes[row][column] = color;
      useBoard(indexes);
    }

    function shakingDots(): string[] {
      return Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="dot"].shaking'),
      ).map((dot) => `${dot.getAttribute('data-row')},${dot.getAttribute('data-column')}`);
    }

    function chainLine(): Element | null {
      return (fixture.nativeElement as HTMLElement).querySelector('[data-testid="chain-line"]');
    }

    it('AC_1_clicking_a_diagonally_adjacent_dot_of_the_chain_color_adds_it', () => {
      useBoard(MOCK_BOARD);

      click(3, 1);
      click(2, 2); // up-right
      click(2, 3); // right
      click(1, 4); // up-right

      expect(game.chain()).toEqual([
        { row: 3, column: 1 },
        { row: 2, column: 2 },
        { row: 2, column: 3 },
        { row: 1, column: 4 },
      ]);
      expect(chainDots().sort()).toEqual(['1,4', '2,2', '2,3', '3,1']);
    });

    it('AC_1_all_four_diagonal_directions_add_a_dot', () => {
      useMockBoardWith([[4, 1, B], [5, 2, B], [4, 3, B], [2, 1, B], [3, 0, B]]);

      click(5, 0);
      click(4, 1); // up-right
      click(5, 2); // down-right
      click(4, 3); // up-right
      click(3, 2); // up-left
      click(2, 1); // up-left
      click(3, 0); // down-left

      expect(game.chain().length).toBe(7);
      expect(game.chain().at(-1)).toEqual({ row: 3, column: 0 });
    });

    it('AC_1_diagonal_dots_can_be_added_by_drag_and_by_keyboard', () => {
      useBoard(MOCK_BOARD);
      press(3, 1);
      moveTo(2, 2);
      expect(game.chain()).toEqual([
        { row: 3, column: 1 },
        { row: 2, column: 2 },
      ]);
      releasePointer();

      board().dispatchEvent(new FocusEvent('focus'));
      for (let i = 0; i < 3; i++) key('ArrowDown');
      key('ArrowRight');
      key('Enter');
      key('ArrowUp'); // the cursor moves one row or column per press
      key('ArrowRight');
      key('Enter');
      expect(game.chain()).toEqual([
        { row: 3, column: 1 },
        { row: 2, column: 2 },
      ]);
    });

    it('AC_2_dots_that_are_not_adjacent_are_ignored', () => {
      useMockBoardWith([[5, 4, B]]);
      click(3, 1);
      click(2, 2);
      click(3, 2);
      const before = game.chain();

      click(5, 4); // blue, two cells diagonally away
      click(3, 4); // two cells to the right
      click(1, 2); // two rows up

      expect(game.chain()).toEqual(before);
    });

    it('AC_2_no_wrap_around_across_the_board_edge', () => {
      useMockBoardWith([[1, 0, B], [6, 6, B]]);
      click(0, 6);

      click(1, 0); // start of the next row: other edge of the board
      click(6, 6); // bottom of the same column

      expect(game.chain()).toEqual([{ row: 0, column: 6 }]);
    });

    it('AC_3_a_diagonal_dot_of_another_color_is_ignored', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);
      click(3, 2);
      const before = game.chain();

      click(2, 1); // orange, up-left
      click(4, 3); // yellow, down-right
      click(4, 1); // pink, down-left

      expect(game.chain()).toEqual(before);
    });

    it('AC_4_a_dot_already_in_the_chain_is_not_added_again', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);
      click(3, 2);

      click(3, 1); // starting dot, adjacent to the last dot

      expect(game.chain()).toEqual([
        { row: 3, column: 1 },
        { row: 2, column: 2 },
        { row: 3, column: 2 },
      ]);

      click(2, 2); // the previous dot still steps back
      expect(game.chain().length).toBe(2);
    });

    it('AC_5_a_crossing_link_is_ignored', () => {
      useMockBoardWith([[3, 3, B]]);
      click(3, 2);
      click(2, 3); // up-right
      click(2, 2); // left

      click(3, 3); // down-right would cross the first link

      expect(game.chain()).toEqual([
        { row: 3, column: 2 },
        { row: 2, column: 3 },
        { row: 2, column: 2 },
      ]);
      expect(chainLine()?.getAttribute('points')).toBe('125,171 171,125 125,125');
    });

    it('AC_5_a_crossing_link_entered_during_a_drag_is_ignored', () => {
      useMockBoardWith([[3, 3, B]]);
      press(3, 2);
      moveTo(2, 3);
      moveTo(2, 2);

      moveTo(3, 3);

      expect(game.chain().length).toBe(3);
    });

    it('AC_6_ending_a_chain_of_3_dots_clears_it_and_scores_30_then_refills', () => {
      useBoard(MOCK_BOARD);
      refillWithBlue();
      const chainIds = [game.board()[3][1]!.id, game.board()[2][2]!.id, game.board()[2][3]!.id];
      click(3, 1);
      click(2, 2);
      click(2, 3);

      click(2, 3);

      expect(text('score')).toBe('30');
      expect(text('points-earned')).toBe('+30');
      const idsOnBoard = game.board().flat().map((dot) => dot?.id);
      for (const id of chainIds) expect(idsOnBoard).not.toContain(id);
      expect(shakingDots()).toEqual([]);
      finishAnimation();
      expect(game.board().flat().every((dot) => dot !== null)).toBe(true);
    });

    it('AC_6_releasing_a_drag_or_enter_on_the_last_dot_of_a_3_plus_chain_clears_it', () => {
      useBoard(MOCK_BOARD);
      refillWithBlue();
      press(3, 1);
      moveTo(2, 2);
      moveTo(2, 3);
      moveTo(1, 4);
      releasePointer();
      expect(text('score')).toBe('50');
      finishAnimation();
      finishComputerTurn();

      useBoard(MOCK_BOARD);
      board().dispatchEvent(new FocusEvent('focus'));
      for (let i = 0; i < 3; i++) key('ArrowDown');
      key('ArrowRight');
      key('Enter');
      key('ArrowRight');
      key('Enter');
      key('ArrowUp');
      key('Enter');
      key('Enter');
      expect(text('score')).toBe('80');
    });

    it('AC_7_ending_a_2_dot_chain_by_click_removes_nothing_and_shakes_its_dots', () => {
      useBoard(MOCK_BOARD);
      const before = game.board();
      click(3, 1);
      click(2, 2);

      click(2, 2);

      expect(game.chain()).toEqual([]);
      expect(chainDots()).toEqual([]);
      expect(chainLine()).toBeNull();
      expect(game.board()).toBe(before);
      expect(text('score')).toBe('0');
      expect(text('points-earned')).toBeUndefined();
      expect(game.animating()).toBe(false);
      expect(shakingDots().sort()).toEqual(['2,2', '3,1']);
      expect(dotAt(2, 2).querySelector('.fill')?.getAttribute('r')).toBe('13');

      vi.advanceTimersByTime(SHAKE_DURATION_MS);
      render();
      expect(shakingDots()).toEqual([]);
      expect(game.board()).toBe(before);
    });

    it('AC_7_the_shake_has_a_static_fallback_for_reduced_motion_and_no_text_hint', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(3, 2);
      click(3, 2);

      expect(dotAt(3, 1).querySelectorAll('.shake-ghost').length).toBe(2);
      expect(dotAt(3, 2).querySelectorAll('.shake-ghost').length).toBe(2);
      expect(dotAt(2, 2).querySelectorAll('.shake-ghost').length).toBe(0);
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Need');
    });

    it('AC_7_enter_on_the_last_dot_of_a_2_dot_chain_shakes_without_removing', () => {
      useBoard(MOCK_BOARD);
      const before = game.board();
      board().dispatchEvent(new FocusEvent('focus'));
      for (let i = 0; i < 3; i++) key('ArrowDown');
      key('ArrowRight');
      key('Enter');
      key('ArrowRight');
      key('Enter');

      key('Enter');

      expect(game.chain()).toEqual([]);
      expect(game.board()).toBe(before);
      expect(text('score')).toBe('0');
      expect(shakingDots().sort()).toEqual(['3,1', '3,2']);
    });

    it('AC_8_releasing_a_drag_with_2_dots_removes_nothing_and_shakes_its_dots', () => {
      useBoard(MOCK_BOARD);
      const before = game.board();
      press(3, 1);
      moveTo(2, 2);

      releasePointer();

      expect(game.chain()).toEqual([]);
      expect(game.board()).toBe(before);
      expect(text('score')).toBe('0');
      expect(game.animating()).toBe(false);
      expect(shakingDots().sort()).toEqual(['2,2', '3,1']);
    });

    it('AC_8_lifting_a_finger_after_a_2_dot_drag_shakes_its_dots', () => {
      useBoard(MOCK_BOARD);
      press(3, 1, 'touch');
      moveTo(3, 2, 'touch');

      releasePointer('touch');

      expect(text('score')).toBe('0');
      expect(shakingDots().sort()).toEqual(['3,1', '3,2']);
    });

    it('AC_9_ending_a_1_dot_chain_is_silent', () => {
      useBoard(MOCK_BOARD);
      const before = game.board();

      click(3, 1);
      click(3, 1);
      expect(game.chain()).toEqual([]);
      expect(shakingDots()).toEqual([]);

      press(3, 1);
      moveTo(3, 2);
      moveTo(3, 1); // step back to 1 dot
      releasePointer();
      expect(shakingDots()).toEqual([]);
      expect(game.board()).toBe(before);
      expect(text('score')).toBe('0');
    });

    it('AC_10_a_new_chain_can_start_during_the_shake_and_stops_it', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);
      click(2, 2);
      expect(shakingDots().length).toBe(2);

      click(4, 0);

      expect(game.chain()).toEqual([{ row: 4, column: 0 }]);
      expect(shakingDots()).toEqual([]);
    });

    it('AC_10_keyboard_input_is_accepted_during_the_shake', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);
      click(2, 2);
      board().dispatchEvent(new FocusEvent('focus'));

      key('ArrowDown');
      key('Enter');

      expect(game.focusCursor()).toEqual({ row: 1, column: 0 });
      expect(game.chain()).toEqual([{ row: 1, column: 0 }]);
    });

    it('AC_11_the_game_ends_when_only_pairs_are_left_after_a_refill', () => {
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [...ONLY_PAIRS_REFILL];
      click(6, 0);
      click(6, 1);
      click(6, 2);
      click(6, 2);

      finishAnimation();

      const top = game.board()[0];
      expect(top[2]!.color).toBe(top[3]!.color); // a pair is left
      expect(game.gameOver()).toBe(true);
      expect(text('final-score')).toBe('30');
    });

    it('AC_11_the_game_continues_when_three_dots_touch_only_diagonally', () => {
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [Y, P, G]; // green at 0,2 joins the greens at 1,1 and 1,3 diagonally
      click(6, 0);
      click(6, 1);
      click(6, 2);
      click(6, 2);

      finishAnimation();

      const board = game.board();
      expect([board[1][1], board[0][2], board[1][3]].map((dot) => dot!.color)).toEqual(
        Array(3).fill(COLOR_PALETTE[G]),
      );
      expect(board[1][2]!.color).not.toBe(COLOR_PALETTE[G]);
      expect(game.gameOver()).toBe(false);
    });

    it('AC_12_diagonal_links_are_drawn_center_to_center_like_straight_links', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);
      click(2, 3);
      click(1, 4);

      const line = chainLine();
      expect(line?.getAttribute('points')).toBe('79,171 125,125 171,125 217,79');
      expect(line?.getAttribute('stroke')).toBe(COLOR_PALETTE[B]);
      expect(line?.classList).toContain('chain-line');
      expect(line?.tagName).toBe('polyline');
    });

    it('AC_12_the_chain_line_is_drawn_under_the_dots_so_dots_stay_visible', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(2, 2);

      const firstDot = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="dot"]')!;
      expect(chainLine()!.compareDocumentPosition(firstDot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('AC_13_a_diagonal_drag_through_a_cell_corner_does_not_add_that_dot', () => {
      useBoard(MOCK_BOARD);
      press(3, 1);

      moveToPoint(102, 152); // corner of the blue dot's cell at 3,2, outside its dot circle
      expect(game.chain()).toEqual([{ row: 3, column: 1 }]);

      moveToPoint(125 + 9, 125 + 9); // inside the dot circle at 2,2
      expect(game.chain()).toEqual([
        { row: 3, column: 1 },
        { row: 2, column: 2 },
      ]);
    });

    it('AC_13_the_dot_circle_has_the_drawn_dot_radius', () => {
      useBoard(MOCK_BOARD);
      press(3, 1);

      moveToPoint(125 + 14, 171); // 14 px from the center of 3,2: outside
      expect(game.chain().length).toBe(1);
      moveToPoint(125 + 13, 171); // on the edge of the dot circle
      expect(game.chain().length).toBe(2);
    });

    it('AC_13_clicks_and_taps_still_target_the_whole_cell', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);

      pointer('pointerdown', dotAt(3, 2).querySelector('.cell')!);
      pointer('pointerup', document);
      pointer('pointerdown', dotAt(2, 2).querySelector('.cell')!, 'touch');
      pointer('pointerup', document, 'touch');

      expect(game.chain().length).toBe(3);
      const cell = dotAt(3, 2).querySelector('.cell')!;
      expect([cell.getAttribute('width'), cell.getAttribute('height')]).toEqual(['46', '46']);
    });
  });

  describe('DOTS-103', () => {
    /** Background of orange, green, pink and yellow in 2×2 tiles; only the listed cells are blue. */
    function blueAt(blueCells: [number, number][]): number[][] {
      return Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, column) =>
          blueCells.some(([r, c]) => r === row && c === column) ? B : 1 + (row % 2) * 2 + (column % 2),
        ),
      );
    }

    /** The known test board: its longest valid chain is the 5 blue dots from (3,1) to (6,4). */
    const KNOWN_TEST_BOARD = blueAt([[0, 0], [0, 1], [0, 2], [3, 1], [4, 2], [4, 3], [5, 4], [6, 4]]);
    const KNOWN_COMPUTER_MOVE = [[3, 1], [4, 2], [4, 3], [5, 4], [6, 4]].map(([row, column]) => ({ row, column }));

    function root(): HTMLElement {
      return fixture.nativeElement as HTMLElement;
    }

    function isActive(testId: string): boolean {
      return root().querySelector(`[data-testid="${testId}"]`)!.classList.contains('active');
    }

    /** The player clears the 3 blue dots of MOCK_BOARD for 30 points; refills are blue. */
    function playerClearsThreeDots(): void {
      useBoard(MOCK_BOARD);
      refillWithBlue();
      click(3, 1);
      click(3, 2);
      click(2, 2);
      click(2, 2);
    }

    function advance(ms: number): void {
      vi.advanceTimersByTime(ms);
      render();
    }

    function playAgain(): void {
      root().querySelector<HTMLButtonElement>('[data-testid="play-again"]')!.click();
      render();
    }

    it('AC_1_new_game_shows_both_scores_at_0_and_the_players_turn', () => {
      expect(text('score')).toBe('0');
      expect(text('computer-score')).toBe('0');
      expect(text('turn-indicator')).toBe('Your turn');
      expect(isActive('player-side')).toBe(true);
      expect(isActive('computer-side')).toBe(false);
      expect(root().querySelectorAll('[data-testid="dot"]').length).toBe(49);
      expect(root().textContent).not.toMatch(/solo/i);
      click(0, 0);
      expect(game.chain()).toEqual([{ row: 0, column: 0 }]);
    });

    it('AC_2_clearing_a_3_plus_chain_scores_for_the_player_and_after_the_refill_it_is_the_computers_turn', () => {
      playerClearsThreeDots();

      expect(text('score')).toBe('30');
      expect(text('computer-score')).toBe('0');
      expect(text('points-earned')).toBe('+30');
      expect(text('turn-indicator')).toBe('Your turn');

      finishAnimation();

      expect(text('turn-indicator')).toBe('Computer’s turn…');
      expect(game.turn()).toBe('computer');
    });

    it('AC_2_the_player_can_clear_a_chain_by_drag_and_by_keyboard', () => {
      useBoard(MOCK_BOARD);
      refillWithBlue();
      press(3, 1);
      moveTo(3, 2);
      moveTo(2, 2);
      releasePointer();
      expect(text('score')).toBe('30');
      finishAnimation();
      finishComputerTurn();

      useBoard(MOCK_BOARD);
      board().dispatchEvent(new FocusEvent('focus'));
      game.focusCursor.set({ row: 3, column: 1 });
      key('Enter');
      key('ArrowRight');
      key('Enter');
      key('ArrowUp');
      key('Enter');
      key('Enter');
      expect(Number(text('score'))).toBe(60);
    });

    it('AC_3_ending_a_1_or_2_dot_chain_keeps_the_players_turn', () => {
      useBoard(MOCK_BOARD);
      click(3, 1);
      click(3, 2);
      click(3, 2);

      expect(root().querySelectorAll('[data-testid="dot"].shaking').length).toBe(2);
      click(0, 0);
      click(0, 0);
      advance(5000);

      expect(game.turn()).toBe('player');
      expect(text('turn-indicator')).toBe('Your turn');
      expect(text('score')).toBe('0');
      expect(text('computer-score')).toBe('0');
      click(3, 1);
      expect(game.chain()).toEqual([{ row: 3, column: 1 }]);
    });

    it('AC_4_turns_alternate_and_each_turn_clears_exactly_one_chain', () => {
      playerClearsThreeDots();
      finishAnimation();
      expect(game.turn()).toBe('computer');

      useBoard(KNOWN_TEST_BOARD);
      finishComputerTurn();
      expect(game.turn()).toBe('player');
      expect(text('computer-score')).toBe('70');

      advance(10_000);
      expect(game.turn()).toBe('player');
      expect(text('computer-score')).toBe('70');

      playerClearsThreeDots();
      finishAnimation();
      expect(game.turn()).toBe('computer');
      expect(text('score')).toBe('60');
    });

    it('AC_5_both_scores_stay_visible_and_change_only_for_the_side_that_cleared', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(KNOWN_TEST_BOARD);
      advance(COMPUTER_PAUSE_MS + COMPUTER_DRAW_MS / 2);

      expect(text('points-earned')).toBeUndefined();
      expect(text('score')).toBe('30');
      expect(text('computer-score')).toBe('0');

      advance(COMPUTER_DRAW_MS / 2 + COMPUTER_HOLD_MS);

      expect(text('score')).toBe('30');
      expect(text('computer-score')).toBe('70');
      expect(text('computer-points-earned')).toBe('+70');
      expect(text('points-earned')).toBeUndefined();
    });

    it('AC_6_the_turn_indicator_shows_whose_turn_it_is', () => {
      expect(text('turn-indicator')).toBe('Your turn');

      playerClearsThreeDots();
      finishAnimation();
      expect(text('turn-indicator')).toBe('Computer’s turn…');
      expect(isActive('computer-side')).toBe(true);
      expect(isActive('player-side')).toBe(false);

      useBoard(KNOWN_TEST_BOARD);
      advance(COMPUTER_PAUSE_MS + COMPUTER_DRAW_MS + COMPUTER_HOLD_MS + FALL_DURATION_MS);
      expect(text('turn-indicator')).toBe('Computer’s turn…');

      advance(FALL_DURATION_MS);
      expect(text('turn-indicator')).toBe('Your turn');
      expect(isActive('player-side')).toBe(true);
      expect(isActive('computer-side')).toBe(false);
    });

    it('AC_7_clicks_taps_drags_and_enter_are_ignored_during_the_computers_turn', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(KNOWN_TEST_BOARD);
      expect(board().classList.contains('blocked')).toBe(true);

      click(0, 0);
      click(0, 0, 'touch');
      press(0, 0);
      moveTo(0, 1);
      releasePointer();
      board().dispatchEvent(new FocusEvent('focus'));
      key('Enter');
      key(' ');
      expect(game.chain()).toEqual([]);

      advance(COMPUTER_PAUSE_MS);
      click(0, 0);
      expect(game.chain()).toEqual([{ row: 3, column: 1 }]);
      expect(text('score')).toBe('30');
    });

    it('AC_7_arrow_keys_still_move_the_focus_cursor_during_the_computers_turn', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(KNOWN_TEST_BOARD);
      board().dispatchEvent(new FocusEvent('focus'));

      key('ArrowDown');
      expect(focusCursor()).toBe('1,0');

      advance(COMPUTER_PAUSE_MS + COMPUTER_DRAW_MS + COMPUTER_HOLD_MS); // the computer's refill animation runs
      key('ArrowRight');
      expect(focusCursor()).toBe('1,1');
    });

    it('AC_8_the_computer_plays_the_longest_chain_on_the_known_test_board', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(KNOWN_TEST_BOARD);

      advance(COMPUTER_PAUSE_MS + COMPUTER_DRAW_MS);

      expect(game.chain()).toEqual(KNOWN_COMPUTER_MOVE);
      advance(COMPUTER_HOLD_MS);
      expect(text('computer-score')).toBe('70');
    });

    it('AC_10_the_computer_move_is_drawn_dot_by_dot_over_1_second_then_held_and_cleared', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(KNOWN_TEST_BOARD);
      const ids = KNOWN_COMPUTER_MOVE.map(({ row, column }) => game.board()[row][column]!.id);

      advance(COMPUTER_PAUSE_MS - 1);
      expect(chainDots()).toEqual([]);
      advance(1);
      expect(chainDots()).toEqual(['3,1']);
      for (let n = 2; n <= 5; n++) {
        advance(COMPUTER_DRAW_MS / 4);
        expect(chainDots().length).toBe(n);
      }
      expect(COMPUTER_PAUSE_MS).toBe(400);
      expect(COMPUTER_DRAW_MS).toBe(1000);
      expect(COMPUTER_HOLD_MS).toBe(300);
      const line = root().querySelector('[data-testid="chain-line"]');
      expect(line?.getAttribute('stroke')).toBe(COLOR_PALETTE[B]);
      expect(line?.getAttribute('points')?.split(' ').length).toBe(5);

      advance(COMPUTER_HOLD_MS - 1);
      expect(chainDots().length).toBe(5);
      expect(text('computer-score')).toBe('0');

      advance(1);
      expect(chainDots()).toEqual([]);
      expect(text('computer-score')).toBe('70');
      const remaining = new Set(game.board().flat().map((dot) => dot?.id));
      expect(ids.some((id) => remaining.has(id))).toBe(false);

      finishAnimation();
      expect(game.board().flat().every((dot) => dot !== null)).toBe(true);
      expect(game.turn()).toBe('player');
    });

    it('AC_11_no_valid_move_after_the_players_refill_ends_the_game_and_the_computer_makes_no_move', () => {
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [...ONLY_PAIRS_REFILL];
      click(6, 0);
      click(6, 1);
      click(6, 2);
      click(6, 2);
      finishAnimation();

      expect(game.gameOver()).toBe(true);
      advance(10_000);
      expect(text('computer-score')).toBe('0');
      expect(game.chain()).toEqual([]);
      expect(text('turn-indicator')).toBe('Game over');
      expect(isActive('player-side') || isActive('computer-side')).toBe(false);
      click(5, 0);
      expect(game.chain()).toEqual([]);
    });

    it('AC_11_no_valid_move_after_the_computers_refill_ends_the_game', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [...ONLY_PAIRS_REFILL];

      finishComputerTurn();

      expect(text('computer-score')).toBe('30');
      expect(game.gameOver()).toBe(true);
      expect(text('game-over')).toBeDefined();
      click(0, 0);
      expect(game.chain()).toEqual([]);
    });

    it('AC_12_the_result_view_shows_both_final_scores_and_the_outcome', () => {
      const cases: [number, number, string][] = [
        [340, 290, 'You win'],
        [260, 310, 'Computer wins'],
        [300, 300, 'Draw'],
      ];
      for (const [playerScore, computerScore, outcome] of cases) {
        game.playerScore.set(playerScore);
        game.computerScore.set(computerScore);
        game.gameOver.set(true);
        render();

        expect(text('outcome')).toBe(outcome);
        expect(text('final-score')).toBe(String(playerScore));
        expect(text('final-computer-score')).toBe(String(computerScore));
      }
    });

    it('AC_12_a_real_game_ending_in_a_draw_shows_draw', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [...ONLY_PAIRS_REFILL];
      finishComputerTurn();

      expect(text('outcome')).toBe('Draw');
    });

    it('AC_13_play_again_starts_a_new_game_against_the_computer', () => {
      playerClearsThreeDots();
      finishAnimation();
      useBoard(ONE_MOVE_BOARD);
      pickedColors = [...ONLY_PAIRS_REFILL];
      finishComputerTurn();
      const oldIds = new Set(game.board().flat().map((dot) => dot!.id));
      expect(text('play-again')).toBe('Play again');

      playAgain();

      expect(text('game-over')).toBeUndefined();
      expect(text('score')).toBe('0');
      expect(text('computer-score')).toBe('0');
      expect(text('turn-indicator')).toBe('Your turn');
      expect(game.board().flat().some((dot) => oldIds.has(dot!.id))).toBe(false);
      click(0, 0);
      expect(game.chain()).toEqual([{ row: 0, column: 0 }]);
    });
  });
});
