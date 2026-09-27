import type { MyFlight } from '@/components/DrawerMode';
import type { Settings } from '@/components/Settings';
import { isPast, type FlightPhase, type FlightStatus } from '@/components/flightStatus';

export type TrackedFlight = { flight: MyFlight; status: FlightStatus };

// ponytail: fixed lead time; use the airline's published boarding time once the status source has it.
export const BOARDING_LEAD_MS = 40 * 60_000;
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

/** `at` set = schedule for that time; unset = fire once now (deduped by `id`). */
export type PlannedAlert = { id: string; title: string; body: string; at?: number };

export function planAlerts(tracked: TrackedFlight[], alerts: Settings['alerts'], now: number): PlannedAlert[] {
  const plan: PlannedAlert[] = [];
  for (const { flight, status } of tracked) {
    const route = `${flight.code} to ${flight.toCity}`;
    if (status.phase === 'cancelled') {
      if (alerts.status) plan.push({ id: `${flight.id}:cancelled`, title: `${flight.code} cancelled`, body: `Your flight to ${flight.toCity} was cancelled.` });
      continue;
    }
    if (isPast(status)) continue;
    const boardingAt = status.departsAt - BOARDING_LEAD_MS;
    if (alerts.boarding && boardingAt > now) {
      plan.push({ id: `${flight.id}:boarding`, title: `${flight.code} is boarding`, body: `Head to ${status.gate ? `gate ${status.gate}` : 'your gate'} for ${route}.`, at: boardingAt });
    }
    if (alerts.status && status.departsAt > now) {
      plan.push({ id: `${flight.id}:departed`, title: `${flight.code} departed`, body: `${route} is on its way.`, at: status.departsAt });
    }
    if (alerts.status && status.arrivesAt > now) {
      plan.push({ id: `${flight.id}:landed`, title: `${flight.code} landed`, body: `Welcome to ${flight.toCity}.`, at: status.arrivesAt });
    }
    if (alerts.delay && status.delayMinutes > 0) {
      plan.push({ id: `${flight.id}:delay`, title: `${flight.code} delayed`, body: `${route} is ${status.label.toLowerCase()}.` });
    }
    if (alerts.gate && status.gate) {
      const terminal = status.terminal ? `, terminal ${status.terminal}` : '';
      plan.push({ id: `${flight.id}:gate`, title: `${flight.code} gate ${status.gate}`, body: `${route} departs from gate ${status.gate}${terminal}.` });
    }
  }
  return plan;
}
