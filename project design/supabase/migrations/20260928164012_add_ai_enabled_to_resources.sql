/*
# Add AI source approval column to resources

## Purpose
Adds a persistent boolean column `ai_enabled` to the existing `resources` table.
This column controls whether a specific educational resource is approved for use
by the future "مساعد مِداد" AI assistant.

## Design Decision
The AI approval state is stored directly on the existing `resources` row — NOT in
a separate table. This avoids duplicating resource records and keeps the approval
state tightly coupled to the resource it controls. The column defaults to `false`,
meaning no resource is available to the AI unless an administrator explicitly
enables it.

## Changes
- New column: `resources.ai_enabled` (boolean, NOT NULL, default false)

## Security
- The existing UPDATE policy on `resources` already restricts writes to resource
  owners (teachers) OR admins (via `is_current_user_admin()`). This means:
  - Admins can toggle `ai_enabled` on any resource.
  - Teachers can technically toggle it on their own resources, but the admin UI
    is the only interface exposed for this control. Students and anon users
    have no UPDATE access on resources at all.
- No new RLS policies are needed — the existing policy covers this column.
- No new tables are created.
*/ 

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS ai_enabled boolean NOT NULL DEFAULT false;