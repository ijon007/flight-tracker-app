import { flightRoute, greatCircle } from './flightRoute';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

const oslo = { latitude: 60.1976, longitude: 11.1004 };
const nyc = { latitude: 40.6413, longitude: -73.7781 };
const path = greatCircle(oslo, nyc);
const last = path[path.length - 1]!;

assert(near(path[0]!.latitude, oslo.latitude) && near(path[0]!.longitude, oslo.longitude), 'starts at origin');
assert(near(last.latitude, nyc.latitude) && near(last.longitude, nyc.longitude), 'ends at destination');
assert(Math.max(...path.map((p) => p.latitude)) > oslo.latitude, 'transatlantic arc bulges poleward');
assert(greatCircle(oslo, oslo).length === 2, 'same point stays a pair');
assert(flightRoute('TIA', 'FCO')?.to.code === 'FCO', 'catalog airports resolve');
assert(flightRoute('TIA', 'XXX') === null, 'unknown airport has no route');

console.log('flightRoute ok');
