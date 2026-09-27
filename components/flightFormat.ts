import type { MyFlight } from '@/components/DrawerMode';
import { airportByCode } from '@/components/addFlightCatalog';

export type Units = 'metric' | 'imperial' | 'nautical';
export type TimeFormat = '24h' | '12h';
export type TimeZonePref = 'local' | 'device' | 'utc';

const UNIT: Record<Units, { perKm: number; label: string }> = {
  metric: { perKm: 1, label: 'km' },
  imperial: { perKm: 0.621371, label: 'mi' },
  nautical: { perKm: 0.539957, label: 'nm' },
};

export function formatDistance(km: number, units: Units) {
  const { perKm, label } = UNIT[units];
  return `${Math.round(km * perKm).toLocaleString()} ${label}`;
}

/** Clock time of an instant in `timeZone`, or the device zone when it's undefined. */
// ponytail: builds a formatter per call; cache by (format, zone) if card lists get long.
export function formatClock(ms: number, timeFormat: TimeFormat, timeZone?: string) {
  const h12 = timeFormat === '12h';
  return new Intl.DateTimeFormat(h12 ? 'en-US' : 'en-GB', {
    hour: h12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: h12,
    timeZone,
  }).format(ms);
}

/** A schedule "HH:MM" string in the chosen time format, zone untouched. */
export function formatScheduleTime(hhmm: string, timeFormat: TimeFormat) {
  if (timeFormat === '24h') return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  return formatClock(Date.UTC(2000, 0, 1, h!, m!), timeFormat, 'UTC');
}

export function flightTime(
  flight: Pick<MyFlight, 'from' | 'to' | 'departsAt' | 'minutes'>,
  which: 'departs' | 'arrives',
  timeFormat: TimeFormat,
  pref: TimeZonePref,
) {
  const ms = which === 'departs' ? flight.departsAt : flight.departsAt + flight.minutes * 60_000;
  switch (pref) {
    case 'local':
      return formatClock(ms, timeFormat, airportByCode(which === 'departs' ? flight.from : flight.to)?.tz);
    case 'device':
      return formatClock(ms, timeFormat);
    case 'utc':
      return `${formatClock(ms, timeFormat, 'UTC')} UTC`;
    default: {
      const never: never = pref;
      throw new Error(`Unknown time zone preference ${String(never)}`);
    }
  }
}
