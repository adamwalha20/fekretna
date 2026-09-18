-- Migration: Security, Database, and RLS Hardening for Fekretna MVP
-- Generated on 2026-09-18

-- 1. FOREIGN KEYS TO public.profiles FOR POSTGREST EMBEDDING JOINS
ALTER TABLE public.projects
    DROP CONSTRAINT IF EXISTS projects_owner_id_fkey,
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.connection_requests
    DROP CONSTRAINT IF EXISTS connection_requests_sender_id_fkey,
    ADD CONSTRAINT connection_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    DROP CONSTRAINT IF EXISTS connection_requests_receiver_id_fkey,
    ADD CONSTRAINT connection_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_members
    DROP CONSTRAINT IF EXISTS conversation_members_user_id_fkey,
    ADD CONSTRAINT conversation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
    DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.project_applications
    DROP CONSTRAINT IF EXISTS project_applications_applicant_id_fkey,
    ADD CONSTRAINT project_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reports
    DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey,
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    DROP CONSTRAINT IF EXISTS reports_reported_user_id_fkey,
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
    DROP CONSTRAINT IF EXISTS reports_reviewed_by_fkey,
    ADD CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.blocks
    DROP CONSTRAINT IF EXISTS blocks_blocker_id_fkey,
    ADD CONSTRAINT blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    DROP CONSTRAINT IF EXISTS blocks_blocked_id_fkey,
    ADD CONSTRAINT blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. HARDEN RLS POLICIES FOR CONNECTION REQUESTS
DROP POLICY IF EXISTS "Users can update their connection requests" ON public.connection_requests;

-- Sender can only cancel a pending request
CREATE POLICY "Sender can cancel connection request"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = sender_id AND status = 'pending')
WITH CHECK (auth.uid() = sender_id AND status = 'cancelled');

-- Receiver can accept or reject a pending request
CREATE POLICY "Receiver can respond to connection request"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = receiver_id AND status = 'pending')
WITH CHECK (auth.uid() = receiver_id AND status IN ('accepted', 'rejected'));

-- 3. HARDEN RLS POLICIES FOR PROJECT APPLICATIONS
DROP POLICY IF EXISTS "Applicants or owners can update applications" ON public.project_applications;

-- Applicant can only withdraw their application
CREATE POLICY "Applicant can withdraw application"
ON public.project_applications FOR UPDATE
USING (auth.uid() = applicant_id AND status = 'pending')
WITH CHECK (auth.uid() = applicant_id AND status = 'withdrawn');

-- Project owner can accept or reject application
CREATE POLICY "Owner can accept or reject application"
ON public.project_applications FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) AND status IN ('accepted', 'rejected'));

-- 4. INSERT POLICIES FOR CONVERSATIONS, CONVERSATION MEMBERS & NOTIFICATIONS
DROP POLICY IF EXISTS "Authenticated users create conversations" ON public.conversations;
CREATE POLICY "Authenticated users create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can add conversation members" ON public.conversation_members;
CREATE POLICY "Users can add conversation members"
ON public.conversation_members FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT public.is_blocked_between(auth.uid(), user_id)
);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT public.is_blocked_between(auth.uid(), user_id)
);

-- 5. PROFILE PRIVACY POLICY HARDENING
DROP POLICY IF EXISTS "Public profiles are viewable by everyone when discoverable" ON public.profiles;
CREATE POLICY "Profiles viewable according to privacy and blocks"
ON public.profiles FOR SELECT
USING (
    (
        auth.uid() = id
        OR (
            profile_visibility = 'public'
            AND discoverable = TRUE
        )
        OR (
            profile_visibility = 'connections_only'
            AND EXISTS (
                SELECT 1 FROM public.connection_requests
                WHERE status = 'accepted'
                AND ((sender_id = auth.uid() AND receiver_id = id) OR (sender_id = id AND receiver_id = auth.uid()))
            )
        )
        OR public.is_admin(auth.uid())
    )
    AND NOT public.is_blocked_between(auth.uid(), id)
);

-- 6. FUNCTION SECURITY DEFINER & SEARCH_PATH HARDENING
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_blocked_between(u1 UUID, u2 UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF u1 IS NULL OR u2 IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.blocks
        WHERE (blocker_id = u1 AND blocked_id = u2)
           OR (blocker_id = u2 AND blocked_id = u1)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), ' ', '_'))
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Revoke execute permissions on internal trigger function from public, anon, and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Revoke execute on is_admin and is_blocked_between from anon and authenticated (used internally in RLS)
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_blocked_between(UUID, UUID) FROM PUBLIC, anon, authenticated;

-- 7. ENABLE REALTIME BROADCAST FOR MESSAGES AND NOTIFICATIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
