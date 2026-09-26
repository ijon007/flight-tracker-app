import { useEffect } from 'react';
import { router } from 'expo-router';

import { useDrawerMode } from '@/components/DrawerMode';

/** The search tab never stays on its own screen. It opens Add Flight on the map. */
export default function SearchRedirect() {
  const { open } = useDrawerMode();

  useEffect(() => {
    open('add');
    router.replace('/');
  }, [open]);

  return null;
}
