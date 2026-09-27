import { flightsOn, parseFlightNumber, searchCatalog } from './addFlightCatalog';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const all = (q: string) => Object.values(searchCatalog(q)).flat();

assert(all('').length === 0, 'empty query returns nothing');
assert(all('   ').length === 0, 'blank query returns nothing');
assert(all('s').length === 0, 'one character returns nothing');
assert(searchCatalog('tia').airport.some((item) => item.id === 'TIA'), 'airport code');
assert(searchCatalog('sk 412').flight.some((item) => item.id === 'SK412'), 'flight number with a space');
assert(searchCatalog('sk412').flight.some((item) => item.id === 'SK412'), 'flight number without a space');
assert(searchCatalog('sas').airline.some((item) => item.id === 'SK'), 'airline name');
assert(searchCatalog('rome', 'airport').flight.length === 0, 'kind filter');
assert(all('zzzz').length === 0, 'unknown query is empty');

assert(parseFlightNumber('az507')?.airline === 'AZ', 'flight number airline');
assert(parseFlightNumber('AZ 0507')?.number === '507', 'flight number strips leading zeros');
assert(parseFlightNumber('U2 8123')?.airline === 'U2', 'alphanumeric airline code');
assert(parseFlightNumber('rome') === null, 'words are not flight numbers');
assert(parseFlightNumber('12345') === null, 'digits alone are not flight numbers');

// 2026-09-28 is a Monday, 2026-09-29 a Tuesday.
assert(flightsOn({ from: 'TIA', to: 'FCO' }, '2026-09-28').length === 2, 'route on an operating day');
assert(flightsOn({ from: 'TIA', to: 'FCO' }, '2026-09-29').length === 1, 'weekday schedule skips a day');
assert(flightsOn({ airline: 'AZ', number: '507' }, '2026-09-29')[0]?.date === '2026-09-29', 'dated flight');
const tia = flightsOn({ from: 'TIA' }, '2026-09-28');
assert(tia[0]!.departs < tia[1]!.departs, 'sorted by departure');

console.log('addFlightCatalog ok');
