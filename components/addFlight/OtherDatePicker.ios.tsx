import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, labelsHidden, tint } from '@expo/ui/swift-ui/modifiers';
import { Text, View } from 'react-native';

type Props = { value: Date; min: Date; onChange: (date: Date) => void };

export function OtherDatePicker({ value, min, onChange }: Props) {
  return (
    <View className="min-h-14 flex-row items-center justify-between gap-3 px-4">
      <Text className="text-[17px] text-ink">Other date</Text>
      <Host matchContents colorScheme="dark">
        <DatePicker
          selection={value}
          range={{ start: min }}
          displayedComponents={['date']}
          onDateChange={onChange}
          modifiers={[datePickerStyle('compact'), labelsHidden(), tint('#0A84FF')]}
        />
      </Host>
    </View>
  );
}
