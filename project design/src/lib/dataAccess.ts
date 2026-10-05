import { supabase } from '@/lib/supabase';
import {
  type Resource,
  type ResourceType,
  type Subject,
  type Teacher,
  type Contribution,
  type Suggestion,
  type Announcement,
  type Counselor,
  type CounselorStatus,
  type Conversation,
  type Message,
} from '@/data/sampleData';

// ============================================================
// Data access layer
// Fetches from Supabase when available, falls back to local sample data.
// All admin CRUD operations hit the real database.
// ============================================================

const dbAvailable = Boolean(
  (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL) &&
  (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY)
);

// ============================================================
// Types for DB row shapes
// ============================================================

export type SubjectRow = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  color: string;
  is_hidden: boolean;
  sort_order: number;
  grade_level: string;
  created_at: string;
};

export type TeacherRow = {
  id: string;
  user_id: string | null;
  name: string;
  subject_id: string;
  bio: string;
  avatar_initials: string;
  questions_open: boolean;
  followers_count: number;
  is_hidden: boolean;
  is_approved: boolean;
  specialization: string;
  subjects: string;
  years_experience: number;
  avatar_url: string | null;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  teacher_id: string;
  user_id: string | null;
  student_name: string | null;
  student_email: string | null;
  notifications_enabled: boolean;
  created_at: string;
};

export type ResourceRow = {
  id: string;
  subject_id: string;
  teacher_id: string | null;
  title: string;
  lesson: string;
  type: string;
  author: string;
  description: string;
  file_url: string | null;
  thumbnail_url: string | null;
  status: string;
  is_hidden: boolean;
  source: string;
  ai_enabled: boolean;
  created_at: string;
};

export type ContributionRow = {
  id: string;
  student_name: string;
  email: string;
  subject_id: string;
  lesson: string;
  content_type: string;
  description: string;
  file_name: string;
  file_url: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
};

export type SuggestionRow = {
  id: string;
  name: string | null;
  email: string | null;
  type: string;
  message: string;
  status: string;
  created_at: string;
};

// ============================================================
// Profiles (usernames)
// ============================================================

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  if (!dbAvailable) return true;
  let query = supabase.from('profiles').select('id').ilike('username', username);
  if (excludeUserId) query = query.neq('id', excludeUserId);
  const { data } = await query.maybeSingle();
  return !data;
}

export async function updateProfile(userId: string, updates: { username?: string; display_name?: string }): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
  return !error;
}

// ============================================================
// Subjects
// ============================================================

export async function fetchSubjects(includeHidden = false): Promise<Subject[]> {
  if (!dbAvailable) return [];
  let query = supabase.from('subjects').select('*').order('sort_order', { ascending: true });
  if (!includeHidden) query = query.eq('is_hidden', false);
  const { data, error } = await query;
  if (error || !data) return [];
  const subjects = data as SubjectRow[];
  const { data: resourcesData } = await supabase.from('resources')
    .select('subject_id')
    .eq('status', 'approved').eq('is_hidden', false);
  const counts: Record<string, number> = {};
  (resourcesData || []).forEach((r: any) => {
    counts[r.subject_id] = (counts[r.subject_id] || 0) + 1;
  });
  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    nameEn: s.name_en,
    description: s.description,
    icon: s.icon,
    resourceCount: counts[s.id] || 0,
    color: s.color as Subject['color'],
  }));
}

export async function fetchAllSubjectsAdmin(): Promise<SubjectRow[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('subjects').select('*').order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as SubjectRow[];
}

export async function insertSubject(s: {
  id: string; name: string; nameEn: string; description: string; icon: string; color: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('subjects').insert({
    id: s.id, name: s.name, name_en: s.nameEn, description: s.description,
    icon: s.icon, color: s.color, is_hidden: false, sort_order: 99, grade_level: 'secondary_1',
  });
  return !error;
}

export async function updateSubject(id: string, updates: {
  name?: string; name_en?: string; description?: string; icon?: string; color?: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('subjects').update(updates).eq('id', id);
  return !error;
}

export async function deleteSubject(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  return !error;
}

export async function toggleSubjectHidden(id: string, hidden: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('subjects').update({ is_hidden: hidden }).eq('id', id);
  return !error;
}

// ============================================================
// Teachers
// ============================================================

export async function fetchTeachers(includeHidden = false): Promise<Teacher[]> {
  if (!dbAvailable) return [];
  let query = supabase.from('teachers').select(`
    *, subject: subjects!inner(name), teacher_links(*)
  `).order('created_at', { ascending: true });
  if (!includeHidden) query = query.eq('is_hidden', false).eq('is_approved', true);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as any[]).map((t) => ({
    id: t.id,
    name: t.name,
    subjectId: t.subject_id,
    subjectName: t.subject?.name || '',
    bio: t.bio,
    followers: t.followers_count,
    avatarInitials: t.avatar_initials,
    questionsOpen: t.questions_open,
    specialization: t.specialization || '',
    subjects: t.subjects || '',
    yearsExperience: t.years_experience || 0,
    avatarUrl: t.avatar_url || null,
    isApproved: t.is_approved ?? false,
    links: (t.teacher_links || []).map((l: any) => ({
      label: l.label, type: l.link_type, url: l.url,
    })),
  }));
}

export async function fetchAllTeachersAdmin(): Promise<(TeacherRow & { subjectName: string })[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('teachers').select(`
    *, subject: subjects!inner(name)
  `).order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as any[]).map((t) => ({ ...t, subjectName: t.subject?.name || '' }));
}

export async function insertTeacher(t: {
  name: string; subjectId: string; bio: string; avatarInitials: string;
  specialization?: string; subjects?: string; yearsExperience?: number;
  avatarUrl?: string | null; isApproved?: boolean;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').insert({
    name: t.name, subject_id: t.subjectId, bio: t.bio,
    avatar_initials: t.avatarInitials, questions_open: true, followers_count: 0, is_hidden: false,
    specialization: t.specialization || '', subjects: t.subjects || '',
    years_experience: t.yearsExperience || 0, avatar_url: t.avatarUrl || null,
    is_approved: t.isApproved ?? false,
  });
  return !error;
}

export async function updateTeacher(id: string, updates: {
  name?: string; subject_id?: string; bio?: string; avatar_initials?: string;
  questions_open?: boolean; specialization?: string; subjects?: string;
  years_experience?: number; avatar_url?: string | null; is_approved?: boolean;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').update(updates).eq('id', id);
  return !error;
}

export async function deleteTeacher(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  return !error;
}

export async function toggleTeacherHidden(id: string, hidden: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').update({ is_hidden: hidden }).eq('id', id);
  return !error;
}

export async function setTeacherApproved(id: string, approved: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').update({ is_approved: approved }).eq('id', id);
  return !error;
}

// ============================================================
// Resources (Topics)
// ============================================================

export async function fetchResources(subjectId?: string): Promise<Resource[]> {
  if (!dbAvailable) return [];
  let query = supabase.from('resources').select(`*, subjects!inner(name)`)
    .eq('status', 'approved').eq('is_hidden', false);
  if (subjectId) query = query.eq('subject_id', subjectId);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    id: r.id, subjectId: r.subject_id, subjectName: r.subjects?.name || '',
    title: r.title, lesson: r.lesson, type: r.type as ResourceType,
    author: r.author, authorId: r.teacher_id || 'team',
    date: r.created_at?.split('T')[0] || '', description: r.description,
    fileUrl: r.file_url || null,
    thumbnailUrl: r.thumbnail_url || null,
    source: r.source || 'official',
  }));
}

export async function fetchResourcesByTeacher(teacherId: string): Promise<Resource[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('resources').select(`*, subjects!inner(name)`)
    .eq('teacher_id', teacherId)
    .eq('status', 'approved').eq('is_hidden', false)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    id: r.id, subjectId: r.subject_id, subjectName: r.subjects?.name || '',
    title: r.title, lesson: r.lesson, type: r.type as ResourceType,
    author: r.author, authorId: r.teacher_id || 'team',
    date: r.created_at?.split('T')[0] || '', description: r.description,
    fileUrl: r.file_url || null,
    thumbnailUrl: r.thumbnail_url || null,
    source: r.source || 'official',
  }));
}

export async function fetchAllResourcesByTeacherAdmin(teacherId: string): Promise<(ResourceRow & { subjectName: string })[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('resources').select(`*, subjects!inner(name)`)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({ ...r, subjectName: r.subjects?.name || '' }));
}

export async function fetchAllResourcesAdmin(): Promise<(ResourceRow & { subjectName: string })[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('resources').select(`*, subjects!inner(name)`)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({ ...r, subjectName: r.subjects?.name || '' }));
}

export async function insertResource(r: {
  subjectId: string; title: string; lesson: string; type: string;
  author: string; description: string; fileUrl?: string | null;
  thumbnailUrl?: string | null;
  teacherId?: string | null;
  source?: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').insert({
    subject_id: r.subjectId, title: r.title, lesson: r.lesson, type: r.type,
    author: r.author, description: r.description, file_url: r.fileUrl || null,
    thumbnail_url: r.thumbnailUrl || null,
    teacher_id: r.teacherId || null,
    source: r.source || 'official',
    status: 'approved', is_hidden: false,
  });
  return !error;
}

export async function updateResource(id: string, updates: {
  title?: string; lesson?: string; type?: string; description?: string;
  subject_id?: string; author?: string; file_url?: string | null;
  thumbnail_url?: string | null;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').update(updates).eq('id', id);
  return !error;
}

export async function updateResourceByTeacher(id: string, teacherId: string, updates: {
  title?: string; lesson?: string; type?: string; description?: string;
  subject_id?: string; file_url?: string | null;
  thumbnail_url?: string | null;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').update(updates)
    .eq('id', id).eq('teacher_id', teacherId);
  return !error;
}

export async function deleteResourceByTeacher(id: string, teacherId: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').delete()
    .eq('id', id).eq('teacher_id', teacherId);
  return !error;
}

export type DeleteResult = { ok: boolean; errorKind?: 'foreign_key' | 'permission' | 'other'; message?: string };

export async function deleteResource(id: string): Promise<DeleteResult> {
  if (!dbAvailable) return { ok: false, errorKind: 'other', message: 'Database not available' };
  const { error } = await supabase.from('resources').delete().eq('id', id);
  if (error) {
    console.error('Topic deletion failed:', error);
    const code = error.code || '';
    let errorKind: DeleteResult['errorKind'] = 'other';
    if (code === '23503' || /foreign key|violates foreign key/i.test(error.message || '')) {
      errorKind = 'foreign_key';
    } else if (code === '42501' || /policy|permission|denied|rls/i.test(error.message || '')) {
      errorKind = 'permission';
    }
    return { ok: false, errorKind, message: error.message };
  }
  return { ok: true };
}

export async function toggleResourceHidden(id: string, hidden: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').update({ is_hidden: hidden }).eq('id', id);
  return !error;
}

export async function toggleResourceAiEnabled(id: string, enabled: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('resources').update({ ai_enabled: enabled }).eq('id', id);
  if (error) console.error('AI toggle failed:', error);
  return !error;
}

// ============================================================
// Search
// ============================================================

export async function searchResources(query: string): Promise<Resource[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('resources').select(`*, subjects!inner(name)`)
    .eq('status', 'approved').eq('is_hidden', false)
    .or(`title.ilike.%${query}%,lesson.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    id: r.id, subjectId: r.subject_id, subjectName: r.subjects?.name || '',
    title: r.title, lesson: r.lesson, type: r.type as ResourceType,
    author: r.author, authorId: r.teacher_id || 'team',
    date: r.created_at?.split('T')[0] || '', description: r.description,
    fileUrl: r.file_url || null,
    thumbnailUrl: r.thumbnail_url || null,
    source: r.source || 'official',
  }));
}

// ============================================================
// Announcements
// ============================================================

export async function fetchAnnouncements(teacherId?: string): Promise<Announcement[]> {
  if (!dbAvailable) return [];
  let query = supabase.from('announcements').select(`*, teachers!inner(name)`);
  if (teacherId) query = query.eq('teacher_id', teacherId);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as any[]).map((a) => ({
    id: a.id, teacherId: a.teacher_id, teacherName: a.teachers?.name || '',
    title: a.title, body: a.body,
    date: a.scheduled_date || a.created_at?.split('T')[0] || '',
    time: a.scheduled_time || '',
    link: a.link_label ? { label: a.link_label, url: a.link_url || '#' } : undefined,
  }));
}

// ============================================================
// Contributions
// ============================================================

export async function fetchContributions(): Promise<Contribution[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('contributions').select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  const subjects = await fetchSubjects(true);
  return (data as ContributionRow[]).map((c) => ({
    id: c.id, studentName: c.student_name, email: c.email,
    subjectId: c.subject_id,
    subjectName: subjects.find((s) => s.id === c.subject_id)?.name || '',
    lesson: c.lesson, contentType: c.content_type as ResourceType,
    description: c.description, fileName: c.file_name,
    fileUrl: c.file_url || null,
    date: c.created_at?.split('T')[0] || '', status: c.status as Contribution['status'],
    reviewNote: c.review_note || undefined,
  }));
}

export async function fetchAllContributionsAdmin(): Promise<ContributionRow[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('contributions').select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as ContributionRow[];
}

export async function insertContribution(c: {
  studentName: string; email: string; subjectId: string; lesson: string;
  contentType: ResourceType; description: string; fileName: string; fileUrl?: string | null;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('contributions').insert({
    student_name: c.studentName, email: c.email, subject_id: c.subjectId,
    lesson: c.lesson, content_type: c.contentType, description: c.description,
    file_name: c.fileName, file_url: c.fileUrl || null, status: 'pending',
  });
  return !error;
}

export async function updateContributionStatus(id: string, status: string, reviewNote?: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const update: Record<string, any> = { status, reviewed_at: new Date().toISOString() };
  if (reviewNote !== undefined) update.review_note = reviewNote;
  const { error } = await supabase.from('contributions').update(update).eq('id', id);
  if (error) return false;
  if (status === 'approved') {
    const { data } = await supabase.from('contributions').select('*').eq('id', id).maybeSingle();
    if (data) {
      const c = data as ContributionRow;
      await supabase.from('resources').insert({
        subject_id: c.subject_id, title: c.lesson, lesson: c.lesson, type: c.content_type,
        author: c.student_name, description: c.description, file_url: c.file_url,
        source: 'contribution',
        status: 'approved', is_hidden: false,
      });
    }
  }
  return true;
}

export async function updateContribution(id: string, updates: {
  lesson?: string; description?: string; content_type?: string; subject_id?: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('contributions').update(updates).eq('id', id);
  return !error;
}

export async function deleteContribution(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('contributions').delete().eq('id', id);
  return !error;
}

// ============================================================
// Suggestions
// ============================================================

export async function fetchSuggestions(): Promise<Suggestion[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('suggestions').select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as SuggestionRow[]).map((s) => ({
    id: s.id, name: s.name || undefined, email: s.email || undefined,
    type: s.type, message: s.message,
    date: s.created_at?.split('T')[0] || '', status: s.status as Suggestion['status'],
  }));
}

export async function fetchAllSuggestionsAdmin(): Promise<SuggestionRow[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('suggestions').select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as SuggestionRow[];
}

export async function insertSuggestion(s: {
  name?: string; email?: string; type: string; message: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('suggestions').insert({
    name: s.name || null, email: s.email || null, type: s.type,
    message: s.message, status: 'new',
  });
  return !error;
}

export async function updateSuggestionStatus(id: string, status: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('suggestions').update({ status }).eq('id', id);
  return !error;
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  return !error;
}

// ============================================================
// Questions
// ============================================================

export type QuestionRow = {
  id: string;
  teacher_id: string;
  student_id: string | null;
  student_name: string | null;
  question: string;
  answer: string | null;
  title: string | null;
  type: string;
  status: string;
  created_at: string;
  answered_at: string | null;
  updated_at: string | null;
};

export type TeacherQuestion = {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string | null;
  studentName: string;
  studentUsername: string;
  question: string;
  answer: string | null;
  title: string | null;
  type: 'private' | 'public';
  status: string;
  createdAt: string;
  answeredAt: string | null;
  readAt: string | null;
};

function mapQuestion(q: any, teacherName?: string): TeacherQuestion {
  return {
    id: q.id,
    teacherId: q.teacher_id,
    teacherName: teacherName || q.teacher_name || q.teachers?.name || '',
    studentId: q.student_id,
    studentName: q.student_name || 'طالب',
    studentUsername: q.student_username || q.student_name || 'طالب',
    question: q.question,
    answer: q.answer,
    title: q.title,
    type: (q.type || 'private') as 'private' | 'public',
    status: q.status || 'pending',
    createdAt: q.created_at,
    answeredAt: q.answered_at,
    readAt: q.read_at || null,
  };
}

// Student sends a private question to a teacher
export async function insertPrivateQuestion(params: {
  teacherId: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  question: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions').insert({
    teacher_id: params.teacherId,
    student_id: params.studentId,
    student_name: params.studentName,
    student_username: params.studentUsername,
    question: params.question,
    type: 'private',
    status: 'pending',
  });
  return !error;
}

// Teacher answers a private question
export async function answerQuestion(id: string, answer: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions').update({
    answer,
    status: 'answered',
    answered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  return !error;
}

// Fetch private questions for a teacher (inbox)
export async function fetchTeacherQuestions(teacherId: string): Promise<TeacherQuestion[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('questions')
    .select('*, teachers!inner(name)')
    .eq('teacher_id', teacherId)
    .eq('type', 'private')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((q) => mapQuestion(q, q.teachers?.name));
}

// Fetch questions asked by a student
export async function fetchStudentQuestions(studentId: string): Promise<TeacherQuestion[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('questions')
    .select('*, teachers!inner(name)')
    .eq('student_id', studentId)
    .eq('type', 'private')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((q) => mapQuestion(q, q.teachers?.name));
}

// Teacher creates a public Q&A
export async function insertPublicQA(params: {
  teacherId: string;
  title: string;
  question: string;
  answer: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions').insert({
    teacher_id: params.teacherId,
    title: params.title,
    question: params.question,
    answer: params.answer,
    type: 'public',
    status: 'published',
    student_id: null,
    student_name: null,
  });
  return !error;
}

// Teacher updates their public Q&A
export async function updatePublicQA(id: string, updates: {
  title?: string;
  question?: string;
  answer?: string;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions').update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  return !error;
}

// Teacher deletes their public Q&A
export async function deletePublicQA(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return !error;
}

// Fetch all answered private questions (admin moderation view)
export async function fetchAllAnsweredQuestionsAdmin(): Promise<TeacherQuestion[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('questions')
    .select('*, teachers!inner(name)')
    .eq('type', 'private')
    .order('answered_at', { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return (data as any[]).map((q) => mapQuestion(q, q.teachers?.name));
}

// Student marks a question's answer as read
export async function markQuestionRead(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('questions')
    .update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Mark question read failed:', error);
  return !error;
}

// Fetch public Q&As for a teacher
export async function fetchPublicQAs(teacherId: string): Promise<TeacherQuestion[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('questions')
    .select('*, teachers!inner(name)')
    .eq('teacher_id', teacherId)
    .eq('type', 'public')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((q) => mapQuestion(q, q.teachers?.name));
}

// ============================================================
// Subscriptions
// ============================================================

export async function fetchSubscriptions(teacherId: string): Promise<SubscriptionRow[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('subscriptions').select('*')
    .eq('teacher_id', teacherId).order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as SubscriptionRow[];
}

export async function fetchSubscriptionCount(teacherId: string): Promise<number> {
  if (!dbAvailable) return 0;
  const { count, error } = await supabase.from('subscriptions').select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId);
  if (error) return 0;
  return count || 0;
}

export async function checkSubscription(teacherId: string, studentEmail: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { data } = await supabase.from('subscriptions').select('id')
    .eq('teacher_id', teacherId).eq('student_email', studentEmail).maybeSingle();
  return !!data;
}

export async function subscribeToTeacher(teacherId: string, studentName: string, studentEmail: string): Promise<{ ok: boolean; error?: string }> {
  if (!dbAvailable) return { ok: false, error: 'قاعدة البيانات غير متاحة' };
  const { data: existing } = await supabase.from('subscriptions').select('id')
    .eq('teacher_id', teacherId).eq('student_email', studentEmail).maybeSingle();
  if (existing) return { ok: false, error: 'أنت مشترك بالفعل' };
  const { error } = await supabase.from('subscriptions').insert({
    teacher_id: teacherId, student_name: studentName, student_email: studentEmail,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unsubscribeFromTeacher(teacherId: string, studentEmail: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('subscriptions').delete()
    .eq('teacher_id', teacherId).eq('student_email', studentEmail);
  return !error;
}

export async function fetchTeacherByEmail(email: string): Promise<TeacherRow | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('teachers').select('*')
    .eq('name', email).maybeSingle();
  if (error || !data) return null;
  return data as TeacherRow;
}

export async function fetchTeacherByName(name: string): Promise<TeacherRow | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('teachers').select('*')
    .eq('name', name).maybeSingle();
  if (error || !data) return null;
  return data as TeacherRow;
}

export async function fetchTeacherByUserId(userId: string): Promise<TeacherRow | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('teachers').select('*')
    .eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return data as TeacherRow;
}

export async function insertTeacherForUser(t: {
  userId: string; name: string; subjectId: string; bio: string; avatarInitials: string;
  specialization?: string; subjects?: string; yearsExperience?: number;
  avatarUrl?: string | null;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('teachers').insert({
    user_id: t.userId,
    name: t.name, subject_id: t.subjectId, bio: t.bio,
    avatar_initials: t.avatarInitials, questions_open: true, followers_count: 0,
    is_hidden: false, is_approved: false,
    specialization: t.specialization || '', subjects: t.subjects || '',
    years_experience: t.yearsExperience || 0, avatar_url: t.avatarUrl || null,
  });
  return !error;
}

// ============================================================
// Admin stats — dynamically computed from database
// ============================================================

export async function fetchAdminStats(): Promise<{
  subjects: number; teachers: number; resources: number;
  contributions: number; pendingContributions: number; suggestions: number;
  announcements: number; counselors: number; pendingCounselors: number;
}> {
  if (!dbAvailable) {
    return { subjects: 0, teachers: 0, resources: 0, contributions: 0, pendingContributions: 0, suggestions: 0, announcements: 0, counselors: 0, pendingCounselors: 0 };
  }
  const [subjectsR, teachersR, resourcesR, contributionsR, pendingR, suggestionsR, announcementsR, counselorsR, pendingCounselorsR] = await Promise.all([
    supabase.from('subjects').select('id', { count: 'exact', head: true }),
    supabase.from('teachers').select('id', { count: 'exact', head: true }),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('contributions').select('id', { count: 'exact', head: true }),
    supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('suggestions').select('id', { count: 'exact', head: true }),
    supabase.from('announcements').select('id', { count: 'exact', head: true }),
    supabase.from('counselors').select('id', { count: 'exact', head: true }),
    supabase.from('counselors').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return {
    subjects: subjectsR.count || 0,
    teachers: teachersR.count || 0,
    resources: resourcesR.count || 0,
    contributions: contributionsR.count || 0,
    pendingContributions: pendingR.count || 0,
    suggestions: suggestionsR.count || 0,
    announcements: announcementsR.count || 0,
    counselors: counselorsR.count || 0,
    pendingCounselors: pendingCounselorsR.count || 0,
  };
}

// ============================================================
// Counselors
// ============================================================

export type CounselorRow = {
  id: string;
  user_id: string;
  name: string;
  username: string;
  photo_url: string | null;
  specialization: string;
  bio: string;
  qualifications: string;
  experience: number;
  support_areas: string;
  status: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

function mapCounselor(c: CounselorRow): Counselor {
  return {
    id: c.id,
    userId: c.user_id,
    name: c.name,
    username: c.username,
    photoUrl: c.photo_url,
    specialization: c.specialization,
    bio: c.bio,
    qualifications: c.qualifications,
    experience: c.experience,
    supportAreas: c.support_areas,
    status: c.status as CounselorStatus,
    isVisible: c.is_visible,
    createdAt: c.created_at,
  };
}

export async function fetchApprovedCounselors(): Promise<Counselor[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('counselors')
    .select('*')
    .eq('status', 'approved')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as CounselorRow[]).map(mapCounselor);
}

export async function fetchCounselorById(id: string): Promise<Counselor | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('counselors')
    .select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapCounselor(data as CounselorRow);
}

export async function fetchCounselorByUserId(userId: string): Promise<Counselor | null> {
  if (!dbAvailable) return null;
  const { data, error } = await supabase.from('counselors')
    .select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return mapCounselor(data as CounselorRow);
}

export async function fetchAllCounselorsAdmin(): Promise<CounselorRow[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('counselors')
    .select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as CounselorRow[];
}

export async function insertCounselor(c: {
  userId: string; name: string; username: string;
  specialization?: string; bio?: string; qualifications?: string;
  experience?: number; supportAreas?: string; photoUrl?: string | null;
}): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('counselors').insert({
    user_id: c.userId, name: c.name, username: c.username,
    specialization: c.specialization || '', bio: c.bio || '',
    qualifications: c.qualifications || '', experience: c.experience || 0,
    support_areas: c.supportAreas || '', photo_url: c.photoUrl || null,
    status: 'pending', is_visible: true,
  });
  return !error;
}

export async function updateCounselor(id: string, updates: Partial<{
  name: string; username: string; specialization: string; bio: string;
  qualifications: string; experience: number; support_areas: string;
  photo_url: string | null;
}>): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('counselors')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Counselor update failed:', error);
  return !error;
}

export async function updateCounselorStatus(id: string, status: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('counselors')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Counselor status update failed:', error);
  return !error;
}

export async function toggleCounselorVisible(id: string, visible: boolean): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('counselors')
    .update({ is_visible: visible, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Counselor visibility toggle failed:', error);
  return !error;
}

export async function deleteCounselor(id: string): Promise<boolean> {
  if (!dbAvailable) return false;
  const { error } = await supabase.from('counselors').delete().eq('id', id);
  if (error) console.error('Counselor deletion failed:', error);
  return !error;
}

// ============================================================
// Conversations & Messages
// ============================================================

export type ConversationRow = {
  id: string;
  student_id: string;
  student_username: string;
  counselor_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export async function fetchConversationsForCounselor(counselorId: string): Promise<(ConversationRow & {
  unreadCount: number; lastMessage: string | null; lastMessageAt: string | null;
})[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('conversations')
    .select('*').eq('counselor_id', counselorId)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  const convs = data as ConversationRow[];
  const result = await Promise.all(convs.map(async (conv) => {
    const { count } = await supabase.from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .eq('sender_role', 'student')
      .is('read_at', null);
    const { data: lastMsg } = await supabase.from('messages')
      .select('*').eq('conversation_id', conv.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    return {
      ...conv,
      unreadCount: count || 0,
      lastMessage: lastMsg?.content || null,
      lastMessageAt: lastMsg?.created_at || null,
    };
  }));
  return result;
}

export async function fetchConversationsForStudent(studentId: string): Promise<(ConversationRow & {
  counselorName: string; counselorPhoto: string | null;
  unreadCount: number; lastMessage: string | null; lastMessageAt: string | null;
})[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('conversations')
    .select('*, counselor:counselors(*)')
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  const convs = data as any[];
  const result = await Promise.all(convs.map(async (conv) => {
    const { count } = await supabase.from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .eq('sender_role', 'counselor')
      .is('read_at', null);
    const { data: lastMsg } = await supabase.from('messages')
      .select('*').eq('conversation_id', conv.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    return {
      id: conv.id,
      student_id: conv.student_id,
      student_username: conv.student_username,
      counselor_id: conv.counselor_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message_at: conv.last_message_at,
      counselorName: conv.counselor?.name || '',
      counselorPhoto: conv.counselor?.photo_url || null,
      unreadCount: count || 0,
      lastMessage: lastMsg?.content || null,
      lastMessageAt: lastMsg?.created_at || null,
    };
  }));
  return result;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (!dbAvailable) return [];
  const { data, error } = await supabase.from('messages')
    .select('*').eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as MessageRow[]).map((m) => ({
    id: m.id, conversationId: m.conversation_id, senderId: m.sender_id,
    senderRole: m.sender_role as 'student' | 'counselor',
    content: m.content, createdAt: m.created_at, readAt: m.read_at,
  }));
}

export async function getOrCreateConversation(
  studentId: string, studentUsername: string, counselorId: string
): Promise<{ conversationId: string | null; error?: string }> {
  if (!dbAvailable) return { conversationId: null, error: 'قاعدة البيانات غير متاحة' };
  const { data: existing } = await supabase.from('conversations')
    .select('id').eq('student_id', studentId).eq('counselor_id', counselorId).maybeSingle();
  if (existing) return { conversationId: existing.id };
  const { data, error } = await supabase.from('conversations').insert({
    student_id: studentId, student_username: studentUsername, counselor_id: counselorId,
  }).select('id').single();
  if (error) return { conversationId: null, error: error.message };
  return { conversationId: data.id };
}

export async function sendMessage(
  conversationId: string, senderId: string, senderRole: 'student' | 'counselor', content: string
): Promise<{ ok: boolean; error?: string }> {
  if (!dbAvailable) return { ok: false, error: 'قاعدة البيانات غير متاحة' };
  if (!content.trim()) return { ok: false, error: 'الرسالة فارغة' };
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId, sender_id: senderId,
    sender_role: senderRole, content: content.trim(),
  });
  if (error) return { ok: false, error: error.message };
  await supabase.from('conversations').update({
    updated_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  }).eq('id', conversationId);
  return { ok: true };
}

export async function markMessagesRead(conversationId: string, readerRole: 'student' | 'counselor'): Promise<void> {
  if (!dbAvailable) return;
  await supabase.from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('sender_role', readerRole === 'student' ? 'counselor' : 'student')
    .is('read_at', null);
}

export async function fetchCounselorUnreadCount(counselorId: string): Promise<number> {
  if (!dbAvailable) return 0;
  const { data: convs } = await supabase.from('conversations')
    .select('id').eq('counselor_id', counselorId);
  if (!convs || convs.length === 0) return 0;
  const convIds = convs.map((c: any) => c.id);
  const { count } = await supabase.from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convIds)
    .eq('sender_role', 'student')
    .is('read_at', null);
  return count || 0;
}

export async function fetchStudentUnreadCount(studentId: string): Promise<number> {
  if (!dbAvailable) return 0;
  const { data: convs } = await supabase.from('conversations')
    .select('id').eq('student_id', studentId);
  if (!convs || convs.length === 0) return 0;
  const convIds = convs.map((c: any) => c.id);
  const { count } = await supabase.from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convIds)
    .eq('sender_role', 'counselor')
    .is('read_at', null);
  return count || 0;
}

// ============================================================
// Resource file upload
// ============================================================

export async function uploadResourceFile(
  file: File, onProgress?: (pct: number) => void
): Promise<{ url: string | null; error?: string }> {
  if (!dbAvailable) return { url: null, error: 'التخزين غير متاح' };
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) return { url: null, error: 'حجم الملف يتجاوز 100 ميجابايت' };
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowed = ['pdf', 'mp4', 'webm', 'mov', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!allowed.includes(ext)) return { url: null, error: 'نوع الملف غير مدعوم' };
  const fileName = `resources/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from('files')
    .upload(fileName, file, { upsert: false });
  if (error) return { url: null, error: error.message };
  const { data: urlData } = supabase.storage.from('files').getPublicUrl(fileName);
  return { url: urlData.publicUrl };
}

export async function uploadResourceThumbnail(
  file: File
): Promise<{ url: string | null; error?: string }> {
  if (!dbAvailable) return { url: null, error: 'التخزين غير متاح' };
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return { url: null, error: 'حجم الصورة يتجاوز 5 ميجابايت' };
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!imgExts.includes(ext)) return { url: null, error: 'يجب أن تكون الصورة بصيغة JPG أو PNG أو GIF أو WebP' };
  const fileName = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('files').upload(fileName, file, { upsert: false });
  if (error) return { url: null, error: error.message };
  const { data: urlData } = supabase.storage.from('files').getPublicUrl(fileName);
  return { url: urlData.publicUrl };
}
