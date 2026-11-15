import { PetState, ALLOWED_TRANSITIONS, STATE_CONFIGS } from '../types/pet';

export type StateListener = (state: PetState, prevState: PetState) => void;

export interface StateMachineOptions {
  idleSleepEnabled: boolean;
  wanderingEnabled: boolean;
  animationSpeed: number; // default 1.0
  idleSleepTimeoutMs?: number; // default 45000 (45s)
  onStateChange?: StateListener;
}

export class PetStateMachine {
  private currentState: PetState = 'idle';
  private previousState: PetState = 'idle';
  private stateTimer: number | null = null;
  private naturalTimer: number | null = null;
  private idleSleepTimer: number | null = null;
  private listeners: StateListener[] = [];

  public idleSleepEnabled: boolean;
  public wanderingEnabled: boolean;
  public animationSpeed: number;
  private idleSleepTimeoutMs: number;

  constructor(options: StateMachineOptions) {
    this.idleSleepEnabled = options.idleSleepEnabled;
    this.wanderingEnabled = options.wanderingEnabled;
    this.animationSpeed = options.animationSpeed || 1.0;
    this.idleSleepTimeoutMs = options.idleSleepTimeoutMs || 45000;

    if (options.onStateChange) {
      this.listeners.push(options.onStateChange);
    }

    this.startNaturalBehaviors();
    this.resetIdleSleepTimer();
  }

  public getState(): PetState {
    return this.currentState;
  }

  public getPreviousState(): PetState {
    return this.previousState;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(newState: PetState, oldState: PetState) {
    for (const listener of this.listeners) {
      listener(newState, oldState);
    }
  }

  public canTransitionTo(nextState: PetState): boolean {
    if (this.currentState === nextState) return true;
    const allowed = ALLOWED_TRANSITIONS[this.currentState] || [];
    return allowed.includes(nextState);
  }

  public transitionTo(nextState: PetState, force: boolean = false): boolean {
    if (this.currentState === nextState) return true;

    if (!force && !this.canTransitionTo(nextState)) {
      // Transition not allowed by state rules
      return false;
    }

    const prevState = this.currentState;
    this.currentState = nextState;
    this.previousState = prevState;

    this.clearStateTimer();

    const config = STATE_CONFIGS[nextState];
    if (config.durationMs > 0 && !config.loop) {
      const adjustedDuration = Math.round(config.durationMs / Math.max(0.5, this.animationSpeed));
      this.stateTimer = setTimeout(() => {
        this.transitionTo('idle', true);
      }, adjustedDuration) as unknown as number;
    }

    this.notify(nextState, prevState);
    return true;
  }

  // --- Interaction Triggers ---

  public handleClick(): void {
    this.resetIdleSleepTimer();
    if (this.currentState === 'sleep') {
      this.transitionTo('wake', true);
      return;
    }

    if (this.currentState === 'idle' || this.currentState === 'blink' || this.currentState === 'curious') {
      // 70% chance happy, 30% surprised
      const next = Math.random() < 0.7 ? 'happy' : 'surprised';
      this.transitionTo(next, true);
    }
  }

  public handleFeed(): void {
    this.resetIdleSleepTimer();
    if (this.currentState === 'sleep') {
      this.transitionTo('wake', true);
      setTimeout(() => {
        this.transitionTo('eat', true);
      }, 600);
      return;
    }
    this.transitionTo('eat', true);
  }

  public handleStartDrag(): void {
    this.resetIdleSleepTimer();
    this.transitionTo('dragged', true);
  }

  public handleEndDrag(): void {
    this.resetIdleSleepTimer();
    if (this.currentState === 'dragged') {
      this.transitionTo('land', true);
    }
  }

  public toggleSleep(): void {
    this.resetIdleSleepTimer();
    if (this.currentState === 'sleep') {
      this.transitionTo('wake', true);
    } else {
      this.transitionTo('sleep', true);
    }
  }

  // --- Natural Autonomous Behaviors ---

  private startNaturalBehaviors(): void {
    this.scheduleNextNaturalAction();
  }

  private scheduleNextNaturalAction(): void {
    if (this.naturalTimer) {
      clearTimeout(this.naturalTimer);
    }

    // Schedule next autonomous action between 3.5s and 8s
    const delay = Math.floor(Math.random() * 4500) + 3500;
    this.naturalTimer = setTimeout(() => {
      this.performNaturalAction();
      this.scheduleNextNaturalAction();
    }, delay) as unknown as number;
  }

  private performNaturalAction(): void {
    if (this.currentState !== 'idle') {
      return;
    }

    const roll = Math.random();
    if (roll < 0.50) {
      // 50% blink
      this.transitionTo('blink');
    } else if (roll < 0.80) {
      // 30% curious glance
      this.transitionTo('curious');
    } else if (this.wanderingEnabled && roll < 0.95) {
      // 15% wander walk
      this.transitionTo('walk');
    }
  }

  private resetIdleSleepTimer(): void {
    if (this.idleSleepTimer) {
      clearTimeout(this.idleSleepTimer);
      this.idleSleepTimer = null;
    }

    if (!this.idleSleepEnabled) return;

    this.idleSleepTimer = setTimeout(() => {
      if (this.currentState === 'idle' || this.currentState === 'blink' || this.currentState === 'curious') {
        this.transitionTo('sleep', true);
      } else if (this.currentState !== 'sleep') {
        this.resetIdleSleepTimer();
      }
    }, this.idleSleepTimeoutMs) as unknown as number;
  }

  private clearStateTimer(): void {
    if (this.stateTimer) {
      clearTimeout(this.stateTimer);
      this.stateTimer = null;
    }
  }

  public destroy(): void {
    this.clearStateTimer();
    if (this.naturalTimer) {
      clearTimeout(this.naturalTimer);
      this.naturalTimer = null;
    }
    if (this.idleSleepTimer) {
      clearTimeout(this.idleSleepTimer);
      this.idleSleepTimer = null;
    }
    this.listeners = [];
  }
}
