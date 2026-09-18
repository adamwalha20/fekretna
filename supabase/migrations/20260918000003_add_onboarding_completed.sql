-- Migration: Add onboarding_completed column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark existing configured profiles as completed
UPDATE public.profiles SET onboarding_completed = TRUE WHERE experience_level IS NOT NULL;
