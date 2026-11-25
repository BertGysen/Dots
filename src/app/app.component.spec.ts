import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('AC_16_loading_the_page_starts_a_new_game_and_saves_nothing', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const harness = await RouterTestingHarness.create('/');
    const page = harness.routeNativeElement as HTMLElement;

    expect(page.querySelectorAll('[data-testid="dot"]').length).toBe(49);
    expect(page.querySelector('[data-testid="score"]')?.textContent?.trim()).toBe('0');

    page
      .querySelector<SVGGElement>('[data-testid="dot"]')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    harness.detectChanges();
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it('AC_1_opening_the_page_starts_a_game_against_the_computer_with_the_players_turn', async () => {
    const harness = await RouterTestingHarness.create('/');
    const page = harness.routeNativeElement as HTMLElement;
    const text = (testId: string) => page.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();

    expect(page.querySelectorAll('[data-testid="dot"]').length).toBe(49);
    expect(text('score')).toBe('0');
    expect(text('computer-score')).toBe('0');
    expect(text('turn-indicator')).toBe('Your turn');
  });
});
