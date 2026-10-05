import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================================
// Database Types — mirror the database schema
// ============================================================

export type ResourceType = 'lesson' | 'summary' | 'presentation' | 'file' | 'video';
export type ContributionStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type SuggestionStatus = 'new' | 'read' | 'resolved';
export type QuestionStatus = 'pending' | 'answered' | 'closed';

export type Subject = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  color: string;
  grade_level: string;
  sort_order: number;
  created_at: string;
};

export type Teacher = {
  id: string;
  user_id: string | null;
  name: string;
  subject_id: string;
  bio: string;
  avatar_initials: string;
  questions_open: boolean;
  followers_count: number;
  created_at: string;
};

export type TeacherLink = {
  id: string;
  teacher_id: string;
  label: string;
  link_type: 'telegram' | 'whatsapp' | 'external';
  url: string;
  sort_order: number;
};

export type Resource = {
  id: string;
  subject_id: string;
  teacher_id: string | null;
  title: string;
  lesson: string;
  type: ResourceType;
  author: string;
  description: string;
  file_url: string | null;
  status: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  teacher_id: string;
  title: string;
  body: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  link_label: string | null;
  link_url: string | null;
  created_at: string;
};

export type Contribution = {
  id: string;
  student_name: string;
  email: string;
  subject_id: string;
  lesson: string;
  content_type: ResourceType;
  description: string;
  file_name: string;
  file_url: string | null;
  status: ContributionStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Suggestion = {
  id: string;
  name: string | null;
  email: string | null;
  type: string;
  message: string;
  status: SuggestionStatus;
  created_at: string;
};

export type Subscription = {
  id: string;
  teacher_id: string;
  user_id: string | null;
  notifications_enabled: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  teacher_id: string;
  student_name: string | null;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  created_at: string;
  answered_at: string | null;
};
