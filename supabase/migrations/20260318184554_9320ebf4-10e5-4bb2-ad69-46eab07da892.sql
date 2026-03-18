
-- Add pt_explanation column
ALTER TABLE public.camera_references ADD COLUMN IF NOT EXISTS pt_explanation text;

-- Create reference-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('reference-images', 'reference-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for reference-images
CREATE POLICY "Anyone can view reference images" ON storage.objects FOR SELECT USING (bucket_id = 'reference-images');
CREATE POLICY "Admins can upload reference images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL AND is_admin_or_moderator(auth.uid()));
CREATE POLICY "Admins can delete reference images" ON storage.objects FOR DELETE USING (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL AND is_admin_or_moderator(auth.uid()));
CREATE POLICY "Admins can update reference images" ON storage.objects FOR UPDATE USING (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL AND is_admin_or_moderator(auth.uid()));

-- Add delete policy for camera_references (admin only, already covered by ALL policy but explicit)
