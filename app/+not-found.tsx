import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="text-xl font-semibold text-ink">This screen does not exist.</Text>
        <Link href="/" className="mt-4 py-3">
          <Text className="text-base text-muted">Go home</Text>
        </Link>
      </View>
    </>
  );
}
