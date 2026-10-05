/*
# Extend questions table for proper Q&A system

## Problem
The existing questions table only stores student_name (display name), not the
authenticated student's user ID. This means:
1. Questions can't be filtered back to the correct student
2. The teacher has no proper inbox query
3. No answer function exists
4. No support for public teacher-published Q&As

## Changes
### Modified Tables
- `questions`: Added columns:
  - `student_id` (uuid, nullable) — links to auth.users for the student who asked
  - `type` (text, NOT NULL, default 'private') — 'private' for student questions,
    'public' for teacher-published Q&As
  - `title` (text, nullable) — used as the question title for public Q&As
  - `updated_at` (timestamptz, nullable) — track answer edits

### Updated RLS Policies
Replaced the wide-open policies with ownership-scoped ones:
- SELECT: authenticated users can see:
  - Private questions they asked (student_id = auth.uid())
  - Private questions addressed to their teacher record
  - Public Q&As (type = 'public')
- INSERT: authenticated users can insert:
  - Private questions where student_id = auth.uid()
  - Public Q&As where teacher_id belongs to their teacher record
- UPDATE: only the teacher who owns the question can update (answer it / edit public Q&A)
- DELETE: only the teacher who owns the question can delete

## Important Notes
1. Existing questions keep type = 'private' by default
2. student_id is nullable for backward compatibility with existing rows
3. Public Q&As have student_id = NULL and type = 'public'
4. Private student questions have student_id = auth.uid() and type = 'private'
*/

-- Add student_id column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE questions ADD COLUMN student_id uuid;
  END IF;
END $$;

-- Add type column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'type'
  ) THEN
    ALTER TABLE questions ADD COLUMN type text NOT NULL DEFAULT 'private';
  END IF;
END $$;

-- Add title column (for public Q&A titles)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'title'
  ) THEN
    ALTER TABLE questions ADD COLUMN title text;
  END IF;
END $$;

-- Add updated_at column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE questions ADD COLUMN updated_at timestamptz;
  END IF;
END $$;

-- Backfill existing rows
UPDATE questions SET type = 'private' WHERE type IS NULL OR type = '';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_student_id ON questions(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- Replace SELECT policy: ownership-scoped
DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "authenticated_select_questions" ON questions FOR SELECT
  TO authenticated USING (
    -- Student can see their own private questions
    (type = 'private' AND student_id = auth.uid())
    OR
    -- Teacher can see private questions addressed to them
    (type = 'private' AND EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = questions.teacher_id
      AND t.user_id = auth.uid()
    ))
    OR
    -- Everyone can see public Q&As
    (type = 'public')
  );

-- Replace INSERT policy: student inserts private, teacher inserts public
DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "authenticated_insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (
    -- Student inserts a private question to a teacher
    (type = 'private' AND student_id = auth.uid())
    OR
    -- Teacher inserts a public Q&A for their own teacher record
    (type = 'public' AND EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = questions.teacher_id
      AND t.user_id = auth.uid()
    ))
  );

-- Replace UPDATE policy: only the owning teacher can update
DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "authenticated_update_questions" ON questions FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = questions.teacher_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = questions.teacher_id
      AND t.user_id = auth.uid()
    )
  );

-- Replace DELETE policy: only the owning teacher can delete
DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "authenticated_delete_questions" ON questions FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = questions.teacher_id
      AND t.user_id = auth.uid()
    )
  );