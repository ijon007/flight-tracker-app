/* eslint-disable react-hooks/immutability -- shared values are written from the gesture and the snap effect */
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFlightPanel } from '@/components/AddFlightPanel';
import { useDrawerMode, type DrawerMode } from '@/components/DrawerMode';
import { GlassSurface } from '@/components/GlassSurface';
import { DRAWER_HEADER, resist, snapHeight, tapTarget } from '@/components/flightDrawerSnap';
import { FlightStack } from '@/components/FlightStack';
import { ProfilePanel } from '@/components/ProfilePanel';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };
const FADE = { duration: 220, easing: Easing.out(Easing.cubic) };
/** Liquid glass stops rendering under an opacity-0 ancestor, so the fade never goes fully transparent. */
const FADE_FROM = 0.25;

// ponytail: one height shared by every tab's drawer (only one is visible), so a tab switch starts
// from the size the last drawer had. -1 until the first drawer is shown. Move into context if a
// second drawer ever needs to be visible at once.
const height = makeMutable(-1);

const TITLES: Record<DrawerMode, string> = {
  flights: 'My Flights',
  add: 'Add Flight',
  profile: 'Profile',
};

/** The native tab bar floats inside the bottom of the sheet; this reserves its space. */
const TAB_BAR_HEIGHT = 12;
const DRAWER_INSET = 10;
// ponytail: concentric with modern iPhone corners (~52) minus the inset. Read the real display radius if it looks off on older devices.
const DRAWER_RADIUS = 42;

/**
 * Each tab renders its own drawer with a fixed mode, so a tab switch swaps whole screens
 * instead of animating one drawer between modes after the route changes.
 */
export function FlightDrawer({ mode }: { mode: DrawerMode }) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { myFlights, header: override } = useDrawerMode();
  const header = mode === 'add' ? override : null;
  const title = header?.title ?? TITLES[mode];
  const reducedMotion = useReducedMotion();
  /** Add Flight and Profile open the tall sheet. */
  const panel = mode !== 'flights';
  const tabZone = insets.bottom + TAB_BAR_HEIGHT - DRAWER_INSET;
  const collapsed = DRAWER_HEADER + tabZone;
  const tall = Math.round(screenH - insets.top - 8);
  /** Flights: closed, the short sheet, then this taller sheet. Other tabs only use closed and tall. */
  const peek = Math.round(Math.min(screenH * 0.46, 440)) + tabZone;
  const expanded = panel ? tall : peek;
  const minH = useSharedValue(collapsed);
  const midH = useSharedValue(expanded);
  const maxH = useSharedValue(tall);
  const origin = useSharedValue(0);
  /** Where this drawer settles when its tab is shown; the flights drawer remembers the user's drag. */
  const rest = useSharedValue(expanded);
  const reduceSv = useSharedValue(reducedMotion);
  const fade = useSharedValue(FADE_FROM);

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
          const target = snapHeight(dragged, minH.value, maxH.value, e.velocityY, midH.value);
          rest.value = target;
          height.value = reduceSv.value
            ? target
            : withSpring(target, { ...SPRING, velocity: -e.velocityY });
        }),
    [maxH, midH, minH, origin, reduceSv, rest],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        const target = tapTarget(height.value, minH.value, maxH.value, midH.value);
        rest.value = target;
        height.value = reduceSv.value ? target : withSpring(target, SPRING);
      }),
    [maxH, midH, minH, reduceSv, rest],
  );

  /**
   * The shown tab's drawer picks up the shared height the previous tab left behind and springs to
   * its own size, so the glass grows or shrinks across the switch while the new content fades in.
   */
  useFocusEffect(
    useCallback(() => {
      reduceSv.value = reducedMotion;
      minH.value = collapsed;
      midH.value = panel ? tall : peek;
      maxH.value = tall;
      const target = panel ? tall : snapHeight(rest.value, collapsed, tall, 0, peek);
      height.value = height.value < 0 || reducedMotion ? target : withSpring(target, SPRING);
      fade.value = reducedMotion ? 1 : withTiming(1, FADE);
      return () => {
        fade.value = FADE_FROM;
      };
    }, [collapsed, fade, maxH, midH, minH, panel, peek, reduceSv, reducedMotion, rest, tall]),
  );

  const gesture = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

  const sheet = useAnimatedStyle(() => ({ height: height.value < 0 ? midH.value : height.value }));
  const content = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: ((1 - fade.value) / (1 - FADE_FROM)) * 8 }],
  }));

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
            accessibilityLabel={title}
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
            <Animated.View style={content}>
              <Text
                numberOfLines={1}
                className="mt-2 text-[28px] font-semibold text-white"
                style={{ letterSpacing: -0.4, marginLeft: header ? 40 : 0 }}>
                {title}
              </Text>
            </Animated.View>
          </View>
        </GestureDetector>
        {/* Outside the detector so its tap doesn't also toggle the drawer. */}
        {header ? (
          <Pressable
            onPress={header.onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={{ position: 'absolute', left: 14, top: 20 }}>
            <GlassSurface
              colorScheme="dark"
              isInteractive
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SymbolView name="chevron.left" size={16} tintColor="#FFFFFF" weight="semibold" />
            </GlassSurface>
          </Pressable>
        ) : null}
        <Animated.View style={[{ flex: 1 }, content]}>
          {mode === 'profile' ? <ProfilePanel /> : null}
          {mode === 'add' ? <AddFlightPanel /> : null}
          {mode === 'flights' ? <FlightStack flights={myFlights} /> : null}
        </Animated.View>
        <View pointerEvents="none" style={{ height: tabZone }} />
      </GlassSurface>
    </Animated.View>
  );
}
