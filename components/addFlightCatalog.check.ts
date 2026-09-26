import { searchCatalog } from './addFlightCatalog';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(searchCatalog('').length === 0, 'empty query returns nothing');
assert(searchCatalog('   ').length === 0, 'blank query returns nothing');
assert(searchCatalog('s').length === 0, 'one character returns nothing');
assert(searchCatalog('tia').some((item) => item.id === 'TIA'), 'airport code');
assert(searchCatalog('sk 412').some((item) => item.id === 'SK412'), 'flight number with a space');
assert(searchCatalog('sk412').some((item) => item.id === 'SK412'), 'flight number without a space');
assert(searchCatalog('sas').some((item) => item.kind === 'airline'), 'airline name');
assert(searchCatalog('zzzz').length === 0, 'unknown query is empty');

console.log('addFlightCatalog ok');
