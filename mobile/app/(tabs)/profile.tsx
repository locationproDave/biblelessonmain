// Profile Screen - Matching web profile page
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fonts, spacing, borderRadius } from '../../src/styles/theme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="moon-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Appearance</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="book-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Bible Version</Text>
            <Text style={styles.menuItemValue}>KJV</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="language-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Language</Text>
            <Text style={styles.menuItemValue}>English</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="star-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Rate App</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="card-outline" size={20} color={theme.primary} />
            </View>
            <Text style={styles.menuItemText}>Subscription</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Free</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.menuIconContainer, { backgroundColor: theme.errorLight }]}>
              <Ionicons name="log-out-outline" size={20} color={theme.error} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Bible Lesson Planner v1.0.0</Text>
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
      paddingTop: 60,
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
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    avatarText: {
      fontSize: fonts.sizes.xxl,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: fonts.sizes.lg,
      fontWeight: '700',
      color: theme.text,
    },
    userEmail: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    editButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fonts.sizes.xs,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: spacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border,
    },
    menuIconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    menuItemText: {
      flex: 1,
      fontSize: fonts.sizes.md,
      color: theme.text,
    },
    menuItemValue: {
      fontSize: fonts.sizes.sm,
      color: theme.textSecondary,
      marginRight: spacing.sm,
    },
    planBadge: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    planBadgeText: {
      fontSize: fonts.sizes.xs,
      fontWeight: '600',
      color: theme.primary,
    },
    logoutItem: {
      marginTop: spacing.sm,
    },
    appInfo: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    appVersion: {
      fontSize: fonts.sizes.xs,
      color: theme.textTertiary,
    },
  });
