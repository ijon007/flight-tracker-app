import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarMinimizeProvider } from 'expo-glass-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

const ink = Platform.OS === 'ios' ? DynamicColorIOS({ light: '#18181B', dark: '#FAFAFA' }) : '#18181B';

export default function TabLayout() {
  return (
    <TabBarMinimizeProvider>
      <NativeTabs
        minimizeBehavior="never"
        tintColor={ink}
        labelStyle={{ color: ink }}>
        <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'house', selected: 'house.fill' }}
            md="home"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="flights" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Flights</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'airplane', selected: 'airplane' }}
            md="flight"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="map" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'map', selected: 'map.fill' }}
            md="map"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
            md="settings"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarMinimizeProvider>
  );
}
