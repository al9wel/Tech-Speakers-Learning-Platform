-- Add thumbnail_url column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Add type filter index if not exists
CREATE INDEX IF NOT EXISTS idx_resources_type_subject ON resources(type, subject_id);
