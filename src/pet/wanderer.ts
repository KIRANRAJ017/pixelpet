export interface WanderControllerOptions {
  onStep: (dx: number, dy: number) => Promise<{ x: number; y: number } | null>;
  onFinish: () => void;
  speed: number;
}

export class WanderController {
  private activeInterval: number | null = null;
  private remainingSteps: number = 0;
  private dirX: number = 0;
  private options: WanderControllerOptions;

  constructor(options: WanderControllerOptions) {
    this.options = options;
  }

  public setSpeed(speed: number): void {
    this.options.speed = speed;
  }

  public startWander(): void {
    this.stop();

    // Pick direction: left (-1) or right (+1)
    this.dirX = Math.random() < 0.5 ? -1 : 1;
    // Step count: 15 to 35 steps of 2px
    this.remainingSteps = Math.floor(Math.random() * 20) + 15;

    const intervalTime = Math.max(30, Math.round(60 / Math.max(0.5, this.options.speed)));

    this.activeInterval = window.setInterval(async () => {
      if (this.remainingSteps <= 0) {
        this.stop();
        this.options.onFinish();
        return;
      }

      const dx = this.dirX * 2;
      const res = await this.options.onStep(dx, 0);

      // If hit boundary or unable to move, stop
      if (!res) {
        this.stop();
        this.options.onFinish();
        return;
      }

      this.remainingSteps--;
    }, intervalTime);
  }

  public stop(): void {
    if (this.activeInterval !== null) {
      window.clearInterval(this.activeInterval);
      this.activeInterval = null;
    }
    this.remainingSteps = 0;
  }

  public isWandering(): boolean {
    return this.activeInterval !== null;
  }
}
