import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

/** Mirrors the iOS ContentUnavailableView layout. */
export function EmptyFlights() {
  return (
    <View className="items-center justify-center px-8" style={{ height: 220, gap: 6 }}>
      <SymbolView name="airplane" size={44} tintColor="rgba(255,255,255,0.55)" />
      <Text className="mt-2 text-[22px] font-bold text-white" style={{ letterSpacing: -0.4 }}>
        No Upcoming Flights
      </Text>
      <Text className="text-center text-[15px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Flights you add will appear here.
      </Text>
    </View>
  );
}
