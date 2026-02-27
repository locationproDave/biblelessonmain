// Tabs Layout - Protected routes requiring authentication
import { Tabs, Redirect } from 'expo-router';
import { useColorScheme, Platform, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/styles/theme';
import Header from '../../src/components/Header';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
        <Header />
      </SafeAreaView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text,
          tabBarShowLabel: true,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            height: Platform.OS === 'ios' ? 88 : 70,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={focused ? theme.primary : theme.text} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="lessons"
          options={{
            title: 'Lessons',
            tabBarLabel: 'Lessons',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'book' : 'book-outline'} 
                size={24} 
                color={focused ? theme.primary : theme.text} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarLabel: 'Create',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'add-circle' : 'add-circle-outline'} 
                size={30} 
                color={theme.primary} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="templates"
          options={{
            title: 'Templates',
            tabBarLabel: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'grid' : 'grid-outline'} 
                size={24} 
                color={focused ? theme.primary : theme.text} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={focused ? theme.primary : theme.text} 
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
