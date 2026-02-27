// Secure Storage for auth tokens and sensitive data
// Uses AsyncStorage fallback for Expo Go compatibility
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const CACHED_LESSONS_KEY = 'cached_lessons';
const SETTINGS_KEY = 'app_settings';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

// Try to use SecureStore, fallback to AsyncStorage for Expo Go
let SecureStore: any = null;
try {
  SecureStore = require('expo-secure-store');
} catch (e) {
  console.log('SecureStore not available, using AsyncStorage fallback');
}

// Secure storage for sensitive data (tokens)
export const secureStorage = {
  async setToken(token: string): Promise<void> {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      }
    } catch (e) {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      }
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
      } else {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
      }
    } catch (e) {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    }
  },

  async getBiometricEnabled(): Promise<boolean> {
    try {
      let value: string | null = null;
      if (SecureStore) {
        value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      } else {
        value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      }
      return value === 'true';
    } catch (e) {
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    }
  },
};

// Regular storage for non-sensitive data (lessons cache, settings)
export const storage = {
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  },

  async setCachedLessons(lessons: any[]): Promise<void> {
    await AsyncStorage.setItem(CACHED_LESSONS_KEY, JSON.stringify(lessons));
  },

  async getCachedLessons(): Promise<any[]> {
    const data = await AsyncStorage.getItem(CACHED_LESSONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addCachedLesson(lesson: any): Promise<void> {
    const lessons = await this.getCachedLessons();
    const existingIndex = lessons.findIndex((l: any) => l.id === lesson.id);
    if (existingIndex >= 0) {
      lessons[existingIndex] = lesson;
    } else {
      lessons.unshift(lesson);
    }
    // Keep only last 50 lessons cached
    const trimmedLessons = lessons.slice(0, 50);
    await this.setCachedLessons(trimmedLessons);
  },

  async removeCachedLesson(lessonId: string): Promise<void> {
    const lessons = await this.getCachedLessons();
    const filtered = lessons.filter((l: any) => l.id !== lessonId);
    await this.setCachedLessons(filtered);
  },

  async setSettings(settings: any): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  async getSettings(): Promise<any> {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      bibleVersion: 'KJV',
      darkMode: false,
      notifications: true,
      offlineMode: false,
    };
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([USER_DATA_KEY, CACHED_LESSONS_KEY, SETTINGS_KEY, AUTH_TOKEN_KEY]);
  },
};

export default { secureStorage, storage };
