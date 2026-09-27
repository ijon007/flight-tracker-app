import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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
};

const DrawerModeContext = createContext<DrawerModeApi | null>(null);

const HOUR = 3_600_000;
const now = Date.now();

const initialFlights: MyFlight[] = [
  { id: 'AZ507', code: 'AZ 507', departsAt: now + 10 * HOUR, fromCity: 'Tirana', toCity: 'Rome', from: 'TIA', to: 'FCO', departs: '05:40', arrives: '07:00', minutes: 80 },
  { id: 'SK412', code: 'SK 412', departsAt: now + 28 * HOUR, fromCity: 'Oslo', toCity: 'Stockholm', from: 'OSL', to: 'ARN', departs: '08:15', arrives: '09:15', minutes: 60 },
  { id: 'LH800', code: 'LH 800', departsAt: now + 46 * HOUR, fromCity: 'Frankfurt', toCity: 'London', from: 'FRA', to: 'LHR', departs: '14:05', arrives: '14:55', minutes: 110 },
];

// ponytail: flights live in memory and reset on reload; persist once there is a backend.
export function DrawerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DrawerMode>('flights');
  const [myFlights, setMyFlights] = useState(initialFlights);
  const [header, setHeader] = useState<DrawerHeader>(null);
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
    (id: string) => setMyFlights((list) => list.filter((f) => f.id !== id)),
    [],
  );
  const value = useMemo(
    () => ({ mode, open, close, toggle, myFlights, addFlight, removeFlight, header, setHeader }),
    [mode, open, close, toggle, myFlights, addFlight, removeFlight, header],
  );

  return <DrawerModeContext.Provider value={value}>{children}</DrawerModeContext.Provider>;
}

export function useDrawerMode() {
  const value = useContext(DrawerModeContext);
  if (!value) throw new Error('DrawerModeProvider is missing');
  return value;
}
