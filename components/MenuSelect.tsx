import { Host, Picker } from '@expo/ui';
import { View, Text } from 'react-native';

type Props<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function MenuSelect<T extends string>({ value, options, onChange }: Props<T>) {
  const current = options.find((option) => option.value === value)?.label ?? value;

  return (
    <View className="relative items-end justify-center">
      <Text className="text-[17px] text-ink">{current}</Text>
      <View className="absolute inset-0 min-w-[88px] opacity-0">
        <Host matchContents>
          <Picker selectedValue={value} onValueChange={onChange} appearance="menu">
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </Host>
      </View>
    </View>
  );
}
