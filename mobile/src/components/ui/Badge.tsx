// Badge Component matching web app design
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  colorScheme?: 'light' | 'dark';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'sm',
  icon,
  colorScheme = 'light',
  style,
}) => {
  const theme = colors[colorScheme];

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: theme.primaryLight, text: theme.primary };
      case 'success':
        return { bg: theme.successLight, text: theme.success };
      case 'warning':
        return { bg: theme.warningLight, text: theme.warning };
      case 'error':
        return { bg: theme.errorLight, text: theme.error };
      case 'info':
        return { bg: theme.infoLight, text: theme.info };
      default:
        return { bg: theme.surfaceSecondary, text: theme.textSecondary };
    }
  };

  const variantColors = getVariantColors();

  const containerStyle: ViewStyle = {
    backgroundColor: variantColors.bg,
    paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
    paddingVertical: size === 'sm' ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    color: variantColors.text,
    fontSize: size === 'sm' ? 12 : 14,
    fontWeight: '500',
  };

  return (
    <View style={[containerStyle, style]}>
      {icon && (
        <Ionicons name={icon} size={size === 'sm' ? 12 : 14} color={variantColors.text} />
      )}
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

export default Badge;
