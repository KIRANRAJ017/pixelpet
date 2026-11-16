export interface ShakeDetectorOptions {
  timeWindowMs?: number;      // Rolling window to count reversals (default: 500ms)
  minReversals?: number;      // Minimum direction reversals required (default: 3)
  minStrokeDistance?: number; // Minimum pixels moved in one direction to count as a stroke (default: 12px)
  minSpeed?: number;          // Minimum average velocity in px/ms (default: 0.4px/ms)
  cooldownMs?: number;        // Cooldown before next shake can trigger (default: 2000ms)
}

interface PointSample {
  x: number;
  y: number;
  time: number;
}

export class ShakeDetector {
  private options: Required<ShakeDetectorOptions>;
  private samples: PointSample[] = [];
  private lastTriggerTime: number = -Infinity;
  private isTriggeredInCurrentDrag: boolean = false;

  constructor(options: ShakeDetectorOptions = {}) {
    this.options = {
      timeWindowMs: options.timeWindowMs ?? 500,
      minReversals: options.minReversals ?? 3,
      minStrokeDistance: options.minStrokeDistance ?? 12,
      minSpeed: options.minSpeed ?? 0.4,
      cooldownMs: options.cooldownMs ?? 2000
    };
  }

  /**
   * Reset tracking state when pointer down or drag ends.
   */
  public reset(): void {
    this.samples = [];
    this.isTriggeredInCurrentDrag = false;
  }

  /**
   * Record a pointer position during dragging.
   * Returns true if a shake gesture was just detected.
   */
  public addSample(x: number, y: number, now: number = Date.now()): boolean {
    if (this.isTriggeredInCurrentDrag) {
      return false;
    }

    if (now - this.lastTriggerTime < this.options.cooldownMs) {
      return false;
    }

    this.samples.push({ x, y, time: now });

    // Prune samples older than timeWindowMs
    const cutoff = now - this.options.timeWindowMs;
    this.samples = this.samples.filter(s => s.time >= cutoff);

    if (this.samples.length < 4) {
      return false;
    }

    // Check if movement pattern represents rapid back-and-forth shaking
    if (this.detectShake()) {
      this.lastTriggerTime = now;
      this.isTriggeredInCurrentDrag = true;
      this.samples = [];
      return true;
    }

    return false;
  }

  private detectShake(): boolean {
    if (this.samples.length < 4) return false;

    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const duration = last.time - first.time;
    if (duration <= 0) return false;

    // Calculate total path distance and count direction reversals along X (or Y)
    let totalPath = 0;
    let reversals = 0;
    let currentDir = 0; // -1 for left, 1 for right
    let currentStrokeDist = 0;

    for (let i = 1; i < this.samples.length; i++) {
      const prev = this.samples[i - 1];
      const curr = this.samples[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.hypot(dx, dy);
      totalPath += dist;

      // Look at horizontal delta (primary shake axis) or strong vertical shake
      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      if (Math.abs(primaryDelta) >= 1) {
        const dir = primaryDelta > 0 ? 1 : -1;
        if (currentDir === 0) {
          currentDir = dir;
          currentStrokeDist = Math.abs(primaryDelta);
        } else if (dir === currentDir) {
          currentStrokeDist += Math.abs(primaryDelta);
        } else {
          // Direction reversed!
          if (currentStrokeDist >= this.options.minStrokeDistance) {
            reversals++;
            currentDir = dir;
            currentStrokeDist = Math.abs(primaryDelta);
          }
        }
      }
    }

    const averageSpeed = totalPath / duration;

    // Must satisfy:
    // 1. Enough direction changes (reversals >= minReversals)
    // 2. Fast enough average movement
    // 3. Total path distance exceeds threshold (not tiny jitter)
    if (
      reversals >= this.options.minReversals &&
      averageSpeed >= this.options.minSpeed &&
      totalPath >= this.options.minStrokeDistance * this.options.minReversals
    ) {
      return true;
    }

    return false;
  }
}
