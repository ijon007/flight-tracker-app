import { useEffect, useMemo } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassSurface';
import { DRAWER_HEADER, resist, snapHeight } from '@/components/flightDrawerSnap';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };

/** The native tab bar floats inside the bottom of the sheet; this reserves its space. */
const TAB_BAR_HEIGHT = 12;
const DRAWER_INSET = 10;
// ponytail: concentric with modern iPhone corners (~52) minus the inset. Read the real display radius if it looks off on older devices.
const DRAWER_RADIUS = 42;

const flights = [
  {
    id: 'AZ507',
    code: 'AZ 507',
    hours: 10,
    fromCity: 'Tirana',
    toCity: 'Rome',
    from: 'TIA',
    to: 'FCO',
    departs: '05:40',
    arrives: '07:00',
  },
  {
    id: 'SK412',
    code: 'SK 412',
    hours: 28,
    fromCity: 'Oslo',
    toCity: 'Stockholm',
    from: 'OSL',
    to: 'ARN',
    departs: '08:15',
    arrives: '09:15',
  },
  {
    id: 'LH800',
    code: 'LH 800',
    hours: 46,
    fromCity: 'Frankfurt',
    toCity: 'London',
    from: 'FRA',
    to: 'LHR',
    departs: '14:05',
    arrives: '14:55',
  },
];

function Leg({ code, time }: { code: string; time: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
      <Text className="text-[15px] font-medium text-white">{code}</Text>
      <Text className="text-[15px] font-medium text-[#30D158]">{time}</Text>
    </View>
  );
}

export function FlightDrawer() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const tabZone = insets.bottom + TAB_BAR_HEIGHT - DRAWER_INSET;
  const collapsed = DRAWER_HEADER + tabZone;
  const expanded = Math.round(Math.min(screenH * 0.46, 440)) + tabZone;
  const minH = useSharedValue(collapsed);
  const maxH = useSharedValue(expanded);
  const height = useSharedValue(expanded);
  const origin = useSharedValue(expanded);

  useEffect(() => {
    minH.value = collapsed;
    maxH.value = expanded;
    height.value = Math.min(Math.max(height.value, collapsed), expanded);
  }, [collapsed, expanded, height, maxH, minH]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onBegin(() => {
          origin.value = height.value;
        })
        .onUpdate((e) => {
          height.value = resist(origin.value - e.translationY, minH.value, maxH.value);
        })
        .onEnd((e) => {
          const dragged = origin.value - e.translationY;
          const target = snapHeight(dragged, minH.value, maxH.value, e.velocityY);
          height.value = withSpring(target, { ...SPRING, velocity: -e.velocityY });
        }),
    [height, maxH, minH, origin],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        const mid = (minH.value + maxH.value) / 2;
        const target = height.value < mid ? maxH.value : minH.value;
        height.value = withSpring(target, SPRING);
      }),
    [height, maxH, minH],
  );

  const gesture = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

  const sheet = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: DRAWER_INSET,
          right: DRAWER_INSET,
          bottom: DRAWER_INSET,
        },
        sheet,
      ]}>
      <GlassSurface
        colorScheme="dark"
        glassEffectStyle="regular"
        style={{
          flex: 1,
          borderRadius: DRAWER_RADIUS,
          borderCurve: 'continuous',
          overflow: 'hidden',
        }}>
        <GestureDetector gesture={gesture}>
          <View
            accessibilityRole="button"
            accessibilityLabel="Flights"
            style={{ height: DRAWER_HEADER, paddingHorizontal: 22 }}>
            <View
              style={{
                alignSelf: 'center',
                width: 36,
                height: 5,
                marginTop: 8,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.42)',
              }}
            />
            <Text className="mt-2 text-[28px] font-semibold text-white">My Flights</Text>
          </View>
        </GestureDetector>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 22, gap: 18 }}>
          {flights.map((flight) => (
            <View key={flight.id} className="flex-row">
              <View className="w-[72px]">
                <Text className="text-[40px] font-semibold leading-none text-white">
                  {flight.hours}
                </Text>
                <Text className="mt-1 text-[11px] font-semibold tracking-widest text-white/45">
                  HOURS
                </Text>
              </View>
              <View className="flex-1 pt-1">
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="text-[17px] font-semibold text-white">{flight.code}</Text>
                  <Text className="text-[13px] text-white/70">
                    Departs <Text className="text-[#30D158]">On Time</Text>
                  </Text>
                </View>
                <Text className="mt-0.5 text-[17px] text-white">
                  {flight.fromCity} to {flight.toCity}
                </Text>
                <View className="mt-2 flex-row gap-4">
                  <Leg code={flight.from} time={flight.departs} />
                  <Leg code={flight.to} time={flight.arrives} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <View pointerEvents="none" style={{ height: tabZone }} />
      </GlassSurface>
    </Animated.View>
  );
}
