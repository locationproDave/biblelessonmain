// Reusable Card Component matching web app design
import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  colorScheme?: 'light' | 'dark';
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  colorScheme = 'light',
  testID,
}) => {
  const theme = colors[colorScheme];

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    ...(variant === 'elevated' && shadows.lg),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: theme.border,
    }),
    ...(variant === 'default' && shadows.sm),
    ...(padding !== 'none' && {
      padding: padding === 'sm' ? spacing.sm : padding === 'md' ? spacing.md : spacing.lg,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

export default Card;
