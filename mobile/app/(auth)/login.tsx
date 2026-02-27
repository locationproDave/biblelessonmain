// Login Screen - redirect to welcome
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  return <Redirect href="/(auth)/welcome" />;
}
