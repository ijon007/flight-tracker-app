import {
  EntityTypes,
  getCalendars,
  getDefaultCalendarSync,
  requestCalendarPermissions,
} from 'expo-calendar';
import { createEventInCalendarAsync, requestCalendarPermissionsAsync } from 'expo-calendar/legacy';
import { createURL } from 'expo-linking';
import { Alert, Linking, Platform, Share } from 'react-native';

import { airportByCode, formatDuration } from '@/components/addFlightCatalog';
import type { MyFlight } from '@/components/DrawerMode';
import { departureDate } from '@/components/flightLink';
import { shareText } from '@/components/flightStackLayout';

export async function shareFlight(flight: MyFlight) {
  const url = createURL('/', {
    queryParams: { flight: flight.code.replace(/\s+/g, ''), date: departureDate(flight) },
  });
  try {
    await Share.share({
      message: `${shareText({ ...flight, duration: formatDuration(flight.minutes) })}\n${url}`,
    });
  } catch {
    // User dismissed the sheet; nothing to do.
  }
}

function eventFields(flight: MyFlight) {
  return {
    title: `${flight.code} · ${flight.fromCity} to ${flight.toCity}`,
    startDate: new Date(flight.departsAt),
    endDate: new Date(flight.departsAt + flight.minutes * 60_000),
    location: airportByCode(flight.from)?.name ?? flight.from,
    notes: shareText({ ...flight, duration: formatDuration(flight.minutes) }),
  };
}

function denied() {
  Alert.alert('Calendar access needed', 'Allow calendar access in Settings to add flights.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: () => Linking.openSettings() },
  ]);
}

/** Opens the system "new event" form prefilled; the user confirms or cancels there. */
export async function addFlightToCalendar(flight: MyFlight) {
  const fields = eventFields(flight);
  try {
    // Expo Go stubs CalendarNext as a class, so these next-API functions are undefined.
    if (typeof requestCalendarPermissions === 'function') {
      const { granted } = await requestCalendarPermissions(Platform.OS === 'ios');
      if (!granted) return denied();
      const calendar =
        Platform.OS === 'ios'
          ? getDefaultCalendarSync()
          : (await getCalendars(EntityTypes.EVENT))
              .filter((c) => c.allowsModifications)
              .sort((a, b) => Number(b.isPrimary ?? false) - Number(a.isPrimary ?? false))[0];
      if (!calendar) {
        Alert.alert('No calendar', 'Add a calendar account on this device first.');
        return;
      }
      await calendar.addEventWithForm(fields);
      return;
    }
    const { granted } = await requestCalendarPermissionsAsync();
    if (!granted) return denied();
    await createEventInCalendarAsync(fields);
  } catch {
    Alert.alert('Could not add to calendar', 'Try again after a development build.');
  }
}
