// Feature Highlight Card - for call-to-action sections matching web app
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  colorScheme?: 'light' | 'dark';
  testID?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'primary',
  colorScheme = 'light',
  testID,
}) => {
  const theme = colors[colorScheme];
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isPrimary ? theme.primary : theme.surface,
          borderColor: isPrimary ? theme.primary : theme.border,
        },
        isPrimary ? shadows.lg : shadows.sm,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      testID={testID}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isPrimary
                ? 'rgba(255,255,255,0.2)'
                : theme.primaryLight,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={28}
            color={isPrimary ? '#FFFFFF' : theme.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isPrimary ? '#FFFFFF' : theme.text },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: isPrimary ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={isPrimary ? '#FFFFFF' : theme.textTertiary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
});

export default FeatureCard;
