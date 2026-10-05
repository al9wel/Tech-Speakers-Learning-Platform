/*
# Add teacher profile fields and subscription student info

## Overview
This migration adds profile fields to the teachers table (specialization, subjects, years of experience, avatar URL, approval status) and a student_name column to subscriptions so the system works with the existing localStorage-based auth (no real Supabase Auth yet).

## Changes to teachers table
1. `specialization` (text) — the teacher's specialization title
2. `subjects` (text) — comma-separated list of subjects taught (Arabic)
3. `years_experience` (int) — years of teaching experience
4. `avatar_url` (text) — optional profile photo URL
5. `is_approved` (boolean, default false) — only approved teachers appear publicly

## Changes to subscriptions table
1. `student_name` (text) — the subscribing student's display name (since we use localStorage auth, not Supabase Auth)
2. `student_email` (text) — the subscribing student's email (for dedup)

## Notes
- The existing `is_hidden` column (from a previous migration) controls admin hide/show.
- `is_approved` controls whether a teacher is publicly visible and can receive subscriptions.
- Public queries will filter: `is_hidden = false AND is_approved = true`.
- The UNIQUE constraint on subscriptions is updated to use (teacher_id, student_email) to prevent duplicates.
*/

-- ============================================================
-- 1. Add profile fields to teachers
-- ============================================================
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS specialization text NOT NULL DEFAULT '';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS subjects text NOT NULL DEFAULT '';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS years_experience int NOT NULL DEFAULT 0;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. Add student info to subscriptions
-- ============================================================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS student_name text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS student_email text;

-- Drop the old unique constraint (teacher_id, user_id) and add new one
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_teacher_id_user_id_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_teacher_id_student_email_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_teacher_id_student_email_key
      UNIQUE (teacher_id, student_email);
  END IF;
END $$;

-- ============================================================
-- 3. Mark existing seed teachers as approved
-- ============================================================
UPDATE teachers SET is_approved = true WHERE is_approved = false;

-- ============================================================
-- 4. Add index for approval/visibility filtering
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_teachers_is_approved ON teachers(is_approved);
