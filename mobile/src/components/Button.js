import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '../constants/theme';

export function Button({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles = {
      sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
      md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
      lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
    };

    return { ...baseStyle, ...sizeStyles[size] };
  };

  const getTextStyle = () => {
    const sizeStyles = {
      sm: { fontSize: FontSizes.sm },
      md: { fontSize: FontSizes.md },
      lg: { fontSize: FontSizes.lg },
    };

    return {
      fontWeight: '600',
      ...sizeStyles[size],
    };
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
        activeOpacity={0.8}
      >
        <View style={[getButtonStyle(), { backgroundColor: colors.primary }]}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
              <Text style={[getTextStyle(), { color: '#fff' }]}>{children}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
        activeOpacity={0.8}
      >
        <View style={[
          getButtonStyle(), 
          { 
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
          }
        ]}>
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
              <Text style={[getTextStyle(), { color: colors.text }]}>{children}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'gradient') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.gradientBlue, colors.gradientPurple, colors.gradientPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={getButtonStyle()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
              <Text style={[getTextStyle(), { color: '#fff' }]}>{children}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline variant
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      activeOpacity={0.8}
    >
      <View style={[
        getButtonStyle(), 
        { 
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        }
      ]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
            <Text style={[getTextStyle(), { color: colors.primary }]}>{children}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
