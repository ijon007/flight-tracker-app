import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { MyFlight } from '@/components/DrawerMode';
import { formatDuration } from '@/components/addFlightCatalog';
import {
  flightTime,
  formatDistance,
  type TimeFormat,
  type TimeZonePref,
  type Units,
} from '@/components/flightFormat';

export type { TimeFormat, TimeZonePref, Units };

export type Settings = {
  name: string;
  units: Units;
  timeFormat: TimeFormat;
  timeZone: TimeZonePref;
  shareLocation: boolean;
};

type SettingsApi = Settings & { update: (patch: Partial<Settings>) => void };

const defaults: Settings = {
  name: 'Alex Morgan',
  units: 'metric',
  timeFormat: '24h',
  timeZone: 'local',
  shareLocation: false,
};

const SettingsContext = createContext<SettingsApi | null>(null);

// ponytail: settings live in memory and reset on reload; persist once there is an account.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults);
  const value = useMemo(
    () => ({ ...settings, update: (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('SettingsProvider is missing');
  return value;
}

export type FlightFormat = {
  /** Departure or arrival clock time per the time format and time zone settings. */
  time: (flight: MyFlight, which: 'departs' | 'arrives') => string;
  /** Distance in the chosen units, like "1,203 km", "748 mi", "650 nm". */
  distance: (km: number) => string;
  duration: (minutes: number) => string;
};

export function useFlightFormat(): FlightFormat {
  const { units, timeFormat, timeZone } = useSettings();
  return useMemo<FlightFormat>(
    () => ({
      time: (flight, which) => flightTime(flight, which, timeFormat, timeZone),
      distance: (km) => formatDistance(km, units),
      duration: formatDuration,
    }),
    [units, timeFormat, timeZone],
  );
}
