import type { FlightStatus } from '@/components/flightStatus';

/** Visible strip of a stacked card: just the two airport codes. */
export const PEEK = 72;
/** Strip of each card in the pile under an open card. */
export const PILE = 10;
export const PILE_GAP = 14;
export const PILE_SCALE = 0.94;

/** Where card `i` of `n` sits. `open` is -1 when nothing is open. */
export function placeCard(i: number, open: number, cardH: number): { y: number; scale: number } {
  if (open < 0) return { y: i * PEEK, scale: 1 };
  if (i === open) return { y: 0, scale: 1 };
  const k = i < open ? i : i - 1;
  return { y: cardH + PILE_GAP + k * PILE, scale: PILE_SCALE };
}

/** Height of the stack, clipped so the pile only shows its top strip. */
export function stackHeight(n: number, open: number, cardH: number): number {
  if (n === 0) return 0;
  if (open < 0) return (n - 1) * PEEK + cardH;
  if (n === 1) return cardH;
  return cardH + PILE_GAP + (n - 2) * PILE + PEEK;
}

// ponytail: colors are hashed from the id, so each flight keeps its own but they mean nothing. Swap for airline brand colors if wanted.
const GRADIENTS: readonly [string, string][] = [
  ['#0A84FF', '#5E5CE6'],
  ['#FF375F', '#BF5AF2'],
  ['#FF6B2C', '#E0245E'],
  ['#12A150', '#0A84FF'],
  ['#5E5CE6', '#BF5AF2'],
  ['#0FA3B1', '#2D6CDF'],
  ['#E8562A', '#8E3BD9'],
];

export function gradientFor(id: string): readonly [string, string] {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length]!;
}

export function dateLabel(at: number) {
  return new Date(at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function shareText(flight: {
  code: string;
  fromCity: string;
  toCity: string;
  from: string;
  to: string;
  departs: string;
  arrives: string;
  departsAt: number;
  duration: string;
}) {
  return [
    `${flight.code} · ${flight.fromCity} (${flight.from}) to ${flight.toCity} (${flight.to})`,
    `Departs ${flight.departs} · Arrives ${flight.arrives}`,
    `${dateLabel(flight.departsAt)} · ${flight.duration}`,
  ].join('\n');
}

export function countdown(at: number, now = Date.now()): string {
  const m = Math.max(0, Math.round((at - now) / 60_000));
  if (m === 0) return 'Now';
  if (m < 60) return `in ${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `in ${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 === 0 ? `in ${d}d` : `in ${d}d ${h % 24}h`;
}

/** Top-strip text: a countdown to the estimated departure until the flight is underway. */
export function stripLabel(status: FlightStatus, now = Date.now()): string {
  switch (status.phase) {
    case 'scheduled':
    case 'delayed':
      return countdown(status.departsAt, now);
    case 'boarding':
    case 'departed':
    case 'landed':
    case 'cancelled':
      return status.label;
    default: {
      const never: never = status.phase;
      return never;
    }
  }
}
