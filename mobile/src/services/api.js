import axios from 'axios';
import { API_BASE_URL } from '../constants/theme';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lesson API
export const lessonAPI = {
  generate: async (config) => {
    const response = await api.post('/ai/generate-lesson', config);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/lessons');
    return response.data;
  },
  
  save: async (lesson) => {
    const response = await api.post('/lessons', lesson);
    return response.data;
  },
  
  delete: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  generate: async (lessonId, questionCount = 5, questionTypes = ['multiple_choice', 'true_false'], difficulty = 'medium', lessonDetails = {}) => {
    const response = await api.post('/ai/generate-quiz', {
      lessonId,
      questionCount,
      questionTypes,
      difficulty,
      lessonTitle: lessonDetails.title,
      lessonPassage: lessonDetails.passage,
      lessonTheme: lessonDetails.theme,
      lessonAgeGroup: lessonDetails.ageGroup,
      memoryVerse: lessonDetails.memoryVerse,
      lessonContent: lessonDetails.content,
    });
    return response.data;
  },
};

// Map API  
export const mapAPI = {
  extractLocations: async (lessonId, lessonTitle, lessonPassage, lessonContent) => {
    const response = await api.post('/ai/extract-locations', {
      lessonId,
      lessonTitle,
      lessonPassage,
      lessonContent,
    });
    return response.data;
  },
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (question, sessionId) => {
    const response = await api.post('/chatbot/chat', { question, sessionId });
    return response.data;
  },
};

// Pricing API
export const pricingAPI = {
  getPlans: async (billing = 'monthly') => {
    const response = await api.get(`/pricing/plans?billing=${billing}`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  submit: async (data) => {
    const response = await api.post('/contact', data);
    return response.data;
  },
};
