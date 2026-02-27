// Guest Create Lesson - No account required
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';
import { api } from '../../src/lib/api';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
];

const QUICK_PICKS = [
  { label: 'John 3:16', book: 'John', ch: '3', v: '16' },
  { label: 'Psalm 23', book: 'Psalms', ch: '23', v: '' },
  { label: 'Genesis 1', book: 'Genesis', ch: '1', v: '' },
  { label: 'Matthew 5', book: 'Matthew', ch: '5', v: '' },
];

const AGE_GROUPS = [
  { value: 'Preschool (3-5)', label: 'Preschool', desc: 'Ages 3-5' },
  { value: 'Elementary (6-10)', label: 'Elementary', desc: 'Ages 6-10' },
  { value: 'Pre-Teen (11-13)', label: 'Pre-Teen', desc: 'Ages 11-13' },
  { value: 'Teen (14-17)', label: 'Teen', desc: 'Ages 14-17' },
  { value: 'Adult', label: 'Adult', desc: 'Ages 18+' },
];

export default function GuestCreateScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [verse, setVerse] = useState('16');
  const [ageGroup, setAgeGroup] = useState('Elementary (6-10)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [showBookPicker, setShowBookPicker] = useState(false);

  const handleGenerate = async () => {
    if (!book) {
      Alert.alert('Required', 'Please select a Bible book');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Analyzing scripture passage...');
    
    try {
      const passage = `${book}${chapter ? ' ' + chapter : ''}${verse ? ':' + verse : ''}`;

      const config = {
        passage,
        ageGroup,
        duration: '45 minutes',
        format: 'Interactive',
      };

      // Simulate progress steps
      const progressSteps = [
        { progress: 15, step: 'Analyzing scripture passage...' },
        { progress: 30, step: 'Researching biblical context...' },
        { progress: 45, step: 'Creating lesson outline...' },
        { progress: 60, step: 'Generating teaching content...' },
        { progress: 75, step: 'Adding activities and discussion...' },
        { progress: 90, step: 'Finalizing lesson plan...' },
      ];

      for (const { progress, step } of progressSteps) {
        setGenerationProgress(progress);
        setGenerationStep(step);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const lesson = await api.lessons.generate(config);
      
      setGenerationProgress(100);
      setGenerationStep('Complete!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsGenerating(false);
      
      // Show success and prompt to sign up
      Alert.alert(
        'Lesson Created!', 
        'Your test lesson has been generated. Sign up to save and access your lessons.',
        [
          { text: 'View Lesson', onPress: () => router.push(`/lesson/${lesson.id}`) },
          { text: 'Sign Up', onPress: () => router.push('/(auth)/welcome') },
        ]
      );
    } catch (error: any) {
      setIsGenerating(false);
      Alert.alert('Error', error.message || 'Failed to generate lesson');
    }
  };

  const handleQuickPick = (pick: typeof QUICK_PICKS[0]) => {
    setBook(pick.book);
    setChapter(pick.ch);
    setVerse(pick.v);
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Generation Progress Modal */}
      <Modal visible={isGenerating} animationType="fade" transparent>
        <View style={styles.progressOverlay}>
          <View style={styles.progressModal}>
            <View style={styles.progressIconContainer}>
              <Ionicons name="sparkles" size={40} color={theme.primary} />
            </View>
            <Text style={styles.progressTitle}>Creating Your Lesson</Text>
            <Text style={styles.progressStep}>{generationStep}</Text>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${generationProgress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{generationProgress}%</Text>
            
            <Text style={styles.progressNote}>
              This usually takes about 30-60 seconds
            </Text>
          </View>
        </View>
      </Modal>

      {/* Book Picker Modal */}
      <Modal visible={showBookPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: theme.surface }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {BIBLE_BOOKS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.pickerItem, book === b && { backgroundColor: theme.primaryLight }]}
                  onPress={() => { setBook(b); setShowBookPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.text }, book === b && { color: theme.primary }]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Guest Notice */}
        <View style={styles.guestNotice}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={styles.guestNoticeText}>
            You're creating a test lesson without an account. Sign up to save your lessons!
          </Text>
        </View>

        {/* Scripture Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Scripture</Text>
          
          {/* Book Selector */}
          <TouchableOpacity style={styles.selector} onPress={() => setShowBookPicker(true)}>
            <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Book</Text>
            <View style={styles.selectorValue}>
              <Text style={[styles.selectorText, { color: theme.text }]}>{book || 'Select a book'}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Chapter & Verse */}
          <View style={styles.row}>
            <View style={[styles.selector, { flex: 1 }]}>
              <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Chapter</Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: theme.text }]}>{chapter || 'All'}</Text>
              </View>
            </View>
            <View style={[styles.selector, { flex: 1 }]}>
              <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Verse(s)</Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: theme.text }]}>{verse || 'All'}</Text>
              </View>
            </View>
          </View>

          {/* Quick Picks */}
          <Text style={styles.quickPicksLabel}>Quick Picks</Text>
          <View style={styles.quickPicksRow}>
            {QUICK_PICKS.map((pick) => (
              <TouchableOpacity
                key={pick.label}
                style={[
                  styles.quickPickChip,
                  book === pick.book && chapter === pick.ch && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                ]}
                onPress={() => handleQuickPick(pick)}
              >
                <Text style={[styles.quickPickText, { color: theme.text }]}>{pick.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Group Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Age Group</Text>
          <View style={styles.ageGroupGrid}>
            {AGE_GROUPS.map((age) => (
              <TouchableOpacity
                key={age.value}
                style={[
                  styles.ageGroupCard,
                  ageGroup === age.value && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                ]}
                onPress={() => setAgeGroup(age.value)}
              >
                <Text style={[styles.ageGroupLabel, { color: theme.text }]}>{age.label}</Text>
                <Text style={[styles.ageGroupDesc, { color: theme.textSecondary }]}>{age.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>Generate Test Lesson</Text>
        </TouchableOpacity>

        {/* Sign Up CTA */}
        <View style={styles.signUpCta}>
          <Text style={styles.signUpCtaText}>Want to save your lessons?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/welcome')}>
            <Text style={styles.signUpCtaLink}>Sign up for free →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    guestNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primaryLight,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xl,
    },
    guestNoticeText: {
      flex: 1,
      fontSize: fonts.sizes.sm,
      color: theme.text,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.md,
    },
    selector: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    selectorLabel: {
      fontSize: fonts.sizes.xs,
      marginBottom: spacing.xs,
    },
    selectorValue: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectorText: {
      fontSize: fonts.sizes.md,
      fontWeight: '500',
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    quickPicksLabel: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    quickPicksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    quickPickChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    quickPickText: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
    },
    ageGroupGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    ageGroupCard: {
      width: '48%',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    ageGroupLabel: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      marginBottom: 2,
    },
    ageGroupDesc: {
      fontSize: fonts.sizes.sm,
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
    },
    generateButtonText: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    signUpCta: {
      alignItems: 'center',
    },
    signUpCtaText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
    },
    signUpCtaLink: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.primary,
      marginTop: spacing.xs,
    },
    // Progress Modal
    progressOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    progressModal: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
    },
    progressIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    progressTitle: {
      fontSize: fonts.sizes.xl,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    progressStep: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    progressBarContainer: {
      width: '100%',
      height: 8,
      backgroundColor: theme.surfaceSecondary,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    progressPercent: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: spacing.md,
    },
    progressNote: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
      textAlign: 'center',
    },
    // Picker Modal
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    pickerModal: {
      maxHeight: '70%',
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    pickerTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
    },
    pickerItem: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    pickerItemText: {
      fontSize: fonts.sizes.md,
    },
  });
