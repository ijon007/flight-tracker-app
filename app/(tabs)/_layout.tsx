import { router, usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarMinimizeProvider } from 'expo-glass-tabs';
import { useEffect, useRef } from 'react';

import { DrawerModeProvider, useDrawerMode, type DrawerMode } from '@/components/DrawerMode';

export const unstable_settings = {
  initialRouteName: 'index',
};

function Tabs() {
  const { mode, open, close, toggle } = useDrawerMode();
  const pathname = usePathname();
  const modeRef = useRef(mode);
  const pathRef = useRef(pathname);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /** The profile tab is selected natively; its map shows the profile drawer. */
  useEffect(() => {
    pathRef.current = pathname;
    if (pathname === '/profile') open('profile');
  }, [open, pathname]);

  /** Closing the profile drawer returns to the Flights tab. */
  useEffect(() => {
    if (mode === 'flights' && pathRef.current === '/profile') router.navigate('/');
  }, [mode]);

  /** Drawer tabs stay on the map; the press only switches what the drawer shows. */
  const drawerTab = (target: DrawerMode) => ({
    tabPress: () => {
      const opening = modeRef.current !== target;
      toggle(target);
      if (opening) router.navigate('/');
    },
  });

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
        disableAutomaticContentInsets
        unstable_nativeProps={{ preventNativeSelection: true }}
        listeners={drawerTab('add')}>
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  return (
    <DrawerModeProvider>
      <TabBarMinimizeProvider>
        <Tabs />
      </TabBarMinimizeProvider>
    </DrawerModeProvider>
  );
}
