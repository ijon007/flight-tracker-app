import type { MyFlight } from './DrawerMode';
import { estimatedFlight, flightStatus, isPast } from './flightStatus';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const MIN = 60_000;
const flight = (id: string): MyFlight => ({
  id,
  code: id,
  departsAt: 600 * MIN,
  fromCity: 'Tirana',
  toCity: 'Rome',
  from: 'TIA',
  to: 'FCO',
  departs: '23:40',
  arrives: '01:00',
  minutes: 80,
});

const az = flight('AZ507');
const s = flightStatus(az, 0);
assert(s.phase === 'delayed' && s.delayMinutes > 0, 'AZ507 is the seeded delayed demo flight');
assert(s.label === `Delayed ${s.delayMinutes}m`, 'delay label names the minutes');
assert(JSON.stringify(flightStatus(az, 0)) === JSON.stringify(s), 'same flight, same status');
assert(s.gate !== undefined && s.terminal !== undefined, 'gate known within 12h of departure');
assert(flightStatus({ ...az, departsAt: 2000 * MIN }, 0).gate === undefined, 'gate unknown days out');
assert(flightStatus(az, s.departsAt - 10 * MIN).phase === 'boarding', 'boarding before est. departure');
assert(flightStatus(az, s.departsAt + 5 * MIN).label === 'Departed', 'departed right after takeoff');
assert(flightStatus(az, s.departsAt + 30 * MIN).label === 'In Air', 'then in air');
assert(!isPast(flightStatus(az, s.arrivesAt - 1)), 'not past before arrival');
assert(isPast(flightStatus(az, s.arrivesAt)), 'landed is past');
assert(s.arrivesAt - s.departsAt === 80 * MIN, 'arrival follows the delayed departure');

const est = estimatedFlight(az, s);
assert(est.departsAt === s.departsAt, 'estimated epoch carries the delay');
assert(est.departs === (s.delayMinutes >= 20 ? `00:${String(s.delayMinutes - 20).padStart(2, '0')}` : `23:${40 + s.delayMinutes}`), 'clock shifts across midnight');
assert(estimatedFlight(flight('SK412'), flightStatus(flight('SK412'), 0)).departs === '23:40', 'on time keeps the schedule');

const cancelled = flightStatus(flight('W61234'), 0);
assert(cancelled.phase === 'cancelled' && isPast(cancelled), 'cancelled goes straight to past');

console.log('flightStatus ok');
