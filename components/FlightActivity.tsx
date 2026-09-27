import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, monospacedDigit, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

import type { FlightActivityProps } from '@/components/flightLive';

/** Runs in the widget runtime: only swift-ui globals, and every helper must live inside the function. */
const FlightActivity = (props: FlightActivityProps, environment: LiveActivityEnvironment) => {
  'widget';
  const inAir = props.phase === 'departed';
  const target = new Date(inAir ? props.arrivesAt : props.departsAt);
  const accent =
    environment.isLuminanceReduced ? '#FFFFFF'
    : props.phase === 'cancelled' ? '#FF453A'
    : props.phase === 'delayed' ? '#FF9F0A'
    : props.phase === 'boarding' ? '#30D158'
    : '#0A84FF';
  const gate = props.gate ? `Gate ${props.gate}${props.terminal ? ` · T${props.terminal}` : ''}` : 'Gate TBA';

  return {
    banner: (
      <VStack spacing={8} modifiers={[padding({ all: 16 })]}>
        <HStack>
          <Text modifiers={[font({ weight: 'semibold', size: 15 })]}>{props.code}</Text>
          <Spacer />
          <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle(accent)]}>{props.label}</Text>
        </HStack>
        <HStack>
          <Text modifiers={[font({ weight: 'bold', size: 28 })]}>{props.from}</Text>
          <Spacer />
          <Image systemName="airplane" color={accent} />
          <Spacer />
          <Text modifiers={[font({ weight: 'bold', size: 28 })]}>{props.to}</Text>
        </HStack>
        <HStack>
          <Text modifiers={[font({ size: 13 })]}>{`Departs ${props.departs}`}</Text>
          <Spacer />
          <Text modifiers={[font({ size: 13 })]}>{gate}</Text>
        </HStack>
        <HStack spacing={4}>
          <Text modifiers={[font({ size: 13 })]}>{inAir ? 'Lands' : 'Departs'}</Text>
          <Text date={target} dateStyle="relative" modifiers={[font({ size: 13 }), monospacedDigit()]} />
        </HStack>
      </VStack>
    ),
    compactLeading: <Image systemName={inAir ? 'airplane' : 'airplane.departure'} color={accent} />,
    compactTrailing: <Text date={target} dateStyle="timer" modifiers={[monospacedDigit()]} />,
    minimal: <Image systemName="airplane" color={accent} />,
    expandedLeading: <Text modifiers={[font({ weight: 'bold', size: 22 })]}>{props.from}</Text>,
    expandedTrailing: <Text modifiers={[font({ weight: 'bold', size: 22 })]}>{props.to}</Text>,
    expandedCenter: <Text modifiers={[foregroundStyle(accent)]}>{props.label}</Text>,
    expandedBottom: (
      <HStack modifiers={[padding({ horizontal: 8 })]}>
        <Text>{`${props.code} · ${props.departs}`}</Text>
        <Spacer />
        <Text>{gate}</Text>
      </HStack>
    ),
  };
};

export default createLiveActivity('FlightActivity', FlightActivity);
