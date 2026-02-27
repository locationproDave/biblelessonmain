// Section Header Component - matching web app's section headers
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  colorScheme?: 'light' | 'dark';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeIcon,
  actionText,
  onAction,
  colorScheme = 'light',
}) => {
  const theme = colors[colorScheme];

  return (
    <View style={styles.container}>
      {badge && (
        <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
          {badgeIcon && (
            <Ionicons name={badgeIcon} size={12} color={theme.primary} />
          )}
          <Text style={[styles.badgeText, { color: theme.primary }]}>
            {badge.toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {actionText && onAction && (
          <TouchableOpacity onPress={onAction} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SectionHeader;
