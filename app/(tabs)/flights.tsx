import { Text, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { TabScreen } from '@/components/TabScreen';

const flights = [
  { id: 'SK412', from: 'OSL', to: 'ARN', time: '08:15' },
  { id: 'AY912', from: 'HEL', to: 'CPH', time: '11:40' },
  { id: 'LH800', from: 'FRA', to: 'LHR', time: '14:05' },
  { id: 'AF1240', from: 'CDG', to: 'AMS', time: '17:20' },
];

export default function FlightsScreen() {
  return (
    <TabScreen title="Flights" subtitle="Upcoming legs">
      {flights.map((flight) => (
        <GlassSurface key={flight.id} style={{ borderRadius: 20, padding: 18 }}>
          <View className="flex-row items-baseline justify-between">
            <Text className="text-lg font-semibold text-ink">{flight.id}</Text>
            <Text className="text-sm text-muted">{flight.time}</Text>
          </View>
          <Text className="mt-2 text-base text-ink">
            {flight.from} → {flight.to}
          </Text>
        </GlassSurface>
      ))}
    </TabScreen>
  );
}
