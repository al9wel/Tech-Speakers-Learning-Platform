/*
# Fix counselor UPDATE/DELETE RLS policies for admin accounts

## Problem
The UPDATE and DELETE policies on `counselors` (from migration
20260910091229_add_counselors_and_messaging.sql) check admin status by
joining `admins` to `auth.users`:

    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.email = u.email
      WHERE u.id = auth.uid()
    )

The `authenticated` role does NOT have SELECT privilege on `auth.users`,
so this subquery errors at evaluation time. The RLS engine treats the
error as a policy failure, so every admin attempt to UPDATE a counselor's
status (approve/reject/suspend), toggle visibility, edit, or DELETE is
rejected — the admin sees "حدث خطأ أثناء تحديث حالة المستشار".

This is the same root cause that was fixed for the `resources` table in
migration 20260924092057_fix_resources_delete_rls_policy.sql.

## Fix
1. Replace the UPDATE policy on `counselors` to use the existing
   `is_current_user_admin()` SECURITY DEFINER function (created in the
   resources fix migration) for the admin path. The owner-self-update
   path (auth.uid() = user_id) is preserved unchanged.
2. Replace the DELETE policy on `counselors` to use
   `is_current_user_admin()` for the admin path.

## Security
- The function derives the caller identity from `auth.jwt()` (session,
  not a client-supplied parameter).
- `SET search_path = public` prevents search-path shadowing.
- Only `authenticated` can call the function (EXECUTE revoked from anon).
- The existing owner-self-update check is preserved unchanged.
- RLS remains enabled; no table is made public.
- No counselor records are modified or deleted.
*/

-- ============================================================
-- 1. Replace UPDATE policy on counselors
-- ============================================================
DROP POLICY IF EXISTS "update_own_or_admin_counselor" ON counselors;

CREATE POLICY "update_own_or_admin_counselor" ON counselors FOR UPDATE
  TO authenticated
  USING (
    -- Counselor can update their own profile
    auth.uid() = user_id
    OR
    -- Admin can update any counselor
    is_current_user_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    is_current_user_admin()
  );

-- ============================================================
-- 2. Replace DELETE policy on counselors
-- ============================================================
DROP POLICY IF EXISTS "admin_delete_counselor" ON counselors;

CREATE POLICY "admin_delete_counselor" ON counselors FOR DELETE
  TO authenticated
  USING (
    is_current_user_admin()
  );