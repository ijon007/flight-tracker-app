import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import type { CatalogKind } from '@/components/addFlightCatalog';
import { GlassSurface } from '@/components/GlassSurface';

export const KIND_ICON: Record<CatalogKind, { icon: SFSymbol; color: string }> = {
  flight: { icon: 'airplane', color: '#0A84FF' },
  airport: { icon: 'mappin.and.ellipse', color: '#FF9F0A' },
  airline: { icon: 'building.2', color: '#30D158' },
};

/** The drawer glass is dark and translucent; system gray (#8E8E93) washes out on it. */
const SECONDARY = 'rgba(255,255,255,0.65)';
const TERTIARY = 'rgba(255,255,255,0.45)';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: Ref<TextInput>;
  keyboardType?: KeyboardTypeOptions;
  /** Shown while focused or non-empty; clears and dismisses. */
  onCancel?: () => void;
};

export function SearchField({
  value,
  onChangeText,
  placeholder,
  autoFocus,
  inputRef,
  keyboardType,
  onCancel,
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const showCancel = onCancel && (focused || value.length > 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 16 }}>
      <View style={fieldChrome}>
        {/* Glass is a sibling of the row so the pill doesn't remount when the clear button appears. */}
        <GlassSurface colorScheme="dark" isInteractive style={StyleSheet.absoluteFill} />
        <View style={fieldRow}>
          <SymbolView name="magnifyingglass" size={17} tintColor={SECONDARY} weight="medium" />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={SECONDARY}
            autoFocus={autoFocus}
            autoCorrect={false}
            autoCapitalize="words"
            keyboardType={keyboardType}
            returnKeyType="search"
            keyboardAppearance="dark"
            accessibilityLabel={placeholder}
            style={fieldInput}
          />
          {value.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
              onPress={() => onChangeText('')}
              className="active:opacity-50">
              <SymbolView name="xmark.circle.fill" size={18} tintColor={SECONDARY} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {showCancel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel search" onPress={onCancel}>
          <GlassSurface
            colorScheme="dark"
            isInteractive
            style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
            <SymbolView name="xmark" size={16} tintColor="#FFFFFF" weight="semibold" />
          </GlassSurface>
        </Pressable>
      ) : null}
    </View>
  );
}

export function IconBadge({ icon, color }: { icon: SFSymbol; color: string }) {
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <SymbolView name={icon} size={16} tintColor="#FFFFFF" weight="semibold" />
    </View>
  );
}

type ItemRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: string;
  dimmed?: boolean;
  onPress?: () => void;
};

export function ItemRow({ title, subtitle, leading, trailing, dimmed, onPress }: ItemRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, subtitle, trailing].filter(Boolean).join(', ')}
      style={({ pressed }) => ({
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 12,
        opacity: dimmed ? 0.45 : pressed ? 0.6 : 1,
      })}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} className="text-[17px] text-white" style={{ letterSpacing: -0.4 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-[14px]" style={{ color: SECONDARY }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text className="text-[15px]" style={{ color: SECONDARY }}>
          {trailing}
        </Text>
      ) : null}
      {onPress ? <SymbolView name="chevron.right" size={13} tintColor={TERTIARY} weight="semibold" /> : null}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.45 : 1 }}>
      <GlassSurface
        colorScheme="dark"
        isInteractive={!disabled}
        tintColor={disabled ? undefined : '#0A84FF'}
        style={{
          height: 52,
          borderRadius: 26,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.4 }}>
          {label}
        </Text>
      </GlassSurface>
    </Pressable>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <Text className="text-[15px]" style={{ color: SECONDARY, paddingHorizontal: 20, marginBottom: -12 }}>
      {children}
    </Text>
  );
}

const fieldChrome = {
  flex: 1,
  height: 44,
  borderRadius: 22,
  borderCurve: 'continuous',
  overflow: 'hidden',
} as const;

const fieldRow = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 14,
  paddingRight: 10,
  gap: 8,
} as const;

const fieldInput = {
  flex: 1,
  minWidth: 0,
  padding: 0,
  margin: 0,
  color: '#FFFFFF',
  fontSize: 17,
  lineHeight: 20,
  textAlignVertical: 'center',
} as const;
