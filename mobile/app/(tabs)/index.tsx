// Home Tab Screen - EXACT match to web homepage style
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/lib/api';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';
import type { Lesson } from '../../src/lib/types';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { user } = useAuth();

  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, favorites: 0, thisMonth: 0 });

  const loadData = useCallback(async () => {
    try {
      const lessons = await api.lessons.getAll();
      setRecentLessons(lessons.slice(0, 4));
      setStats({
        total: lessons.length,
        favorites: lessons.filter((l) => l.isFavorite).length,
        thisMonth: lessons.filter((l) => {
          const created = new Date(l.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (error) {
      console.error('Failed to load lessons:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const styles = createStyles(theme);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Teacher'}</Text>
        <Text style={styles.welcomeSubtext}>Ready to create your next lesson?</Text>
      </View>

      {/* Primary CTA - Create Lesson */}
      <TouchableOpacity
        style={styles.primaryCTA}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.9}
        data-testid="create-lesson-cta"
      >
        <View style={styles.ctaContent}>
          <View style={styles.ctaIconContainer}>
            <Ionicons name="sparkles" size={24} color={theme.primary} />
          </View>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>Create New Lesson</Text>
            <Text style={styles.ctaSubtitle}>AI-powered lesson generator</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.primary} />
        </View>
      </TouchableOpacity>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="book-outline" size={24} color={theme.primary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.favorites}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="calendar-outline" size={24} color={theme.success} />
          <Text style={styles.statValue}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      {/* Secondary CTAs */}
      <TouchableOpacity
        style={styles.secondaryCTA}
        onPress={() => router.push('/(tabs)/templates')}
        activeOpacity={0.8}
        data-testid="templates-cta"
      >
        <View style={styles.secondaryIconContainer}>
          <Ionicons name="grid-outline" size={20} color={theme.primary} />
        </View>
        <View style={styles.secondaryTextContainer}>
          <Text style={styles.secondaryTitle}>Browse Templates</Text>
          <Text style={styles.secondarySubtitle}>Start with pre-built lesson templates</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryCTA}
        onPress={() => router.push('/(tabs)/lessons')}
        activeOpacity={0.8}
        data-testid="my-lessons-cta"
      >
        <View style={styles.secondaryIconContainer}>
          <Ionicons name="book" size={20} color={theme.primary} />
        </View>
        <View style={styles.secondaryTextContainer}>
          <Text style={styles.secondaryTitle}>My Lessons</Text>
          <Text style={styles.secondarySubtitle}>View and manage your lesson library</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      </TouchableOpacity>

      {/* Recent Lessons */}
      {recentLessons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Lessons</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lessons')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentLessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
              activeOpacity={0.8}
              data-testid={`recent-lesson-${lesson.id}`}
            >
              <View style={styles.lessonIconContainer}>
                <Ionicons name="book-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                <Text style={styles.lessonPassage}>{lesson.passage}</Text>
                <View style={styles.lessonMeta}>
                  <View style={styles.lessonBadge}>
                    <Text style={styles.lessonBadgeText}>{lesson.ageGroup || 'All Ages'}</Text>
                  </View>
                  <Text style={styles.lessonDuration}>{lesson.duration || '45 min'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const createStyles = (theme: typeof colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: spacing.lg,
    },
    welcomeSection: {
      marginBottom: spacing.xl,
    },
    greeting: {
      fontSize: fonts.sizes.md,
      color: theme.textSecondary,
    },
    userName: {
      fontSize: fonts.sizes.title,
      fontWeight: '700',
      color: theme.text,
      fontFamily: fonts.heading,
    },
    welcomeSubtext: {
      fontSize: fonts.sizes.sm,
      color: theme.textTertiary,
      marginTop: spacing.xs,
    },
    primaryCTA: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 2,
      borderColor: theme.primary,
      marginBottom: spacing.xl,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    ctaContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ctaIconContainer: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    ctaTextContainer: {
      flex: 1,
    },
    ctaTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
    },
    ctaSubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    statValue: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      color: theme.text,
      marginTop: spacing.sm,
    },
    statLabel: {
      fontSize: fonts.sizes.xs,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    secondaryCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    secondaryTextContainer: {
      flex: 1,
    },
    secondaryTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
    },
    secondarySubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    section: {
      marginTop: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
    },
    seeAllLink: {
      fontSize: fonts.sizes.sm,
      color: theme.primary,
      fontWeight: '600',
    },
    lessonCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border,
    },
    lessonIconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    lessonContent: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
    },
    lessonPassage: {
      fontSize: fonts.sizes.sm,
      color: theme.primary,
      fontWeight: '500',
      marginTop: 2,
    },
    lessonMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    lessonBadge: {
      backgroundColor: theme.surfaceSecondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    lessonBadgeText: {
      fontSize: fonts.sizes.xs,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    lessonDuration: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
    },
  });
