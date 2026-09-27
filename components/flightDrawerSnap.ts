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

function detents(min: number, max: number, mid: number): number[] {
  'worklet';
  if (mid > min && mid < max) return [min, mid, max];
  return [min, max];
}

/**
 * Flick moves one detent in that direction. Otherwise the nearer detent.
 * Min is minimize, never dismiss. Pass a mid between min and max for a third stop.
 */
export function snapHeight(
  next: number,
  min: number,
  max: number,
  velocityY: number,
  mid = max,
): number {
  'worklet';
  const points = detents(min, max, mid);
  const last = points.length - 1;
  if (velocityY > 800) {
    let target = points[0];
    for (let i = 0; i < points.length; i++) {
      if (points[i] < next - 0.5) target = points[i];
    }
    return target;
  }
  if (velocityY < -800) {
    let target = points[last];
    for (let i = last; i >= 0; i--) {
      if (points[i] > next + 0.5) target = points[i];
    }
    return target;
  }
  let best = points[0];
  let bestDist = Math.abs(next - best);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const dist = Math.abs(next - point);
    if (dist < bestDist || (dist === bestDist && point > best)) {
      best = point;
      bestDist = dist;
    }
  }
  return best;
}

/** Header tap steps up one detent, then back to closed. */
export function tapTarget(height: number, min: number, max: number, mid = max): number {
  'worklet';
  const points = detents(min, max, mid);
  const here = snapHeight(height, min, max, 0, mid);
  const index = points.indexOf(here);
  return points[index < 0 ? 0 : (index + 1) % points.length];
}
