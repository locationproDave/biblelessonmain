// API Client for Bible Lesson Planner
import { secureStorage, storage } from './storage';
import type { Lesson, LessonConfig, User, Session, Template, Curriculum, Notification } from './types';
import Constants from 'expo-constants';

// Get API URL with fallback
const getApiUrl = () => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  const defaultUrl = 'https://bible-lesson-preview.preview.emergentagent.com/api';
  const url = configUrl || defaultUrl;
  console.log('[API] Using API URL:', url);
  return url;
};

const API_URL = getApiUrl();

class APIClient {
  private token: string | null = null;

  private async getHeaders(): Promise<HeadersInit> {
    if (!this.token) {
      this.token = await secureStorage.getToken();
    }
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_URL}${endpoint}`;
    console.log('[API] Request:', options.method || 'GET', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      console.log('[API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[API] Error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || 'Request failed' };
        }
        throw new Error(error.message || error.detail || 'Request failed');
      }

      const data = await response.json();
      console.log('[API] Response data received');
      return data;
    } catch (error: any) {
      console.error('[API] Request error:', error.message);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    login: async (email: string, password: string): Promise<Session> => {
      console.log('[Auth] Attempting login for:', email);
      try {
        const data = await this.request<any>('/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        console.log('[Auth] Login response received, token exists:', !!data.token);
        
        if (data.token) {
          console.log('[Auth] Storing token...');
          await secureStorage.setToken(data.token);
          this.setToken(data.token);
          console.log('[Auth] Storing user data...');
          await storage.setUser(data.user);
          console.log('[Auth] Login successful for:', data.user?.name);
        } else {
          console.error('[Auth] No token in response');
          throw new Error('Login failed: No authentication token received');
        }
        
        return { user: data.user, token: data.token };
      } catch (error: any) {
        console.error('[Auth] Login error:', error.message);
        throw error;
      }
    },

    register: async (email: string, password: string, name: string): Promise<Session> => {
      const data = await this.request<any>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      
      if (data.token) {
        await secureStorage.setToken(data.token);
        this.setToken(data.token);
        await storage.setUser(data.user);
      }
      
      return { user: data.user, token: data.token };
    },

    logout: async (): Promise<void> => {
      await secureStorage.removeToken();
      await storage.removeUser();
      this.clearToken();
    },

    getSession: async (): Promise<Session | null> => {
      const token = await secureStorage.getToken();
      const user = await storage.getUser();
      
      if (token && user) {
        this.setToken(token);
        return { user, token };
      }
      
      return null;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
      const user = await this.request<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await storage.setUser(user);
      return user;
    },
  };

  // Lessons endpoints
  lessons = {
    getAll: async (): Promise<Lesson[]> => {
      try {
        const rawLessons = await this.request<any[]>('/lessons');
        // Transform API response to match mobile app types
        const lessons = rawLessons.map(this.transformLesson);
        // Cache for offline use
        await storage.setCachedLessons(lessons);
        return lessons;
      } catch (error) {
        // Return cached lessons if offline
        console.log('Fetching from cache due to error:', error);
        return await storage.getCachedLessons();
      }
    },

    getById: async (id: string): Promise<Lesson> => {
      try {
        const rawLesson = await this.request<any>(`/lessons/${id}`);
        const lesson = this.transformLesson(rawLesson);
        await storage.addCachedLesson(lesson);
        return lesson;
      } catch (error) {
        // Try to find in cache
        const cached = await storage.getCachedLessons();
        const found = cached.find((l: Lesson) => l.id === id);
        if (found) return found;
        throw error;
      }
    },

    create: async (lesson: Partial<Lesson>): Promise<Lesson> => {
      const created = await this.request<any>('/lessons', {
        method: 'POST',
        body: JSON.stringify(lesson),
      });
      const transformed = this.transformLesson(created);
      await storage.addCachedLesson(transformed);
      return transformed;
    },

    update: async (id: string, lesson: Partial<Lesson>): Promise<Lesson> => {
      const updated = await this.request<any>(`/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(lesson),
      });
      const transformed = this.transformLesson(updated);
      await storage.addCachedLesson(transformed);
      return transformed;
    },

    delete: async (id: string): Promise<void> => {
      await this.request(`/lessons/${id}`, { method: 'DELETE' });
      await storage.removeCachedLesson(id);
    },

    toggleFavorite: async (id: string): Promise<Lesson> => {
      const rawLesson = await this.request<any>(`/lessons/${id}/favorite`, {
        method: 'POST',
      });
      const lesson = this.transformLesson(rawLesson);
      await storage.addCachedLesson(lesson);
      return lesson;
    },

    generate: async (config: LessonConfig): Promise<Lesson> => {
      const rawLesson = await this.request<any>('/ai/generate-lesson', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      const lesson = this.transformLesson(rawLesson);
      await storage.addCachedLesson(lesson);
      return lesson;
    },
  };

  // Transform API lesson format to mobile app format
  private transformLesson = (raw: any): Lesson => {
    // Parse JSON strings if needed
    let sections = [];
    let materials = [];
    
    try {
      sections = typeof raw.sectionsJson === 'string' 
        ? JSON.parse(raw.sectionsJson) 
        : (raw.sections || []);
    } catch (e) {
      sections = raw.sections || [];
    }
    
    try {
      materials = typeof raw.materialsJson === 'string' 
        ? JSON.parse(raw.materialsJson) 
        : (raw.supplies || []);
    } catch (e) {
      materials = raw.supplies || [];
    }

    return {
      id: raw.id,
      title: raw.title,
      passage: raw.passage,
      ageGroup: raw.ageGroup,
      theme: raw.theme,
      duration: raw.duration,
      description: raw.description,
      objectives: raw.objectives || [],
      sections: sections.map((s: any) => ({
        title: s.title || 'Section',
        content: s.content || s.description || '',
        type: s.type || s.title,
      })),
      memoryVerse: raw.memoryVerseText 
        ? `${raw.memoryVerseText} - ${raw.memoryVerseReference || ''}`
        : raw.memoryVerse,
      prayerPoints: raw.prayerPoints || [],
      supplies: materials.map((m: any) => typeof m === 'string' ? m : m.item),
      takeHomeActivity: raw.takeHomeActivity,
      isFavorite: raw.favorite || raw.isFavorite || false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      userId: raw.userId,
    };
  };

  // Templates endpoints
  templates = {
    getAll: async (): Promise<Template[]> => {
      return this.request<Template[]>('/templates');
    },

    getById: async (id: string): Promise<Template> => {
      return this.request<Template>(`/templates/${id}`);
    },

    useTemplate: async (templateId: string): Promise<Lesson> => {
      return this.request<Lesson>(`/templates/${templateId}/use`, {
        method: 'POST',
      });
    },
  };

  // Curriculum endpoints
  curriculum = {
    getAll: async (): Promise<Curriculum[]> => {
      return this.request<Curriculum[]>('/curriculum');
    },

    getById: async (id: string): Promise<Curriculum> => {
      return this.request<Curriculum>(`/curriculum/${id}`);
    },

    create: async (data: Partial<Curriculum>): Promise<Curriculum> => {
      return this.request<Curriculum>('/curriculum', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Curriculum>): Promise<Curriculum> => {
      return this.request<Curriculum>(`/curriculum/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<void> => {
      await this.request(`/curriculum/${id}`, { method: 'DELETE' });
    },
  };

  // Notifications endpoints
  notifications = {
    getAll: async (): Promise<Notification[]> => {
      return this.request<Notification[]>('/notifications');
    },

    markAsRead: async (id: string): Promise<void> => {
      await this.request(`/notifications/${id}/read`, { method: 'POST' });
    },

    markAllAsRead: async (): Promise<void> => {
      await this.request('/notifications/read-all', { method: 'POST' });
    },
  };

  // Scripture endpoints
  scripture = {
    lookup: async (book: string, chapter: number, verseStart: number, verseEnd: number, version: string = 'KJV'): Promise<string> => {
      const params = new URLSearchParams({
        book,
        chapter: chapter.toString(),
        verse_start: verseStart.toString(),
        verse_end: verseEnd.toString(),
        version,
      });
      const data = await this.request<{ text: string }>(`/scripture/lookup?${params}`);
      return data.text;
    },
  };
}

export const api = new APIClient();
export default api;
