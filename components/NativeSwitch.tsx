import { Platform, Switch } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function NativeSwitch({ label, value, onValueChange }: Props) {
  const scheme = useColorScheme();
  const on = scheme === 'dark' ? '#0A84FF' : '#007AFF';
  const off = scheme === 'dark' ? '#39393D' : '#E9E9EB';

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={label}
      trackColor={{ false: off, true: on }}
      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
    />
  );
}
