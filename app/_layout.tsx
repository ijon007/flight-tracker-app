import '../global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const light = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#18181B',
    background: '#F4F4F5',
    card: '#F4F4F5',
    text: '#18181B',
    border: '#D4D4D8',
    notification: '#18181B',
  },
};

const dark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FAFAFA',
    background: '#18181B',
    card: '#18181B',
    text: '#FAFAFA',
    border: '#3F3F46',
    notification: '#FAFAFA',
  },
};

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={scheme === 'dark' ? dark : light}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
