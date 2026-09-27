import { distanceKm } from './addFlightCatalog';
import type { MyFlight } from './DrawerMode';
import { flightStatus } from './flightStatus';
import { travelStats } from './flightStats';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const DAY = 86_400_000;
const now = 100 * DAY;
const flight = (id: string, from: string, to: string, daysAgo: number, minutes: number): MyFlight => ({
  id,
  code: id,
  departsAt: now - daysAgo * DAY,
  fromCity: from,
  toCity: to,
  from,
  to,
  departs: '10:00',
  arrives: '12:00',
  minutes,
});

const lhrTia = flight('BA2590', 'LHR', 'TIA', 3, 195);
const tiaFco = flight('AZ507', 'TIA', 'FCO', 2, 80);
const upcoming = flight('SK412', 'OSL', 'ARN', -1, 60);
assert(flightStatus(lhrTia, now).phase === 'landed' && flightStatus(tiaFco, now).phase === 'landed', 'fixtures have landed');

const s = travelStats([lhrTia, tiaFco, upcoming], now);
assert(s.flights === 2, 'upcoming flights do not count');
assert(s.minutes === 275, 'block time adds up');
assert(s.airports === 3 && s.countries === 3, 'airports and countries are unique');
assert(Math.abs(s.km - (distanceKm('LHR', 'TIA')! + distanceKm('TIA', 'FCO')!)) < 1e-6, 'distance adds up');
assert(s.longest?.flight.id === 'BA2590', 'longest by distance');
assert(travelStats([], now).longest === null, 'no flights, no longest');

console.log('flightStats ok');
