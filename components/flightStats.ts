import { airportByCode, distanceKm } from '@/components/addFlightCatalog';
import type { MyFlight } from '@/components/DrawerMode';
import { flightStatus } from '@/components/flightStatus';

export type TravelStats = {
  flights: number;
  km: number;
  minutes: number;
  airports: number;
  countries: number;
  longest: { flight: MyFlight; km: number } | null;
};

/** Totals over flights that have landed; cancelled and upcoming flights don't count. */
export function travelStats(flights: MyFlight[], now = Date.now()): TravelStats {
  const flown = flights.filter((f) => flightStatus(f, now).phase === 'landed');
  const airports = new Set(flown.flatMap((f) => [f.from, f.to]));
  const countries = new Set([...airports].map((code) => airportByCode(code)?.country ?? code));
  let km = 0;
  let longest: TravelStats['longest'] = null;
  for (const flight of flown) {
    const d = distanceKm(flight.from, flight.to) ?? 0;
    km += d;
    if (!longest || d > longest.km) longest = { flight, km: d };
  }
  return {
    flights: flown.length,
    km,
    minutes: flown.reduce((sum, f) => sum + f.minutes, 0),
    airports: airports.size,
    countries: countries.size,
    longest,
  };
}
