import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { searchCatalog, type CatalogKind } from '@/components/addFlightCatalog';

const ICONS: Record<CatalogKind, SFSymbol> = {
  airport: 'mappin.and.ellipse',
  flight: 'airplane',
  airline: 'building.2',
};

const HINTS: { kind: CatalogKind; title: string; subtitle: string }[] = [
  { kind: 'airport', title: 'Airports', subtitle: 'City, name, or code' },
  { kind: 'flight', title: 'Flights', subtitle: 'Flight number, like SK 412' },
  { kind: 'airline', title: 'Airlines', subtitle: 'Name or code' },
];

export function AddFlightPanel() {
  const [query, setQuery] = useState('');
  const results = searchCatalog(query);
  const searching = query.trim().replace(/\s+/g, '').length >= 2;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View
          style={{
            height: 36,
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: 'rgba(255,255,255,0.12)',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            gap: 8,
          }}>
          <SymbolView name="magnifyingglass" size={16} tintColor="rgba(255,255,255,0.55)" weight="semibold" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Airports, flights, airlines"
            placeholderTextColor="rgba(255,255,255,0.45)"
            autoCorrect={false}
            autoCapitalize="words"
            clearButtonMode="never"
            returnKeyType="search"
            keyboardAppearance="dark"
            accessibilityLabel="Search airports, flights, and airlines"
            style={{
              flex: 1,
              color: '#FFFFFF',
              fontSize: 17,
              paddingVertical: 0,
            }}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setQuery('')}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <SymbolView name="xmark.circle.fill" size={18} tintColor="rgba(255,255,255,0.45)" />
            </Pressable>
          ) : null}
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}>
        {searching ? (
          results.length > 0 ? (
            results.map((item) => (
              <ResultRow
                key={item.id}
                icon={ICONS[item.kind]}
                title={item.title}
                subtitle={item.subtitle}
              />
            ))
          ) : (
            <View style={{ paddingHorizontal: 22, paddingTop: 28 }}>
              <Text className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.3 }}>
                No results
              </Text>
              <Text className="mt-1 text-[15px] text-white/55">Try a city, a code, or a flight number.</Text>
            </View>
          )
        ) : (
          HINTS.map((hint) => (
            <ResultRow
              key={hint.kind}
              icon={ICONS[hint.kind]}
              title={hint.title}
              subtitle={hint.subtitle}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ResultRow({ icon, title, subtitle }: { icon: SFSymbol; title: string; subtitle: string }) {
  return (
    <View
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <SymbolView name={icon} size={18} tintColor="#FFFFFF" weight="semibold" />
      </View>
      <View style={{ flex: 1 }}>
        <Text className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.3 }}>
          {title}
        </Text>
        <Text className="text-[13px] text-white/55">{subtitle}</Text>
      </View>
    </View>
  );
}
