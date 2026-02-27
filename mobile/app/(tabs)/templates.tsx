// Templates Screen - Matching web templates page
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';

interface LessonTemplate {
  id: string;
  title: string;
  passage: string;
  description: string;
  ageGroup: string;
  duration: string;
  theme: string;
  category: string;
  memoryVerse: string;
  objectives: string[];
  sections: { title: string; content: string; type: string }[];
}

const TEMPLATES: LessonTemplate[] = [
  { 
    id: '1', 
    title: 'The Good Samaritan', 
    passage: 'Luke 10:25-37', 
    ageGroup: 'Elementary (6-10)', 
    duration: '45 min', 
    theme: 'Compassion & Kindness',
    category: 'parables',
    description: 'Learn about showing love and kindness to everyone through the parable of the Good Samaritan.',
    memoryVerse: 'Love your neighbor as yourself. - Mark 12:31',
    objectives: ['Understand what it means to be a good neighbor', 'Learn to show compassion to everyone', 'Recognize opportunities to help others'],
    sections: [
      { title: 'Opening', content: 'Welcome children and open with prayer. Ask: "What does it mean to be a good neighbor?"', type: 'opening' },
      { title: 'Bible Story', content: 'Read Luke 10:25-37. Use props or pictures to illustrate the story.', type: 'scripture' },
      { title: 'Discussion', content: 'Why did the Samaritan help when others didn\'t? How can we be good neighbors?', type: 'discussion' },
      { title: 'Activity', content: 'Role-play scenarios where children can show kindness to others.', type: 'activity' },
      { title: 'Closing', content: 'Review memory verse and pray together.', type: 'closing' },
    ],
  },
  { 
    id: '2', 
    title: 'David and Goliath', 
    passage: '1 Samuel 17', 
    ageGroup: 'Preschool (3-5)', 
    duration: '30 min', 
    theme: 'Courage & Faith',
    category: 'old-testament',
    description: 'Discover how young David trusted God and defeated the giant Goliath.',
    memoryVerse: 'The Lord is my strength and my shield. - Psalm 28:7',
    objectives: ['Learn that God gives us courage', 'Understand that size doesn\'t matter to God', 'Trust God when facing big problems'],
    sections: [
      { title: 'Opening', content: 'Sing action songs about being brave. Open with prayer.', type: 'opening' },
      { title: 'Bible Story', content: 'Tell the story with visual aids. Show how small David defeated big Goliath.', type: 'scripture' },
      { title: 'Activity', content: 'Make paper "stones" and practice throwing at a target.', type: 'activity' },
      { title: 'Craft', content: 'Create a David and Goliath craft with paper plates.', type: 'craft' },
      { title: 'Closing', content: 'Review: Who helped David be brave? Pray for courage.', type: 'closing' },
    ],
  },
  { 
    id: '3', 
    title: 'The Prodigal Son', 
    passage: 'Luke 15:11-32', 
    ageGroup: 'Pre-Teen (11-13)', 
    duration: '60 min', 
    theme: 'Forgiveness & Grace',
    category: 'parables',
    description: 'Explore God\'s amazing love and forgiveness through the story of the prodigal son.',
    memoryVerse: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us. - Romans 5:8',
    objectives: ['Understand God\'s unconditional love', 'Learn about repentance and forgiveness', 'Recognize the Father\'s heart for His children'],
    sections: [
      { title: 'Icebreaker', content: 'Discussion: Have you ever made a mistake and needed forgiveness?', type: 'opening' },
      { title: 'Scripture Study', content: 'Read Luke 15:11-32. Analyze each character\'s perspective.', type: 'scripture' },
      { title: 'Small Groups', content: 'Discuss: Why did the father forgive so quickly? How does this reflect God?', type: 'discussion' },
      { title: 'Application', content: 'Journal: Write about a time you needed forgiveness or needed to forgive someone.', type: 'activity' },
      { title: 'Closing', content: 'Share insights and pray together.', type: 'closing' },
    ],
  },
  { 
    id: '4', 
    title: 'Creation Story', 
    passage: 'Genesis 1-2', 
    ageGroup: 'Elementary (6-10)', 
    duration: '45 min', 
    theme: 'God as Creator',
    category: 'old-testament',
    description: 'Marvel at God\'s amazing creation and learn about each day of creation.',
    memoryVerse: 'In the beginning God created the heavens and the earth. - Genesis 1:1',
    objectives: ['Learn the order of creation', 'Appreciate God\'s creativity and power', 'Understand we are made in God\'s image'],
    sections: [
      { title: 'Opening', content: 'Show pictures of nature. Ask: "Who made all these beautiful things?"', type: 'opening' },
      { title: 'Bible Story', content: 'Read Genesis 1 together, adding visuals for each day.', type: 'scripture' },
      { title: 'Activity', content: 'Create a 7-day creation wheel or booklet.', type: 'activity' },
      { title: 'Discussion', content: 'What is your favorite part of creation? Why?', type: 'discussion' },
      { title: 'Closing', content: 'Thank God for His beautiful creation.', type: 'closing' },
    ],
  },
  { 
    id: '5', 
    title: 'Fruits of the Spirit', 
    passage: 'Galatians 5:22-23', 
    ageGroup: 'Teen (14-17)', 
    duration: '60 min', 
    theme: 'Character & Growth',
    category: 'themes',
    description: 'Deep dive into the nine fruits of the Spirit and how to cultivate them in daily life.',
    memoryVerse: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. - Galatians 5:22-23',
    objectives: ['Identify all nine fruits of the Spirit', 'Self-assess spiritual growth areas', 'Develop practical application strategies'],
    sections: [
      { title: 'Opening', content: 'Bring real fruit as object lesson. Discuss how fruit grows.', type: 'opening' },
      { title: 'Bible Study', content: 'Read Galatians 5:16-26 in context. Define each fruit.', type: 'scripture' },
      { title: 'Self-Assessment', content: 'Rate yourself on each fruit. Identify growth areas.', type: 'activity' },
      { title: 'Group Discussion', content: 'How do these fruits show in daily life? Share examples.', type: 'discussion' },
      { title: 'Closing', content: 'Commit to growing in one specific area this week.', type: 'closing' },
    ],
  },
  { 
    id: '6', 
    title: "Noah's Ark", 
    passage: 'Genesis 6-9', 
    ageGroup: 'Preschool (3-5)', 
    duration: '30 min', 
    theme: 'Obedience & Trust',
    category: 'old-testament',
    description: 'Learn about Noah\'s obedience to God and God\'s promise through the rainbow.',
    memoryVerse: 'Noah did everything just as God commanded him. - Genesis 6:22',
    objectives: ['Learn about Noah\'s obedience', 'Understand God keeps His promises', 'Remember the rainbow represents God\'s promise'],
    sections: [
      { title: 'Opening', content: 'Sing "Rise and Shine" with actions. Show toy animals.', type: 'opening' },
      { title: 'Story Time', content: 'Tell story simply with animal sounds and movements.', type: 'scripture' },
      { title: 'Activity', content: 'Animal parade - children walk like different animals.', type: 'activity' },
      { title: 'Craft', content: 'Rainbow craft with paper strips or coloring page.', type: 'craft' },
      { title: 'Closing', content: 'Review God\'s promise. Look for rainbows this week!', type: 'closing' },
    ],
  },
  { 
    id: '7', 
    title: 'The Ten Commandments', 
    passage: 'Exodus 20:1-17', 
    ageGroup: 'Elementary (6-10)', 
    duration: '45 min', 
    theme: 'God\'s Law',
    category: 'old-testament',
    description: 'Discover God\'s rules for living and how they help us love God and others.',
    memoryVerse: 'Love the Lord your God with all your heart. - Deuteronomy 6:5',
    objectives: ['Learn the ten commandments', 'Understand why God gave us rules', 'Apply commandments to daily life'],
    sections: [
      { title: 'Opening', content: 'Discuss: Why do we have rules at home and school?', type: 'opening' },
      { title: 'Bible Story', content: 'Read Exodus 20:1-17. Group into loving God and loving others.', type: 'scripture' },
      { title: 'Activity', content: 'Match commandments to real-life scenarios.', type: 'activity' },
      { title: 'Discussion', content: 'How do these rules help us? Which is hardest to follow?', type: 'discussion' },
      { title: 'Closing', content: 'Thank God for His guidance.', type: 'closing' },
    ],
  },
  { 
    id: '8', 
    title: 'Jesus Feeds 5000', 
    passage: 'John 6:1-14', 
    ageGroup: 'Preschool (3-5)', 
    duration: '30 min', 
    theme: 'God\'s Provision',
    category: 'new-testament',
    description: 'See how Jesus multiplied a small lunch to feed thousands of people.',
    memoryVerse: 'Jesus took the loaves, gave thanks, and distributed to those who were seated. - John 6:11',
    objectives: ['Learn Jesus can do miracles', 'Understand sharing pleases God', 'Trust Jesus to provide for our needs'],
    sections: [
      { title: 'Opening', content: 'Bring fish crackers and bread. Count to 5000!', type: 'opening' },
      { title: 'Story Time', content: 'Tell story of boy who shared his lunch.', type: 'scripture' },
      { title: 'Snack Activity', content: 'Share fish crackers. Talk about sharing.', type: 'activity' },
      { title: 'Craft', content: 'Make a lunch basket craft with fish and bread.', type: 'craft' },
      { title: 'Closing', content: 'Thank Jesus for providing for us.', type: 'closing' },
    ],
  },
];

export default function TemplatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<LessonTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = TEMPLATES.filter((t) =>
    searchQuery === '' ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = (template: LessonTemplate) => {
    // Navigate to create page with template data pre-filled
    router.push({
      pathname: '/(tabs)/create',
      params: {
        templateId: template.id,
        templateTitle: template.title,
        templatePassage: template.passage,
        templateAgeGroup: template.ageGroup,
        templateDuration: template.duration,
        templateTheme: template.theme,
      },
    });
    setShowPreview(false);
  };

  const openPreview = (template: LessonTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Template Preview</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {selectedTemplate && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIconContainer}>
                  <Ionicons name="book" size={32} color={theme.primary} />
                </View>
                <Text style={styles.previewTitle}>{selectedTemplate.title}</Text>
                <Text style={styles.previewPassage}>{selectedTemplate.passage}</Text>
                
                <View style={styles.previewMeta}>
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
                    <Text style={styles.previewMetaText}>{selectedTemplate.ageGroup}</Text>
                  </View>
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                    <Text style={styles.previewMetaText}>{selectedTemplate.duration}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Description</Text>
                <Text style={styles.previewText}>{selectedTemplate.description}</Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Memory Verse</Text>
                <View style={styles.memoryVerseBox}>
                  <Ionicons name="bookmark" size={20} color={theme.primary} />
                  <Text style={styles.memoryVerseText}>{selectedTemplate.memoryVerse}</Text>
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Learning Objectives</Text>
                {selectedTemplate.objectives.map((obj, i) => (
                  <View key={i} style={styles.objectiveItem}>
                    <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                    <Text style={styles.objectiveText}>{obj}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Lesson Outline</Text>
                {selectedTemplate.sections.map((section, i) => (
                  <View key={i} style={styles.sectionItem}>
                    <View style={styles.sectionNumber}>
                      <Text style={styles.sectionNumberText}>{i + 1}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionText} numberOfLines={2}>{section.content}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.useTemplateButton}
                onPress={() => handleUseTemplate(selectedTemplate)}
              >
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.useTemplateButtonText}>Use This Template</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lesson Templates</Text>
          <Text style={styles.subtitle}>
            Start with a pre-built template and customize it
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Templates Grid */}
        <View style={styles.templatesGrid}>
          {filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => openPreview(template)}
              activeOpacity={0.8}
            >
              <View style={styles.templateIconContainer}>
                <Ionicons name="book-outline" size={24} color={theme.primary} />
              </View>
              <View style={styles.templateContent}>
                <View style={styles.templateTitleRow}>
                  <Text style={styles.templateTitle} numberOfLines={1}>{template.title}</Text>
                  <Text style={styles.templateDuration}>{template.duration}</Text>
                </View>
                <Text style={styles.templatePassage}>{template.passage}</Text>
                <Text style={styles.templateTheme}>{template.theme}</Text>
                <View style={styles.templateBadge}>
                  <Text style={styles.templateBadgeText}>{template.ageGroup}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Can't find what you need?</Text>
          <Text style={styles.ctaSubtitle}>Create a custom lesson from scratch</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Create Custom Lesson</Text>
          </TouchableOpacity>
        </View>

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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    header: {
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.xl,
    },
    searchInput: {
      flex: 1,
      fontSize: fonts.sizes.md,
      color: theme.text,
      marginLeft: spacing.sm,
      paddingVertical: spacing.sm,
    },
    templatesGrid: {
      gap: spacing.md,
    },
    templateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    templateIconContainer: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    templateContent: {
      flex: 1,
    },
    templateTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    templateTitle: {
      flex: 1,
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
      fontFamily: fonts.heading,
    },
    templateDuration: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
    },
    templatePassage: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
      color: theme.primary,
      marginBottom: spacing.xs,
    },
    templateTheme: {
      fontSize: fonts.sizes.xs,
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    templateBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surfaceSecondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    templateBadgeText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    ctaSection: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: theme.border,
    },
    ctaTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    ctaSubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginBottom: spacing.lg,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    ctaButtonText: {
      color: '#FFFFFF',
      fontSize: fonts.sizes.md,
      fontWeight: '600',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalCloseButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
    },
    modalContent: {
      flex: 1,
      padding: spacing.lg,
    },
    previewHeader: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    previewIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    previewTitle: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    previewPassage: {
      fontSize: fonts.sizes.lg,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: spacing.md,
    },
    previewMeta: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    previewMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    previewMetaText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
    },
    previewSection: {
      marginBottom: spacing.xl,
    },
    previewSectionTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.md,
    },
    previewText: {
      fontSize: fonts.sizes.md,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    memoryVerseBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: theme.primaryLight,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    memoryVerseText: {
      flex: 1,
      fontSize: fonts.sizes.md,
      fontStyle: 'italic',
      color: theme.text,
      lineHeight: 24,
    },
    objectiveItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    objectiveText: {
      flex: 1,
      fontSize: fonts.sizes.md,
      color: theme.textSecondary,
    },
    sectionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: theme.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionNumberText: {
      fontSize: fonts.sizes.sm,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    sectionContent: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    sectionText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
    },
    useTemplateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
    },
    useTemplateButtonText: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
