import { MenuView } from '@expo/ui/community/menu';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

export type FlightCardMenuProps = {
  radius: number;
  onPress: () => void;
  onShare: () => void;
  onRemove: () => void;
  children: ReactNode;
};

const ACTIONS = [
  { id: 'share', title: 'Share', image: 'square.and.arrow.up' as const },
  { id: 'remove', title: 'Remove', image: 'trash' as const, attributes: { destructive: true } },
];

/** Android dropdown; the card is the trigger. iOS uses FlightCardMenu.ios. */
export function FlightCardMenu({ onPress, onShare, onRemove, children }: FlightCardMenuProps) {
  return (
    <MenuView
      shouldOpenOnLongPress
      colorScheme="dark"
      style={StyleSheet.absoluteFill}
      actions={ACTIONS}
      onPressAction={(e) => {
        if (e.nativeEvent.event === 'share') onShare();
        if (e.nativeEvent.event === 'remove') onRemove();
      }}>
      <Pressable accessibilityRole="button" onPress={onPress}>
        {children}
      </Pressable>
    </MenuView>
  );
}
