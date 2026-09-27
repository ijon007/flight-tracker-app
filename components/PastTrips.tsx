import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { useDrawerMode, type MyFlight } from '@/components/DrawerMode';
import { addFlightToCalendar, shareFlight } from '@/components/flightCardActions';
import { FlightCardMenu } from '@/components/FlightCardMenu';
import { dateLabel, gradientFor } from '@/components/flightStackLayout';
import type { FlightStatus } from '@/components/flightStatus';

const ROW_H = 64;
const RADIUS = 18;
const MUTED = 'rgba(255,255,255,0.6)';

/** Landed and cancelled flights, newest first. Tap frames the route on the map; hold for share or remove. */
export function PastTrips({ trips }: { trips: { flight: MyFlight; status: FlightStatus }[] }) {
  const { removeFlight, openFlightId, setOpenFlightId } = useDrawerMode();

  return (
    <View className="gap-2.5">
      <Text
        accessibilityRole="header"
        className="px-1.5 text-[13px] font-semibold uppercase tracking-wide"
        style={{ color: 'rgba(255,255,255,0.7)' }}>
        Past Trips
      </Text>
      {trips.map(({ flight, status }) => {
        const [start, end] = gradientFor(flight.id);
        const selected = openFlightId === flight.id;
        const onShare = () => {
          void shareFlight(flight);
        };
        const onRemove = () => removeFlight(flight.id);
        return (
          <View key={flight.id} style={{ height: ROW_H }}>
            <FlightCardMenu
              radius={RADIUS}
              onPress={() => setOpenFlightId(selected ? null : flight.id)}
              onShare={onShare}
              onCalendar={() => {
                void addFlightToCalendar(flight);
              }}
              onRemove={onRemove}>
              <View
                accessibilityRole="button"
                accessibilityLabel={`${flight.code}, ${flight.fromCity} to ${flight.toCity}, ${dateLabel(flight.departsAt)}, ${status.label}`}
                accessibilityHint="Shows the route on the map. Hold for share or remove."
                accessibilityState={{ selected }}
                accessibilityActions={[
                  { name: 'share', label: 'Share' },
                  { name: 'delete', label: 'Remove' },
                ]}
                onAccessibilityAction={(e) => {
                  if (e.nativeEvent.actionName === 'share') onShare();
                  if (e.nativeEvent.actionName === 'delete') onRemove();
                }}
                className="flex-row items-center gap-3 px-3"
                style={{
                  height: ROW_H,
                  borderRadius: RADIUS,
                  borderCurve: 'continuous',
                  backgroundColor: selected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                }}>
                <View
                  className="items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    backgroundColor: start,
                    experimental_backgroundImage: `linear-gradient(120deg, ${start}, ${end})`,
                  }}>
                  <SymbolView
                    name={status.phase === 'cancelled' ? 'xmark' : 'airplane.arrival'}
                    size={18}
                    tintColor="#FFFFFF"
                    weight="semibold"
                  />
                </View>
                <View className="flex-1" style={{ gap: 2 }}>
                  <Text numberOfLines={1} className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.4 }}>
                    {flight.fromCity} → {flight.toCity}
                  </Text>
                  <Text numberOfLines={1} className="text-[13px]" style={{ color: MUTED }}>
                    {flight.code} · {flight.from}–{flight.to}
                  </Text>
                </View>
                <View className="items-end" style={{ gap: 2 }}>
                  <Text className="text-[15px] font-medium text-white">{dateLabel(flight.departsAt)}</Text>
                  <Text
                    className="text-[13px] font-medium"
                    style={{ color: status.phase === 'cancelled' ? '#FF453A' : MUTED }}>
                    {status.label}
                  </Text>
                </View>
              </View>
            </FlightCardMenu>
          </View>
        );
      })}
    </View>
  );
}
