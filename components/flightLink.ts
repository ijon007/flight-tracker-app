import { airportByCode, flightCode, flightsOn, myFlightFrom, parseFlightNumber } from '@/components/addFlightCatalog';
import type { MyFlight } from '@/components/DrawerMode';

/** Departure date as YYYY-MM-DD in the departure airport's zone, so the link means the same day everywhere. */
export function departureDate(flight: Pick<MyFlight, 'from' | 'departsAt'>) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: airportByCode(flight.from)?.tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(flight.departsAt);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/**
 * A shared link names a flight and date. Opens the matching saved flight, or builds it from the
 * schedule so the caller can add it. Null for malformed or unknown links.
 */
export function resolveFlightLink(
  flight: string,
  date: string,
  myFlights: MyFlight[],
): { id: string; add?: MyFlight } | null {
  const parsed = parseFlightNumber(flight);
  if (!parsed || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const code = flightCode(parsed);
  const saved = myFlights.find((f) => f.code === code && departureDate(f) === date);
  if (saved) return { id: saved.id };
  const route = flightsOn(parsed, date)[0];
  if (!route) return null;
  const add = myFlightFrom(route);
  return { id: add.id, add };
}
