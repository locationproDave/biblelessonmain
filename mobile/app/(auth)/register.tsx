// Register Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/theme';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
];

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      setError(err.message || 'Registration failed. Please try again.');
    }
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
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={40} color={theme.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start creating Bible lessons today</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={theme.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={theme.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Language</Text>
          <View style={styles.pickerContainer}>
            <Ionicons name="globe-outline" size={20} color={theme.textTertiary} style={styles.pickerIcon} />
            <Picker
              selectedValue={language}
              onValueChange={(val) => setLanguage(val)}
              style={styles.picker}
              dropdownIconColor={theme.textTertiary}
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
      padding: spacing.xl,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: theme.errorLight,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
    },
    errorText: {
      flex: 1,
      color: theme.error,
      fontSize: 14,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: theme.text,
    },
    registerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.md,
      ...shadows.md,
    },
    registerButtonDisabled: {
      opacity: 0.7,
    },
    registerButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xxl,
    },
    loginText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
    },
    pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.lg,
      paddingLeft: spacing.md,
    },
    pickerIcon: {
      marginRight: -spacing.sm,
    },
    picker: {
      flex: 1,
      color: theme.text,
    },
  });
