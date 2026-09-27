import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, withSpring } from 'react-native-reanimated';

import { airlineByCode, distanceKm } from '@/components/addFlightCatalog';
import { useDrawerMode, type MyFlight } from '@/components/DrawerMode';
import { addFlightToCalendar, shareFlight } from '@/components/flightCardActions';
import { FlightCardMenu } from '@/components/FlightCardMenu';
import { dateLabel, gradientFor, PEEK, placeCard, stackHeight, stripLabel } from '@/components/flightStackLayout';
import { estimatedFlight, flightStatus, isPast, type FlightPhase, type FlightStatus } from '@/components/flightStatus';
import { PastTrips } from '@/components/PastTrips';
import { useFlightFormat } from '@/components/Settings';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };
/** Colored cards need a brighter secondary than the drawer glass does. */
const SECONDARY = 'rgba(255,255,255,0.8)';
const DEFAULT_CARD_H = 250;
/** Status only changes on minute boundaries, so the stack re-renders at most twice a minute. */
const TICK = 30_000;

const PHASE_DOT: Record<FlightPhase, string> = {
  scheduled: '#30D158',
  delayed: '#FF9F0A',
  boarding: '#64D2FF',
  departed: '#FFFFFF',
  landed: '#30D158',
  cancelled: '#FF453A',
};

/** Clock time for status, refreshed every TICK and on return to the foreground (timers pause in background). */
function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, TICK);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);
  return now;
}

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

/** Estimated time, with the schedule struck through beside it when they differ. */
function Clock({ time, was }: { time: string; was?: string }) {
  return (
    <View className="mt-1 flex-row items-baseline gap-1.5">
      {was ? (
        <Text
          accessibilityLabel={`scheduled ${was}`}
          className="text-[15px] font-medium"
          style={{ color: SECONDARY, textDecorationLine: 'line-through', fontVariant: ['tabular-nums'] }}>
          {was}
        </Text>
      ) : null}
      <Text
        className="text-[22px] font-semibold text-white"
        style={{ fontVariant: ['tabular-nums'], letterSpacing: -0.4 }}>
        {time}
      </Text>
    </View>
  );
}

type CardProps = {
  flight: MyFlight;
  status: FlightStatus;
  now: number;
  y: number;
  scale: number;
  open: boolean;
  anyOpen: boolean;
  onPress: () => void;
  onShare: () => void;
  onCalendar: () => void;
  onRemove: () => void;
  onMeasure: (height: number) => void;
  width: number;
  height: number;
};

const RADIUS = 28;

function FlightCard({ flight, status, now, y, scale, open, anyOpen, onPress, onShare, onCalendar, onRemove, onMeasure, width, height }: CardProps) {
  const reduced = useReducedMotion();
  const fmt = useFlightFormat();
  const [start, end] = gradientFor(flight.id);
  const airline = airlineByCode(flight.code.split(' ')[0] ?? '')?.name ?? flight.code;
  const when = stripLabel(status, now);
  const est = estimatedFlight(flight, status);
  const late = status.delayMinutes > 0;
  const km = distanceKm(flight.from, flight.to);
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
      <FlightCardMenu radius={RADIUS} onPress={onPress} onShare={onShare} onCalendar={onCalendar} onRemove={onRemove}>
      <View
            onLayout={(e) => onMeasure(e.nativeEvent.layout.height)}
            accessibilityRole="button"
            accessibilityLabel={[
              `${flight.code}, ${flight.fromCity} to ${flight.toCity}`,
              `departs ${fmt.time(est, 'departs')}`,
              status.label,
              status.gate ? `gate ${status.gate}` : null,
              when === status.label ? null : when,
            ]
              .filter(Boolean)
              .join(', ')}
            accessibilityHint={anyOpen ? 'Shows all flights. Hold for share or remove.' : 'Shows flight details. Hold for share or remove.'}
            accessibilityState={{ expanded: open }}
            accessibilityActions={[
              { name: 'share', label: 'Share' },
              { name: 'calendar', label: 'Add to Calendar' },
              { name: 'delete', label: 'Remove' },
            ]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'share') onShare();
              if (e.nativeEvent.actionName === 'calendar') onCalendar();
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
                  <Clock time={fmt.time(est, 'departs')} was={late ? fmt.time(flight, 'departs') : undefined} />
                </View>
                <View className="items-end">
                  <Text numberOfLines={1} className="text-[15px]" style={{ color: SECONDARY }}>
                    {flight.toCity}
                  </Text>
                  <Clock time={fmt.time(est, 'arrives')} was={late ? fmt.time(flight, 'arrives') : undefined} />
                </View>
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.35)' }} />
              <View className="flex-row justify-between">
                <Field label="FLIGHT" value={flight.code} align="flex-start" />
                <Field label="DATE" value={dateLabel(flight.departsAt)} align="center" />
                <Field label="DURATION" value={fmt.duration(flight.minutes)} align="flex-end" />
              </View>
              <View className="flex-row justify-between">
                {status.terminal ? <Field label="TERMINAL" value={status.terminal} align="flex-start" /> : <View />}
                {status.gate ? <Field label="GATE" value={status.gate} align="center" /> : <View />}
                {km === null ? <View /> : <Field label="DISTANCE" value={fmt.distance(km)} align="flex-end" />}
              </View>
              <View className="flex-row items-center justify-between">
                <Text numberOfLines={1} className="flex-1 text-[15px] font-semibold text-white">
                  {airline}
                </Text>
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
                  <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PHASE_DOT[status.phase] }} />
                  <Text className="text-[13px] font-semibold text-white">{status.label}</Text>
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
  const { removeFlight, openFlightId: openId, setOpenFlightId: setOpenId } = useDrawerMode();
  const now = useNow();
  const [cardH, setCardH] = useState(DEFAULT_CARD_H);
  const [width, setWidth] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const trips = flights.map((flight) => ({ flight, status: flightStatus(flight, now) }));
  const upcoming = trips.filter((t) => !isPast(t.status));
  const past = trips.filter((t) => isPast(t.status)).reverse();
  const open = upcoming.findIndex((t) => t.flight.id === openId);

  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 22, gap: 28 }}>
      {upcoming.length === 0 ? (
        <View className="items-center px-6" style={{ paddingTop: 20, gap: 6 }}>
          <SymbolView name="airplane.departure" size={30} tintColor="rgba(255,255,255,0.6)" />
          <Text className="mt-2 text-[17px] font-semibold text-white">No upcoming flights</Text>
          <Text className="text-center text-[15px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Flights you add will show up here.
          </Text>
        </View>
      ) : (
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ height: stackHeight(upcoming.length, open, cardH), overflow: 'hidden' }}>
          {width > 0 &&
            upcoming.map(({ flight, status }, i) => {
              const { y, scale } = placeCard(i, open, cardH);
              return (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  status={status}
                  now={now}
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
                  onCalendar={() => {
                    void addFlightToCalendar(flight);
                  }}
                  onRemove={() => removeFlight(flight.id)}
                  onPress={() => {
                    setOpenId(open >= 0 ? null : flight.id);
                    scroll.current?.scrollTo({ y: 0 });
                  }}
                />
              );
            })}
        </View>
      )}
      {past.length > 0 ? <PastTrips trips={past} /> : null}
    </ScrollView>
  );
}
