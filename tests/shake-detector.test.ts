import { describe, it, expect, beforeEach } from 'vitest';
import { ShakeDetector } from '../src/pet/shake-detector';

describe('ShakeDetector', () => {
  let detector: ShakeDetector;

  beforeEach(() => {
    detector = new ShakeDetector({
      minReversals: 3,
      minStrokeDistance: 12,
      minSpeed: 0.4,
      timeWindowMs: 500,
      cooldownMs: 1000
    });
  });

  it('ignores slow dragging across the screen', () => {
    let detected = false;
    // Moving 1px every 50ms in one direction
    for (let i = 0; i < 10; i++) {
      if (detector.addSample(i * 10, 100, i * 50)) {
        detected = true;
      }
    }
    expect(detected).toBe(false);
  });

  it('ignores fast linear dragging in one direction', () => {
    let detected = false;
    // Fast straight movement without back-and-forth reversals
    for (let i = 0; i < 10; i++) {
      if (detector.addSample(i * 30, 100, i * 30)) {
        detected = true;
      }
    }
    expect(detected).toBe(false);
  });

  it('detects rapid back-and-forth shaking', () => {
    let detected = false;
    // Shake: left -> right -> left -> right rapidly
    const points = [
      { x: 100, t: 0 },
      { x: 150, t: 50 },  // right +50
      { x: 90, t: 100 },  // left -60 (rev 1)
      { x: 160, t: 150 }, // right +70 (rev 2)
      { x: 80, t: 200 }   // left -80 (rev 3)
    ];

    for (const p of points) {
      if (detector.addSample(p.x, 100, p.t)) {
        detected = true;
        break;
      }
    }

    expect(detected).toBe(true);
  });

  it('prevents repeated trigger during the same drag session', () => {
    let triggerCount = 0;
    const points = [
      // 1st shake
      { x: 100, t: 0 },
      { x: 150, t: 50 },
      { x: 90, t: 100 },
      { x: 160, t: 150 },
      { x: 80, t: 200 },
      // continuous dragging without reset
      { x: 150, t: 250 },
      { x: 80, t: 300 },
      { x: 150, t: 350 },
      { x: 80, t: 400 }
    ];

    for (const p of points) {
      if (detector.addSample(p.x, 100, p.t)) {
        triggerCount++;
      }
    }

    expect(triggerCount).toBe(1);

    // After reset (mouse up / down), new shake can trigger after cooldown
    detector.reset();
    const secondShake = [
      { x: 100, t: 1500 },
      { x: 150, t: 1550 },
      { x: 90, t: 1600 },
      { x: 160, t: 1650 },
      { x: 80, t: 1700 }
    ];

    for (const p of secondShake) {
      if (detector.addSample(p.x, 100, p.t)) {
        triggerCount++;
      }
    }

    expect(triggerCount).toBe(2);
  });
});
