import { router, usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarMinimizeProvider } from 'expo-glass-tabs';
import { useEffect, useRef } from 'react';

import { DrawerModeProvider, useDrawerMode } from '@/components/DrawerMode';
import { SettingsProvider } from '@/components/Settings';

export const unstable_settings = {
  initialRouteName: 'index',
};

function Tabs() {
  const { mode, open, close } = useDrawerMode();
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  /** Profile and Search stay selected; each route shows its drawer on the map. */
  useEffect(() => {
    pathRef.current = pathname;
    if (pathname === '/profile') open('profile');
    if (pathname === '/search') open('add');
  }, [open, pathname]);

  /** Closing those drawers returns to the Flights tab. */
  useEffect(() => {
    const path = pathRef.current;
    if (mode === 'flights' && (path === '/profile' || path === '/search')) router.navigate('/');
  }, [mode]);

  return (
    <NativeTabs minimizeBehavior="never">
      <NativeTabs.Trigger
        name="index"
        disableAutomaticContentInsets
        listeners={{ tabPress: () => close() }}>
        <NativeTabs.Trigger.Label>Flights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'airplane.ticket', selected: 'airplane.ticket.fill' }} md="public" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="profile"
        disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="search"
        role="search"
        disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  return (
    <SettingsProvider>
      <DrawerModeProvider>
        <TabBarMinimizeProvider>
          <Tabs />
        </TabBarMinimizeProvider>
      </DrawerModeProvider>
    </SettingsProvider>
  );
}
