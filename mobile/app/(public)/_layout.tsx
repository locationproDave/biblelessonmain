// Public Layout - No auth required
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors } from '../../src/styles/theme';

export default function PublicLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen 
        name="create-guest" 
        options={{ 
          title: 'Create Test Lesson',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
