export type CatalogKind = 'airport' | 'flight' | 'airline';

export type Airport = { code: string; name: string; city: string; country: string };
export type Airline = { code: string; name: string };

export type Route = {
  airline: string;
  number: string;
  from: string;
  to: string;
  departs: string;
  arrives: string;
  /** Block time. Times are airport-local, so it can't be derived from them. */
  minutes: number;
  /** Weekdays it operates, 0 = Sunday. Omitted means daily. */
  days?: number[];
};

export type DatedFlight = Route & { date: string };

export type FlightQuery = { from?: string; to?: string; airline?: string; number?: string };

export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  title: string;
  subtitle: string;
  /** Lowercased, spaces removed, so "SK 412" matches "sk412". */
  key: string;
};

export const AIRPORTS: Airport[] = [
  { code: 'TIA', name: 'Tirana International', city: 'Tirana', country: 'Albania' },
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'Finland' },
  { code: 'CPH', name: 'Copenhagen Kastrup', city: 'Copenhagen', country: 'Denmark' },
];

export const AIRLINES: Airline[] = [
  { code: 'AZ', name: 'ITA Airways' },
  { code: 'SK', name: 'SAS' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'AY', name: 'Finnair' },
  { code: 'BA', name: 'British Airways' },
];

export const ROUTES: Route[] = [
  { airline: 'AZ', number: '507', from: 'TIA', to: 'FCO', departs: '05:40', arrives: '07:00', minutes: 80 },
  { airline: 'AZ', number: '509', from: 'TIA', to: 'FCO', departs: '17:25', arrives: '18:45', minutes: 80, days: [1, 3, 5, 0] },
  { airline: 'AZ', number: '506', from: 'FCO', to: 'TIA', departs: '21:30', arrives: '22:50', minutes: 80 },
  { airline: 'AZ', number: '203', from: 'FCO', to: 'LHR', departs: '09:10', arrives: '11:00', minutes: 170 },
  { airline: 'SK', number: '412', from: 'OSL', to: 'ARN', departs: '08:15', arrives: '09:15', minutes: 60 },
  { airline: 'SK', number: '414', from: 'OSL', to: 'ARN', departs: '12:40', arrives: '13:40', minutes: 60, days: [1, 2, 3, 4, 5] },
  { airline: 'SK', number: '1455', from: 'CPH', to: 'OSL', departs: '07:05', arrives: '08:15', minutes: 70 },
  { airline: 'LH', number: '800', from: 'FRA', to: 'LHR', departs: '14:05', arrives: '14:55', minutes: 110 },
  { airline: 'LH', number: '902', from: 'FRA', to: 'LHR', departs: '19:35', arrives: '20:20', minutes: 105, days: [0, 2, 4, 6] },
  { airline: 'LH', number: '1030', from: 'FRA', to: 'CDG', departs: '10:20', arrives: '11:30', minutes: 70 },
  { airline: 'AF', number: '1240', from: 'CDG', to: 'AMS', departs: '11:50', arrives: '13:10', minutes: 80 },
  { airline: 'AF', number: '1023', from: 'CDG', to: 'FCO', departs: '07:45', arrives: '09:50', minutes: 125, days: [1, 3, 5] },
  { airline: 'AY', number: '912', from: 'HEL', to: 'CPH', departs: '16:20', arrives: '17:10', minutes: 110 },
  { airline: 'BA', number: '456', from: 'LHR', to: 'FCO', departs: '06:55', arrives: '10:30', minutes: 155 },
  { airline: 'BA', number: '908', from: 'LHR', to: 'FRA', departs: '15:30', arrives: '18:00', minutes: 90 },
];

export const airportByCode = (code: string) => AIRPORTS.find((a) => a.code === code);
export const airlineByCode = (code: string) => AIRLINES.find((a) => a.code === code);
export const flightCode = (r: Pick<Route, 'airline' | 'number'>) => `${r.airline} ${r.number}`;

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '');
const cityOf = (code: string) => airportByCode(code)?.city ?? code;

const CATALOG: CatalogItem[] = [
  ...ROUTES.map((r) => ({
    id: `${r.airline}${r.number}`,
    kind: 'flight' as const,
    title: flightCode(r),
    subtitle: `${cityOf(r.from)} to ${cityOf(r.to)}`,
    key: squash(`${r.airline}${r.number}${airlineByCode(r.airline)?.name ?? ''}`),
  })),
  ...AIRPORTS.map((a) => ({
    id: a.code,
    kind: 'airport' as const,
    title: a.name,
    subtitle: `${a.code} · ${a.city}, ${a.country}`,
    key: squash(`${a.code}${a.name}${a.city}${a.country}`),
  })),
  ...AIRLINES.map((a) => ({
    id: a.code,
    kind: 'airline' as const,
    title: a.name,
    subtitle: a.code,
    key: squash(`${a.code}${a.name}`),
  })),
];

/** Nothing until two characters. A one-letter query would match half the catalog. */
const MIN_QUERY = 2;
const MAX_PER_KIND = 8;

export type SearchResults = Record<CatalogKind, CatalogItem[]>;

export function searchCatalog(query: string, only?: CatalogKind): SearchResults {
  const q = squash(query);
  const out: SearchResults = { flight: [], airport: [], airline: [] };
  if (q.length < MIN_QUERY) return out;
  for (const item of CATALOG) {
    if (only && item.kind !== only) continue;
    if (!item.key.includes(q) || out[item.kind].length === MAX_PER_KIND) continue;
    out[item.kind].push(item);
  }
  return out;
}

/** "AZ507", "az 507", "U2 8123". Returns null for anything that isn't shaped like a flight number. */
export function parseFlightNumber(query: string): { airline: string; number: string } | null {
  const m = /^([a-z]{2}|[a-z]\d|\d[a-z])\s*0*(\d{1,4})$/i.exec(query.trim());
  if (!m || m[2] === undefined || m[1] === undefined) return null;
  return { airline: m[1].toUpperCase(), number: m[2] };
}

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dateFromKey(key: string, time = '00:00') {
  const [y, m, d] = key.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y!, m! - 1, d!, hh!, mm!);
}

// ponytail: mock schedules repeat weekly forever; swap for a schedules API call.
export function flightsOn(query: FlightQuery, date: string): DatedFlight[] {
  const weekday = dateFromKey(date).getDay();
  return ROUTES.filter(
    (r) =>
      (!query.from || r.from === query.from) &&
      (!query.to || r.to === query.to) &&
      (!query.airline || r.airline === query.airline) &&
      (!query.number || r.number === query.number) &&
      (!r.days || r.days.includes(weekday)),
  )
    .sort((a, b) => a.departs.localeCompare(b.departs))
    .map((r) => ({ ...r, date }));
}

/** Airports with a mock route out of `from`. */
export function destinationsFrom(from: string): Airport[] {
  const codes = new Set(ROUTES.filter((r) => r.from === from).map((r) => r.to));
  return AIRPORTS.filter((a) => codes.has(a.code));
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}
