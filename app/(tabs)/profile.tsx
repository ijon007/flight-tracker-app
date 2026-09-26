import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { Row, Section, SelectRow, SwitchRow } from '@/components/SettingsRows';
import { TabScreen } from '@/components/TabScreen';

const unitOptions = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
  { value: 'nautical', label: 'Nautical' },
] as const;

const timeOptions = [
  { value: '24h', label: '24-hour' },
  { value: '12h', label: '12-hour' },
] as const;

const timeZoneOptions = [
  { value: 'local', label: 'Airport local' },
  { value: 'device', label: 'My time zone' },
  { value: 'utc', label: 'UTC' },
] as const;

type Option<T extends readonly { value: string }[]> = T[number]['value'];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

// ponytail: choices live in memory and reset on reload; persist once there is an account.
export default function ProfileScreen() {
  const [name, setName] = useState('Alex Morgan');

  const [units, setUnits] = useState<Option<typeof unitOptions>>('metric');
  const [timeFormat, setTimeFormat] = useState<Option<typeof timeOptions>>('24h');
  const [timeZone, setTimeZone] = useState<Option<typeof timeZoneOptions>>('local');

  const [statusAlerts, setStatusAlerts] = useState(true);
  const [gateChanges, setGateChanges] = useState(true);
  const [delays, setDelays] = useState(true);
  const [boarding, setBoarding] = useState(false);

  const [shareLocation, setShareLocation] = useState(false);

  const monogram = initials(name);

  return (
    <TabScreen>
      <View className="items-center">
        <View className="size-[72px] items-center justify-center rounded-full bg-accent">
          {monogram ? (
            <Text className="text-[28px] font-semibold text-white" style={{ letterSpacing: -0.4 }}>
              {monogram}
            </Text>
          ) : (
            <SymbolView name="person.fill" size={30} tintColor="#FFFFFF" />
          )}
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#8E8E93"
          accessibilityLabel="Name"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          className="mt-4 w-full text-center text-[22px] font-semibold text-ink"
          style={{ letterSpacing: -0.3, lineHeight: 28 }}
        />
      </View>

      <Section title="Preferences">
        <SelectRow label="Units" value={units} options={unitOptions} onChange={setUnits} />
        <SelectRow
          label="Time format"
          value={timeFormat}
          options={timeOptions}
          onChange={setTimeFormat}
        />
        <SelectRow
          label="Show times in"
          value={timeZone}
          options={timeZoneOptions}
          onChange={setTimeZone}
        />
        <SwitchRow label="Use my location" value={shareLocation} onValueChange={setShareLocation} />
      </Section>

      <Section title="Notifications">
        <SwitchRow label="Flight status" value={statusAlerts} onValueChange={setStatusAlerts} />
        <SwitchRow label="Gate changes" value={gateChanges} onValueChange={setGateChanges} />
        <SwitchRow label="Delays" value={delays} onValueChange={setDelays} />
        <SwitchRow label="Boarding" value={boarding} onValueChange={setBoarding} />
      </Section>

      <View className="gap-4">
        <Section>
          <Row
            label="Sign out"
            destructive
            onPress={() =>
              Alert.alert('Sign out?', undefined, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive' },
              ])
            }
          />
        </Section>
        <Text className="text-center text-[13px] text-muted">Flight Tracker 1.1</Text>
      </View>
    </TabScreen>
  );
}
