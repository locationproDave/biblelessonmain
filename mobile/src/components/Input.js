import React from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '../constants/theme';

export function TextInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  icon,
  multiline = false,
  numberOfLines = 1,
  style,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : colors.surfaceBorder,
        }
      ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            { color: colors.text },
            multiline && styles.multilineInput,
          ]}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

export function Select({ label, value, options, onChange, placeholder }) {
  const { colors } = useTheme();
  // Note: For a real app, you'd use a proper picker component
  // This is a simplified version
  
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }
      ]}>
        <Text style={[styles.selectText, { color: value ? colors.text : colors.textMuted }]}>
          {value || placeholder || 'Select...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.md,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  selectText: {
    fontSize: FontSizes.md,
    paddingVertical: Spacing.md,
  },
});
