import { SymbolView } from 'expo-symbols';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  AIRLINES,
  AIRPORTS,
  airlineByCode,
  airportByCode,
  dateFromKey,
  dateKey,
  destinationsFrom,
  flightCode,
  flightsOn,
  formatDuration,
  parseFlightNumber,
  ROUTES,
  searchCatalog,
  type CatalogItem,
  type CatalogKind,
  type DatedFlight,
  type FlightQuery,
} from '@/components/addFlightCatalog';
import { OtherDatePicker } from '@/components/addFlight/OtherDatePicker';
import { Hint, IconBadge, ItemRow, KIND_ICON, PrimaryButton, SearchField } from '@/components/addFlight/parts';
import { GlassSurface } from '@/components/GlassSurface';
import { Section } from '@/components/SettingsRows';

export type Step =
  | { kind: 'search' }
  | { kind: 'destination'; from: string }
  | { kind: 'airlineNumber'; airline: string }
  | { kind: 'date'; query: FlightQuery }
  | { kind: 'results'; query: FlightQuery; date: string }
  | { kind: 'confirm'; flight: DatedFlight };

type Push = (step: Step) => void;

const cityOf = (code: string) => airportByCode(code)?.city ?? code;

export const formatDate = (key: string) =>
  dateFromKey(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** "AZ 507 · Tirana to Rome", "Tirana to Rome", or "AZ 507". */
function describe(query: FlightQuery) {
  const route = query.from && query.to ? `${cityOf(query.from)} to ${cityOf(query.to)}` : null;
  const code = query.airline && query.number ? flightCode({ airline: query.airline, number: query.number }) : null;
  return [code, route].filter(Boolean).join(' · ');
}

function Scroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 28, paddingHorizontal: 8, paddingTop: 4, paddingBottom: 16 }}>
      {children}
    </ScrollView>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center px-8 pt-10">
      <Text className="text-[20px] font-semibold text-ink" style={{ letterSpacing: -0.4 }}>
        {title}
      </Text>
      <Text className="mt-1 text-center text-[15px] text-white/65">{body}</Text>
    </View>
  );
}

// ---------- Search ----------

const PLACEHOLDER: Record<CatalogKind | 'any', string> = {
  any: 'Flight, airport, or airline',
  flight: 'Flight number, like AZ 507',
  airport: 'City, airport, or code',
  airline: 'Airline name or code',
};

export const FILTER_TITLE: Record<CatalogKind, string> = {
  flight: 'Flight Number',
  airport: 'Airport',
  airline: 'Airline',
};

const ENTRY_POINTS: { kind: CatalogKind; subtitle: string }[] = [
  { kind: 'flight', subtitle: 'The fastest way, like AZ 507' },
  { kind: 'airport', subtitle: 'Pick the route, then the flight' },
  { kind: 'airline', subtitle: 'Pick the airline, then the number' },
];

const SECTION_TITLE: Record<CatalogKind, string> = { flight: 'Flights', airport: 'Airports', airline: 'Airlines' };
const KIND_ORDER: CatalogKind[] = ['flight', 'airport', 'airline'];

export type SearchState = { query: string; filter: CatalogKind | null };

function stepFor(item: CatalogItem): Step {
  switch (item.kind) {
    case 'flight': {
      const parsed = parseFlightNumber(item.id)!;
      return { kind: 'date', query: parsed };
    }
    case 'airport':
      return { kind: 'destination', from: item.id };
    case 'airline':
      return { kind: 'airlineNumber', airline: item.id };
    default: {
      const never: never = item.kind;
      throw new Error(`Unknown kind ${String(never)}`);
    }
  }
}

function CatalogRow({ item, onPush }: { item: CatalogItem; onPush: Push }) {
  return (
    <ItemRow
      leading={<IconBadge {...KIND_ICON[item.kind]} />}
      title={item.title}
      subtitle={item.subtitle}
      onPress={() => onPush(stepFor(item))}
    />
  );
}

export function SearchStep({
  state,
  onChange,
  onPush,
}: {
  state: SearchState;
  onChange: (state: SearchState) => void;
  onPush: Push;
}) {
  const input = useRef<TextInput>(null);
  const { query, filter } = state;
  const searching = query.trim().replace(/\s+/g, '').length >= 2;
  const results = searchCatalog(query, filter ?? undefined);
  const parsed = filter === 'airport' || filter === 'airline' ? null : parseFlightNumber(query);
  const topId = parsed ? `${parsed.airline}${parsed.number}` : null;
  const flights = results.flight.filter((item) => item.id !== topId);
  const nothing = !parsed && KIND_ORDER.every((kind) => results[kind].length === 0);

  const browse =
    filter === 'airport'
      ? AIRPORTS.map((a) => ({ id: a.code, kind: 'airport' as const, title: a.name, subtitle: `${a.code} · ${a.city}, ${a.country}`, key: '' }))
      : filter === 'airline'
        ? AIRLINES.map((a) => ({ id: a.code, kind: 'airline' as const, title: a.name, subtitle: a.code, key: '' }))
        : [];

  return (
    <View style={{ flex: 1 }}>
      <SearchField
        inputRef={input}
        value={query}
        onChangeText={(text) => onChange({ query: text, filter })}
        placeholder={PLACEHOLDER[filter ?? 'any']}
        onCancel={() => {
          input.current?.blur();
          onChange({ query: '', filter: null });
        }}
      />
      <Scroll>
        {!searching && !parsed ? (
          filter === null ? (
            <Section title="Add By">
              {ENTRY_POINTS.map((entry) => (
                <ItemRow
                  key={entry.kind}
                  leading={<IconBadge {...KIND_ICON[entry.kind]} />}
                  title={FILTER_TITLE[entry.kind]}
                  subtitle={entry.subtitle}
                  onPress={() => {
                    onChange({ query, filter: entry.kind });
                    input.current?.focus();
                  }}
                />
              ))}
            </Section>
          ) : filter === 'flight' ? (
            <Hint>Type the airline code and number, like AZ 507 or SK412.</Hint>
          ) : (
            <Section title={SECTION_TITLE[filter]}>
              {browse.map((item) => (
                <CatalogRow key={item.id} item={item} onPush={onPush} />
              ))}
            </Section>
          )
        ) : nothing ? (
          <Empty title="No Results" body="Try a city, an airport code, or a flight number." />
        ) : (
          <>
            {parsed ? (
              <Section title="Top Hit">
                <ItemRow
                  leading={<IconBadge {...KIND_ICON.flight} />}
                  title={flightCode(parsed)}
                  subtitle={airlineByCode(parsed.airline)?.name ?? 'Flight'}
                  trailing="Pick date"
                  onPress={() => onPush({ kind: 'date', query: parsed })}
                />
              </Section>
            ) : null}
            {KIND_ORDER.map((kind) => {
              const items = kind === 'flight' ? flights : results[kind];
              return items.length > 0 ? (
                <Section key={kind} title={SECTION_TITLE[kind]}>
                  {items.map((item) => (
                    <CatalogRow key={item.id} item={item} onPush={onPush} />
                  ))}
                </Section>
              ) : null;
            })}
          </>
        )}
      </Scroll>
    </View>
  );
}

// ---------- Airport: destination ----------

export function DestinationStep({ from, onPush }: { from: string; onPush: Push }) {
  const [query, setQuery] = useState('');
  const origin = airportByCode(from);
  const searching = query.trim().length >= 2;
  const airports = searching
    ? searchCatalog(query, 'airport').airport.filter((a) => a.id !== from).map((a) => airportByCode(a.id)!)
    : destinationsFrom(from);

  return (
    <View style={{ flex: 1 }}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Where to?" autoFocus />
      <Scroll>
        <Section title={searching ? 'Airports' : `Nonstop from ${origin?.city ?? from}`}>
          {airports.map((a) => (
            <ItemRow
              key={a.code}
              leading={<IconBadge {...KIND_ICON.airport} />}
              title={a.name}
              subtitle={`${a.code} · ${a.city}, ${a.country}`}
              onPress={() => onPush({ kind: 'date', query: { from, to: a.code } })}
            />
          ))}
        </Section>
        {searching && airports.length === 0 ? (
          <Empty title="No Airports" body="Try a city name or a three-letter code." />
        ) : null}
      </Scroll>
    </View>
  );
}

// ---------- Airline: flight number ----------

export function AirlineNumberStep({ airline, onPush }: { airline: string; onPush: Push }) {
  const [number, setNumber] = useState('');
  const name = airlineByCode(airline)?.name ?? airline;
  const known = ROUTES.filter((r) => r.airline === airline && r.number.startsWith(number));
  const go = (n: string) => onPush({ kind: 'date', query: { airline, number: n.replace(/^0+/, '') } });

  return (
    <Scroll>
      <View className="gap-3">
        <GlassSurface
          colorScheme="dark"
          style={{
            height: 72,
            borderRadius: 24,
            borderCurve: 'continuous',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            gap: 10,
          }}>
          <Text className="text-[34px] font-semibold text-white/65" style={{ letterSpacing: -0.8 }}>
            {airline}
          </Text>
          <TextInput
            value={number}
            onChangeText={(text) => setNumber(text.replace(/\D/g, ''))}
            placeholder="Number"
            placeholderTextColor="rgba(235,235,245,0.3)"
            keyboardType="number-pad"
            keyboardAppearance="dark"
            maxLength={4}
            autoFocus
            accessibilityLabel={`${name} flight number`}
            style={{ flex: 1, minWidth: 0, height: 72, color: '#FFFFFF', fontSize: 34, fontWeight: '600', letterSpacing: -0.8 }}
          />
        </GlassSurface>
        <PrimaryButton label="Continue" disabled={number.length === 0} onPress={() => go(number)} />
      </View>
      {known.length > 0 ? (
        <Section title={`${name} Flights`}>
          {known.map((r) => (
            <ItemRow
              key={r.number}
              leading={<IconBadge {...KIND_ICON.flight} />}
              title={flightCode(r)}
              subtitle={`${cityOf(r.from)} to ${cityOf(r.to)}`}
              onPress={() => go(r.number)}
            />
          ))}
        </Section>
      ) : null}
    </Scroll>
  );
}

// ---------- Date ----------

const DAYS_AHEAD = 7;

export function DateStep({ query, onPush }: { query: FlightQuery; onPush: Push }) {
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [other, setOther] = useState(today);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = dateKey(d);
    const label =
      i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'long' });
    return { key, label, count: flightsOn(query, key).length };
  });

  return (
    <Scroll>
      <Hint>{describe(query)}</Hint>
      <Section title="When">
        {days.map((day) => (
          <ItemRow
            key={day.key}
            title={day.label}
            subtitle={formatDate(day.key)}
            trailing={day.count === 0 ? 'No flights' : day.count === 1 ? '1 flight' : `${day.count} flights`}
            dimmed={day.count === 0}
            onPress={day.count === 0 ? undefined : () => onPush({ kind: 'results', query, date: day.key })}
          />
        ))}
      </Section>
      <Section>
        <OtherDatePicker
          value={other}
          min={today}
          onChange={(date) => {
            setOther(date);
            onPush({ kind: 'results', query, date: dateKey(date) });
          }}
        />
      </Section>
    </Scroll>
  );
}

// ---------- Results ----------

export function ResultsStep({ query, date, onPush }: { query: FlightQuery; date: string; onPush: Push }) {
  const flights = flightsOn(query, date);

  return (
    <Scroll>
      <Hint>
        {[describe(query), formatDate(date)].filter(Boolean).join(' · ')}
      </Hint>
      {flights.length === 0 ? (
        <Empty title="No Flights" body={`Nothing matches on ${formatDate(date)}. Try another date.`} />
      ) : (
        <Section title={flights.length === 1 ? '1 Flight' : `${flights.length} Flights`}>
          {flights.map((f) => (
            <ItemRow
              key={`${f.airline}${f.number}`}
              leading={
                <View className="w-[58px]">
                  <Text className="text-[17px] font-semibold text-ink" style={{ fontVariant: ['tabular-nums'] }}>
                    {f.departs}
                  </Text>
                  <Text className="text-[13px] text-white/65" style={{ fontVariant: ['tabular-nums'] }}>
                    {f.arrives}
                  </Text>
                </View>
              }
              title={`${flightCode(f)} · ${airlineByCode(f.airline)?.name ?? f.airline}`}
              subtitle={`${f.from} to ${f.to} · ${formatDuration(f.minutes)}`}
              onPress={() => onPush({ kind: 'confirm', flight: f })}
            />
          ))}
        </Section>
      )}
    </Scroll>
  );
}

// ---------- Confirm ----------

function Endpoint({ code, city, time, align }: { code: string; city: string; time: string; align: 'left' | 'right' }) {
  const alignItems = align === 'left' ? 'flex-start' : 'flex-end';
  return (
    <View style={{ flex: 1, alignItems }}>
      <Text className="text-[40px] font-semibold text-ink" style={{ letterSpacing: -1 }}>
        {code}
      </Text>
      <Text numberOfLines={1} className="text-[15px] text-white/65">
        {city}
      </Text>
      <Text className="mt-2 text-[22px] font-semibold text-ink" style={{ fontVariant: ['tabular-nums'], letterSpacing: -0.4 }}>
        {time}
      </Text>
    </View>
  );
}

export function ConfirmStep({
  flight,
  added,
  onAdd,
}: {
  flight: DatedFlight;
  added: boolean;
  onAdd: () => void;
}) {
  const airline = airlineByCode(flight.airline)?.name ?? flight.airline;

  return (
    <Scroll>
      <GlassSurface colorScheme="dark" style={{ borderRadius: 28, borderCurve: 'continuous', padding: 20, gap: 18 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-semibold text-ink">{airline}</Text>
          <Text className="text-[15px] text-white/65">{flightCode(flight)}</Text>
        </View>
        <View className="flex-row items-start">
          <Endpoint code={flight.from} city={cityOf(flight.from)} time={flight.departs} align="left" />
          <View className="items-center px-2 pt-4">
            <SymbolView name="airplane" size={20} tintColor="rgba(255,255,255,0.65)" weight="semibold" />
            <Text className="mt-1 text-[13px] text-white/65">{formatDuration(flight.minutes)}</Text>
          </View>
          <Endpoint code={flight.to} city={cityOf(flight.to)} time={flight.arrives} align="right" />
        </View>
        <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        <View className="flex-row justify-between">
          <Text className="text-[15px] text-white/65">Date</Text>
          <Text className="text-[15px] text-ink">{formatDate(flight.date)}</Text>
        </View>
      </GlassSurface>
      <View className="gap-2 px-2">
        <PrimaryButton label={added ? 'Already in My Flights' : 'Add Flight'} disabled={added} onPress={onAdd} />
        <Text className="text-center text-[13px] text-white/65">Times are local to each airport.</Text>
      </View>
    </Scroll>
  );
}
