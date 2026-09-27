import { myFlightFrom, zonedTime } from './addFlightCatalog';
import { departureDate, resolveFlightLink } from './flightLink';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// Monday; AZ 507 runs daily.
const date = '2026-09-28';
const az = myFlightFrom({ airline: 'AZ', number: '507', from: 'TIA', to: 'FCO', departs: '05:40', arrives: '07:00', minutes: 80, date });

assert(departureDate(az) === date, 'departure date is read in the departure zone');
assert(departureDate({ from: 'LHR', departsAt: zonedTime(date, '23:30', 'Europe/London') }) === date, 'late departures keep their local day');
assert(resolveFlightLink('AZ507', date, [az])?.id === az.id && !resolveFlightLink('AZ507', date, [az])?.add, 'saved flight opens');
const fresh = resolveFlightLink('az 507', date, []);
assert(fresh?.add?.id === az.id && fresh.add.departsAt === az.departsAt, 'unsaved flight is built from the schedule');
assert(resolveFlightLink('ZZ999', date, []) === null, 'unknown flight');
assert(resolveFlightLink('AZ507', '28/09/2026', []) === null, 'malformed date');
assert(resolveFlightLink('<script>', date, []) === null, 'malformed flight');

console.log('flightLink ok');
