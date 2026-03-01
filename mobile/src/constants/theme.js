// Theme constants matching the web app
export const Colors = {
  light: {
    primary: '#d97706', // amber-600
    primaryDark: '#b45309', // amber-700
    secondary: '#78716c', // stone-500
    background: '#fffbeb', // amber-50
    backgroundGradientStart: '#fef7ed',
    backgroundGradientEnd: '#fff7ed',
    surface: '#ffffff',
    surfaceBorder: '#e7e5e4', // stone-200
    text: '#1c1917', // stone-900
    textSecondary: '#78716c', // stone-500
    textMuted: '#a8a29e', // stone-400
    success: '#22c55e', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    
    // Gradient colors for chatbot
    gradientBlue: '#3b82f6',
    gradientPurple: '#8b5cf6', 
    gradientPink: '#ec4899',
    
    // Card colors
    cardBg: '#ffffff',
    cardBorder: '#e7e5e4',
  },
  dark: {
    primary: '#fbbf24', // amber-400
    primaryDark: '#f59e0b', // amber-500
    secondary: '#a8a29e', // stone-400
    background: '#1c1917', // stone-900
    backgroundGradientStart: '#1c1917',
    backgroundGradientEnd: '#292524',
    surface: '#292524', // stone-800
    surfaceBorder: '#44403c', // stone-700
    text: '#fafaf9', // stone-50
    textSecondary: '#a8a29e', // stone-400
    textMuted: '#78716c', // stone-500
    success: '#4ade80', // green-400
    error: '#f87171', // red-400
    warning: '#fbbf24', // amber-400
    
    gradientBlue: '#60a5fa',
    gradientPurple: '#a78bfa',
    gradientPink: '#f472b6',
    
    cardBg: '#292524',
    cardBorder: '#44403c',
  }
};

export const Fonts = {
  heading: 'CrimsonText-Regular',
  headingBold: 'CrimsonText-Bold',
  body: 'System',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const API_BASE_URL = 'https://claude-ai-features.preview.emergentagent.com/api';
