import { useEffect } from 'react';
import { router, usePathname } from 'expo-router';

import { useDrawerMode } from '@/components/DrawerMode';

/** Deep links to Search open Add Flight on the map. Tab presses handle this themselves. */
export default function SearchRedirect() {
  const { open } = useDrawerMode();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/search') return;
    open('add');
    router.replace('/');
  }, [open, pathname]);

  return null;
}
