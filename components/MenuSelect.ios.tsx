import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { frame, labelsHidden, opacity, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { View, Text as RNText } from 'react-native';

type Props<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function MenuSelect<T extends string>({ value, options, onChange }: Props<T>) {
  const current = options.find((option) => option.value === value)?.label ?? value;

  return (
    <View className="relative items-end justify-center">
      <RNText className="text-[17px] text-ink">{current}</RNText>
      <View className="absolute inset-0 min-w-[88px]">
        <Host matchContents>
          <Picker
            selection={value}
            onSelectionChange={(next) => onChange(next as T)}
            modifiers={[
              pickerStyle('menu'),
              labelsHidden(),
              opacity(0.02),
              frame({ minWidth: 88, minHeight: 44, alignment: 'trailing' }),
            ]}>
            {options.map((option) => (
              <Text key={option.value} modifiers={[tag(option.value)]}>
                {option.label}
              </Text>
            ))}
          </Picker>
        </Host>
      </View>
    </View>
  );
}
