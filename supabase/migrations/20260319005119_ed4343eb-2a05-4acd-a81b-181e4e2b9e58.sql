ALTER TABLE public.profiles ADD COLUMN has_access boolean NOT NULL DEFAULT false;

-- Admins automatically get access
UPDATE public.profiles SET has_access = true WHERE id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');