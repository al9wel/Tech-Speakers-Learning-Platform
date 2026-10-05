/*
# Add moderators table and tighten sensitive RLS

## 1. New Tables
- `moderators`
  - `email` (text, primary key) — the moderator's auth email (lowercase)
  - `created_at` (timestamptz, default now())
  - `created_by` (text, nullable) — the admin email who created this moderator

## 2. Security Changes
- Enable RLS on `moderators`.
- SELECT policy: only `authenticated` users can read (needed for role resolution at login).
- INSERT/UPDATE/DELETE: denied by default (no policies). Only the `create-moderator` edge function
  running with the service-role key can insert into this table — the anon-key frontend cannot.
- Tighten `admins` table: remove the overly-permissive INSERT/UPDATE/DELETE grants from anon
  and authenticated roles. Only SELECT remains for authenticated users (needed for role resolution).
  Admin operations go through the service-role edge function or the existing admin session.

## 3. Important Notes
- The moderators table is intentionally INSERT-locked at the RLS level so that even an
  authenticated user cannot create a moderator account by calling the Supabase REST API
  directly. Moderator creation is only possible through the `create-moderator` edge function,
  which runs with the service-role key and verifies the caller is an admin.
- The admins table follows the same pattern — only the edge function (service role) can
  add new admins.
*/

CREATE TABLE IF NOT EXISTS moderators (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);

ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_moderators_authenticated" ON moderators;
CREATE POLICY "select_moderators_authenticated"
ON moderators FOR SELECT
TO authenticated
USING (true);

-- Remove overly-permissive write grants from admins table
-- Only the service-role (edge functions) should write to admins
REVOKE INSERT, UPDATE, DELETE ON admins FROM anon, authenticated;

-- Same for moderators: no write grants to anon/authenticated
-- (SELECT is allowed via the RLS policy above, but we still grant SELECT at table level)
GRANT SELECT ON moderators TO anon, authenticated;
