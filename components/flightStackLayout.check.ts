import { countdown, dateLabel, gradientFor, PEEK, placeCard, shareText, stackHeight, stripLabel } from './flightStackLayout';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const H = 250;

assert(placeCard(2, -1, H).y === 2 * PEEK, 'stacked cards step by the peek');
assert(stackHeight(3, -1, H) === 2 * PEEK + H, 'last stacked card shows in full');
assert(placeCard(1, 1, H).y === 0, 'open card moves to the top');
assert(placeCard(0, 1, H).y > H && placeCard(2, 1, H).y > placeCard(0, 1, H).y, 'others pile below in order');
assert(placeCard(2, 1, H).y + PEEK === stackHeight(3, 1, H), 'top of the pile shows its peek');
assert(stackHeight(1, 0, H) === H, 'lone open card has no pile');
assert(stackHeight(0, -1, H) === 0, 'empty stack');
assert(gradientFor('AZ507') === gradientFor('AZ507'), 'color is stable per flight');
assert(countdown(0, 0) === 'Now', 'departing now');
assert(countdown(45 * 60_000, 0) === 'in 45m', 'minutes under an hour');
assert(countdown(10 * 3_600_000, 0) === 'in 10h', 'hours');
const status = { phase: 'delayed', label: 'Delayed 20m', delayMinutes: 20, departsAt: 3_600_000, arrivesAt: 0 } as const;
assert(stripLabel(status, 0) === 'in 1h', 'strip counts down to the estimated departure');
assert(stripLabel({ ...status, phase: 'departed', label: 'In Air' }, 0) === 'In Air', 'strip shows the phase once underway');
assert(countdown(28 * 3_600_000, 0) === 'in 1d 4h', 'days and hours');
assert(countdown(48 * 3_600_000, 0) === 'in 2d', 'whole days');
assert(
  shareText({
    code: 'AZ 507',
    fromCity: 'Tirana',
    toCity: 'Rome',
    from: 'TIA',
    to: 'FCO',
    departs: '05:40',
    arrives: '07:00',
    departsAt: Date.UTC(2026, 8, 28),
    duration: '1h 20m',
  }).includes('AZ 507 · Tirana (TIA) to Rome (FCO)'),
  'share names the flight and airports',
);
assert(dateLabel(Date.UTC(2026, 8, 28)).length > 0, 'date label is non-empty');

console.log('flightStackLayout ok');
