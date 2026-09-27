import { requireOptionalNativeModule } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import type { LiveActivity } from 'expo-widgets';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useDrawerMode } from '@/components/DrawerMode';
import { activityFor, planAlerts, type FlightActivityProps } from '@/components/flightLive';
import { flightStatus } from '@/components/flightStatus';
import { useSettings } from '@/components/Settings';

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ponytail: in-memory, so a reload can repeat a delay/gate alert; persist alongside flights.
const firedOnce = new Set<string>();

async function canNotify() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Flight alerts',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !current.canAskAgain) return current.granted;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Keeps the Live Activity and local flight alerts in sync with the user's flights and alert switches. */
export function useFlightLive() {
  const { myFlights } = useDrawerMode();
  const { alerts } = useSettings();
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
  const plan = planAlerts(tracked, alerts, now);
  const planKey = JSON.stringify(plan);

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

  useEffect(() => {
    const planned: ReturnType<typeof planAlerts> = JSON.parse(planKey);
    let cancelled = false;
    (async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (planned.length === 0 || !(await canNotify()) || cancelled) return;
      for (const alert of planned) {
        if (cancelled) return;
        if (alert.at === undefined && firedOnce.has(alert.id)) continue;
        if (alert.at === undefined) firedOnce.add(alert.id);
        await Notifications.scheduleNotificationAsync({
          identifier: alert.id,
          content: { title: alert.title, body: alert.body },
          trigger:
            alert.at === undefined
              ? null
              : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(alert.at), channelId: 'default' },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planKey]);
}