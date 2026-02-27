// Landing Page - EXACT match to web homepage
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';

export default function LandingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
  });

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLogo}>
            <View style={styles.logoIcon}>
              <Ionicons name="book" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.logoText}>Bible Lesson</Text>
              <Text style={styles.logoText}>Planner</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="moon-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="menu" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign In / Sign Up Buttons - Side by Side */}
        <View style={styles.authButtonsRow}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => {
              router.push('/(auth)/welcome');
            }}
            data-testid="landing-signin-btn"
          >
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => {
              router.push('/(auth)/welcome');
            }}
            data-testid="landing-signup-btn"
          >
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text style={styles.signUpText}>Sign Up Free</Text>
          </TouchableOpacity>
        </View>

        {/* Or Continue Without Account */}
        <Text style={styles.orText}>or continue without account</Text>

        {/* Create Test Lesson Button - Dashed Border */}
        <TouchableOpacity
          style={styles.createTestButton}
          onPress={() => router.push('/(public)/create-guest')}
          data-testid="create-test-lesson-btn"
        >
          <Ionicons name="sparkles-outline" size={18} color={theme.primary} />
          <Text style={styles.createTestText}>Create a Test Lesson (No Account)</Text>
        </TouchableOpacity>

        {/* Hero Section - Compact */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Bible Study & Sunday{'\n'}School Lessons
          </Text>
          <MaskedView
            maskElement={
              <Text style={styles.heroHighlight}>Rooted in Scripture</Text>
            }
          >
            <LinearGradient
              colors={['#EA580C', '#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.heroHighlight, { opacity: 0 }]}>Rooted in Scripture</Text>
            </LinearGradient>
          </MaskedView>
          
          <Text style={styles.heroSubtitle}>
            Generate engaging, age-appropriate Bible study and Sunday school lesson plans in minutes. Grounded in God's Word and tailored for your classroom.
          </Text>

          {/* CTA Buttons */}
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/(tabs)/create')}
            data-testid="create-first-lesson-btn"
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.primaryCtaText}>Create Your First Lesson</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={() => router.push('/(tabs)/lessons')}
            data-testid="browse-lessons-btn"
          >
            <Ionicons name="library-outline" size={20} color={theme.text} />
            <Text style={styles.secondaryCtaText}>Browse Lessons</Text>
          </TouchableOpacity>

          {/* Feature Pills */}
          <View style={styles.featurePills}>
            <View style={styles.featurePillRow}>
              <View style={styles.featurePill}>
                <Ionicons name="checkmark" size={16} color={theme.success} />
                <Text style={styles.featurePillText}>All Age Groups</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="checkmark" size={16} color={theme.success} />
                <Text style={styles.featurePillText}>Scripture-Based</Text>
              </View>
            </View>
            <View style={styles.featurePillRow}>
              <View style={styles.featurePill}>
                <Ionicons name="checkmark" size={16} color={theme.success} />
                <Text style={styles.featurePillText}>Print-Ready</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="checkmark" size={16} color={theme.success} />
                <Text style={styles.featurePillText}>Free to Start</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="book-outline" size={24} color={theme.primary} />
              <Text style={styles.statValue}>10,000+</Text>
              <Text style={styles.statLabel}>Lessons Created</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="business-outline" size={24} color={theme.primary} />
              <Text style={styles.statValue}>2,500+</Text>
              <Text style={styles.statLabel}>Churches Served</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="library-outline" size={24} color={theme.primary} />
              <Text style={styles.statValue}>66</Text>
              <Text style={styles.statLabel}>Books of Bible</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flash-outline" size={24} color={theme.primary} />
              <Text style={styles.statValue}>{'< 2 min'}</Text>
              <Text style={styles.statLabel}>Generation Time</Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>FEATURES</Text>
          </View>
          <Text style={styles.sectionTitle}>Everything You Need</Text>
          <Text style={styles.sectionSubtitle}>
            Tools designed for ministry leaders and teachers
          </Text>

          <View style={styles.featuresGrid}>
            {[
              { icon: 'book-outline', title: 'Scripture-Centered', desc: 'Every lesson built on Biblical foundations', color: '#3B82F6' },
              { icon: 'people-outline', title: 'Age-Appropriate', desc: 'Content tailored for every age group', color: '#10B981' },
              { icon: 'color-palette-outline', title: 'Creative Activities', desc: 'Engaging crafts and games included', color: '#8B5CF6' },
              { icon: 'flash-outline', title: 'Ready in Minutes', desc: 'AI generates complete lessons fast', color: '#F59E0B' },
              { icon: 'print-outline', title: 'Print & Share', desc: 'Beautiful PDFs ready to distribute', color: '#EF4444' },
              { icon: 'refresh-outline', title: 'Fully Customizable', desc: 'Edit and adapt to your needs', color: '#06B6D4' },
            ].map((feature, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>HOW IT WORKS</Text>
          </View>
          <Text style={styles.sectionTitle}>4 Simple Steps</Text>
          <Text style={styles.sectionSubtitle}>
            From scripture to complete lesson in minutes
          </Text>

          <View style={styles.stepsContainer}>
            {[
              { step: '01', title: 'Choose Scripture', desc: 'Select a Bible passage or browse by topic', icon: 'search-outline' },
              { step: '02', title: 'Set Parameters', desc: 'Pick age group, duration, and format', icon: 'options-outline' },
              { step: '03', title: 'Generate Lesson', desc: 'AI creates a complete lesson plan', icon: 'sparkles-outline' },
              { step: '04', title: 'Teach & Share', desc: 'Print, export, or share with your team', icon: 'share-outline' },
            ].map((item, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepIconContainer}>
                  <Ionicons name={item.icon as any} size={28} color={theme.primary} />
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>TESTIMONIALS</Text>
          </View>
          <Text style={styles.sectionTitle}>Trusted by Teachers</Text>

          <View style={styles.testimonialsContainer}>
            {[
              { quote: 'Bible Lesson Planner has transformed my Sunday school preparation. What used to take hours now takes minutes.', name: 'Sarah M.', role: "Children's Ministry Director" },
              { quote: 'The age-appropriate activities are spot on. My preschoolers are more engaged than ever.', name: 'Pastor James R.', role: 'Youth Pastor' },
            ].map((item, i) => (
              <View key={i} style={styles.testimonialCard}>
                <View style={styles.testimonialStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.testimonialQuote}>"{item.quote}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialAvatarText}>
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.testimonialName}>{item.name}</Text>
                    <Text style={styles.testimonialRole}>{item.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA Section */}
        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready to Get Started?</Text>
          <Text style={styles.finalCtaSubtitle}>
            Join thousands of teachers creating better Bible lessons
          </Text>
          <TouchableOpacity
            style={styles.finalCtaButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="flash" size={20} color={theme.primary} />
            <Text style={styles.finalCtaButtonText}>Create Your First Lesson</Text>
          </TouchableOpacity>
          <Text style={styles.finalCtaNote}>
            No credit card required
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <View style={styles.footerLogoIcon}>
              <Ionicons name="book" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.footerLogoText}>Bible Lesson Planner</Text>
          </View>
          <Text style={styles.footerCopyright}>
            © 2024 Bible Lesson Planner. All rights reserved.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    fixedHeader: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingTop: 50,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLogo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#1E3A5F',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
      lineHeight: 20,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    langBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    langText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    iconButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    // Auth buttons row
    authButtonsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    signInButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    signInText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    signUpButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    signUpText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    orText: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.textTertiary,
      marginVertical: spacing.xs,
    },
    createTestButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      backgroundColor: 'transparent',
      marginBottom: spacing.lg,
    },
    createTestText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
    // Hero section - compact
    heroSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1E3A5F',
      textAlign: 'center',
      lineHeight: 34,
      fontFamily: 'Montserrat_700Bold',
    },
    heroHighlight: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
      fontFamily: 'Montserrat_700Bold',
    },
    heroSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    primaryCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      width: '100%',
      marginBottom: spacing.sm,
    },
    primaryCtaText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    secondaryCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      width: '100%',
      marginBottom: spacing.lg,
    },
    secondaryCtaText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
    },
    featurePills: {
      gap: spacing.sm,
    },
    featurePillRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.lg,
    },
    featurePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    featurePillText: {
      fontSize: 15,
      color: theme.textSecondary,
    },
    // Stats
    statsSection: {
      marginBottom: spacing.xl,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginTop: spacing.xs,
    },
    statLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    // Sections
    section: {
      paddingVertical: spacing.xl,
      marginHorizontal: -spacing.md,
      paddingHorizontal: spacing.md,
    },
    sectionBadge: {
      alignSelf: 'center',
      backgroundColor: theme.primaryLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      marginBottom: spacing.sm,
    },
    sectionBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
      letterSpacing: 1,
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      fontFamily: fonts.heading,
    },
    sectionSubtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    featuresGrid: {
      gap: spacing.sm,
    },
    featureCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    featureTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    featureDesc: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    // Steps
    stepsContainer: {
      gap: spacing.lg,
    },
    stepItem: {
      alignItems: 'center',
    },
    stepIconContainer: {
      width: 70,
      height: 70,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.primary,
      marginBottom: spacing.sm,
    },
    stepNumber: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    stepDesc: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 200,
    },
    // Testimonials
    testimonialsContainer: {
      gap: spacing.sm,
    },
    testimonialCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    testimonialStars: {
      flexDirection: 'row',
      gap: 2,
      marginBottom: spacing.sm,
    },
    testimonialQuote: {
      fontSize: 15,
      color: theme.textSecondary,
      fontStyle: 'italic',
      lineHeight: 22,
      marginBottom: spacing.sm,
    },
    testimonialAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    testimonialAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    testimonialAvatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    testimonialName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    testimonialRole: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    // Final CTA
    finalCta: {
      backgroundColor: theme.primary,
      marginHorizontal: -spacing.md,
      padding: spacing.xl,
      alignItems: 'center',
    },
    finalCtaTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    finalCtaSubtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    finalCtaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    finalCtaButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.primary,
    },
    finalCtaNote: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
    },
    // Footer
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    footerLogo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    footerLogoIcon: {
      width: 24,
      height: 24,
      borderRadius: 4,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerLogoText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    footerCopyright: {
      fontSize: 11,
      color: theme.textTertiary,
    },
  });
