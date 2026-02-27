// Types for Bible Lesson Planner Mobile App

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  bibleVersion?: string;
  createdAt?: string;
}

export interface Session {
  user: User;
  token: string;
}

export interface LessonSection {
  title: string;
  content: string;
  type?: string;
}

export interface Lesson {
  id: string;
  title: string;
  passage: string;
  ageGroup: string;
  theme: string;
  duration: string;
  description?: string;
  objectives?: string[];
  sections: LessonSection[];
  memoryVerse?: string;
  prayerPoints?: string[];
  supplies?: string[];
  takeHomeActivity?: {
    title: string;
    description: string;
    materials?: string[];
    weeklyChallenge?: string;
  };
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface LessonConfig {
  title?: string;
  book?: string;
  chapter?: string | number;
  verse?: string;  // "start-end" format
  topic?: string;
  theme?: string;
  ageGroup: string;
  duration: string;
  format?: string;
  includeActivities?: boolean;
  includeCrafts?: boolean;
  includeMemoryVerse?: boolean;
  includeDiscussion?: boolean;
  includePrayer?: boolean;
  includeParentTakeHome?: boolean;
  bibleVersion?: string;
}

export interface Template {
  id: string;
  title: string;
  passage: string;
  ageGroup: string;
  theme: string;
  duration: string;
  description: string;
  category: string;
  objectives: string[];
  sections: LessonSection[];
}

export interface CurriculumWeek {
  weekNumber: number;
  lessonId?: string;
  lessonTitle?: string;
  passage?: string;
  notes?: string;
}

export interface Curriculum {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  weeks: CurriculumWeek[];
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export type Theme = 
  | 'Faith & Trust'
  | 'Love & Kindness'
  | 'Courage & Faith'
  | 'Forgiveness & Grace'
  | 'Obedience'
  | 'Prayer'
  | 'Salvation'
  | 'Service'
  | 'Wisdom'
  | 'Compassion & Kindness';

export const AGE_GROUPS: { id: string; name: string; range: string }[] = [
  { id: 'Preschool (3-5)', name: 'Preschool', range: '3-5 years' },
  { id: 'Elementary (6-10)', name: 'Elementary', range: '6-10 years' },
  { id: 'Pre-Teen (11-13)', name: 'Pre-Teen', range: '11-13 years' },
  { id: 'Teen (14-17)', name: 'Teen', range: '14-17 years' },
  { id: 'Adult', name: 'Adult', range: '18+ years' },
];

export const THEMES: Theme[] = [
  'Faith & Trust',
  'Love & Kindness',
  'Courage & Faith',
  'Forgiveness & Grace',
  'Obedience',
  'Prayer',
  'Salvation',
  'Service',
  'Wisdom',
  'Compassion & Kindness',
];

export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

export const BIBLE_VERSIONS = [
  { id: 'KJV', name: 'King James Version', abbr: 'KJV' },
  { id: 'NIV', name: 'New International Version', abbr: 'NIV' },
  { id: 'ESV', name: 'English Standard Version', abbr: 'ESV' },
  { id: 'NLT', name: 'New Living Translation', abbr: 'NLT' },
  { id: 'NASB', name: 'New American Standard Bible', abbr: 'NASB' },
  { id: 'NKJV', name: 'New King James Version', abbr: 'NKJV' },
  { id: 'CSB', name: 'Christian Standard Bible', abbr: 'CSB' },
  { id: 'AMP', name: 'Amplified Bible', abbr: 'AMP' },
];
