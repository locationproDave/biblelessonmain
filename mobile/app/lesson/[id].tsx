// Lesson Detail Screen - EXACT match to web lesson view
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';
import type { Lesson } from '../../src/lib/types';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  const loadLesson = async () => {
    try {
      const data = await api.lessons.getById(id!);
      setLesson(data);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!lesson) return;
    try {
      const updated = await api.lessons.toggleFavorite(lesson.id);
      setLesson(updated);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const shareLesson = async () => {
    if (!lesson) return;
    try {
      await Share.share({
        title: lesson.title,
        message: `Check out this Bible lesson: ${lesson.title}\n\nPassage: ${lesson.passage}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getSectionIcon = (type: string): any => {
    const lower = type.toLowerCase();
    if (lower.includes('introduction') || lower.includes('welcome')) return 'sunny-outline';
    if (lower.includes('story') || lower.includes('bible')) return 'book-outline';
    if (lower.includes('activity') || lower.includes('craft')) return 'color-palette-outline';
    if (lower.includes('discussion')) return 'chatbubbles-outline';
    if (lower.includes('prayer')) return 'hand-left-outline';
    if (lower.includes('game')) return 'game-controller-outline';
    if (lower.includes('song') || lower.includes('worship')) return 'musical-notes-outline';
    if (lower.includes('closing') || lower.includes('conclusion')) return 'flag-outline';
    return 'document-text-outline';
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.textTertiary} />
        <Text style={styles.errorText}>Lesson not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
                <Ionicons
                  name={lesson.isFavorite ? 'star' : 'star-outline'}
                  size={24}
                  color={lesson.isFavorite ? '#F59E0B' : theme.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={shareLesson} style={styles.headerButton}>
                <Ionicons name="share-outline" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.metaBadges}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people-outline" size={14} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>{lesson.ageGroup || 'All Ages'}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{lesson.duration || '45 min'}</Text>
            </View>
          </View>

          <Text style={styles.title}>{lesson.title}</Text>

          <TouchableOpacity style={styles.passageContainer}>
            <Ionicons name="book" size={20} color={theme.primary} />
            <Text style={styles.passage}>{lesson.passage}</Text>
          </TouchableOpacity>

          {lesson.theme && (
            <View style={styles.themeContainer}>
              <Ionicons name="heart" size={16} color={theme.success} />
              <Text style={styles.themeText}>{lesson.theme}</Text>
            </View>
          )}
        </View>

        {/* Memory Verse */}
        {lesson.memoryVerse && (
          <View style={styles.memoryVerseCard}>
            <View style={styles.memoryVerseHeader}>
              <Ionicons name="bookmark" size={20} color={theme.primary} />
              <Text style={styles.memoryVerseTitle}>Memory Verse</Text>
            </View>
            <Text style={styles.memoryVerseText}>{lesson.memoryVerse}</Text>
          </View>
        )}

        {/* Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Objectives</Text>
            {lesson.objectives.map((obj, i) => (
              <View key={i} style={styles.objectiveRow}>
                <View style={styles.objectiveNumber}>
                  <Text style={styles.objectiveNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.objectiveText}>{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Lesson Sections */}
        {lesson.sections && lesson.sections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lesson Content</Text>
            {lesson.sections.map((section, index) => (
              <View key={index} style={styles.lessonSection}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(index)}
                >
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionIcon}>
                      <Ionicons
                        name={getSectionIcon(section.type || section.title)}
                        size={18}
                        color={theme.primary}
                      />
                    </View>
                    <Text style={styles.lessonSectionTitle}>{section.title}</Text>
                  </View>
                  <Ionicons
                    name={expandedSections.has(index) ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textTertiary}
                  />
                </TouchableOpacity>
                {expandedSections.has(index) && (
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionText}>{section.content}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Supplies */}
        {lesson.supplies && lesson.supplies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplies Needed</Text>
            <View style={styles.suppliesGrid}>
              {lesson.supplies.map((supply, i) => (
                <View key={i} style={styles.supplyItem}>
                  <Ionicons name="checkbox-outline" size={18} color={theme.success} />
                  <Text style={styles.supplyText}>{supply}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Take Home Activity */}
        {lesson.takeHomeActivity && (
          <View style={styles.takeHomeCard}>
            <View style={styles.takeHomeHeader}>
              <Ionicons name="home" size={20} color={theme.primary} />
              <Text style={styles.takeHomeTitle}>Take-Home Activity</Text>
            </View>
            <Text style={styles.takeHomeSubtitle}>{lesson.takeHomeActivity.title}</Text>
            <Text style={styles.takeHomeDescription}>{lesson.takeHomeActivity.description}</Text>
          </View>
        )}

        {/* Prayer Points */}
        {lesson.prayerPoints && lesson.prayerPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Points</Text>
            {lesson.prayerPoints.map((point, i) => (
              <View key={i} style={styles.prayerItem}>
                <Ionicons name="hand-left" size={16} color={theme.primary} />
                <Text style={styles.prayerText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const createStyles = (theme: typeof colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingBottom: spacing.xxxl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: spacing.xl,
    },
    errorText: {
      fontSize: fonts.sizes.lg,
      color: theme.textSecondary,
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    backButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
    },
    backButtonText: {
      color: '#FFF',
      fontSize: fonts.sizes.md,
      fontWeight: '600',
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerButton: {
      padding: spacing.sm,
    },
    hero: {
      backgroundColor: theme.surface,
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    metaBadges: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    badgeText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '600',
    },
    title: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.md,
      fontFamily: fonts.heading,
    },
    passageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    passage: {
      fontSize: fonts.sizes.md,
      color: theme.primary,
      fontWeight: '600',
    },
    themeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    themeText: {
      fontSize: fonts.sizes.sm,
      color: theme.success,
      fontWeight: '500',
    },
    memoryVerseCard: {
      margin: spacing.lg,
      backgroundColor: theme.primaryLight,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    memoryVerseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    memoryVerseTitle: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.primary,
    },
    memoryVerseText: {
      fontSize: fonts.sizes.md,
      color: theme.text,
      fontStyle: 'italic',
      lineHeight: 24,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.md,
    },
    objectiveRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    objectiveNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    objectiveNumberText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '700',
      color: theme.primary,
    },
    objectiveText: {
      flex: 1,
      fontSize: fonts.sizes.sm,
      color: theme.text,
      lineHeight: 22,
    },
    lessonSection: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    sectionIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lessonSectionTitle: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    sectionContent: {
      padding: spacing.md,
      paddingTop: 0,
    },
    sectionText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    suppliesGrid: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    supplyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    supplyText: {
      fontSize: fonts.sizes.sm,
      color: theme.text,
    },
    takeHomeCard: {
      margin: spacing.lg,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    takeHomeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    takeHomeTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.primary,
    },
    takeHomeSubtitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.sm,
    },
    takeHomeDescription: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    prayerItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    prayerText: {
      flex: 1,
      fontSize: fonts.sizes.sm,
      color: theme.text,
      lineHeight: 22,
    },
  });
