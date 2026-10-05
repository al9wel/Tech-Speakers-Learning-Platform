/*
# Add source column to resources table

## Purpose
Distinguish between three content sources on the Midad platform:
1. "official" — Admin-created content (default for existing rows)
2. "teacher" — Teacher-created content from the Teacher Dashboard
3. "contribution" — Content accepted through the "ساهم" user contribution workflow

## Changes
### Modified Tables
- `resources`: Added `source` column (text, NOT NULL, default 'official')
  - Existing rows default to 'official' since they were admin-created
  - New teacher-created content will set source = 'teacher'
  - Accepted contributions will set source = 'contribution'

### Updated RLS Policies
- Replaced the overly permissive anon INSERT/UPDATE/DELETE policies with
  ownership-scoped policies:
  - INSERT: authenticated users can insert resources where they are the
    teacher (teacher_id matches their teacher record) OR admin
  - UPDATE: teacher can update their own resources (teacher_id matches),
    admin can update any
  - DELETE: teacher can delete their own resources, admin can delete any
- SELECT remains open to anon + authenticated (public content)

## Important Notes
1. Existing resources keep source = 'official' by default
2. The contribution approval workflow already inserts into resources with
   source = 'contribution' — that code path is updated separately
3. Teacher content is NOT a contribution — it bypasses the review workflow
4. Only the teacher who owns a resource can edit/delete it; admins can
   manage all resources
*/

-- Add source column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'source'
  ) THEN
    ALTER TABLE resources ADD COLUMN source text NOT NULL DEFAULT 'official';
  END IF;
END $$;

-- Backfill existing rows to 'official' if they have NULL or no source
UPDATE resources SET source = 'official' WHERE source IS NULL OR source = '';

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_resources_source ON resources(source);

-- Replace overly permissive INSERT policy with ownership-scoped policy
DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
CREATE POLICY "anon_insert_resources" ON resources FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Replace UPDATE policy: teachers can update their own, admins can update all
DROP POLICY IF EXISTS "anon_update_resources" ON resources;
CREATE POLICY "anon_update_resources" ON resources FOR UPDATE
  TO authenticated
  USING (
    -- Teacher can update their own resources
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    -- Admin can update any resource
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.email = u.email
      WHERE u.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.email = u.email
      WHERE u.id = auth.uid()
    )
  );

-- Replace DELETE policy: teachers can delete their own, admins can delete any
DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "anon_delete_resources" ON resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.email = u.email
      WHERE u.id = auth.uid()
    )
  );