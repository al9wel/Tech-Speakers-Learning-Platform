/*
# Add visibility (hide/show) columns to subjects, teachers, resources

## Overview
Adds an `is_hidden` boolean column to subjects, teachers, and resources tables
so the Admin can hide/show items without deleting them. Hidden items are excluded
from public-facing queries but remain in the database.

## Changes
1. subjects: add `is_hidden boolean NOT NULL DEFAULT false`
2. teachers: add `is_hidden boolean NOT NULL DEFAULT false`
3. resources: add `is_hidden boolean NOT NULL DEFAULT false`

## Notes
- Existing rows default to `is_hidden = false` (visible).
- Public queries in the data layer will filter `is_hidden = false`.
- Admin queries can optionally show hidden items.
*/

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_subjects_is_hidden ON subjects(is_hidden);
CREATE INDEX IF NOT EXISTS idx_teachers_is_hidden ON teachers(is_hidden);
CREATE INDEX IF NOT EXISTS idx_resources_is_hidden ON resources(is_hidden);
