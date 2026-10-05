-- Create storage bucket for file uploads (contributions and resources)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "allow_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');

-- Allow anyone to read files (public bucket for approved resources)
CREATE POLICY "allow_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'files');

-- Allow authenticated users to delete files
CREATE POLICY "allow_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'files');
