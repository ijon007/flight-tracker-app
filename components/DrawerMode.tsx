import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type DrawerMode = 'flights' | 'add' | 'profile';

type DrawerModeApi = {
  mode: DrawerMode;
  open: (mode: DrawerMode) => void;
  close: () => void;
  toggle: (mode: DrawerMode) => void;
};

const DrawerModeContext = createContext<DrawerModeApi | null>(null);

export function DrawerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DrawerMode>('flights');
  const open = useCallback((next: DrawerMode) => setMode(next), []);
  const close = useCallback(() => setMode('flights'), []);
  const toggle = useCallback(
    (next: DrawerMode) => setMode((current) => (current === next ? 'flights' : next)),
    [],
  );
  const value = useMemo(() => ({ mode, open, close, toggle }), [mode, open, close, toggle]);

  return <DrawerModeContext.Provider value={value}>{children}</DrawerModeContext.Provider>;
}

export function useDrawerMode() {
  const value = useContext(DrawerModeContext);
  if (!value) throw new Error('DrawerModeProvider is missing');
  return value;
}
