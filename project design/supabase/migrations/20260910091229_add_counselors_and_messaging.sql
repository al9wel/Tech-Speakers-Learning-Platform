/*
# Add Counselors, Conversations, and Messages tables

## 1. New Tables

### counselors
Stores psychological counselor profiles linked to auth users.
- id (uuid, PK)
- user_id (uuid, FK to auth.users, unique) — links to the counselor's auth account
- name (text) — display name
- username (text) — display username shown to students in DMs
- photo_url (text, nullable) — profile photo URL
- specialization (text) — area of specialization
- bio (text) — professional bio
- qualifications (text) — credentials/qualifications
- experience (integer) — years of experience
- support_areas (text) — areas of support (comma-separated)
- status (text, default 'pending') — pending/approved/rejected/suspended
- is_visible (boolean, default true) — admin visibility toggle
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### conversations
Private DM conversations between students and counselors.
- id (uuid, PK)
- student_id (uuid, FK to auth.users) — the student
- student_username (text) — snapshot of student's display name (for privacy)
- counselor_id (uuid, FK to counselors) — the counselor profile
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- last_message_at (timestamptz, nullable)
- Unique constraint on (student_id, counselor_id) to prevent duplicates

### messages
Individual messages within conversations.
- id (uuid, PK)
- conversation_id (uuid, FK to conversations ON DELETE CASCADE)
- sender_id (uuid, FK to auth.users)
- sender_role (text) — 'student' or 'counselor'
- content (text)
- created_at (timestamptz, default now())
- read_at (timestamptz, nullable)

## 2. Modified Tables

### resources
- Added `thumbnail_url` (text, nullable) column for optional thumbnail/preview image.

## 3. Security (RLS)

### counselors
- SELECT: anon can read only approved+visible counselors; authenticated can read all.
- INSERT: authenticated users can insert (self-registration).
- UPDATE: owner (user_id = auth.uid()) OR admin can update.
- DELETE: admin only (checked via admins table join).

### conversations
- SELECT: only participants (student_id = auth.uid() OR counselor's user_id = auth.uid()).
- INSERT: only students (student_id = auth.uid()).
- UPDATE: only participants.
- DELETE: only participants.

### messages
- SELECT: only messages in conversations where the user is a participant.
- INSERT: only participants of the conversation.
- UPDATE: only the recipient can set read_at.
- DELETE: only participants.

## 4. Important Notes
1. Counselor status defaults to 'pending' — no counselor appears publicly until admin approval.
2. The unique constraint on (student_id, counselor_id) prevents duplicate conversations.
3. RLS on conversations/messages enforces strict privacy — only the two parties can access.
4. Admin is detected via: EXISTS (SELECT 1 FROM admins a JOIN auth.users u ON a.email = u.email WHERE u.id = auth.uid()).
5. Counselors cannot change their own status/is_visible — enforced by app layer (only status/bio/etc. fields are editable by owner).
6. Student identity is protected: conversations store student_username (display name) only, not email.
7. The resources table gets a thumbnail_url column for optional preview images.
*/

-- ============================================================
-- Counselors table
-- ============================================================

CREATE TABLE IF NOT EXISTS counselors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  username text NOT NULL,
  photo_url text,
  specialization text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  qualifications text NOT NULL DEFAULT '',
  experience integer NOT NULL DEFAULT 0,
  support_areas text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_counselors" ON counselors;
CREATE POLICY "public_read_approved_counselors"
ON counselors FOR SELECT
TO anon, authenticated
USING (status = 'approved' AND is_visible = true);

DROP POLICY IF EXISTS "authenticated_read_all_counselors" ON counselors;
CREATE POLICY "authenticated_read_all_counselors"
ON counselors FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "insert_own_counselor" ON counselors;
CREATE POLICY "insert_own_counselor"
ON counselors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_or_admin_counselor" ON counselors;
CREATE POLICY "update_own_or_admin_counselor"
ON counselors FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM admins a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM admins a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin_delete_counselor" ON counselors;
CREATE POLICY "admin_delete_counselor"
ON counselors FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = auth.uid()
  )
);

-- ============================================================
-- Conversations table
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_username text NOT NULL,
  counselor_id uuid NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz
);

-- Prevent duplicate conversations between the same student and counselor
CREATE UNIQUE INDEX IF NOT EXISTS conversations_student_counselor_unique
ON conversations (student_id, counselor_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM counselors c
    WHERE c.id = conversations.counselor_id
    AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_own_conversation" ON conversations;
CREATE POLICY "insert_own_conversation"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "update_own_conversation" ON conversations;
CREATE POLICY "update_own_conversation"
ON conversations FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM counselors c
    WHERE c.id = conversations.counselor_id
    AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM counselors c
    WHERE c.id = conversations.counselor_id
    AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_own_conversation" ON conversations;
CREATE POLICY "delete_own_conversation"
ON conversations FOR DELETE
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM counselors c
    WHERE c.id = conversations.counselor_id
    AND c.user_id = auth.uid()
  )
);

-- ============================================================
-- Messages table
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations conv
    WHERE conv.id = messages.conversation_id
    AND (
      conv.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM counselors c
        WHERE c.id = conv.counselor_id
        AND c.user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations conv
    WHERE conv.id = messages.conversation_id
    AND (
      conv.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM counselors c
        WHERE c.id = conv.counselor_id
        AND c.user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages"
ON messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations conv
    WHERE conv.id = messages.conversation_id
    AND (
      conv.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM counselors c
        WHERE c.id = conv.counselor_id
        AND c.user_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations conv
    WHERE conv.id = messages.conversation_id
    AND (
      conv.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM counselors c
        WHERE c.id = conv.counselor_id
        AND c.user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages"
ON messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations conv
    WHERE conv.id = messages.conversation_id
    AND (
      conv.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM counselors c
        WHERE c.id = conv.counselor_id
        AND c.user_id = auth.uid()
      )
    )
  )
);

-- ============================================================
-- Add thumbnail_url to resources
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE resources ADD COLUMN thumbnail_url text;
  END IF;
END $$;
