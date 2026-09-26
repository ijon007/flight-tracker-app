import {
  GlassView,
  isLiquidGlassAvailable,
  type GlassStyle,
  type GlassViewProps,
} from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

const hasLiquidGlass = isLiquidGlassAvailable();

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  glassEffectStyle?: GlassStyle;
  isInteractive?: boolean;
  tintColor?: GlassViewProps['tintColor'];
  colorScheme?: GlassViewProps['colorScheme'];
  animate?: boolean;
  animationDuration?: number;
};

export function GlassSurface({
  children,
  style,
  glassEffectStyle = 'regular',
  isInteractive,
  tintColor,
  colorScheme = 'auto',
  animate,
  animationDuration,
}: Props) {
  const scheme = useColorScheme();
  const fallback = !hasLiquidGlass
    ? {
        backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: scheme === 'dark' ? '#38383A' : '#C6C6C8',
      }
    : undefined;

  return (
    <GlassView
      colorScheme={colorScheme}
      isInteractive={isInteractive}
      tintColor={tintColor}
      glassEffectStyle={
        animate
          ? { style: glassEffectStyle, animate: true, animationDuration }
          : glassEffectStyle
      }
      style={[fallback, style]}>
      {children}
    </GlassView>
  );
}

export { hasLiquidGlass };
