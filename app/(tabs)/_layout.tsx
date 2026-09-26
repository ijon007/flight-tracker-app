import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarMinimizeProvider } from 'expo-glass-tabs';

export default function TabLayout() {
  return (
    <TabBarMinimizeProvider>
      <NativeTabs minimizeBehavior="never">
        <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'globe', selected: 'globe' }} md="public" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="flights" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Flights</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'airplane', selected: 'airplane' }}
            md="flight"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md="person"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarMinimizeProvider>
  );
}
