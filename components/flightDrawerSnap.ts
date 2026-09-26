/** Visible chrome that remains when the sheet is minimized. */
export const DRAWER_HEADER = 64;

/** How far below min the finger can rubber-band. The sheet never leaves the screen. */
export const DRAWER_SQUISH = 20;

// ponytail: linear resistance past the detents. A log curve is the upgrade if the edge feels stiff.
export function resist(next: number, min: number, max: number): number {
  'worklet';
  if (next < min) return Math.max(min - DRAWER_SQUISH, min + (next - min) * 0.22);
  if (next > max) return max + (next - max) * 0.22;
  return next;
}

/** Flick wins. Otherwise the nearer detent. Min is minimize, never dismiss. */
export function snapHeight(next: number, min: number, max: number, velocityY: number): number {
  'worklet';
  if (velocityY > 800) return min;
  if (velocityY < -800) return max;
  return next < (min + max) / 2 ? min : max;
}
