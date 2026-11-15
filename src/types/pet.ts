export type PetState =
  | 'idle'
  | 'blink'
  | 'curious'
  | 'happy'
  | 'walk'
  | 'eat'
  | 'sleep'
  | 'wake'
  | 'surprised'
  | 'dragged'
  | 'land';

export interface PetStateConfig {
  name: PetState;
  durationMs: number; // Duration of animation if temporary, or 0 if continuous/indefinite
  loop: boolean;
  canInterrupt: boolean;
}

export const STATE_CONFIGS: Record<PetState, PetStateConfig> = {
  idle: { name: 'idle', durationMs: 0, loop: true, canInterrupt: true },
  blink: { name: 'blink', durationMs: 800, loop: false, canInterrupt: true },
  curious: { name: 'curious', durationMs: 1600, loop: false, canInterrupt: true },
  happy: { name: 'happy', durationMs: 1400, loop: false, canInterrupt: true },
  walk: { name: 'walk', durationMs: 2400, loop: true, canInterrupt: true },
  eat: { name: 'eat', durationMs: 2000, loop: false, canInterrupt: false },
  sleep: { name: 'sleep', durationMs: 0, loop: true, canInterrupt: true },
  wake: { name: 'wake', durationMs: 1200, loop: false, canInterrupt: false },
  surprised: { name: 'surprised', durationMs: 1200, loop: false, canInterrupt: true },
  dragged: { name: 'dragged', durationMs: 0, loop: true, canInterrupt: true },
  land: { name: 'land', durationMs: 600, loop: false, canInterrupt: false }
};

// Transition matrix defining permissible next states
export const ALLOWED_TRANSITIONS: Record<PetState, PetState[]> = {
  idle: ['blink', 'curious', 'happy', 'walk', 'eat', 'sleep', 'surprised', 'dragged'],
  blink: ['idle', 'curious', 'happy', 'walk', 'eat', 'sleep', 'surprised', 'dragged'],
  curious: ['idle', 'happy', 'walk', 'surprised', 'dragged'],
  happy: ['idle', 'curious', 'walk', 'eat', 'dragged'],
  walk: ['idle', 'happy', 'curious', 'dragged', 'surprised'],
  eat: ['idle', 'happy'], // uninterruptible until finishes
  sleep: ['wake', 'dragged'], // only waking or dragging wakes from sleep
  wake: ['idle', 'happy'],
  surprised: ['idle', 'happy', 'dragged'],
  dragged: ['land'], // releasing drag immediately transitions to land
  land: ['idle', 'happy']
};
