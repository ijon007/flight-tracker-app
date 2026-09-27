import { zonedTime } from './addFlightCatalog';
import { flightTime, formatDistance, formatScheduleTime } from './flightFormat';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// TIA 05:40 (CEST, UTC+2) to FCO, 80 min.
const departsAt = zonedTime('2026-09-28', '05:40', 'Europe/Tirane');
assert(departsAt === Date.UTC(2026, 8, 28, 3, 40), 'airport wall time becomes the right instant');
assert(zonedTime('2026-01-15', '08:15', 'Europe/London') === Date.UTC(2026, 0, 15, 8, 15), 'winter GMT');
assert(zonedTime('2026-03-29', '03:30', 'Europe/Oslo') === Date.UTC(2026, 2, 29, 1, 30), 'day of DST change');

const flight = { from: 'TIA', to: 'FCO', departsAt, minutes: 80 };
assert(flightTime(flight, 'departs', '24h', 'local') === '05:40', 'local departure');
assert(flightTime(flight, 'arrives', '24h', 'local') === '07:00', 'local arrival');
assert(flightTime(flight, 'departs', '24h', 'utc') === '03:40 UTC', 'utc departure');
assert(/^5:40\sAM$/.test(flightTime(flight, 'departs', '12h', 'local')), '12h departure');
assert(/^12:05\sAM$/.test(formatScheduleTime('00:05', '12h')), '12h midnight');
assert(formatScheduleTime('00:05', '24h') === '00:05', '24h passthrough');

assert(/^1.?203 km$/.test(formatDistance(1203.4, 'metric')), 'km');
assert(formatDistance(1000, 'imperial') === '621 mi', 'miles');
assert(formatDistance(1000, 'nautical') === '540 nm', 'nautical miles');

console.log('flightFormat ok');
