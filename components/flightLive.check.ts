import type { MyFlight } from './DrawerMode';
import { ACTIVITY_WINDOW_MS, activityFor, type TrackedFlight } from './flightLive';
import type { FlightStatus } from './flightStatus';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const now = 1_000_000_000;
const HOUR = 3_600_000;
const flight = (id: string, inHours: number): MyFlight => ({
  id, code: id, departsAt: now + inHours * HOUR, fromCity: 'A', toCity: 'B', from: 'AAA', to: 'BBB', departs: '10:00', arrives: '11:00', minutes: 60,
});
const status = (f: MyFlight, patch: Partial<FlightStatus> = {}): FlightStatus => ({
  phase: 'scheduled', label: 'On Time', delayMinutes: 0, departsAt: f.departsAt, arrivesAt: f.departsAt + HOUR, ...patch,
});
const soon = flight('SOON', 2);
const later = flight('LATER', 1);
const landed = flight('LANDED', -3);
const tracked: TrackedFlight[] = [
  { flight: soon, status: status(soon, { phase: 'delayed', label: 'Delayed 25m', delayMinutes: 25, gate: 'B12' }) },
  { flight: later, status: status(later) },
  { flight: landed, status: status(landed, { phase: 'landed', label: 'Landed' }) },
];

assert(activityFor(tracked, now)?.id === 'LATER', 'activity tracks the soonest non-past flight');
assert(activityFor(tracked.slice(2), now) === null, 'no activity when every flight is past');
const far = flight('FAR', ACTIVITY_WINDOW_MS / HOUR + 1);
assert(activityFor([{ flight: far, status: status(far) }], now) === null, 'no activity outside the window');
console.log('flightLive ok');
