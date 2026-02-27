// Root Layout with Auth Provider
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import { colors } from '../src/styles/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  return (
    <AuthProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="lesson/[id]" 
          options={{ 
            title: 'Lesson Details',
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Create Lesson',
            presentation: 'modal',
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
