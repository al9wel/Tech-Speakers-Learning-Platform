-- Create an admins table to persist admin role assignments in the database.
-- This replaces the previous hardcoded email check in frontend code.
CREATE TABLE IF NOT EXISTS admins (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins table is readable by authenticated users so the frontend can check role.
-- Only service role can insert/delete (done via migrations or admin SQL).
CREATE POLICY "select_admins_authenticated" ON admins
  FOR SELECT TO authenticated USING (true);

-- Insert the specified admin account
INSERT INTO admins (email) VALUES ('oa521310@gmail.com')
  ON CONFLICT (email) DO NOTHING;
