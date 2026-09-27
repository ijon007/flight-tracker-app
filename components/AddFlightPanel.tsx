/* eslint-disable react-hooks/immutability -- the transition direction shared value is written on push/back */
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import Animated, {
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type EntryAnimationsValues,
  type ExitAnimationsValues,
  type LayoutAnimation,
} from 'react-native-reanimated';
import { ScopedTheme } from 'uniwind';

import { airlineByCode, airportByCode, dateFromKey, flightCode } from '@/components/addFlightCatalog';
import {
  AirlineNumberStep,
  ConfirmStep,
  DateStep,
  DestinationStep,
  ResultsStep,
  SearchStep,
  FILTER_TITLE,
  type SearchState,
  type Step,
} from '@/components/addFlight/steps';
import { useDrawerMode } from '@/components/DrawerMode';

const SPRING = { damping: 32, stiffness: 320, mass: 0.7 };
/** Where the covered step sits while the next one is on top, as a share of the width. */
const PARALLAX = 0.3;

function titleFor(step: Step): string {
  switch (step.kind) {
    case 'search':
      return 'Add Flight';
    case 'destination':
      return `From ${airportByCode(step.from)?.code ?? step.from}`;
    case 'airlineNumber':
      return airlineByCode(step.airline)?.name ?? step.airline;
    case 'date':
      return 'Date';
    case 'results':
      return 'Select Flight';
    case 'confirm':
      return flightCode(step.flight);
    default: {
      const never: never = step;
      throw new Error(`Unknown step ${JSON.stringify(never)}`);
    }
  }
}

export function AddFlightPanel() {
  const { mode, setHeader, addFlight, myFlights, close } = useDrawerMode();
  const reduced = useReducedMotion();
  const [stack, setStack] = useState<Step[]>([{ kind: 'search' }]);
  const [search, setSearch] = useState<SearchState>({ query: '', filter: null });
  /** 1 = push, -1 = back, 0 = first mount (no transition). */
  const dir = useSharedValue(0);
  const step = stack[stack.length - 1]!;

  const push = useCallback(
    (next: Step) => {
      Keyboard.dismiss();
      dir.value = 1;
      setStack((s) => [...s, next]);
    },
    [dir],
  );
  const back = useCallback(() => {
    Keyboard.dismiss();
    dir.value = -1;
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, [dir]);

  useEffect(() => {
    if (step.kind !== 'search') {
      setHeader({ title: titleFor(step), onBack: back });
      return;
    }
    if (search.filter) {
      setHeader({
        title: FILTER_TITLE[search.filter],
        onBack: () => {
          Keyboard.dismiss();
          setSearch({ query: '', filter: null });
        },
      });
      return;
    }
    setHeader(null);
  }, [back, search.filter, setHeader, step]);
  useEffect(() => () => setHeader(null), [setHeader]);

  // The panel stays mounted (remounting drops the nested liquid glass), so reset it on close.
  const [wasOpen, setWasOpen] = useState(mode === 'add');
  if (wasOpen !== (mode === 'add')) {
    setWasOpen(mode === 'add');
    if (mode !== 'add') {
      setStack([{ kind: 'search' }]);
      setSearch({ query: '', filter: null });
    }
  }
  useEffect(() => {
    if (mode !== 'add') dir.value = 0;
  }, [dir, mode]);

  const entering = (v: EntryAnimationsValues): LayoutAnimation => {
    'worklet';
    const d = dir.value;
    if (d === 0) return { initialValues: {}, animations: {} };
    if (reduced) return { initialValues: { opacity: 0 }, animations: { opacity: withTiming(1, { duration: 200 }) } };
    return {
      initialValues: { opacity: 0, transform: [{ translateX: d > 0 ? v.windowWidth : -v.windowWidth * PARALLAX }] },
      animations: {
        opacity: withTiming(1, { duration: 220 }),
        transform: [{ translateX: withSpring(0, SPRING) }],
      },
    };
  };

  const exiting = (v: ExitAnimationsValues): LayoutAnimation => {
    'worklet';
    const d = dir.value;
    if (reduced) return { initialValues: { opacity: 1 }, animations: { opacity: withTiming(0, { duration: 150 }) } };
    return {
      initialValues: { opacity: 1, transform: [{ translateX: 0 }] },
      animations: {
        opacity: withTiming(0, { duration: 180 }),
        transform: [{ translateX: withTiming(d > 0 ? -v.windowWidth * PARALLAX : v.windowWidth, { duration: 280 }) }],
      },
    };
  };

  const render = () => {
    switch (step.kind) {
      case 'search':
        return <SearchStep state={search} onChange={setSearch} onPush={push} />;
      case 'destination':
        return <DestinationStep from={step.from} onPush={push} />;
      case 'airlineNumber':
        return <AirlineNumberStep airline={step.airline} onPush={push} />;
      case 'date':
        return <DateStep query={step.query} onPush={push} />;
      case 'results':
        return <ResultsStep query={step.query} date={step.date} onPush={push} />;
      case 'confirm': {
        const f = step.flight;
        const id = `${f.airline}${f.number}-${f.date}`;
        return (
          <ConfirmStep
            flight={f}
            added={myFlights.some((m) => m.id === id)}
            onAdd={() => {
              addFlight({
                id,
                code: flightCode(f),
                departsAt: dateFromKey(f.date, f.departs).getTime(),
                fromCity: airportByCode(f.from)?.city ?? f.from,
                toCity: airportByCode(f.to)?.city ?? f.to,
                from: f.from,
                to: f.to,
                departs: f.departs,
                arrives: f.arrives,
                minutes: f.minutes,
              });
              close();
            }}
          />
        );
      }
      default: {
        const never: never = step;
        throw new Error(`Unknown step ${JSON.stringify(never)}`);
      }
    }
  };

  return (
    // The drawer glass is always dark, so its contents use the dark palette.
    <ScopedTheme theme="dark">
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View key={stack.length} entering={entering} exiting={exiting} style={StyleSheet.absoluteFill}>
          {render()}
        </Animated.View>
      </View>
    </ScopedTheme>
  );
}
