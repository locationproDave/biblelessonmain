// App Entry - Show landing page first, redirect to tabs if logged in
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/styles/theme';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give auth a moment to check stored credentials
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.background }}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  // If logged in, go to tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise show landing page
  return <Redirect href="/(auth)/landing" />;
}
