import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BOARD_SIZE, Dot, Position } from './board.model';
import { FocusCursorDirection, GameService } from './game.service';

const CELL_SIZE = 46;
const BOARD_PADDING = 33;
const DOT_RADIUS = 13;

const ARROW_KEYS: Record<string, FocusCursorDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

interface BoardCell extends Position {
  readonly dot: Dot;
  readonly inChain: boolean;
  readonly shaking: boolean;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:pointermove)': 'onPointerMove($event)',
    '(document:pointerup)': 'onPointerUp()',
    '(document:pointercancel)': 'onPointerUp()',
  },
})
export class GameComponent {
  protected readonly game = inject(GameService);
  private readonly boardElement = viewChild.required<ElementRef<SVGSVGElement>>('board');

  protected readonly boardPixels = BOARD_PADDING * 2 + CELL_SIZE * (BOARD_SIZE - 1);
  protected readonly cellSize = CELL_SIZE;
  protected readonly dotRadius = DOT_RADIUS;

  protected readonly keyboardFocus = signal(false);
  protected readonly pointer = signal<Point | null>(null);
  private pointerDownOnBoard = false;

  protected readonly cells = computed<BoardCell[]>(() => {
    const chain = this.game.chain();
    const shakingDots = this.game.shakingDots();
    const cells: BoardCell[] = [];
    this.game.board().forEach((dots, row) =>
      dots.forEach((dot, column) => {
        if (!dot) return;
        const inChain = chain.some((p) => p.row === row && p.column === column);
        const shaking = shakingDots.some((p) => p.row === row && p.column === column);
        cells.push({ dot, row, column, inChain, shaking });
      }),
    );
    return cells;
  });

  protected readonly emptyCells = computed<Position[]>(() => {
    const empty: Position[] = [];
    this.game.board().forEach((dots, row) =>
      dots.forEach((dot, column) => {
        if (!dot) empty.push({ row, column });
      }),
    );
    return empty;
  });

  protected readonly chainLine = computed(() =>
    this.game
      .chain()
      .map((p) => `${this.x(p.column)},${this.y(p.row)}`)
      .join(' '),
  );

  protected readonly dragLine = computed(() => {
    const lastDot = this.game.chain().at(-1);
    const pointer = this.pointer();
    if (!this.game.dragging() || !lastDot || !pointer) return null;
    return { x1: this.x(lastDot.column), y1: this.y(lastDot.row), x2: pointer.x, y2: pointer.y };
  });

  protected x(column: number): number {
    return BOARD_PADDING + column * CELL_SIZE;
  }

  protected y(row: number): number {
    return BOARD_PADDING + row * CELL_SIZE;
  }

  protected onBoardPointerDown(): void {
    this.pointerDownOnBoard = true;
    this.keyboardFocus.set(false);
  }

  protected onDotPointerDown(event: PointerEvent, position: Position): void {
    if (event.button !== 0) return;
    this.game.pressDot(position);
    this.pointer.set(this.toBoardPoint(event));
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.game.dragging()) return;
    const point = this.toBoardPoint(event);
    this.pointer.set(point);
    const position = point && this.dotCircleAt(point);
    if (position) this.game.enterDot(position);
  }

  protected onPointerUp(): void {
    this.pointerDownOnBoard = false;
    this.pointer.set(null);
    this.game.release();
  }

  protected onBoardFocus(): void {
    // Focus that arrives while a pointer is pressed on the board came from a click or tap, not Tab.
    this.keyboardFocus.set(!this.pointerDownOnBoard);
  }

  protected onBoardBlur(): void {
    this.keyboardFocus.set(false);
  }

  protected onBoardKeydown(event: KeyboardEvent): void {
    const direction = ARROW_KEYS[event.key];
    if (direction) {
      event.preventDefault();
      if (this.game.animating() || this.game.gameOver()) return;
      this.keyboardFocus.set(true);
      this.game.moveFocusCursor(direction);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.game.selectFocusedDot();
    }
  }

  /**
   * During a drag only the dot circle counts, not the whole cell, so a diagonal drag that cuts
   * through the corners of neighboring cells does not pick up those dots.
   */
  private dotCircleAt(point: Point): Position | null {
    const column = Math.round((point.x - BOARD_PADDING) / CELL_SIZE);
    const row = Math.round((point.y - BOARD_PADDING) / CELL_SIZE);
    if (row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE) return null;
    const distance = Math.hypot(point.x - this.x(column), point.y - this.y(row));
    return distance <= DOT_RADIUS ? { row, column } : null;
  }

  private toBoardPoint(event: PointerEvent): Point | null {
    const rect = this.boardElement().nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left) * this.boardPixels) / rect.width,
      y: ((event.clientY - rect.top) * this.boardPixels) / rect.height,
    };
  }
}
