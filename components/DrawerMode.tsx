import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { airportByCode, dateKey, zonedTime } from '@/components/addFlightCatalog';

export type DrawerMode = 'flights' | 'add' | 'profile';

export type MyFlight = {
  id: string;
  code: string;
  /** Departure as epoch ms; the list derives "hours to go" from it. */
  departsAt: number;
  fromCity: string;
  toCity: string;
  from: string;
  to: string;
  departs: string;
  arrives: string;
  /** Block time; times are airport-local so it can't be derived. */
  minutes: number;
};

/** Lets a panel replace the drawer title and show a back button. */
export type DrawerHeader = { title: string; onBack: () => void } | null;

type DrawerModeApi = {
  mode: DrawerMode;
  open: (mode: DrawerMode) => void;
  close: () => void;
  toggle: (mode: DrawerMode) => void;
  myFlights: MyFlight[];
  addFlight: (flight: MyFlight) => void;
  removeFlight: (id: string) => void;
  header: DrawerHeader;
  setHeader: (header: DrawerHeader) => void;
  /** Card lifted to the top of the stack; the map frames its route. */
  openFlightId: string | null;
  setOpenFlightId: (id: string | null) => void;
};

const DrawerModeContext = createContext<DrawerModeApi | null>(null);

const DAY = 86_400_000;

/** Seed departure `days` from today at the schedule time, read in the departure airport's zone. */
const seed = (flight: Omit<MyFlight, 'departsAt'>, days: number): MyFlight => ({
  ...flight,
  departsAt: zonedTime(dateKey(new Date(Date.now() + days * DAY)), flight.departs, airportByCode(flight.from)?.tz),
});

const initialFlights: MyFlight[] = [
  seed({ id: 'BA2590', code: 'BA 2590', fromCity: 'London', toCity: 'Tirana', from: 'LHR', to: 'TIA', departs: '09:25', arrives: '13:40', minutes: 195 }, -3),
  seed({ id: 'AZ507', code: 'AZ 507', fromCity: 'Tirana', toCity: 'Rome', from: 'TIA', to: 'FCO', departs: '05:40', arrives: '07:00', minutes: 80 }, 1),
  seed({ id: 'SK412', code: 'SK 412', fromCity: 'Oslo', toCity: 'Stockholm', from: 'OSL', to: 'ARN', departs: '08:15', arrives: '09:15', minutes: 60 }, 1),
  seed({ id: 'LH800', code: 'LH 800', fromCity: 'Frankfurt', toCity: 'London', from: 'FRA', to: 'LHR', departs: '14:05', arrives: '14:55', minutes: 110 }, 2),
];

// ponytail: flights live in memory and reset on reload; persist once there is a backend.
export function DrawerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DrawerMode>('flights');
  const [myFlights, setMyFlights] = useState(initialFlights);
  const [header, setHeader] = useState<DrawerHeader>(null);
  const [openFlightId, setOpenFlightId] = useState<string | null>(null);
  const open = useCallback((next: DrawerMode) => setMode(next), []);
  const close = useCallback(() => setMode('flights'), []);
  const toggle = useCallback(
    (next: DrawerMode) => setMode((current) => (current === next ? 'flights' : next)),
    [],
  );
  const addFlight = useCallback(
    (flight: MyFlight) =>
      setMyFlights((list) =>
        list.some((f) => f.id === flight.id)
          ? list
          : [...list, flight].sort((a, b) => a.departsAt - b.departsAt),
      ),
    [],
  );
  const removeFlight = useCallback(
    (id: string) => {
      setMyFlights((list) => list.filter((f) => f.id !== id));
      setOpenFlightId((current) => (current === id ? null : current));
    },
    [],
  );
  const value = useMemo(
    () => ({ mode, open, close, toggle, myFlights, addFlight, removeFlight, header, setHeader, openFlightId, setOpenFlightId }),
    [mode, open, close, toggle, myFlights, addFlight, removeFlight, header, openFlightId],
  );

  return <DrawerModeContext.Provider value={value}>{children}</DrawerModeContext.Provider>;
}

export function useDrawerMode() {
  const value = useContext(DrawerModeContext);
  if (!value) throw new Error('DrawerModeProvider is missing');
  return value;
}
