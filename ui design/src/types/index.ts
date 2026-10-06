export type LessonStatus = 'completed' | 'current' | 'upcoming' | 'locked';
export type LessonType = 'reading' | 'exercise' | 'video' | 'discussion' | 'assessment';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  status: LessonStatus;
  estimatedMinutes: number;
  content?: LessonContent[];
  keyTerms?: { term: string; definition: string }[];
  practiceQuestions?: { question: string; answer: string }[];
}

export interface LessonContent {
  type: 'paragraph' | 'heading' | 'subheading' | 'list' | 'blockquote' | 'image' | 'callout';
  text?: string;
  items?: string[];
  caption?: string;
  variant?: 'info' | 'warning' | 'tip';
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  icon: string;
  units: Unit[];
}

export interface ActivityItem {
  id: string;
  type: 'completed' | 'started' | 'answered' | 'saved';
  label: string;
  subject: string;
  subjectId: string;
  lessonTitle?: string;
  lessonId?: string;
  timestamp: string;
}

export interface Discussion {
  id: string;
  question: string;
  subject: string;
  subjectId: string;
  author: string;
  replies: number;
  lastActivity: string;
  excerpt: string;
  tags: string[];
  answered: boolean;
}

export interface SavedLesson {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  subjectId: string;
  unitTitle: string;
  savedAt: string;
  type: LessonType;
}
