// Shared Header Component - Matches landing page header
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme, 
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, fonts } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuPress?: () => void;
}

export default function Header({ onMenuPress }: HeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { user, logout } = useAuth();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'PT', name: 'Português' },
  ];

  const menuItems = [
    { icon: 'home-outline', label: 'Home', route: '/(tabs)/index' },
    { icon: 'book-outline', label: 'My Lessons', route: '/(tabs)/lessons' },
    { icon: 'add-circle-outline', label: 'Create Lesson', route: '/(tabs)/create' },
    { icon: 'grid-outline', label: 'Templates', route: '/(tabs)/templates' },
    { icon: 'person-outline', label: 'Profile', route: '/(tabs)/profile' },
    { icon: 'settings-outline', label: 'Settings', route: '/(tabs)/profile' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null, action: 'help' },
  ];

  const handleMenuItemPress = (item: typeof menuItems[0]) => {
    setShowMenu(false);
    if (item.route) {
      router.push(item.route as any);
    } else if (item.action === 'help') {
      Linking.openURL('mailto:support@biblelessonplanner.com');
    }
  };

  const handleLanguageSelect = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang.code);
    setShowLanguage(false);
    // In a real app, this would update the app's language context
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    router.replace('/(auth)/landing');
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/(tabs)/index')}>
          <View style={styles.logoIcon}>
            <Ionicons name="book" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.logoText, { color: theme.text }]}>Bible Lesson</Text>
            <Text style={[styles.logoText, { color: theme.text }]}>Planner</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowLanguage(true)}>
            <Text style={[styles.langText, { color: theme.text }]}>{selectedLanguage}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            // Dark mode toggle - would need app-level state management
            // For now just show a message
          }}>
            <Ionicons name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowMenu(true)}>
            <Ionicons name="menu" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal visible={showLanguage} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLanguage(false)}
        >
          <View style={[styles.languageModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === lang.code && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text style={[
                  styles.languageText,
                  { color: theme.text },
                  selectedLanguage === lang.code && { color: theme.primary, fontWeight: '600' }
                ]}>
                  {lang.name}
                </Text>
                {selectedLanguage === lang.code && (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Modal */}
      <Modal visible={showMenu} animationType="slide" transparent>
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)} 
          />
          <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Menu</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {user && (
              <View style={[styles.userInfo, { borderBottomColor: theme.border }]}>
                <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.userAvatarText}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.userName, { color: theme.text }]}>{user.name || 'User'}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
                </View>
              </View>
            )}

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <Ionicons name={item.icon as any} size={22} color={theme.textSecondary} />
                  <Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {user && (
              <TouchableOpacity style={[styles.logoutButton, { borderTopColor: theme.border }]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color={theme.error} />
                <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  logoContainer: {
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
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    padding: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  languageModal: {
    width: '100%',
    maxWidth: 300,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  languageText: {
    fontSize: fonts.sizes.md,
  },
  // Menu styles
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.lg,
  },
  menuTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: fonts.sizes.sm,
  },
  menuItems: {
    flex: 1,
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  menuItemText: {
    fontSize: fonts.sizes.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  logoutText: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
});
