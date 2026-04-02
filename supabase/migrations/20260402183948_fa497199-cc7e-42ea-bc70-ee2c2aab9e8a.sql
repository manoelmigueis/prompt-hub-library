ALTER TABLE public.prompts ADD COLUMN tags text[] DEFAULT '{}';

-- Create GIN index for efficient tag searches
CREATE INDEX idx_prompts_tags ON public.prompts USING GIN(tags);