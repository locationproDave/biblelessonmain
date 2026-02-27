// Create Lesson Screen - EXACT match to web generate page with dropdowns and topics
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';

type Step = 'scripture' | 'audience' | 'customize';

// Bible books with chapter counts
const BIBLE_BOOKS: { [key: string]: number } = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
  'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
  'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
  'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
  'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
  'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
  '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
  '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
  'Jude': 1, 'Revelation': 22,
};

const POPULAR_TOPICS = [
  'Love', 'Faith', 'Forgiveness', 'Prayer', 'Grace', 'Salvation',
  'Hope', 'Peace', 'Joy', 'Obedience', 'Trust', 'Courage',
];

const THEMES = [
  "God's Love", 'Compassion', 'Kindness', 'Humility', 'Gratitude',
  'Patience', 'Wisdom', 'Service', 'Faithfulness', 'Perseverance',
];

const QUICK_PICKS = [
  { book: 'John', ch: '3', v: '16', label: 'John 3:16' },
  { book: 'Luke', ch: '10', v: '25-37', label: 'Good Samaritan' },
  { book: 'Genesis', ch: '1', v: '', label: 'Creation' },
  { book: '1 Samuel', ch: '17', v: '', label: 'David & Goliath' },
  { book: 'Luke', ch: '15', v: '11-32', label: 'Prodigal Son' },
  { book: 'Matthew', ch: '5', v: '1-12', label: 'Beatitudes' },
];

const AGE_GROUPS = [
  { label: 'Preschool (3-5)', desc: 'Ages 3-5, simple concepts' },
  { label: 'Elementary (6-10)', desc: 'Ages 6-10, interactive learning' },
  { label: 'Pre-Teen (11-13)', desc: 'Ages 11-13, deeper discussion' },
  { label: 'Teen (14-17)', desc: 'Ages 14-17, life application' },
  { label: 'Adult', desc: 'Adults, comprehensive study' },
];

const DURATIONS = [
  { label: '30 min', desc: 'Quick lesson' },
  { label: '45 min', desc: 'Standard lesson' },
  { label: '60 min', desc: 'Extended lesson' },
  { label: '90 min', desc: 'Full session' },
];

const FORMATS = [
  { label: 'Traditional', icon: 'book-outline', desc: 'Lecture-style teaching' },
  { label: 'Discussion', icon: 'chatbubbles-outline', desc: 'Group conversation focus' },
  { label: 'Interactive', icon: 'sparkles-outline', desc: 'Mixed activities & teaching' },
  { label: 'Activity', icon: 'color-palette-outline', desc: 'Hands-on learning' },
];

export default function CreateScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  const [step, setStep] = useState<Step>('scripture');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<'passage' | 'topic'>('passage');

  // Scripture config
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  // Audience config
  const [ageGroup, setAgeGroup] = useState('');
  const [duration, setDuration] = useState('');
  const [format, setFormat] = useState('');

  // Customize config
  const [includeActivities, setIncludeActivities] = useState(false);
  const [includeCrafts, setIncludeCrafts] = useState(false);
  const [includeMemoryVerse, setIncludeMemoryVerse] = useState(false);
  const [includeDiscussion, setIncludeDiscussion] = useState(false);
  const [includePrayer, setIncludePrayer] = useState(false);
  const [includeTakeHome, setIncludeTakeHome] = useState(false);

  // Generation progress
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');

  // Dropdown modals
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showVersePicker, setShowVersePicker] = useState(false);

  const steps: { key: Step; label: string; icon: string }[] = [
    { key: 'scripture', label: 'Scripture', icon: 'book-outline' },
    { key: 'audience', label: 'Audience', icon: 'people-outline' },
    { key: 'customize', label: 'Customize', icon: 'settings-outline' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    if (step === 'scripture') {
      if (inputMode === 'passage') return book !== '';
      return topic !== '';
    }
    if (step === 'audience') return ageGroup !== '' && duration !== '' && format !== '';
    return true;
  };

  const handleNext = () => {
    if (step === 'scripture') setStep('audience');
    else if (step === 'audience') setStep('customize');
  };

  const handleBack = () => {
    if (step === 'audience') setStep('scripture');
    else if (step === 'customize') setStep('audience');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Analyzing scripture passage...');
    
    try {
      const passage = inputMode === 'passage' 
        ? `${book}${chapter ? ' ' + chapter : ''}${verse ? ':' + verse : ''}`
        : topic;

      const config = {
        passage,
        ageGroup,
        duration,
        format,
        theme: selectedTheme,
        topic: inputMode === 'topic' ? topic : undefined,
        includeActivities,
        includeCrafts,
        includeMemoryVerse,
        includeDiscussion,
        includePrayer,
        includeTakeHome,
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

      // Run progress animation
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
      
      // Navigate directly to the lesson
      if (lesson && lesson.id) {
        router.replace(`/lesson/${lesson.id}`);
      } else {
        // If no ID, go to lessons list
        Alert.alert('Success', 'Your lesson has been created!', [
          { text: 'View Lessons', onPress: () => router.replace('/(tabs)/lessons') },
        ]);
      }
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

  const getChapters = () => {
    if (!book || !BIBLE_BOOKS[book]) return [];
    return Array.from({ length: BIBLE_BOOKS[book] }, (_, i) => String(i + 1));
  };

  const getVerses = () => {
    // Simplified - just return 1-50 for verses
    return ['All verses', ...Array.from({ length: 50 }, (_, i) => String(i + 1))];
  };

  const styles = createStyles(theme);

  // Dropdown Picker Modal
  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, selected === item && styles.pickerItemSelected]}
                onPress={() => {
                  onSelect(item === 'All verses' ? '' : item);
                  onClose();
                }}
              >
                <Text style={[styles.pickerItemText, selected === item && styles.pickerItemTextSelected]}>
                  {item}
                </Text>
                {selected === item && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </TouchableOpacity>
            )}
            style={styles.pickerList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Badge */}
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={styles.headerBadgeText}>LESSON GENERATOR</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Your Lesson</Text>
        <Text style={styles.subtitle}>
          Follow these simple steps to create a complete Bible lesson plan
        </Text>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {steps.map((s, index) => (
            <React.Fragment key={s.key}>
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => index < currentStepIndex && setStep(s.key)}
              >
                <View
                  style={[
                    styles.stepIcon,
                    currentStepIndex >= index && styles.stepIconActive,
                    currentStepIndex > index && styles.stepIconComplete,
                  ]}
                >
                  {currentStepIndex > index ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name={s.icon as any}
                      size={18}
                      color={currentStepIndex >= index ? '#FFFFFF' : theme.textTertiary}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStepIndex >= index && styles.stepLabelActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex > index && styles.stepLineActive,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Step Content Card */}
        <View style={styles.contentCard}>
          {/* Scripture Step */}
          {step === 'scripture' && (
            <>
              <Text style={styles.cardTitle}>Choose Your Scripture</Text>
              <Text style={styles.cardSubtitle}>
                Start with a Bible passage or browse by topic
              </Text>

              {/* Input Mode Toggle */}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, inputMode === 'passage' && styles.modeButtonActive]}
                  onPress={() => setInputMode('passage')}
                >
                  <Ionicons
                    name="book-outline"
                    size={16}
                    color={inputMode === 'passage' ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      inputMode === 'passage' && styles.modeButtonTextActive,
                    ]}
                  >
                    By Passage
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, inputMode === 'topic' && styles.modeButtonActive]}
                  onPress={() => setInputMode('topic')}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color={inputMode === 'topic' ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      inputMode === 'topic' && styles.modeButtonTextActive,
                    ]}
                  >
                    By Topic
                  </Text>
                </TouchableOpacity>
              </View>

              {inputMode === 'passage' ? (
                <>
                  {/* Book Dropdown */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Book</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowBookPicker(true)}
                    >
                      <Text style={book ? styles.dropdownText : styles.dropdownPlaceholder}>
                        {book || 'Select a book...'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
                    </TouchableOpacity>
                  </View>

                  {/* Chapter & Verse Row */}
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Chapter</Text>
                      <TouchableOpacity
                        style={[styles.dropdown, !book && styles.dropdownDisabled]}
                        onPress={() => book && setShowChapterPicker(true)}
                        disabled={!book}
                      >
                        <Text style={chapter ? styles.dropdownText : styles.dropdownPlaceholder}>
                          {chapter || 'Select chapter'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Verse(s)</Text>
                      <TouchableOpacity
                        style={[styles.dropdown, !chapter && styles.dropdownDisabled]}
                        onPress={() => chapter && setShowVersePicker(true)}
                        disabled={!chapter}
                      >
                        <Text style={verse ? styles.dropdownText : styles.dropdownPlaceholder}>
                          {verse || 'All verses'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Picks */}
                  <View style={styles.inputGroup}>
                    <View style={styles.quickPicksHeader}>
                      <Ionicons name="flash" size={16} color={theme.textSecondary} />
                      <Text style={styles.quickPicksLabel}>Quick Picks</Text>
                    </View>
                    <View style={styles.quickPicksGrid}>
                      {QUICK_PICKS.map((pick) => (
                        <TouchableOpacity
                          key={pick.label}
                          style={[
                            styles.quickPickButton,
                            book === pick.book && chapter === pick.ch && styles.quickPickButtonActive,
                          ]}
                          onPress={() => handleQuickPick(pick)}
                        >
                          <Text
                            style={[
                              styles.quickPickText,
                              book === pick.book && chapter === pick.ch && styles.quickPickTextActive,
                            ]}
                          >
                            {pick.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Topic Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Topic</Text>
                    <View style={styles.topicChips}>
                      {POPULAR_TOPICS.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.topicChip, topic === t && styles.topicChipActive]}
                          onPress={() => setTopic(t)}
                        >
                          <Text style={[styles.topicChipText, topic === t && styles.topicChipTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Or enter a custom topic..."
                      placeholderTextColor={theme.textTertiary}
                      value={topic}
                      onChangeText={setTopic}
                    />
                  </View>

                  {/* Theme Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Theme</Text>
                    <View style={styles.topicChips}>
                      {THEMES.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.topicChip, selectedTheme === t && styles.topicChipActive]}
                          onPress={() => setSelectedTheme(selectedTheme === t ? '' : t)}
                        >
                          <Text style={[styles.topicChipText, selectedTheme === t && styles.topicChipTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Or enter a custom theme..."
                      placeholderTextColor={theme.textTertiary}
                      value={selectedTheme}
                      onChangeText={setSelectedTheme}
                    />
                  </View>
                </>
              )}
            </>
          )}

          {/* Audience Step */}
          {step === 'audience' && (
            <>
              <Text style={styles.cardTitle}>Select Your Audience</Text>
              <Text style={styles.cardSubtitle}>
                Choose the age group, duration, and format
              </Text>

              {/* Age Group */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age Group</Text>
                <View style={styles.optionCards}>
                  {AGE_GROUPS.map((age) => (
                    <TouchableOpacity
                      key={age.label}
                      style={[styles.optionCard, ageGroup === age.label && styles.optionCardActive]}
                      onPress={() => setAgeGroup(age.label)}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={ageGroup === age.label ? theme.primary : theme.textSecondary}
                      />
                      <Text style={[styles.optionCardTitle, ageGroup === age.label && styles.optionCardTitleActive]}>
                        {age.label}
                      </Text>
                      <Text style={styles.optionCardDesc}>{age.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.durationRow}>
                  {DURATIONS.map((dur) => (
                    <TouchableOpacity
                      key={dur.label}
                      style={[styles.durationButton, duration === dur.label && styles.durationButtonActive]}
                      onPress={() => setDuration(dur.label)}
                    >
                      <Text style={[styles.durationButtonText, duration === dur.label && styles.durationButtonTextActive]}>
                        {dur.label}
                      </Text>
                      <Text style={styles.durationButtonDesc}>{dur.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Format */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Format</Text>
                <View style={styles.formatGrid}>
                  {FORMATS.map((fmt) => (
                    <TouchableOpacity
                      key={fmt.label}
                      style={[styles.formatCard, format === fmt.label && styles.formatCardActive]}
                      onPress={() => setFormat(fmt.label)}
                    >
                      <Ionicons
                        name={fmt.icon as any}
                        size={24}
                        color={format === fmt.label ? theme.primary : theme.textSecondary}
                      />
                      <Text style={[styles.formatCardTitle, format === fmt.label && styles.formatCardTitleActive]}>
                        {fmt.label}
                      </Text>
                      <Text style={styles.formatCardDesc}>{fmt.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Customize Step */}
          {step === 'customize' && (
            <>
              <Text style={styles.cardTitle}>Customize Your Lesson</Text>
              <Text style={styles.cardSubtitle}>
                Select which components to include
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Include in Lesson</Text>
                <View style={styles.checkboxList}>
                  {[
                    { key: 'activities', label: 'Activities', state: includeActivities, setState: setIncludeActivities },
                    { key: 'crafts', label: 'Crafts', state: includeCrafts, setState: setIncludeCrafts },
                    { key: 'memoryVerse', label: 'Memory Verse', state: includeMemoryVerse, setState: setIncludeMemoryVerse },
                    { key: 'discussion', label: 'Discussion Questions', state: includeDiscussion, setState: setIncludeDiscussion },
                    { key: 'prayer', label: 'Prayer Points', state: includePrayer, setState: setIncludePrayer },
                    { key: 'takeHome', label: 'Parent Take-Home', state: includeTakeHome, setState: setIncludeTakeHome },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.checkboxRow}
                      onPress={() => item.setState(!item.state)}
                    >
                      <Ionicons
                        name={item.state ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={item.state ? theme.primary : theme.textTertiary}
                      />
                      <Text style={styles.checkboxLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Lesson Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Scripture:</Text>
                  <Text style={styles.summaryValue}>
                    {inputMode === 'passage' 
                      ? `${book}${chapter ? ' ' + chapter : ''}${verse ? ':' + verse : ''}`
                      : topic}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Age Group:</Text>
                  <Text style={styles.summaryValue}>{ageGroup}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryValue}>{duration}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Format:</Text>
                  <Text style={styles.summaryValue}>{format}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          {currentStepIndex > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step !== 'customize' ? (
            <TouchableOpacity
              style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Lesson</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Picker Modals */}
      {renderPicker(showBookPicker, () => setShowBookPicker(false), 'Select Book', Object.keys(BIBLE_BOOKS), book, (v) => { setBook(v); setChapter(''); setVerse(''); })}
      {renderPicker(showChapterPicker, () => setShowChapterPicker(false), 'Select Chapter', getChapters(), chapter, (v) => { setChapter(v); setVerse(''); })}
      {renderPicker(showVersePicker, () => setShowVersePicker(false), 'Select Verse', getVerses(), verse, setVerse)}
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
      paddingTop: spacing.xl,
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primaryLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      marginBottom: spacing.md,
    },
    headerBadgeText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '700',
      color: theme.primary,
      letterSpacing: 1,
    },
    title: {
      fontSize: fonts.sizes.title,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      fontFamily: fonts.heading,
    },
    subtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xxl,
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
    },
    stepItem: {
      alignItems: 'center',
    },
    stepIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: theme.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    stepIconActive: {
      backgroundColor: theme.primary,
    },
    stepIconComplete: {
      backgroundColor: '#10B981',
    },
    stepLabel: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
      fontWeight: '500',
    },
    stepLabelActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: theme.border,
      marginHorizontal: spacing.md,
      marginBottom: spacing.xxl,
    },
    stepLineActive: {
      backgroundColor: '#10B981',
    },
    contentCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: {
      fontSize: fonts.sizes.xl,
      fontWeight: '700',
      color: theme.text,
      fontFamily: fonts.heading,
      marginBottom: spacing.xs,
    },
    cardSubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xl,
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: 4,
      marginBottom: spacing.xl,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.sm,
    },
    modeButtonActive: {
      backgroundColor: theme.surface,
    },
    modeButtonText: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    modeButtonTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    dropdownDisabled: {
      opacity: 0.5,
    },
    dropdownText: {
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    dropdownPlaceholder: {
      fontSize: fonts.sizes.md,
      color: theme.textTertiary,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    quickPicksHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    quickPicksLabel: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    quickPicksGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    quickPickButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    quickPickButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    quickPickText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    quickPickTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    topicChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    topicChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.surfaceSecondary,
    },
    topicChipActive: {
      backgroundColor: theme.primary,
    },
    topicChipText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    topicChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    optionCards: {
      gap: spacing.sm,
    },
    optionCard: {
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    optionCardActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    optionCardTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
      marginTop: spacing.xs,
    },
    optionCardTitleActive: {
      color: theme.primary,
    },
    optionCardDesc: {
      fontSize: fonts.sizes.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    durationRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    durationButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    durationButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    durationButtonText: {
      fontSize: fonts.sizes.sm,
      color: theme.text,
      fontWeight: '600',
    },
    durationButtonTextActive: {
      color: theme.primary,
    },
    durationButtonDesc: {
      fontSize: 12,
      color: theme.textTertiary,
      marginTop: 2,
    },
    formatGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    formatCard: {
      width: '48%',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    formatCardActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    formatCardTitle: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.text,
      marginTop: spacing.sm,
    },
    formatCardTitleActive: {
      color: theme.primary,
    },
    formatCardDesc: {
      fontSize: 12,
      color: theme.textTertiary,
      textAlign: 'center',
      marginTop: 2,
    },
    checkboxList: {
      gap: spacing.md,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    checkboxLabel: {
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    summaryCard: {
      backgroundColor: theme.surfaceSecondary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    summaryTitle: {
      fontSize: fonts.sizes.md,
      fontWeight: '600',
      color: theme.text,
      marginBottom: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    summaryLabel: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
    },
    summaryValue: {
      fontSize: fonts.sizes.sm,
      fontWeight: '600',
      color: theme.text,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    backButtonText: {
      fontSize: fonts.sizes.md,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
    },
    nextButtonDisabled: {
      opacity: 0.5,
    },
    nextButtonText: {
      fontSize: fonts.sizes.md,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
    },
    generateButtonDisabled: {
      opacity: 0.7,
    },
    generateButtonText: {
      fontSize: fonts.sizes.md,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '600',
      color: theme.text,
    },
    pickerList: {
      maxHeight: 400,
    },
    pickerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    pickerItemSelected: {
      backgroundColor: theme.primaryLight,
    },
    pickerItemText: {
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    pickerItemTextSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
    // Progress modal styles
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
  });
