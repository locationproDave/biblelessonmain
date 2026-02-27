import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '../constants/theme';

export function Card({ children, style, padded = true }) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      },
      padded && styles.padded,
      style,
    ]}>
      {children}
    </View>
  );
}

export function StatCard({ icon, value, label }) {
  const { colors } = useTheme();

  return (
    <Card style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
  );
}

export function FeatureCard({ icon, title, description }) {
  const { colors } = useTheme();

  return (
    <Card>
      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
        {icon}
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.md,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
