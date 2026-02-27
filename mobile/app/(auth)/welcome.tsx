// Welcome/Auth Screen - with Sign In / Sign Up / Create Lesson tabs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';

type TabType = 'signin' | 'signup' | 'create';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { login, register, isLoading, user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  // Reset form when switching tabs
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  }, [activeTab]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    }
  };

  const handleCreateWithoutAccount = () => {
    // Navigate to create lesson screen without account
    router.push('/(tabs)/create');
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="book-outline" size={28} color={theme.primary} />
          </View>
          <Text style={styles.appTitle}>Bible Lesson Planner</Text>
        </View>

        {/* Three-Tab Toggle - Sign In / Sign Up / Create Lesson */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'signin' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveTab('signin')}
              data-testid="toggle-signin"
            >
              <Ionicons
                name="log-in-outline"
                size={16}
                color={activeTab === 'signin' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeTab === 'signin' && styles.toggleTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'signup' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveTab('signup')}
              data-testid="toggle-signup"
            >
              <Ionicons
                name="person-add-outline"
                size={16}
                color={activeTab === 'signup' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeTab === 'signup' && styles.toggleTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'create' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveTab('create')}
              data-testid="toggle-create"
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={activeTab === 'create' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeTab === 'create' && styles.toggleTextActive,
                ]}
              >
                No Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Title */}
        <View style={styles.tabHeader}>
          <Text style={styles.tabTitle}>
            {activeTab === 'signin' && 'Welcome Back'}
            {activeTab === 'signup' && 'Create Account'}
            {activeTab === 'create' && 'Create a Lesson'}
          </Text>
          <Text style={styles.tabSubtitle}>
            {activeTab === 'signin' && 'Sign in to access your lesson plans'}
            {activeTab === 'signup' && 'Start creating Bible lessons today'}
            {activeTab === 'create' && 'No account needed - try our AI lesson generator'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={theme.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  data-testid="signin-email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  data-testid="signin-password"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSignIn}
                disabled={isLoading}
                data-testid="signin-submit"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.submitText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  data-testid="signup-name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  data-testid="signup-email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  data-testid="signup-password"
                />
                <Text style={styles.hint}>Minimum 8 characters</Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSignUp}
                disabled={isLoading}
                data-testid="signup-submit"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.submitText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Create Lesson Without Account */}
          {activeTab === 'create' && (
            <>
              <View style={styles.createInfo}>
                <View style={styles.createFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.createFeatureText}>No account required</Text>
                </View>
                <View style={styles.createFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.createFeatureText}>AI-powered lesson generation</Text>
                </View>
                <View style={styles.createFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.createFeatureText}>All 66 books of the Bible</Text>
                </View>
                <View style={styles.createFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.createFeatureText}>Age-appropriate content</Text>
                </View>
                <View style={styles.createFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.createFeatureText}>Free to try</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateWithoutAccount}
                data-testid="create-lesson-btn"
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Create a Lesson Now</Text>
              </TouchableOpacity>

              <Text style={styles.createNote}>
                Create an account later to save your lessons
              </Text>
            </>
          )}
        </View>

        {/* Footer */}
        {activeTab !== 'create' && (
          <Text style={styles.footerText}>
            Want to explore premium plans?{' '}
            <Text style={styles.footerLink}>View Pricing</Text>
          </Text>
        )}

        {/* Back to Landing */}
        <TouchableOpacity
          style={styles.backToLanding}
          onPress={() => router.push('/(auth)/landing')}
        >
          <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
          <Text style={styles.backToLandingText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: typeof colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: 60,
      paddingBottom: spacing.xxxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    logoContainer: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    appTitle: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
    },
    toggleContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    toggleWrapper: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.full,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
    },
    toggleButtonActive: {
      backgroundColor: theme.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    toggleTextActive: {
      color: '#FFFFFF',
    },
    tabHeader: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    tabTitle: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      color: theme.text,
      fontFamily: fonts.heading,
      marginBottom: spacing.xs,
    },
    tabSubtitle: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.errorLight,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    errorText: {
      flex: 1,
      color: theme.error,
      fontSize: fonts.sizes.sm,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: fonts.sizes.sm,
      fontWeight: '500',
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
    hint: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
      marginTop: spacing.xs,
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md + 2,
      marginTop: spacing.sm,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitText: {
      color: '#FFFFFF',
      fontSize: fonts.sizes.md,
      fontWeight: '600',
    },
    createInfo: {
      marginBottom: spacing.xl,
    },
    createFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    createFeatureText: {
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    createNote: {
      textAlign: 'center',
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.lg,
    },
    footerText: {
      textAlign: 'center',
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.xl,
    },
    footerLink: {
      color: theme.primary,
      fontWeight: '500',
    },
    backToLanding: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
      paddingVertical: spacing.md,
    },
    backToLandingText: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
    },
  });
