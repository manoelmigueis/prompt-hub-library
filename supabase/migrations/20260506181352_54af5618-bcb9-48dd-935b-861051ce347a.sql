DROP POLICY IF EXISTS "Only admins can create prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompt content" ON public.prompts;

CREATE POLICY "Only admins and moderators can create prompts"
ON public.prompts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Only admins and moderators can update prompts"
ON public.prompts
FOR UPDATE
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()))
WITH CHECK (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Only admins and moderators can delete prompts"
ON public.prompts
FOR DELETE
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

DROP POLICY IF EXISTS "Users can upload to own folder in prompt-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

CREATE POLICY "Only admins can upload prompt images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.is_admin_or_moderator(auth.uid())
);

CREATE POLICY "Only admins can update prompt images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.is_admin_or_moderator(auth.uid())
)
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.is_admin_or_moderator(auth.uid())
);

CREATE POLICY "Only admins can delete prompt images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.is_admin_or_moderator(auth.uid())
);