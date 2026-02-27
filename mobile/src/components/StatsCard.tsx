// Stats Card Component - matching web app's stats display
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  accentColor?: string;
  colorScheme?: 'light' | 'dark';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  accentColor,
  colorScheme = 'light',
}) => {
  const theme = colors[colorScheme];
  const iconColor = accentColor || theme.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textTertiary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...shadows.sm,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default StatsCard;
