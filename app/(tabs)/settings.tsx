import { Text, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { TabScreen } from '@/components/TabScreen';

const rows = [
  { label: 'Appearance', value: 'System' },
  { label: 'Units', value: 'Metric' },
  { label: 'Notifications', value: 'On' },
];

export default function SettingsScreen() {
  return (
    <TabScreen title="Settings" subtitle="Preferences">
      {rows.map((row) => (
        <GlassSurface key={row.label} isInteractive style={{ borderRadius: 18, padding: 16 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-ink">{row.label}</Text>
            <Text className="text-base text-muted">{row.value}</Text>
          </View>
        </GlassSurface>
      ))}
    </TabScreen>
  );
}
