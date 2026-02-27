// Theme configuration - EXACT MATCH to web app design
export const colors = {
  light: {
    // Primary - Amber (exact match to web)
    primary: '#D97706',
    primaryLight: '#FEF3C7',
    primaryDark: '#B45309',

    // Backgrounds - Warm cream (exact match to web #F9F7F1)
    background: '#F9F7F1',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F4',

    // Text colors - Stone palette (exact match to web)
    text: '#1C1917',
    textSecondary: '#57534E',
    textTertiary: '#A8A29E',

    // Borders
    border: '#E7E5E4',
    borderLight: '#F5F5F4',

    // Status colors
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Card shadows
    cardBg: '#FFFFFF',
  },
  dark: {
    primary: '#F59E0B',
    primaryLight: '#422006',
    primaryDark: '#FCD34D',

    background: '#1C1917',
    surface: '#292524',
    surfaceSecondary: '#44403C',

    text: '#FAFAF9',
    textSecondary: '#A8A29E',
    textTertiary: '#78716C',

    border: '#44403C',
    borderLight: '#292524',

    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#422006',
    error: '#EF4444',
    errorLight: '#450A0A',
    info: '#60A5FA',
    infoLight: '#1E3A5F',

    cardBg: '#292524',
  },
};

export const fonts = {
  heading: 'serif', // Crimson Text equivalent
  body: 'System',
  sizes: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
    xxxl: 30,
    title: 34,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export default { colors, fonts, spacing, borderRadius };
