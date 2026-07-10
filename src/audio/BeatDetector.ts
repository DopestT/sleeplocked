/**
 * Lightweight onset detector: flags a "beat" when bass energy spikes well
 * above its recent rolling average, with a cooldown to avoid double-triggers.
 */
export class BeatDetector {
  private history: number[] = [];
  private readonly historySize = 43; // ~0.7s at 60fps
  private cooldown = 0;
  private lastBeatStrength = 0;

  update(bassEnergy: number, deltaSeconds: number): { isBeat: boolean; strength: number } {
    this.history.push(bassEnergy);
    if (this.history.length > this.historySize) this.history.shift();

    const average = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    this.cooldown = Math.max(0, this.cooldown - deltaSeconds);

    const threshold = average * 1.35 + 0.05;
    const isBeat = bassEnergy > threshold && this.cooldown <= 0;

    if (isBeat) {
      this.cooldown = 0.16;
      this.lastBeatStrength = Math.min(1, (bassEnergy - average) * 2.2);
    } else {
      this.lastBeatStrength *= 0.9;
    }

    return { isBeat, strength: this.lastBeatStrength };
  }
}
