DROP POLICY IF EXISTS "Users can create prompts" ON public.prompts;

CREATE POLICY "Only admins can create prompts"
ON public.prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_admin_or_moderator(auth.uid()));