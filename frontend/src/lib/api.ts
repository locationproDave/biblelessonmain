import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Note: withCredentials removed - we use localStorage for tokens, not cookies
  // This was causing CORS issues on mobile browsers
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic API request helper for fetch-style usage
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

// Types
export interface Lesson {
  id: string;
  userId?: string;
  title: string;
  passage: string;
  ageGroup: string;
  duration: string;
  format: string;
  theme: string;
  memoryVerseText: string;
  memoryVerseReference: string;
  objectives: string[];
  sectionsJson: string;
  materialsJson: string;
  crossReferencesJson?: string;
  configJson?: string;
  favorite: boolean;
  createdAt?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  bibleVersion: string;
  ministryRole?: string;
  preferredAgeGroup?: string;
  onboardingCompleted: boolean;
}

export interface TeamMember {
  id: string;
  ownerId: string;
  userId: string;
  email: string;
  name?: string;
  role: 'editor' | 'viewer';
  joinedAt: number;
}

export interface Invitation {
  id: string;
  ownerId: string;
  email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'revoked';
  token: string;
  invitedAt: number;
  acceptedAt?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Auth API
export const authAPI = {
  signUp: async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  signIn: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  signOut: async () => {
    localStorage.removeItem('auth_token');
    return { success: true };
  },
  
  getSession: async () => {
    try {
      const response = await api.get('/auth/session');
      return response.data;
    } catch {
      return null;
    }
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (): Promise<Lesson[]> => {
    const response = await api.get('/lessons');
    return response.data;
  },
  
  getById: async (id: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },
  
  getByAgeGroup: async (ageGroup: string): Promise<Lesson[]> => {
    const response = await api.get(`/lessons?ageGroup=${encodeURIComponent(ageGroup)}`);
    return response.data;
  },
  
  getFavorites: async (): Promise<Lesson[]> => {
    const response = await api.get('/lessons?favorite=true');
    return response.data;
  },
  
  create: async (lesson: Omit<Lesson, 'id' | 'userId' | 'favorite' | 'createdAt'>): Promise<Lesson> => {
    const response = await api.post('/lessons', lesson);
    return response.data;
  },
  
  update: async (id: string, updates: Partial<Lesson>): Promise<Lesson> => {
    const response = await api.put(`/lessons/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },
  
  toggleFavorite: async (id: string): Promise<Lesson> => {
    const response = await api.post(`/lessons/${id}/favorite`);
    return response.data;
  },
};

// AI Generation API
export const aiAPI = {
  generateLesson: async (config: {
    book?: string;
    chapter?: string;
    verse?: string;
    topic?: string;
    theme?: string;
    ageGroup: string;
    duration: string;
    format: string;
    bibleVersion?: string;
    language?: string;
    includeActivities?: boolean;
    includeCrafts?: boolean;
    includeMemoryVerse?: boolean;
    includeDiscussion?: boolean;
    includePrayer?: boolean;
    includeParentTakeHome?: boolean;
  }) => {
    const response = await api.post('/ai/generate-lesson', config);
    return response.data;
  },
};

// User Preferences API
export const preferencesAPI = {
  get: async (): Promise<UserPreferences | null> => {
    try {
      const response = await api.get('/preferences');
      return response.data;
    } catch {
      return null;
    }
  },
  
  getBibleVersion: async (): Promise<string> => {
    try {
      const response = await api.get('/preferences/bible-version');
      return response.data.bibleVersion || 'KJV';
    } catch {
      return 'KJV';
    }
  },
  
  setBibleVersion: async (bibleVersion: string): Promise<UserPreferences> => {
    const response = await api.put('/preferences/bible-version', { bibleVersion });
    return response.data;
  },
  
  hasCompletedOnboarding: async (): Promise<boolean> => {
    try {
      const response = await api.get('/preferences/onboarding-status');
      return response.data.completed || false;
    } catch {
      return false;
    }
  },
  
  completeOnboarding: async (data: {
    ministryRole?: string;
    bibleVersion: string;
    preferredAgeGroup?: string;
  }): Promise<UserPreferences> => {
    const response = await api.post('/preferences/complete-onboarding', data);
    return response.data;
  },
};

// Team API
export const teamAPI = {
  getMembers: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team/members');
    return response.data;
  },
  
  getInvitations: async (): Promise<Invitation[]> => {
    const response = await api.get('/team/invitations');
    return response.data;
  },
  
  getPendingInvitations: async (): Promise<Invitation[]> => {
    const response = await api.get('/team/invitations?status=pending');
    return response.data;
  },
  
  getMyTeams: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team/my-teams');
    return response.data;
  },
  
  inviteMember: async (email: string, role: 'editor' | 'viewer'): Promise<Invitation> => {
    const response = await api.post('/team/invite', { email, role });
    return response.data;
  },
  
  acceptInvitation: async (token: string): Promise<TeamMember> => {
    const response = await api.post('/team/accept-invitation', { token });
    return response.data;
  },
  
  revokeMember: async (memberId: string): Promise<void> => {
    await api.delete(`/team/members/${memberId}`);
  },
  
  revokeInvitation: async (invitationId: string): Promise<void> => {
    await api.delete(`/team/invitations/${invitationId}`);
  },
};

// ==================== NEW FEATURE TYPES ====================

export interface Quiz {
  id: string;
  quizTitle: string;
  lessonId: string;
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface SupplyList {
  lessonId: string;
  supplies: Supply[];
  totalEstimatedCost: string;
  prepTime: string;
  shoppingList: string[];
  substitutions: { original: string; alternative: string }[];
}

export interface Supply {
  item: string;
  quantity: string;
  category: 'essential' | 'craft' | 'activity' | 'optional' | 'technology';
  notes: string;
  estimatedCost: string;
}

export interface CurriculumPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  ageGroup: string;
  lessonIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id?: string;
  userId?: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedSections: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

// ==================== EMAIL API ====================

export const emailAPI = {
  sendLesson: async (lessonId: string, recipientEmail: string, recipientName?: string): Promise<{ status: string; message: string; emailId: string }> => {
    const response = await api.post('/email/send-lesson', { 
      lessonId, 
      recipientEmail, 
      recipientName 
    });
    return response.data;
  },
};

// ==================== QUIZ API ====================

export const quizAPI = {
  generate: async (
    lessonId: string, 
    questionCount: number = 5, 
    questionTypes: string[] = ['multiple_choice', 'true_false'], 
    difficulty: string = 'medium',
    lessonDetails?: {
      title?: string;
      passage?: string;
      theme?: string;
      ageGroup?: string;
      memoryVerse?: string;
      content?: string;
    }
  ): Promise<Quiz> => {
    const response = await api.post('/ai/generate-quiz', {
      lessonId,
      questionCount,
      questionTypes,
      difficulty,
      lessonTitle: lessonDetails?.title,
      lessonPassage: lessonDetails?.passage,
      lessonTheme: lessonDetails?.theme,
      lessonAgeGroup: lessonDetails?.ageGroup,
      memoryVerse: lessonDetails?.memoryVerse,
      lessonContent: lessonDetails?.content
    });
    return response.data;
  },
  
  getForLesson: async (lessonId: string): Promise<Quiz[]> => {
    const response = await api.get(`/quizzes/${lessonId}`);
    return response.data;
  },
};

// ==================== SUPPLY LIST API ====================

export const supplyAPI = {
  extract: async (lessonId: string): Promise<SupplyList> => {
    const response = await api.post('/ai/extract-supplies', { lessonId });
    return response.data;
  },
};

// ==================== BIBLICAL MAP API ====================

export interface BiblicalLocation {
  name: string;
  modernName: string;
  lat: number;
  lng: number;
  type: 'city' | 'region' | 'river' | 'sea' | 'mountain' | 'desert' | 'landmark';
  period: string;
  significance: string;
  keyEvents: string[];
  scriptureRefs: string[];
  terrain: string;
}

export interface LocationDistance {
  from: string;
  to: string;
  miles: number;
  context: string;
}

export interface MapRegion {
  name: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
}

export interface BiblicalMapData {
  locations: BiblicalLocation[];
  distances: LocationDistance[];
  region: MapRegion;
}

export const biblicalMapAPI = {
  extractLocations: async (
    lessonId: string, 
    lessonTitle?: string, 
    lessonPassage?: string, 
    lessonContent?: string
  ): Promise<BiblicalMapData> => {
    const response = await api.post('/ai/extract-locations', { 
      lessonId,
      lessonTitle,
      lessonPassage,
      lessonContent
    });
    return response.data;
  },
  
  getCachedMapData: async (lessonId: string): Promise<BiblicalMapData | null> => {
    try {
      const response = await api.get(`/ai/map-data/${lessonId}`);
      return response.data;
    } catch {
      return null;
    }
  },
};

// ==================== CURRICULUM PLANNER API ====================

export const curriculumAPI = {
  getAll: async (): Promise<CurriculumPlan[]> => {
    const response = await api.get('/curriculum');
    return response.data;
  },
  
  getById: async (planId: string): Promise<CurriculumPlan> => {
    const response = await api.get(`/curriculum/${planId}`);
    return response.data;
  },
  
  create: async (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    ageGroup: string;
    lessonIds?: string[];
  }): Promise<CurriculumPlan> => {
    const response = await api.post('/curriculum', data);
    return response.data;
  },
  
  update: async (planId: string, data: Partial<CurriculumPlan>): Promise<CurriculumPlan> => {
    const response = await api.put(`/curriculum/${planId}`, data);
    return response.data;
  },
  
  delete: async (planId: string): Promise<void> => {
    await api.delete(`/curriculum/${planId}`);
  },
};

// ==================== PROGRESS TRACKER API ====================

export const progressAPI = {
  getAll: async (): Promise<Progress[]> => {
    const response = await api.get('/progress');
    return response.data;
  },
  
  getForLesson: async (lessonId: string): Promise<Progress> => {
    const response = await api.get(`/progress/${lessonId}`);
    return response.data;
  },
  
  update: async (data: {
    lessonId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completedSections?: string[];
    notes?: string;
  }): Promise<Progress> => {
    const response = await api.post('/progress', data);
    return response.data;
  },
  
  getSummary: async (): Promise<ProgressSummary> => {
    const response = await api.get('/progress/stats/summary');
    return response.data;
  },
};

// ==================== SUBSCRIPTION API ====================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: string;
  lessonsUsed: number;
  lessonsLimit: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  features: Record<string, any>;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  lessonsLimit: number;
  description: string;
  features: Record<string, any>;
}

export interface SubscriptionUsage {
  lessonsUsed: number;
  lessonsLimit: number;
  quizzesGenerated: number;
  periodStart: string;
  periodEnd: string;
}

export const subscriptionAPI = {
  getPlans: async (): Promise<{ individual: PricingPlan[]; organization: PricingPlan[] }> => {
    const response = await api.get('/pricing/plans');
    return response.data;
  },
  
  getCurrent: async (): Promise<{ subscription: Subscription | null; plan: PricingPlan; isFreeTier: boolean }> => {
    const response = await api.get('/subscription');
    return response.data;
  },
  
  getUsage: async (): Promise<SubscriptionUsage> => {
    const response = await api.get('/subscription/usage');
    return response.data;
  },
  
  checkLimit: async (): Promise<{ allowed: boolean; used: number; limit: number; planId: string; remaining: number }> => {
    const response = await api.get('/subscription/check-limit');
    return response.data;
  },
  
  createCheckoutSession: async (planId: string, originUrl: string): Promise<{ url: string; sessionId: string }> => {
    const response = await api.post('/checkout/create-session', { planId, originUrl });
    return response.data;
  },
  
  getCheckoutStatus: async (sessionId: string): Promise<{ status: string; paymentStatus: string; amount: number; currency: string }> => {
    const response = await api.get(`/checkout/status/${sessionId}`);
    return response.data;
  },
};

// ==================== EXPORT API ====================

export const exportAPI = {
  exportLesson: async (lessonId: string, format: 'pdf' | 'docx'): Promise<{
    success: boolean;
    lessonId: string;
    format: string;
    filename?: string;
    contentType?: string;
    fileData?: string;
    title?: string;
    htmlContent?: string;
    metadata?: {
      title: string;
      passage: string;
      ageGroup: string;
      duration: string;
      createdAt: string;
    };
  }> => {
    const response = await api.post('/export/lesson', { lessonId, format });
    return response.data;
  },
};

// ==================== PROMO CODE API ====================

export const promoAPI = {
  validate: async (code: string, planId: string): Promise<{
    valid: boolean;
    code?: string;
    discountPercent?: number;
    message: string;
  }> => {
    const response = await api.post('/promo/validate', { code, planId });
    return response.data;
  },
  
  use: async (code: string, planId: string): Promise<{ success: boolean }> => {
    const response = await api.post('/promo/use', { code, planId });
    return response.data;
  },
};

// ==================== CALENDAR SYNC API ====================

export interface CalendarEvent {
  title: string;
  description: string;
  durationMinutes?: number;
  suggestedDate?: string;
  lessonId?: string;
}

export const calendarAPI = {
  getAuthUrl: async (provider: 'google' | 'outlook' | 'apple'): Promise<{
    provider: string;
    status: string;
    message: string;
    setupUrl: string;
    instructions: string[];
  }> => {
    const response = await api.get(`/calendar/auth-url/${provider}`);
    return response.data;
  },
  
  generateICS: async (event: {
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    provider: string;
  }): Promise<{ success: boolean; icsContent: string; filename: string }> => {
    const response = await api.post('/calendar/generate-ics', event);
    return response.data;
  },
  
  syncLesson: async (lessonId: string, provider: 'google' | 'outlook' | 'apple'): Promise<{
    event: CalendarEvent;
    provider: string;
    instructions: string;
  }> => {
    const response = await api.post('/calendar/sync-lesson', { lessonId, provider });
    return response.data;
  },
  
  syncCurriculum: async (curriculumId: string, provider: 'google' | 'outlook' | 'apple'): Promise<{
    curriculum: { id: string; title: string; startDate: string; endDate: string };
    events: CalendarEvent[];
    provider: string;
  }> => {
    const response = await api.post('/calendar/sync-lesson', { curriculumId, provider });
    return response.data;
  },

  // Google Calendar Direct Integration
  getGoogleCalendarStatus: async (): Promise<{
    connected: boolean;
    configured: boolean;
    email?: string;
    message?: string;
  }> => {
    const response = await api.get('/calendar/google/status');
    return response.data;
  },

  startGoogleAuth: async (): Promise<{
    authorization_url: string;
    state: string;
  }> => {
    const response = await api.get('/calendar/google/auth');
    return response.data;
  },

  disconnectGoogleCalendar: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/calendar/google/disconnect');
    return response.data;
  },

  createGoogleCalendarEvent: async (event: {
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    provider: string;
  }): Promise<{
    success: boolean;
    event?: {
      id: string;
      htmlLink: string;
      summary: string;
      start: { dateTime: string };
      end: { dateTime: string };
    };
    message: string;
  }> => {
    const response = await api.post('/calendar/google/create-event', event);
    return response.data;
  },

  getGoogleCalendarEvents: async (): Promise<{
    events: Array<{
      id: string;
      summary: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
      htmlLink: string;
    }>;
  }> => {
    const response = await api.get('/calendar/google/events');
    return response.data;
  },

  // Calendar Configuration APIs
  listGoogleCalendars: async (): Promise<{
    calendars: Array<{
      id: string;
      summary: string;
      description?: string;
      primary: boolean;
      backgroundColor?: string;
      accessRole: string;
    }>;
    current_calendar_id: string;
    shared_calendar_id?: string;
  }> => {
    const response = await api.get('/calendar/google/calendars');
    return response.data;
  },

  getCalendarConfig: async (): Promise<{
    site_calendar_id: string;
    shared_calendar_id?: string;
    user_calendar_id?: string;
    effective_calendar_id: string;
    google_connected: boolean;
    google_email?: string;
  }> => {
    const response = await api.get('/calendar/config');
    return response.data;
  },

  setUserCalendar: async (calendarId: string): Promise<{
    success: boolean;
    calendar_id: string;
    message: string;
  }> => {
    const response = await api.post(`/calendar/config/user-calendar?calendar_id=${encodeURIComponent(calendarId)}`);
    return response.data;
  },
};

// ==================== ADMIN API ====================

export interface AdminAnalytics {
  period: string;
  startDate: string;
  metrics: {
    newSignups: number;
    totalUsers: number;
    lessonsCreated: number;
    totalLessons: number;
    activeUsers: number;
  };
  charts: {
    dailySignups: Record<string, number>;
    dailyLessons: Record<string, number>;
    ageGroupDistribution: Record<string, number>;
  };
  recentSignups: Array<{ id: string; name: string; email: string; createdAt: string }>;
  recentLessons: Array<{ id: string; title: string; ageGroup: string; createdAt: string }>;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt: string;
  lessonCount?: number;
}

export interface AdminSpending {
  period: string;
  metrics: {
    totalRevenue: number;
    newSubscriptions: number;
    subscriptionCounts: Record<string, number>;
  };
  revenueByPlan: Record<string, number>;
  dailyRevenue: Record<string, number>;
}

export interface AdminLessonsStats {
  period: string;
  totalCreated: number;
  themeDistribution: Record<string, number>;
  durationDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  recentLessons: Array<{ id: string; title: string; ageGroup: string; theme: string; duration: string; createdAt: string }>;
}

export const adminAPI = {
  getAnalytics: async (period: string = '7d'): Promise<AdminAnalytics> => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },
  
  getUsers: async (page: number = 1, limit: number = 20, search?: string): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },
  
  getSpending: async (period: string = '30d'): Promise<AdminSpending> => {
    const response = await api.get(`/admin/spending?period=${period}`);
    return response.data;
  },
  
  getLessonsStats: async (period: string = '30d'): Promise<AdminLessonsStats> => {
    const response = await api.get(`/admin/lessons-stats?period=${period}`);
    return response.data;
  },
  
  getPlanBreakdown: async (): Promise<{
    totalUsers: number;
    totalMRR: number;
    breakdown: {
      planId: string;
      planName: string;
      price: number;
      color: string;
      userCount: number;
      percentage: number;
      monthlyRevenue: number;
      recentUsers: { id: string; name: string; email: string; createdAt: string }[];
    }[];
  }> => {
    const response = await api.get('/admin/plan-breakdown');
    return response.data;
  },
  
  setUserAdmin: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/admin/set-admin/${userId}`);
    return response.data;
  },
  
  removeUserAdmin: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/admin/remove-admin/${userId}`);
    return response.data;
  },
};

// ==================== SERIES API ====================

export interface Series {
  id: string;
  userId: string;
  name: string;
  summary: string;
  theme: string;
  ageGroup: string;
  lessonIds: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesStats {
  total: number;
  totalLessons: number;
  themes: number;
}

export const seriesAPI = {
  getAll: async (): Promise<Series[]> => {
    const response = await api.get('/series');
    return response.data;
  },
  
  getById: async (seriesId: string): Promise<Series> => {
    const response = await api.get(`/series/${seriesId}`);
    return response.data;
  },
  
  create: async (data: {
    name: string;
    summary: string;
    theme: string;
    ageGroup: string;
    lessonIds?: string[];
  }): Promise<Series> => {
    const response = await api.post('/series', data);
    return response.data;
  },
  
  update: async (seriesId: string, data: Partial<{
    name: string;
    summary: string;
    theme: string;
    ageGroup: string;
    lessonIds: string[];
  }>): Promise<Series> => {
    const response = await api.put(`/series/${seriesId}`, data);
    return response.data;
  },
  
  delete: async (seriesId: string): Promise<void> => {
    await api.delete(`/series/${seriesId}`);
  },
  
  addLesson: async (seriesId: string, lessonId: string): Promise<Series> => {
    const response = await api.post(`/series/${seriesId}/lessons/${lessonId}`);
    return response.data;
  },
  
  removeLesson: async (seriesId: string, lessonId: string): Promise<Series> => {
    const response = await api.delete(`/series/${seriesId}/lessons/${lessonId}`);
    return response.data;
  },
  
  reorderLessons: async (seriesId: string, lessonIds: string[]): Promise<Series> => {
    const response = await api.put(`/series/${seriesId}/reorder`, { lessonIds });
    return response.data;
  },
  
  getLessons: async (seriesId: string): Promise<Lesson[]> => {
    const response = await api.get(`/series/${seriesId}/lessons`);
    return response.data;
  },
  
  getStats: async (): Promise<SeriesStats> => {
    const response = await api.get('/series/stats/summary');
    return response.data;
  },
};

// ==================== COLLABORATION WEBSOCKET ====================

export interface CollaborationUser {
  userId: string;
  userName: string;
}

export interface CollaborationMessage {
  type: 'presence' | 'cursor' | 'typing' | 'edit' | 'section_focus' | 'active_users' | 'pong' | 'ping';
  userId?: string;
  userName?: string;
  action?: 'joined' | 'left';
  activeUsers?: CollaborationUser[];
  position?: { x: number; y: number };
  sectionIndex?: number;
  isTyping?: boolean;
  field?: string;
  value?: string;
  timestamp?: string;
  users?: CollaborationUser[];
}

export class LessonCollaborationClient {
  private ws: WebSocket | null = null;
  private lessonId: string;
  private token: string;
  private onMessage: (message: CollaborationMessage) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pingInterval: NodeJS.Timeout | null = null;
  
  constructor(
    lessonId: string,
    token: string,
    onMessage: (message: CollaborationMessage) => void,
    onConnect: () => void = () => {},
    onDisconnect: () => void = () => {}
  ) {
    this.lessonId = lessonId;
    this.token = token;
    this.onMessage = onMessage;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }
  
  connect() {
    const wsUrl = import.meta.env.VITE_API_URL?.replace('https://', 'wss://').replace('http://', 'ws://') || '';
    const url = `${wsUrl}/ws/lesson/${this.lessonId}?token=${this.token}`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnect();
      this.startPing();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.onMessage(message);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };
    
    this.ws.onclose = () => {
      this.stopPing();
      this.onDisconnect();
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }
  
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }
  
  send(message: Partial<CollaborationMessage>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  sendCursor(position: { x: number; y: number }, sectionIndex?: number) {
    this.send({ type: 'cursor', position, sectionIndex });
  }
  
  sendTyping(sectionIndex: number, isTyping: boolean) {
    this.send({ type: 'typing', sectionIndex, isTyping });
  }
  
  sendEdit(sectionIndex: number, field: string, value: string, persist = false) {
    this.send({ type: 'edit', sectionIndex, field, value, persist } as any);
  }
  
  sendSectionFocus(sectionIndex: number) {
    this.send({ type: 'section_focus', sectionIndex });
  }
  
  getActiveUsers() {
    this.send({ type: 'get_active_users' } as any);
  }
  
  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const collaborationAPI = {
  getActiveUsers: async (lessonId: string): Promise<{ lessonId: string; activeUsers: CollaborationUser[] }> => {
    const response = await api.get(`/collaboration/${lessonId}/users`);
    return response.data;
  },
};

export default api;
