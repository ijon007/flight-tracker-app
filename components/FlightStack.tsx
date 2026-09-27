import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, withSpring } from 'react-native-reanimated';

import { airlineByCode, formatDuration } from '@/components/addFlightCatalog';
import { useDrawerMode, type MyFlight } from '@/components/DrawerMode';
import { shareFlight } from '@/components/flightCardActions';
import { FlightCardMenu } from '@/components/FlightCardMenu';
import { countdown, dateLabel, gradientFor, PEEK, placeCard, stackHeight } from '@/components/flightStackLayout';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };
/** Colored cards need a brighter secondary than the drawer glass does. */
const SECONDARY = 'rgba(255,255,255,0.8)';
const DEFAULT_CARD_H = 250;

function Field({ label, value, align }: { label: string; value: string; align: 'flex-start' | 'center' | 'flex-end' }) {
  return (
    <View style={{ alignItems: align, gap: 2 }}>
      <Text className="text-[11px] font-semibold" style={{ color: SECONDARY, letterSpacing: 0.6 }}>
        {label}
      </Text>
      <Text numberOfLines={1} className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.4 }}>
        {value}
      </Text>
    </View>
  );
}

type CardProps = {
  flight: MyFlight;
  y: number;
  scale: number;
  open: boolean;
  anyOpen: boolean;
  onPress: () => void;
  onShare: () => void;
  onRemove: () => void;
  onMeasure: (height: number) => void;
  width: number;
  height: number;
};

const RADIUS = 28;

function FlightCard({ flight, y, scale, open, anyOpen, onPress, onShare, onRemove, onMeasure, width, height }: CardProps) {
  const reduced = useReducedMotion();
  const [start, end] = gradientFor(flight.id);
  const airline = airlineByCode(flight.code.split(' ')[0] ?? '')?.name ?? flight.code;
  const when = countdown(flight.departsAt);
  const place = useAnimatedStyle(() => ({
    transform: [
      { translateY: reduced ? y : withSpring(y, SPRING) },
      { scale: reduced ? scale : withSpring(scale, SPRING) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          borderRadius: RADIUS,
          borderCurve: 'continuous',
          overflow: 'hidden',
        },
        place,
      ]}>
      <FlightCardMenu radius={RADIUS} onPress={onPress} onShare={onShare} onRemove={onRemove}>
      <View
            onLayout={(e) => onMeasure(e.nativeEvent.layout.height)}
            accessibilityRole="button"
            accessibilityLabel={`${flight.code}, ${flight.fromCity} to ${flight.toCity}, departs ${flight.departs}, ${when}`}
            accessibilityHint={anyOpen ? 'Shows all flights. Hold for share or remove.' : 'Shows flight details. Hold for share or remove.'}
            accessibilityState={{ expanded: open }}
            accessibilityActions={[
              { name: 'share', label: 'Share' },
              { name: 'delete', label: 'Remove' },
            ]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'share') onShare();
              if (e.nativeEvent.actionName === 'delete') onRemove();
            }}
            style={{
              width,
              borderRadius: RADIUS,
              borderCurve: 'continuous',
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(255,255,255,0.35)',
            }}>
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: start,
                  experimental_backgroundImage: `linear-gradient(120deg, ${start}, ${end})`,
                },
              ]}
            />
            <View style={{ height: PEEK, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
              <Text className="text-[40px] font-semibold text-white" style={{ letterSpacing: -1 }}>
                {flight.from}
              </Text>
              <View className="flex-1 items-center">
                <SymbolView name="airplane" size={18} tintColor="#FFFFFF" weight="semibold" />
                <Text className="mt-0.5 text-[13px] font-semibold" style={{ color: SECONDARY }}>
                  {when}
                </Text>
              </View>
              <Text className="text-[40px] font-semibold text-white" style={{ letterSpacing: -1 }}>
                {flight.to}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
              <View className="flex-row justify-between">
                <View>
                  <Text numberOfLines={1} className="text-[15px]" style={{ color: SECONDARY }}>
                    {flight.fromCity}
                  </Text>
                  <Text
                    className="mt-1 text-[22px] font-semibold text-white"
                    style={{ fontVariant: ['tabular-nums'], letterSpacing: -0.4 }}>
                    {flight.departs}
                  </Text>
                </View>
                <View className="items-end">
                  <Text numberOfLines={1} className="text-[15px]" style={{ color: SECONDARY }}>
                    {flight.toCity}
                  </Text>
                  <Text
                    className="mt-1 text-[22px] font-semibold text-white"
                    style={{ fontVariant: ['tabular-nums'], letterSpacing: -0.4 }}>
                    {flight.arrives}
                  </Text>
                </View>
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.35)' }} />
              <View className="flex-row justify-between">
                <Field label="FLIGHT" value={flight.code} align="flex-start" />
                <Field label="DATE" value={dateLabel(flight.departsAt)} align="center" />
                <Field label="DURATION" value={formatDuration(flight.minutes)} align="flex-end" />
              </View>
              <View className="flex-row items-center justify-between">
                <Text numberOfLines={1} className="flex-1 text-[15px] font-semibold text-white">
                  {airline}
                </Text>
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
                  <View className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                  <Text className="text-[13px] font-semibold text-white">On Time</Text>
                </View>
              </View>
            </View>
          </View>
      </FlightCardMenu>
    </Animated.View>
  );
}

/** Wallet-style stack: tap a card to lift it to the top, tap again (or the pile) to put it back. */
export function FlightStack({ flights }: { flights: MyFlight[] }) {
  const { removeFlight } = useDrawerMode();
  const [openId, setOpenId] = useState<string | null>(null);
  const [cardH, setCardH] = useState(DEFAULT_CARD_H);
  const [width, setWidth] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const open = flights.findIndex((f) => f.id === openId);

  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 22 }}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: stackHeight(flights.length, open, cardH), overflow: 'hidden' }}>
        {width > 0 &&
        flights.map((flight, i) => {
            const { y, scale } = placeCard(i, open, cardH);
            return (
              <FlightCard
                key={flight.id}
                flight={flight}
                y={y}
                scale={scale}
                open={i === open}
                anyOpen={open >= 0}
                width={width}
                height={cardH}
                onMeasure={(h) => setCardH((prev) => (h > prev ? h : prev))}
                onShare={() => {
                  void shareFlight(flight);
                }}
                onRemove={() => {
                  if (openId === flight.id) setOpenId(null);
                  removeFlight(flight.id);
                }}
                onPress={() => {
                  setOpenId(open >= 0 ? null : flight.id);
                  scroll.current?.scrollTo({ y: 0 });
                }}
              />
            );
          })}
      </View>
    </ScrollView>
  );
}
