import { useMinimizeOnScroll } from 'expo-glass-tabs';
import { type ReactNode } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function TabScreen({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const onScroll = useMinimizeOnScroll();

  return (
    <Animated.ScrollView
      className="flex-1 bg-canvas"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerClassName="gap-4 px-5 pb-10"
      contentContainerStyle={{ paddingTop: insets.top + 12 }}>
      <View className="gap-1 pb-2">
        <Text className="text-3xl font-semibold text-ink">{title}</Text>
        {subtitle ? <Text className="text-base text-muted">{subtitle}</Text> : null}
      </View>
      {children}
    </Animated.ScrollView>
  );
}
