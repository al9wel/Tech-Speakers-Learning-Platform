-- Profiles table for all users (username, display name)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique username constraint (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles (lower(username));

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (username + display name are public)
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

-- Users can insert their own profile
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Add username column to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS username text DEFAULT '';

-- Add username column to questions table (student_username)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS student_username text DEFAULT '';

-- Backfill: create profiles for existing auth.users who don't have one
INSERT INTO profiles (id, username, display_name, role)
SELECT
  u.id,
  'user_' || substring(u.id::text, 1, 8),
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

-- Backfill counselor usernames into profiles
UPDATE profiles p
SET username = c.username
FROM counselors c
WHERE c.user_id = p.id AND c.username IS NOT NULL AND c.username != '';

-- Backfill teacher usernames (use display_name-based slug)
UPDATE profiles p
SET username = lower(regexp_replace(p.display_name, '[^a-zA-Z0-9]', '', 'g')) || '_' || substring(p.id::text, 1, 4)
WHERE p.id IN (SELECT user_id FROM teachers WHERE user_id IS NOT NULL)
  AND p.username LIKE 'user_%';

-- Backfill questions.student_username from profiles
UPDATE questions q
SET student_username = p.username
FROM profiles p
WHERE q.student_id = p.id AND q.student_username = '';

-- Add trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        role = EXCLUDED.role,
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();
