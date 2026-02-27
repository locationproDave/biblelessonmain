// Lesson Card Component - matching web app's card design
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';
import type { Lesson } from '../lib/types';

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
  onFavoritePress?: () => void;
  colorScheme?: 'light' | 'dark';
  compact?: boolean;
  testID?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onPress,
  onFavoritePress,
  colorScheme = 'light',
  compact = false,
  testID,
}) => {
  const theme = colors[colorScheme];

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Just now') return dateStr;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const styles = createStyles(theme, compact);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
          {lesson.title}
        </Text>
        {onFavoritePress && (
          <TouchableOpacity
            onPress={onFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-favorite`}
          >
            <Ionicons
              name={lesson.isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={lesson.isFavorite ? theme.warning : theme.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.passageRow}>
        <Ionicons name="book-outline" size={14} color={theme.primary} />
        <Text style={styles.passage} numberOfLines={1}>
          {lesson.passage}
        </Text>
      </View>

      {!compact && lesson.description && (
        <Text style={styles.description} numberOfLines={2}>
          {lesson.description}
        </Text>
      )}

      <View style={styles.tagsRow}>
        <View style={[styles.tag, { backgroundColor: theme.surfaceSecondary }]}>
          <Ionicons name="people-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.tagText, { color: theme.textSecondary }]}>
            {lesson.ageGroup?.split(' ')[0] || 'All Ages'}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="time-outline" size={12} color={theme.primary} />
          <Text style={[styles.tagText, { color: theme.primary }]}>
            {lesson.duration || '45 min'}
          </Text>
        </View>
        {lesson.theme && !compact && (
          <View style={[styles.tag, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="heart-outline" size={12} color="#7C3AED" />
            <Text style={[styles.tagText, { color: '#7C3AED' }]} numberOfLines={1}>
              {lesson.theme.split(' ')[0]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={theme.textTertiary} />
          <Text style={styles.metaText}>{formatDate(lesson.createdAt)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {lesson.sections?.length || 0} sections
          </Text>
        </View>
        <Text style={styles.viewText}>View →</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: typeof colors.light, compact: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: compact ? spacing.md : spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    title: {
      flex: 1,
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: theme.text,
      marginRight: spacing.sm,
    },
    favoriteButton: {
      padding: spacing.xs,
    },
    passageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: compact ? spacing.sm : spacing.md,
    },
    passage: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.primary,
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: compact ? spacing.sm : spacing.md,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: compact ? 0 : spacing.md,
      borderTopWidth: compact ? 0 : 1,
      borderTopColor: theme.border,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    metaText: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    metaDot: {
      color: theme.textTertiary,
    },
    viewText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.primary,
    },
  });

export default LessonCard;
