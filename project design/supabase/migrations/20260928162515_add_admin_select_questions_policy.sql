/*
# Add admin SELECT policy on questions table

The existing questions RLS policies allow:
- Students to SELECT their own private questions
- Teachers to SELECT questions assigned to them
- Public Q&A to be SELECTed by anyone

But admins have no SELECT access to private questions for moderation.
This adds an admin SELECT policy using the existing is_current_user_admin()
SECURITY DEFINER function.
*/

CREATE POLICY "admin_select_questions" ON questions FOR SELECT
  TO authenticated
  USING (
    is_current_user_admin()
  );