import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PetStateMachine } from '../src/pet/state-machine';
import { ALLOWED_TRANSITIONS } from '../src/types/pet';

describe('PetStateMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes in idle state', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    expect(sm.getState()).toBe('idle');
    sm.destroy();
  });

  it('allows valid transitions from idle according to transition matrix', () => {
    const allowed = ALLOWED_TRANSITIONS['idle'];
    for (const next of allowed) {
      const sm = new PetStateMachine({
        idleSleepEnabled: true,
        wanderingEnabled: true,
        animationSpeed: 1.0
      });
      expect(sm.canTransitionTo(next)).toBe(true);
      const ok = sm.transitionTo(next);
      expect(ok).toBe(true);
      expect(sm.getState()).toBe(next);
      sm.destroy();
    }
  });

  it('rejects disallowed transitions without force', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    // Put into sleep state
    sm.transitionTo('sleep', true);
    expect(sm.getState()).toBe('sleep');

    // Trying to walk while sleeping should be rejected
    const ok = sm.transitionTo('walk', false);
    expect(ok).toBe(false);
    expect(sm.getState()).toBe('sleep');

    sm.destroy();
  });

  it('drag and drop flow: dragged -> land -> idle', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    sm.handleStartDrag();
    expect(sm.getState()).toBe('dragged');

    sm.handleEndDrag();
    expect(sm.getState()).toBe('land');

    // Fast forward landing animation duration (600ms)
    vi.advanceTimersByTime(650);
    expect(sm.getState()).toBe('idle');

    sm.destroy();
  });

  it('click wakes sleeping pet', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    sm.transitionTo('sleep', true);
    expect(sm.getState()).toBe('sleep');

    sm.handleClick();
    expect(sm.getState()).toBe('wake');

    // Wake finishes (1200ms)
    vi.advanceTimersByTime(1250);
    expect(sm.getState()).toBe('idle');

    sm.destroy();
  });

  it('feed triggers eat state and returns to idle', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    sm.handleFeed();
    expect(sm.getState()).toBe('eat');

    // Eat animation is 2000ms
    vi.advanceTimersByTime(2050);
    expect(sm.getState()).toBe('idle');

    sm.destroy();
  });

  it('idle sleep triggers automatically after timeout', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: false,
      animationSpeed: 1.0,
      idleSleepTimeoutMs: 10000 // 10s
    });

    expect(sm.getState()).toBe('idle');

    // Advance 10 seconds
    vi.advanceTimersByTime(10500);
    expect(sm.getState()).toBe('sleep');

    sm.destroy();
  });

  it('properly cleans up timers on destroy', () => {
    const sm = new PetStateMachine({
      idleSleepEnabled: true,
      wanderingEnabled: true,
      animationSpeed: 1.0
    });

    sm.destroy();
    // No timers should trigger errors after destroy
    vi.advanceTimersByTime(60000);
    expect(sm.getState()).toBe('idle');
  });
});
