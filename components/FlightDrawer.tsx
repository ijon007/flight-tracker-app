/* eslint-disable react-hooks/immutability -- shared values are written from the gesture and the snap effect */
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFlightPanel } from '@/components/AddFlightPanel';
import { useDrawerMode, type DrawerMode } from '@/components/DrawerMode';
import { GlassSurface } from '@/components/GlassSurface';
import { DRAWER_HEADER, resist, snapHeight } from '@/components/flightDrawerSnap';
import { FlightStack } from '@/components/FlightStack';
import { ProfilePanel } from '@/components/ProfilePanel';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };

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

export function FlightDrawer() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { mode, myFlights, header: override } = useDrawerMode();
  const header = mode === 'add' ? override : null;
  const title = header?.title ?? TITLES[mode];
  const reducedMotion = useReducedMotion();
  /** Add Flight and Profile open the tall sheet; collapsing keeps the current mode. */
  const panel = mode !== 'flights';
  const tabZone = insets.bottom + TAB_BAR_HEIGHT - DRAWER_INSET;
  const collapsed = DRAWER_HEADER + tabZone;
  const flightsExpanded = Math.round(Math.min(screenH * 0.46, 440)) + tabZone;
  const panelExpanded = Math.round(screenH - insets.top - 8);
  const minH = useSharedValue(collapsed);
  const maxH = useSharedValue(panel ? panelExpanded : flightsExpanded);
  const height = useSharedValue(panel ? panelExpanded : flightsExpanded);
  const origin = useSharedValue(height.value);
  const saved = useSharedValue(flightsExpanded);
  const reduceSv = useSharedValue(reducedMotion);
  const prevMode = useRef(mode);

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
          height.value = reduceSv.value
            ? target
            : withSpring(target, { ...SPRING, velocity: -e.velocityY });
        }),
    [height, maxH, minH, origin, reduceSv],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        const mid = (minH.value + maxH.value) / 2;
        const target = height.value < mid ? maxH.value : minH.value;
        height.value = reduceSv.value ? target : withSpring(target, SPRING);
      }),
    [height, maxH, minH, reduceSv],
  );

  useEffect(() => {
    const wasPanel = prevMode.current !== 'flights';
    const switched = prevMode.current !== mode;
    const entered = !wasPanel && panel;
    const left = wasPanel && !panel;
    prevMode.current = mode;
    reduceSv.value = reducedMotion;
    minH.value = collapsed;
    maxH.value = panel ? panelExpanded : flightsExpanded;

    if (entered) saved.value = height.value;
    if (entered || (switched && panel)) {
      height.value = reducedMotion ? panelExpanded : withSpring(panelExpanded, SPRING);
      return;
    }
    if (left) {
      const back = Math.min(Math.max(saved.value, collapsed), flightsExpanded);
      height.value = reducedMotion ? back : withSpring(back, SPRING);
      return;
    }
    height.value = Math.min(Math.max(height.value, collapsed), maxH.value);
  }, [
    panelExpanded,
    panel,
    collapsed,
    flightsExpanded,
    height,
    maxH,
    minH,
    mode,
    reduceSv,
    reducedMotion,
    saved,
  ]);

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
            <Text
              numberOfLines={1}
              className="mt-2 text-[28px] font-semibold text-white"
              style={{ letterSpacing: -0.4, marginLeft: header ? 40 : 0 }}>
              {title}
            </Text>
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
        {/* Profile stays mounted so its edits survive switching drawer modes. */}
        <View style={{ flex: 1, display: mode === 'profile' ? 'flex' : 'none' }}>
          <ProfilePanel />
        </View>
        <View style={{ flex: 1, display: mode === 'add' ? 'flex' : 'none' }}>
          <AddFlightPanel />
        </View>
        {mode !== 'flights' ? null : <FlightStack flights={myFlights} />}
        <View pointerEvents="none" style={{ height: tabZone }} />
      </GlassSurface>
    </Animated.View>
  );
}
