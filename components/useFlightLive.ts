import { requireOptionalNativeModule } from 'expo-modules-core';
import type { LiveActivity } from 'expo-widgets';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useDrawerMode } from '@/components/DrawerMode';
import { activityFor, type FlightActivityProps } from '@/components/flightLive';
import { flightStatus } from '@/components/flightStatus';

type ActivityApi = {
  getInstances: () => LiveActivity<FlightActivityProps>[];
  start: (props: FlightActivityProps, url: string) => LiveActivity<FlightActivityProps>;
};

/** Expo Go and old dev clients have no ExpoWidgets; importing FlightActivity would crash the tab layout. */
function loadFlightActivity(): ActivityApi | null {
  if (!requireOptionalNativeModule('ExpoWidgets')) return null;
  // ponytail: dynamic so Metro doesn't evaluate expo-widgets when the native module is missing.
  return require('@/components/FlightActivity').default as ActivityApi;
}

/** Keeps the Live Activity in sync with the user's flights. */
export function useFlightLive() {
  const { myFlights } = useDrawerMode();
  const [now, setNow] = useState(Date.now);

  // ponytail: polls the mocked status each minute; real updates need a backend push (APNs / Live Activity push tokens).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const tracked = useMemo(
    () => myFlights.map((flight) => ({ flight, status: flightStatus(flight, now) })),
    [myFlights, now],
  );
  const activity = activityFor(tracked, now);
  const activityKey = JSON.stringify(activity);

  const live = useRef<{ id: string; instance: LiveActivity<FlightActivityProps> } | null>(null);
  useEffect(() => {
    const next: (FlightActivityProps & { id: string }) | null = JSON.parse(activityKey);
    const FlightActivity = loadFlightActivity();
    if (!FlightActivity) return;
    // A relaunch loses our ref but not the system's activities; adopt one and end strays.
    if (!live.current) {
      const [first, ...rest] = FlightActivity.getInstances();
      rest.forEach((a) => void a.end('immediate'));
      if (first) live.current = { id: '', instance: first };
    }
    const current = live.current;
    if (!next) {
      if (current) void current.instance.end('immediate');
      live.current = null;
      return;
    }
    const { id, ...props } = next;
    try {
      if (current && (current.id === id || current.id === '')) {
        void current.instance.update(props);
        live.current = { id, instance: current.instance };
      } else {
        if (current) void current.instance.end('immediate');
        live.current = { id, instance: FlightActivity.start(props, 'flighttracker://') };
      }
    } catch {
      // Live Activities are off in Settings or unsupported on this device.
    }
  }, [activityKey]);
}