import { Text, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { TabScreen } from '@/components/TabScreen';

export default function MapScreen() {
  return (
    <TabScreen title="Map" subtitle="Region overlay">
      <View className="h-72 overflow-hidden rounded-3xl bg-canvas-deep">
        <View className="absolute inset-0 opacity-40">
          <View className="mt-10 h-px bg-hairline" />
          <View className="mt-16 h-px bg-hairline" />
          <View className="mt-20 h-px bg-hairline" />
        </View>
      </View>
      <GlassSurface glassEffectStyle="clear" style={{ borderRadius: 20, padding: 18 }}>
        <Text className="text-lg font-semibold text-ink">North Atlantic</Text>
        <Text className="mt-1 text-sm text-muted">Clear glass over the map field.</Text>
      </GlassSurface>
    </TabScreen>
  );
}
