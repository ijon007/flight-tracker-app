import { SymbolView } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { MenuSelect } from '@/components/MenuSelect';
import { NativeSwitch } from '@/components/NativeSwitch';

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View className="gap-2.5">
      {title ? <Text className="px-5 text-[13px] text-muted">{title}</Text> : null}
      <GlassSurface style={{ borderRadius: 20 }}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View className="mx-5 h-px bg-hairline" /> : null}
            {row}
          </Fragment>
        ))}
      </GlassSurface>
    </View>
  );
}

type RowProps = { label: string; value?: string; onPress?: () => void; destructive?: boolean };

export function Row({ label, value, onPress, destructive }: RowProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      className={
        destructive
          ? 'min-h-12 items-center justify-center px-5 py-3 active:opacity-60'
          : 'min-h-12 flex-row items-center justify-between gap-3 px-5 py-3 active:opacity-60'
      }>
      <Text className={destructive ? 'text-[17px] text-red-500' : 'text-[17px] text-ink'}>
        {label}
      </Text>
      {destructive ? null : (
        <View className="flex-row items-center gap-1.5">
          {value ? <Text className="text-[17px] text-muted">{value}</Text> : null}
          {onPress ? (
            <SymbolView name="chevron.right" size={13} tintColor="#8E8E93" weight="semibold" />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

type SwitchRowProps = { label: string; value: boolean; onValueChange: (v: boolean) => void };

export function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
  return (
    <View className="h-14 flex-row items-center justify-between px-5">
      <Text className="text-[17px] text-ink">{label}</Text>
      <NativeSwitch label={label} value={value} onValueChange={onValueChange} />
    </View>
  );
}

type SelectRowProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SelectRow<T extends string>({ label, value, options, onChange }: SelectRowProps<T>) {
  return (
    <View className="h-14 flex-row items-center justify-between gap-3 px-5">
      <Text className="text-[17px] text-ink">{label}</Text>
      <MenuSelect value={value} options={options} onChange={onChange} />
    </View>
  );
}
