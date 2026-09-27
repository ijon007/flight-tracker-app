import type { MyFlight } from '@/components/DrawerMode';

export type FlightPhase = 'scheduled' | 'delayed' | 'boarding' | 'departed' | 'landed' | 'cancelled';

export type FlightStatus = {
  phase: FlightPhase;
  /** Short label for the status pill, like "On Time", "Delayed 25m", "In Air", "Landed". */
  label: string;
  gate?: string;
  terminal?: string;
  delayMinutes: number;
  /** Estimated departure and arrival as epoch ms, delay included. */
  departsAt: number;
  arrivesAt: number;
};

const MIN = 60_000;
const BOARDING = 40 * MIN;
/** "Departed" reads as "In Air" after this. */
const TAKEOFF = 15 * MIN;
const GATE_KNOWN = 12 * 60 * MIN;

function seed(id: string) {
  let h = 0;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 0x5bd1e995);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

// ponytail: deterministic mock seeded from the flight id, so gate, terminal, delay and
// cancellation never change for a flight and phases follow the clock. Replace the body with a
// flight status API lookup (cached per flight) once there is a feed; keep the return shape.
export function flightStatus(flight: MyFlight, now = Date.now()): FlightStatus {
  const h = seed(flight.id);
  const delayMinutes = h % 10 < 6 ? 0 : 5 * (1 + ((h >>> 4) % 11));
  const departsAt = flight.departsAt + delayMinutes * MIN;
  const arrivesAt = departsAt + flight.minutes * MIN;
  const base = {
    terminal: String(1 + ((h >>> 8) % 3)),
    gate: now >= departsAt - GATE_KNOWN ? `${'ABCDE'[(h >>> 10) % 5]}${1 + ((h >>> 13) % 40)}` : undefined,
    delayMinutes,
    departsAt,
    arrivesAt,
  };
  const at = (phase: FlightPhase, label: string): FlightStatus => ({ ...base, phase, label });

  if ((h >>> 20) % 25 === 0) return { ...at('cancelled', 'Cancelled'), gate: undefined, delayMinutes: 0 };
  if (now >= arrivesAt) return at('landed', 'Landed');
  if (now >= departsAt) return at('departed', now < departsAt + TAKEOFF ? 'Departed' : 'In Air');
  if (now >= departsAt - BOARDING) return at('boarding', 'Boarding');
  return delayMinutes > 0 ? at('delayed', `Delayed ${delayMinutes}m`) : at('scheduled', 'On Time');
}

/** Landed or cancelled flights leave the upcoming stack for past trips. */
export const isPast = (status: FlightStatus) => status.phase === 'landed' || status.phase === 'cancelled';

function shiftClock(hhmm: string, minutes: number) {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const t = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** The flight as it will actually run, for feeding estimated times to the settings formatter. */
export function estimatedFlight(flight: MyFlight, status: FlightStatus): MyFlight {
  return {
    ...flight,
    departsAt: status.departsAt,
    departs: shiftClock(flight.departs, status.delayMinutes),
    arrives: shiftClock(flight.arrives, status.delayMinutes),
  };
}
