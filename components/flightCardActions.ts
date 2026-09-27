import { Share } from 'react-native';

import { formatDuration } from '@/components/addFlightCatalog';
import type { MyFlight } from '@/components/DrawerMode';
import { shareText } from '@/components/flightStackLayout';

export async function shareFlight(flight: MyFlight) {
  try {
    await Share.share({
      message: shareText({ ...flight, duration: formatDuration(flight.minutes) }),
    });
  } catch {
    // User dismissed the sheet; nothing to do.
  }
}

// ponytail: stub until calendar, Live Activity, and alerts land.
export async function addFlightToCalendar(_flight: MyFlight) {}
