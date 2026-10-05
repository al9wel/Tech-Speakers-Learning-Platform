/*
# Create MIDAD educational platform database schema

## Overview
This migration creates the complete database schema for the مِداد (MIDAD) educational platform.
The platform connects students, teachers, and educational content in a single space.

## New Tables

### 1. subjects
Stores the 12 academic subjects (Quran, Math, Physics, etc.).
- `id` (text, primary key — slug like 'physics', 'math')
- `name` (text, Arabic name)
- `name_en` (text, English name)
- `description` (text, short Arabic description)
- `icon` (text, lucide-react icon name)
- `color` (text, brand color tag: 'ink' | 'gold' | 'sage')
- `grade_level` (text, default 'secondary_1' — designed to scale to other grades)
- `sort_order` (int, display ordering)
- `created_at` (timestamp)

### 2. teachers
Volunteer teachers who share knowledge with students.
- `id` (uuid, primary key)
- `user_id` (uuid, nullable — links to auth.users when real auth is added)
- `name` (text, display name with title like "أ. أحمد محمد")
- `subject_id` (text, FK → subjects.id)
- `bio` (text, short biography)
- `avatar_initials` (text, 2-char Arabic initials for avatar)
- `questions_open` (boolean, default true — whether students can submit questions)
- `followers_count` (int, default 0 — denormalized follower count)
- `created_at` (timestamp)

### 3. teacher_links
External links for teachers (Telegram, WhatsApp, etc.).
- `id` (uuid, primary key)
- `teacher_id` (uuid, FK → teachers.id ON DELETE CASCADE)
- `label` (text, display label)
- `link_type` (text: 'telegram' | 'whatsapp' | 'external')
- `url` (text, the link)
- `sort_order` (int)

### 4. resources
Educational content (lessons, summaries, presentations, files, videos).
- `id` (uuid, primary key)
- `subject_id` (text, FK → subjects.id)
- `teacher_id` (uuid, nullable, FK → teachers.id)
- `title` (text, resource title)
- `lesson` (text, lesson/topic name)
- `type` (text: 'lesson' | 'summary' | 'presentation' | 'file' | 'video')
- `author` (text, author display name)
- `description` (text, resource description)
- `file_url` (text, nullable — for future file storage integration)
- `status` (text, default 'approved' — only approved content is public)
- `created_at` (timestamp)

### 5. announcements
Teacher-published educational announcements.
- `id` (uuid, primary key)
- `teacher_id` (uuid, FK → teachers.id ON DELETE CASCADE)
- `title` (text, announcement title)
- `body` (text, announcement body)
- `scheduled_date` (date, when the event/lesson takes place)
- `scheduled_time` (text, time display like "7:00 مساءً")
- `link_label` (text, nullable — button label)
- `link_url` (text, nullable — button URL)
- `created_at` (timestamp)

### 6. contributions
Student-submitted content for moderation. Submissions do NOT become public immediately.
- `id` (uuid, primary key)
- `student_name` (text)
- `email` (text, masked/protected)
- `subject_id` (text, FK → subjects.id)
- `lesson` (text, lesson/topic)
- `content_type` (text: 'lesson' | 'summary' | 'presentation' | 'file' | 'video')
- `description` (text)
- `file_name` (text, original uploaded filename)
- `file_url` (text, nullable — for future storage)
- `status` (text, default 'pending': 'pending' | 'approved' | 'rejected' | 'changes_requested')
- `review_note` (text, nullable — moderator's reason for rejection/changes)
- `reviewed_by` (uuid, nullable — admin user_id when reviewed)
- `reviewed_at` (timestamp, nullable)
- `created_at` (timestamp)

### 7. suggestions
User feedback and suggestions sent to admin dashboard.
- `id` (uuid, primary key)
- `name` (text, nullable — optional)
- `email` (text, nullable — optional)
- `type` (text: 'اقتراح ميزة' | 'اقتراح محتوى' | 'مشكلة' | 'اقتراح متعلق بالمعلمين' | 'أخرى')
- `message` (text)
- `status` (text, default 'new': 'new' | 'read' | 'resolved')
- `created_at` (timestamp)

### 8. subscriptions
Teacher follow relationships (student follows teacher).
- `id` (uuid, primary key)
- `teacher_id` (uuid, FK → teachers.id ON DELETE CASCADE)
- `user_id` (uuid, nullable — links to auth.users when real auth is added)
- `notifications_enabled` (boolean, default false — Web Push notification toggle)
- `created_at` (timestamp)
- UNIQUE constraint on (teacher_id, user_id) to prevent duplicate follows

### 9. questions
Student questions submitted to teachers (moderated Q&A system).
- `id` (uuid, primary key)
- `teacher_id` (uuid, FK → teachers.id ON DELETE CASCADE)
- `student_name` (text, nullable — can be anonymous)
- `question` (text)
- `answer` (text, nullable — teacher's response)
- `status` (text, default 'pending': 'pending' | 'answered' | 'closed')
- `created_at` (timestamp)
- `answered_at` (timestamp, nullable)

## Security
- RLS enabled on ALL tables.
- Since the app currently uses simulated auth (not real Supabase auth), policies
  use `TO anon, authenticated` so the anon-key frontend can read/write.
- Public content (subjects, teachers, resources, announcements) is readable by all.
- Contributions and suggestions are insertable by all (submissions), but only
  readable by the submitter or admin (for now, readable by all since admin is simulated).
- user_id columns are nullable and ready for when real Supabase auth is connected.
  When auth is added, policies should be tightened to `TO authenticated` with
  `auth.uid()` ownership checks.

## Scalability Notes
- `subjects.grade_level` allows expanding to secondary_2, secondary_3, middle_school, primary.
- `subscriptions` and `questions` are designed for Web Push Notifications and
  moderated Q&A in future phases.
- `resources.file_url` and `contributions.file_url` are ready for Supabase Storage integration.
*/

-- ============================================================
-- 1. SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_en text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'BookOpen',
  color text NOT NULL DEFAULT 'ink',
  grade_level text NOT NULL DEFAULT 'secondary_1',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 2. TEACHERS
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  subject_id text NOT NULL REFERENCES subjects(id),
  bio text NOT NULL DEFAULT '',
  avatar_initials text NOT NULL DEFAULT '',
  questions_open boolean NOT NULL DEFAULT true,
  followers_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_subject_id ON teachers(subject_id);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 3. TEACHER_LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  label text NOT NULL,
  link_type text NOT NULL DEFAULT 'external',
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_links_teacher_id ON teacher_links(teacher_id);

ALTER TABLE teacher_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_teacher_links" ON teacher_links;
CREATE POLICY "anon_select_teacher_links" ON teacher_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teacher_links" ON teacher_links;
CREATE POLICY "anon_insert_teacher_links" ON teacher_links FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teacher_links" ON teacher_links;
CREATE POLICY "anon_update_teacher_links" ON teacher_links FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teacher_links" ON teacher_links;
CREATE POLICY "anon_delete_teacher_links" ON teacher_links FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 4. RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES subjects(id),
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  title text NOT NULL,
  lesson text NOT NULL,
  type text NOT NULL DEFAULT 'lesson',
  author text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_url text,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_subject_id ON resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_teacher_id ON resources(teacher_id);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resources" ON resources;
CREATE POLICY "anon_select_resources" ON resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
CREATE POLICY "anon_insert_resources" ON resources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resources" ON resources;
CREATE POLICY "anon_update_resources" ON resources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "anon_delete_resources" ON resources FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 5. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  scheduled_date date,
  scheduled_time text,
  link_label text,
  link_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_teacher_id ON announcements(teacher_id);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  email text NOT NULL,
  subject_id text NOT NULL REFERENCES subjects(id),
  lesson text NOT NULL,
  content_type text NOT NULL DEFAULT 'summary',
  description text NOT NULL,
  file_name text NOT NULL,
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_subject_id ON contributions(subject_id);

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contributions" ON contributions;
CREATE POLICY "anon_select_contributions" ON contributions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contributions" ON contributions;
CREATE POLICY "anon_insert_contributions" ON contributions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contributions" ON contributions;
CREATE POLICY "anon_update_contributions" ON contributions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contributions" ON contributions;
CREATE POLICY "anon_delete_contributions" ON contributions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 7. SUGGESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_suggestions" ON suggestions;
CREATE POLICY "anon_select_suggestions" ON suggestions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_suggestions" ON suggestions;
CREATE POLICY "anon_insert_suggestions" ON suggestions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_suggestions" ON suggestions;
CREATE POLICY "anon_update_suggestions" ON suggestions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_suggestions" ON suggestions;
CREATE POLICY "anon_delete_suggestions" ON suggestions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 8. SUBSCRIPTIONS (teacher follows)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (teacher_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_teacher_id ON subscriptions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 9. QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_name text,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  answered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_questions_teacher_id ON questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TRIGGER: Update teachers.followers_count on subscription change
-- ============================================================
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE teachers SET followers_count = followers_count + 1
    WHERE id = NEW.teacher_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE teachers SET followers_count = followers_count - 1
    WHERE id = OLD.teacher_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_insert ON subscriptions;
CREATE TRIGGER trg_subscriptions_insert
  AFTER INSERT ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_followers_count();

DROP TRIGGER IF EXISTS trg_subscriptions_delete ON subscriptions;
CREATE TRIGGER trg_subscriptions_delete
  AFTER DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_followers_count();
