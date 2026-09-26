import { useMinimizeOnScroll } from 'expo-glass-tabs';
import { type ReactNode } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

type Props = {
  title?: string;
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
      contentContainerClassName="gap-8 px-5"
      contentContainerStyle={{
        paddingTop: insets.top + (title ? 8 : 20),
        paddingBottom: insets.bottom + 96,
      }}>
      {title ? (
        <View className="gap-1">
          <Text className="text-[34px] font-bold text-ink" style={{ letterSpacing: -0.4, lineHeight: 41 }}>
            {title}
          </Text>
          {subtitle ? <Text className="text-[15px] text-muted">{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </Animated.ScrollView>
  );
}
