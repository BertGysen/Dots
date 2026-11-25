import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import {
  BOARD_SIZE,
  Board,
  MINIMUM_CHAIN_LENGTH,
  Position,
  RandomSource,
  applyGravity,
  chainScore,
  clear,
  deal,
  findComputerMove,
  hasValidMove,
  isAdjacent,
  isCrossingLink,
  isSamePosition,
  refill,
} from './board.model';

export const RANDOM_SOURCE = new InjectionToken<RandomSource>('RANDOM_SOURCE', {
  providedIn: 'root',
  factory: () => Math.random,
});

/** Gravity and refill each take this long, keeping the whole animation under 0.5 s. */
export const FALL_DURATION_MS = 200;

/** How long the points just earned stay next to the score. */
export const POINTS_EARNED_DURATION_MS = 1000;

/** How long the dots of a too-short chain shake. */
export const SHAKE_DURATION_MS = 300;

/** Pause between the end of the player's refill and the computer's first dot. */
export const COMPUTER_PAUSE_MS = 400;

/** The computer's chain is drawn dot by dot over this time in total. */
export const COMPUTER_DRAW_MS = 1000;

/** How long the computer's full chain stays visible before it is cleared. */
export const COMPUTER_HOLD_MS = 300;

export type FocusCursorDirection = 'up' | 'down' | 'left' | 'right';

export type Side = 'player' | 'computer';

export type Outcome = 'You win' | 'Computer wins' | 'Draw';

export interface PointsEarned {
  readonly side: Side;
  readonly points: number;
}

interface Drag {
  readonly pressedDot: Position;
  readonly pressedLastDot: boolean;
  enteredOtherDot: boolean;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly random = inject(RANDOM_SOURCE);

  readonly board = signal<Board>(deal(this.random));
  readonly chain = signal<readonly Position[]>([]);
  readonly playerScore = signal(0);
  readonly computerScore = signal(0);
  readonly turn = signal<Side>('player');
  readonly pointsEarned = signal<PointsEarned | null>(null);
  readonly animating = signal(false);
  readonly gameOver = signal(false);
  readonly focusCursor = signal<Position>({ row: 0, column: 0 });
  readonly dragging = signal(false);
  readonly shakingDots = signal<readonly Position[]>([]);

  readonly chainColor = computed(() => {
    const startingDot = this.chain()[0];
    return startingDot ? this.board()[startingDot.row][startingDot.column]?.color : undefined;
  });

  readonly outcome = computed<Outcome>(() => {
    const difference = this.playerScore() - this.computerScore();
    return difference > 0 ? 'You win' : difference < 0 ? 'Computer wins' : 'Draw';
  });

  private drag: Drag | null = null;
  private pointsEarnedTimer?: ReturnType<typeof setTimeout>;
  private shakeTimer?: ReturnType<typeof setTimeout>;
  private turnTimers: ReturnType<typeof setTimeout>[] = [];

  newGame(): void {
    clearTimeout(this.pointsEarnedTimer);
    this.turnTimers.forEach(clearTimeout);
    this.turnTimers = [];
    this.stopShake();
    this.board.set(deal(this.random));
    this.chain.set([]);
    this.playerScore.set(0);
    this.computerScore.set(0);
    this.turn.set('player');
    this.animating.set(false);
    this.pointsEarned.set(null);
    this.gameOver.set(false);
    this.focusCursor.set({ row: 0, column: 0 });
    this.endDrag();
  }

  selectDot(position: Position): void {
    if (!this.acceptsInput()) return;
    const lastDot = this.chain().at(-1);
    if (lastDot && isSamePosition(position, lastDot)) {
      this.endChain();
    } else {
      this.extendChain(position);
    }
  }

  pressDot(position: Position): void {
    if (!this.acceptsInput()) return;
    const lastDot = this.chain().at(-1);
    const pressedLastDot = !!lastDot && isSamePosition(position, lastDot);
    // Pressing the last dot only continues the chain; whether it ends it depends on the release.
    if (!pressedLastDot) this.extendChain(position);
    this.drag = { pressedDot: position, pressedLastDot, enteredOtherDot: false };
    this.dragging.set(true);
  }

  enterDot(position: Position): void {
    if (!this.drag || !this.acceptsInput()) return;
    if (!isSamePosition(position, this.drag.pressedDot)) this.drag.enteredOtherDot = true;
    const lastDot = this.chain().at(-1);
    if (lastDot && isSamePosition(position, lastDot)) return;
    this.extendChain(position);
  }

  release(): void {
    const drag = this.drag;
    this.endDrag();
    if (!drag || !this.acceptsInput()) return;
    if (drag.enteredOtherDot || drag.pressedLastDot) this.endChain();
  }

  moveFocusCursor(direction: FocusCursorDirection): void {
    if (!this.acceptsArrowKeys()) return;
    const { row, column } = this.focusCursor();
    const clamp = (n: number) => Math.min(BOARD_SIZE - 1, Math.max(0, n));
    this.focusCursor.set({
      row: clamp(row + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0)),
      column: clamp(column + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0)),
    });
  }

  selectFocusedDot(): void {
    this.selectDot(this.focusCursor());
  }

  private acceptsInput(): boolean {
    return !this.animating() && !this.gameOver() && this.turn() === 'player';
  }

  /** Arrow keys stay usable during the whole computer's turn, so a keyboard player can prepare. */
  acceptsArrowKeys(): boolean {
    return !this.gameOver() && (this.turn() === 'computer' || !this.animating());
  }

  private endDrag(): void {
    this.drag = null;
    this.dragging.set(false);
  }

  /** Starts, adds to or steps back the chain; anything else is ignored. */
  private extendChain(position: Position): void {
    const chain = this.chain();
    const lastDot = chain.at(-1);
    if (!lastDot) {
      this.stopShake();
      this.chain.set([position]);
      return;
    }

    const previousDot = chain.at(-2);
    if (previousDot && isSamePosition(position, previousDot)) {
      this.chain.set(chain.slice(0, -1));
      return;
    }

    const alreadyInChain = chain.some((dot) => isSamePosition(dot, position));
    const color = this.board()[position.row][position.column]?.color;
    if (
      !alreadyInChain &&
      isAdjacent(position, lastDot) &&
      color === this.chainColor() &&
      !isCrossingLink(chain, position)
    ) {
      this.chain.set([...chain, position]);
    }
  }

  private endChain(): void {
    const chain = this.chain();
    this.chain.set([]);
    if (chain.length < MINIMUM_CHAIN_LENGTH) {
      // A 1-dot chain is how a player cancels a selection, so only longer too-short chains shake.
      if (chain.length > 1) this.shake(chain);
      return;
    }
    this.clearChain('player', chain);
  }

  /** Removes the chain, scores it for `side`, and after gravity and refill ends that side's turn. */
  private clearChain(side: Side, chain: readonly Position[]): void {
    this.chain.set([]);
    const points = chainScore(chain.length);
    (side === 'player' ? this.playerScore : this.computerScore).update((score) => score + points);
    this.showPointsEarned(side, points);

    this.animating.set(true);
    this.board.set(applyGravity(clear(this.board(), chain)));
    this.after(FALL_DURATION_MS, () => {
      this.board.set(refill(this.board(), this.random));
      this.after(FALL_DURATION_MS, () => {
        this.animating.set(false);
        if (!hasValidMove(this.board())) {
          this.gameOver.set(true);
          return;
        }
        if (side === 'player') {
          this.turn.set('computer');
          this.after(COMPUTER_PAUSE_MS, () => this.playComputerMove());
        } else {
          this.turn.set('player');
        }
      });
    });
  }

  private playComputerMove(): void {
    const computerMove = findComputerMove(this.board());
    if (computerMove.length === 0) {
      this.gameOver.set(true);
      return;
    }
    const step = COMPUTER_DRAW_MS / (computerMove.length - 1);
    this.chain.set(computerMove.slice(0, 1));
    for (let i = 1; i < computerMove.length; i++) {
      this.after(i * step, () => this.chain.set(computerMove.slice(0, i + 1)));
    }
    this.after(COMPUTER_DRAW_MS + COMPUTER_HOLD_MS, () => this.clearChain('computer', computerMove));
  }

  private after(ms: number, action: () => void): void {
    const timer = setTimeout(() => {
      this.turnTimers = this.turnTimers.filter((t) => t !== timer);
      action();
    }, ms);
    this.turnTimers.push(timer);
  }

  private shake(dots: readonly Position[]): void {
    clearTimeout(this.shakeTimer);
    this.shakingDots.set(dots);
    this.shakeTimer = setTimeout(() => this.shakingDots.set([]), SHAKE_DURATION_MS);
  }

  private stopShake(): void {
    clearTimeout(this.shakeTimer);
    this.shakingDots.set([]);
  }

  private showPointsEarned(side: Side, points: number): void {
    clearTimeout(this.pointsEarnedTimer);
    this.pointsEarned.set({ side, points });
    this.pointsEarnedTimer = setTimeout(() => this.pointsEarned.set(null), POINTS_EARNED_DURATION_MS);
  }
}
