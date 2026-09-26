import { GlassContainer } from 'expo-glass-effect';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassSurface, hasLiquidGlass } from '@/components/GlassSurface';
import { TabScreen } from '@/components/TabScreen';

const chips = ['Today', 'Week', 'Month'];

export default function HomeScreen() {
  const [glassOn, setGlassOn] = useState(true);

  return (
    <TabScreen title="Home" subtitle="Neutral liquid glass surfaces">
      <GlassSurface
        glassEffectStyle={glassOn ? 'regular' : 'none'}
        animate
        animationDuration={0.45}
        style={{ borderRadius: 20, padding: 18 }}>
        <Text className="text-lg font-semibold text-ink">Live glass</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          {hasLiquidGlass
            ? 'Native liquid glass is on. Style changes animate without fading opacity.'
            : 'Liquid glass is unavailable here. Same GlassView with an opaque fill and hairline.'}
        </Text>
      </GlassSurface>

      <Pressable onPress={() => setGlassOn((value) => !value)}>
        <GlassSurface isInteractive style={{ borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18 }}>
          <Text className="text-center text-base font-medium text-ink">
            {glassOn ? 'Hide glass' : 'Show glass'}
          </Text>
        </GlassSurface>
      </Pressable>

      <GlassContainer spacing={10} style={{ flexDirection: 'row', gap: 8 }}>
        {chips.map((chip) => (
          <GlassSurface
            key={chip}
            isInteractive
            glassEffectStyle="clear"
            style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 }}>
            <Text className="text-sm font-medium text-ink">{chip}</Text>
          </GlassSurface>
        ))}
      </GlassContainer>

      <View className="h-48 rounded-3xl bg-canvas-deep" />
      <View className="h-36 rounded-3xl bg-canvas-deep" />
    </TabScreen>
  );
}
