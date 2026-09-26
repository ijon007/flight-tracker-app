import { Host, Toggle } from '@expo/ui/swift-ui';
import { labelsHidden, tint } from '@expo/ui/swift-ui/modifiers';

import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function NativeSwitch({ label, value, onValueChange }: Props) {
  const on = useColorScheme() === 'dark' ? '#0A84FF' : '#007AFF';

  return (
    <Host matchContents>
      <Toggle
        isOn={value}
        label={label}
        onIsOnChange={onValueChange}
        modifiers={[labelsHidden(), tint(on)]}
      />
    </Host>
  );
}
