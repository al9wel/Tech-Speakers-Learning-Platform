/*
# Fix resource DELETE/UPDATE RLS policy for admin accounts

## Problem
The DELETE and UPDATE policies on `resources` (added in migration
20260916162100_add_source_column_to_resources.sql) check admin status by
joining `admins` to `auth.users`:

    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.email = u.email
      WHERE u.id = auth.uid()
    )

The `authenticated` role does NOT have SELECT privilege on `auth.users`,
so this subquery errors at evaluation time. The RLS engine treats the
error as a policy failure, so every admin attempt to DELETE or UPDATE a
resource is rejected — the admin sees "حدث خطأ أثناء الحذف."

## Fix
1. Create a SECURITY DEFINER function `is_current_user_admin()` that
   reads the caller's email from `auth.jwt()->>'email'` (available in the
   JWT without needing table access) and checks it against the `admins`
   table. The function runs as its owner, bypassing RLS, and avoids the
   `auth.users` join entirely.
2. Replace the DELETE policy on `resources` to use `is_current_user_admin()`
   for the admin path (teacher-ownership path unchanged).
3. Replace the UPDATE policy on `resources` to use `is_current_user_admin()`
   for the admin path (teacher-ownership path unchanged).
4. Revoke EXECUTE on the function from `anon` so anonymous callers cannot
   probe admin status; grant to `authenticated`.

## Security
- The function derives the caller identity from `auth.uid()` / `auth.jwt()`
  (session, not a client-supplied parameter).
- `SET search_path = public` prevents search-path shadowing.
- Only `authenticated` can call the function.
- The existing teacher-ownership checks are preserved unchanged.
- RLS remains enabled; no table is made public; no policies use `USING (true)`.
*/

-- ============================================================
-- 1. Helper function: is_current_user_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE email = (auth.jwt() ->> 'email')
  )
$$;

REVOKE EXECUTE ON FUNCTION is_current_user_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- ============================================================
-- 2. Replace DELETE policy on resources
-- ============================================================
DROP POLICY IF EXISTS "anon_delete_resources" ON resources;

CREATE POLICY "anon_delete_resources" ON resources FOR DELETE
  TO authenticated
  USING (
    -- Teacher can delete their own resources
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    -- Admin can delete any resource
    is_current_user_admin()
  );

-- ============================================================
-- 3. Replace UPDATE policy on resources
-- ============================================================
DROP POLICY IF EXISTS "anon_update_resources" ON resources;

CREATE POLICY "anon_update_resources" ON resources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    is_current_user_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = resources.teacher_id
      AND t.user_id = auth.uid()
    )
    OR
    is_current_user_admin()
  );