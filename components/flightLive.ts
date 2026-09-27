import type { MyFlight } from '@/components/DrawerMode';
import { isPast, type FlightPhase, type FlightStatus } from '@/components/flightStatus';

export type TrackedFlight = { flight: MyFlight; status: FlightStatus };

// ponytail: ActivityKit ends a Live Activity after 8h, so only start it this close to departure.
export const ACTIVITY_WINDOW_MS = 4 * 3_600_000;

/** Props for the Live Activity; JSON-serialized into the widget runtime, so plain values only. */
export type FlightActivityProps = {
  code: string;
  from: string;
  to: string;
  departs: string;
  departsAt: number;
  arrivesAt: number;
  phase: FlightPhase;
  label: string;
  gate?: string;
  terminal?: string;
};

/** Soonest flight that hasn't landed or been cancelled. */
export function nextFlight(tracked: TrackedFlight[]) {
  return tracked
    .filter((t) => !isPast(t.status))
    .sort((a, b) => a.status.departsAt - b.status.departsAt)[0];
}

export function activityFor(tracked: TrackedFlight[], now: number): (FlightActivityProps & { id: string }) | null {
  const next = nextFlight(tracked);
  if (!next || next.status.departsAt - now > ACTIVITY_WINDOW_MS) return null;
  const { flight, status } = next;
  return {
    id: flight.id,
    code: flight.code,
    from: flight.from,
    to: flight.to,
    departs: flight.departs,
    departsAt: status.departsAt,
    arrivesAt: status.arrivesAt,
    phase: status.phase,
    label: status.label,
    gate: status.gate,
    terminal: status.terminal,
  };
}
