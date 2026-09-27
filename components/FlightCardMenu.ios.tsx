import { Button, ContextMenu, Host, RNHostView } from '@expo/ui/swift-ui';
import { clipShape, contentShape, shapes } from '@expo/ui/swift-ui/modifiers';
import { Pressable, StyleSheet } from 'react-native';

import type { FlightCardMenuProps } from '@/components/FlightCardMenu';

/** Card is the context-menu trigger so a hold lifts it. Host size comes from the parent, not the drawer. */
export function FlightCardMenu({ radius, onPress, onShare, onRemove, children }: FlightCardMenuProps) {
  const shape = shapes.roundedRectangle({ cornerRadius: radius, roundedCornerStyle: 'continuous' });
  return (
    <Host colorScheme="dark" ignoreSafeArea="all" style={StyleSheet.absoluteFill}>
      <ContextMenu
        modifiers={[
          clipShape('roundedRectangle', radius),
          contentShape(shape, ['interaction', 'contextMenuPreview']),
        ]}>
        <ContextMenu.Trigger>
          <RNHostView>
            <Pressable accessibilityRole="button" onPress={onPress}>
              {children}
            </Pressable>
          </RNHostView>
        </ContextMenu.Trigger>
        <ContextMenu.Items>
          <Button label="Share" systemImage="square.and.arrow.up" onPress={onShare} />
          <Button label="Remove" systemImage="trash" role="destructive" onPress={onRemove} />
        </ContextMenu.Items>
      </ContextMenu>
    </Host>
  );
}
