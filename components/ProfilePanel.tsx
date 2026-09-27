import { SymbolView } from 'expo-symbols';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { ScopedTheme } from 'uniwind';

import { useDrawerMode } from '@/components/DrawerMode';
import { travelStats } from '@/components/flightStats';
import { GlassSurface } from '@/components/GlassSurface';
import { useFlightFormat, useSettings, type Settings } from '@/components/Settings';
import { Row, Section, SelectRow, SwitchRow } from '@/components/SettingsRows';

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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}, ${value}`} style={{ flexGrow: 1, flexBasis: '45%' }}>
      <GlassSurface style={{ borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14, gap: 2 }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-[26px] font-semibold text-white"
          style={{ letterSpacing: -0.6, fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: 0.2 }}>
          {label}
        </Text>
      </GlassSurface>
    </View>
  );
}

export function ProfilePanel() {
  const { name, units, timeFormat, timeZone, shareLocation, alerts, update } = useSettings();
  const setAlert = (key: keyof Settings['alerts']) => (on: boolean) =>
    update({ alerts: { ...alerts, [key]: on } });

  const monogram = initials(name);
  const { myFlights } = useDrawerMode();
  const fmt = useFlightFormat();
  const stats = travelStats(myFlights);

  return (
    // The drawer glass is always dark, so its contents use the dark palette.
    <ScopedTheme theme="dark">
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 28, paddingHorizontal: 8, paddingBottom: 16 }}>
        <View className="items-center">
          <View
            className="items-center justify-center bg-accent"
            style={{ width: 104, height: 104, borderRadius: 52 }}>
            {monogram ? (
              <Text className="text-[40px] font-semibold text-white" style={{ letterSpacing: -0.6 }}>
                {monogram}
              </Text>
            ) : (
              <SymbolView name="person.fill" size={44} tintColor="#FFFFFF" />
            )}
          </View>
          <TextInput
            value={name}
            onChangeText={(text) => update({ name: text })}
            placeholder="Name"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Name"
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="done"
            keyboardAppearance="dark"
            className="mt-4 w-full text-center text-[22px] font-semibold text-ink"
            style={{ letterSpacing: -0.3, lineHeight: 28 }}
          />
        </View>

        <View className="gap-2.5">
          <Text
            accessibilityRole="header"
            className="px-5 text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            Travel Stats
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            <Stat label="Flights" value={String(stats.flights)} />
            <Stat label="Distance" value={fmt.distance(stats.km)} />
            <Stat label="In the air" value={fmt.duration(stats.minutes)} />
            <Stat label={stats.countries === 1 ? 'Country' : 'Countries'} value={String(stats.countries)} />
          </View>
          {stats.longest ? (
            <Section>
              <Row label="Airports" value={String(stats.airports)} />
              <Row
                label="Longest flight"
                value={`${stats.longest.flight.from}–${stats.longest.flight.to} · ${fmt.distance(stats.longest.km)}`}
              />
            </Section>
          ) : null}
        </View>

        <Section title="Preferences">
          <SelectRow label="Units" value={units} options={unitOptions} onChange={(v) => update({ units: v })} />
          <SelectRow
            label="Time format"
            value={timeFormat}
            options={timeOptions}
            onChange={(v) => update({ timeFormat: v })}
          />
          <SelectRow
            label="Show times in"
            value={timeZone}
            options={timeZoneOptions}
            onChange={(v) => update({ timeZone: v })}
          />
          <SwitchRow
            label="Use my location"
            value={shareLocation}
            onValueChange={(v) => update({ shareLocation: v })}
          />
        </Section>

        <Section title="Notifications">
          <SwitchRow label="Flight status" value={alerts.status} onValueChange={setAlert('status')} />
          <SwitchRow label="Gate changes" value={alerts.gate} onValueChange={setAlert('gate')} />
          <SwitchRow label="Delays" value={alerts.delay} onValueChange={setAlert('delay')} />
          <SwitchRow label="Boarding" value={alerts.boarding} onValueChange={setAlert('boarding')} />
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
          <Text className="text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Flight Tracker 1.1
          </Text>
        </View>
      </ScrollView>
    </ScopedTheme>
  );
}
