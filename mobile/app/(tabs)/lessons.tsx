// My Lessons Screen - EXACT match to web lessons page
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';
import type { Lesson } from '../../src/lib/types';

const AGE_FILTERS = ['All', 'Preschool (3-5)', 'Elementary (6-10)', 'Pre-Teen (11-13)', 'Teen (14-17)', 'Adult'];

export default function LessonsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadLessons = useCallback(async () => {
    try {
      const data = await api.lessons.getAll();
      setLessons(data);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLessons();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (lesson: Lesson, e: any) => {
    e?.stopPropagation?.();
    try {
      await api.lessons.toggleFavorite(lesson.id);
      loadLessons();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.theme && lesson.theme.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAge = ageFilter === 'All' || lesson.ageGroup === ageFilter;
    const matchesFav = !showFavoritesOnly || lesson.isFavorite;
    return matchesSearch && matchesAge && matchesFav;
  });

  // Stats
  const stats = {
    total: lessons.length,
    favorites: lessons.filter((l) => l.isFavorite).length,
    ageGroups: new Set(lessons.map((l) => l.ageGroup).filter(Boolean)).size,
    sections: lessons.reduce((acc, l) => acc + (l.sections?.length || 0), 0),
  };

  const activeFilterCount = (ageFilter !== 'All' ? 1 : 0) + (showFavoritesOnly ? 1 : 0) + (searchQuery ? 1 : 0);

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Lessons</Text>
            <Text style={styles.subtitle}>
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} in your library
              {activeFilterCount > 0 && (
                <Text style={styles.filterIndicator}>
                  {' '}({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)
                </Text>
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newLessonButton}
            onPress={() => router.push('/(tabs)/create')}
            data-testid="new-lesson-btn"
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.newLessonText}>New Lesson</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards - Matching web design */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="book-outline" size={20} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Lessons</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.favorites}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons name="people-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.ageGroups}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Age Groups</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons name="list-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.sections}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Sections</Text>
          </View>
        </View>

        {/* Search & Filters - Matching web design */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, passage, theme, or..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            data-testid="search-input"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Ionicons
              name={showFavoritesOnly ? 'star' : 'star-outline'}
              size={18}
              color={showFavoritesOnly ? theme.primary : theme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, viewMode === 'grid' && styles.filterButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? theme.primary : theme.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, viewMode === 'list' && styles.filterButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? theme.primary : theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Age Filter Pills */}
        <View style={styles.ageFilterLabel}>
          <Text style={styles.filterLabelText}>AGE</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageFiltersScroll}>
          {AGE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.ageFilterChip,
                ageFilter === filter && styles.ageFilterChipActive,
                {
                  borderColor: ageFilter === filter ? theme.primary : theme.border,
                  backgroundColor: ageFilter === filter ? theme.primaryLight : theme.surface,
                },
              ]}
              onPress={() => setAgeFilter(filter)}
              data-testid={`age-filter-${filter.toLowerCase()}`}
            >
              <Text
                style={[
                  styles.ageFilterText,
                  { color: ageFilter === filter ? theme.primary : theme.textSecondary },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lessons List */}
        {filteredLessons.length > 0 ? (
          <View style={styles.lessonsList}>
            {filteredLessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                activeOpacity={0.7}
                data-testid={`lesson-card-${lesson.id}`}
              >
                <View style={styles.lessonCardHeader}>
                  <View style={styles.lessonIconContainer}>
                    <Ionicons name="book-outline" size={24} color={theme.primary} />
                  </View>
                  <View style={styles.lessonCardContent}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                      <Text style={styles.lessonDuration}>{lesson.duration || '45 min'}</Text>
                    </View>
                    <Text style={styles.lessonPassage}>{lesson.passage}</Text>
                    {lesson.theme && <Text style={styles.lessonTheme}>{lesson.theme}</Text>}
                    <View style={styles.lessonBadge}>
                      <Text style={styles.lessonBadgeText}>{lesson.ageGroup || 'All Ages'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(e) => handleFavoriteToggle(lesson, e)}
                  >
                    <Ionicons
                      name={lesson.isFavorite ? 'star' : 'star-outline'}
                      size={22}
                      color={lesson.isFavorite ? '#F59E0B' : theme.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={theme.textTertiary} />
            <Text style={styles.emptyTitle}>No lessons found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilterCount > 0
                ? 'Try adjusting your filters'
                : 'Create your first Bible lesson'}
            </Text>
            {activeFilterCount === 0 && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/(tabs)/create')}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Lesson</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: typeof colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: fonts.sizes.title,
      fontWeight: '700',
      color: theme.text,
      fontFamily: fonts.heading,
    },
    subtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    filterIndicator: {
      color: theme.primary,
      fontWeight: '500',
    },
    newLessonButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    newLessonText: {
      color: '#FFFFFF',
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'flex-start',
    },
    statValue: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      marginTop: spacing.sm,
    },
    statLabel: {
      fontSize: fonts.sizes.xs,
      marginTop: spacing.xs,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: fonts.sizes.md,
      color: theme.text,
      marginLeft: spacing.sm,
      paddingVertical: spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    filterButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    filterButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    ageFilterLabel: {
      marginBottom: spacing.sm,
    },
    filterLabelText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    ageFiltersScroll: {
      marginBottom: spacing.xl,
    },
    ageFilterChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginRight: spacing.sm,
      borderWidth: 1,
    },
    ageFilterChipActive: {},
    ageFilterText: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
    },
    lessonsList: {
      gap: spacing.md,
    },
    lessonCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: spacing.md,
    },
    lessonCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    lessonIconContainer: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    lessonCardContent: {
      flex: 1,
    },
    lessonTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    lessonTitle: {
      flex: 1,
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
      fontFamily: fonts.heading,
    },
    lessonDuration: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
    },
    lessonPassage: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
      color: theme.primary,
      marginBottom: spacing.xs,
    },
    lessonTheme: {
      fontSize: fonts.sizes.xs,
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    lessonBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surfaceSecondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    lessonBadgeText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    favoriteButton: {
      padding: spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '600',
      color: theme.text,
      marginTop: spacing.lg,
    },
    emptySubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.xl,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: fonts.sizes.md,
      fontWeight: '600',
    },
  });
