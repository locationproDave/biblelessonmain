// Auth layout
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors } from '../../src/styles/theme';

export default function AuthLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="landing" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
