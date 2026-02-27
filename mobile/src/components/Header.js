import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Menu, Sun, Moon, X } from 'lucide-react-native';

export function Header({ navigation, showMenu = true, title }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <SafeAreaView style={{ backgroundColor: colors.surface }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        {/* Logo */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <View>
            <Text style={[styles.logoText, { color: colors.text }]}>Bible Lesson</Text>
            <Text style={[styles.logoSubtext, { color: colors.primary }]}>Planner</Text>
          </View>
        </TouchableOpacity>

        {/* Right side buttons */}
        <View style={styles.rightButtons}>
          {/* Theme Toggle */}
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: colors.background }]}
          >
            {isDark ? (
              <Sun size={20} color={colors.primary} />
            ) : (
              <Moon size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {/* Menu Button */}
          {showMenu && (
            <TouchableOpacity 
              onPress={() => setMenuOpen(!menuOpen)}
              style={[styles.iconButton, { backgroundColor: colors.background }]}
            >
              {menuOpen ? (
                <X size={20} color={colors.text} />
              ) : (
                <Menu size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu */}
      {menuOpen && (
        <View style={[styles.mobileMenu, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <MenuItem label="Home" onPress={() => { setMenuOpen(false); navigation.navigate('Home'); }} colors={colors} />
          <MenuItem label="Create Lesson" onPress={() => { setMenuOpen(false); navigation.navigate('Generate'); }} colors={colors} />
          <MenuItem label="My Lessons" onPress={() => { setMenuOpen(false); navigation.navigate('Lessons'); }} colors={colors} />
          <MenuItem label="Templates" onPress={() => { setMenuOpen(false); navigation.navigate('Templates'); }} colors={colors} />
          <MenuItem label="Pricing" onPress={() => { setMenuOpen(false); navigation.navigate('Pricing'); }} colors={colors} />
          <MenuItem label="Help" onPress={() => { setMenuOpen(false); navigation.navigate('Help'); }} colors={colors} />
          <MenuItem label="Contact Us" onPress={() => { setMenuOpen(false); navigation.navigate('Contact'); }} colors={colors} />
          
          <View style={[styles.menuDivider, { backgroundColor: colors.surfaceBorder }]} />
          
          {isAuthenticated ? (
            <>
              <MenuItem label="Settings" onPress={() => { setMenuOpen(false); navigation.navigate('Settings'); }} colors={colors} />
              <MenuItem label="Profile" onPress={() => { setMenuOpen(false); navigation.navigate('Profile'); }} colors={colors} />
            </>
          ) : (
            <>
              <MenuItem label="Sign In" onPress={() => { setMenuOpen(false); navigation.navigate('SignIn'); }} colors={colors} primary />
              <MenuItem label="Sign Up" onPress={() => { setMenuOpen(false); navigation.navigate('SignUp'); }} colors={colors} primary />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function MenuItem({ label, onPress, colors, primary }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.menuItem}
    >
      <Text style={[
        styles.menuItemText, 
        { color: primary ? colors.primary : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoPlus: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    lineHeight: 18,
  },
  logoSubtext: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    lineHeight: 16,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
});
