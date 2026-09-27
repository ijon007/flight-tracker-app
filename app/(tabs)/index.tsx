import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { useDrawerMode } from '@/components/DrawerMode';
import { resolveFlightLink } from '@/components/flightLink';
import { MapScreen } from '@/components/MapScreen';

export default function FlightsScreen() {
  const { flight, date } = useLocalSearchParams<{ flight?: string; date?: string }>();
  const { myFlights, addFlight, setOpenFlightId, close } = useDrawerMode();

  /** Shared links (flighttracker://?flight=AZ507&date=2026-09-28) open that flight, adding it if needed. */
  useEffect(() => {
    if (!flight || !date) return;
    const link = resolveFlightLink(flight, date, myFlights);
    router.setParams({ flight: undefined, date: undefined });
    if (!link) {
      Alert.alert('Flight not found', `${flight} on ${date} isn't on the schedule.`);
      return;
    }
    if (link.add) addFlight(link.add);
    close();
    setOpenFlightId(link.id);
  }, [addFlight, close, date, flight, myFlights, setOpenFlightId]);

  return <MapScreen drawer="flights" />;
}
