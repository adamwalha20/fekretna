-- Migration: Project Reels & Idea Discovery (Likes, Comments, Advice)

CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_likes_project ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user ON public.project_likes(user_id);

ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project likes"
  ON public.project_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like projects"
  ON public.project_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.project_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created ON public.project_comments(created_at DESC);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project comments"
  ON public.project_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment on projects"
  ON public.project_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.project_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.project_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_advice_project ON public.project_advice(project_id);

ALTER TABLE public.project_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners and authors can view advice"
  ON public.project_advice FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_advice.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can give advice"
  ON public.project_advice FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);
