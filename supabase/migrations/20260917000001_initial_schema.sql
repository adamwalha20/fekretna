-- Fekretna MVP Database Schema
-- Initial Migration: Tables, Indexes, Triggers, and Row-Level Security (RLS) Policies

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES ENUM & TABLE
CREATE TYPE user_role_type AS ENUM ('user', 'moderator', 'admin');

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    city TEXT DEFAULT 'Sfax',
    university TEXT,
    experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Experienced')),
    collaboration_goals TEXT[],
    availability TEXT CHECK (availability IN ('Few hours per week', 'Weekends', 'Part-time', 'Flexible', 'Full-time')),
    collaboration_format TEXT CHECK (collaboration_format IN ('In person', 'Remote', 'Hybrid')),
    discoverable BOOLEAN NOT NULL DEFAULT TRUE,
    profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections_only', 'private')),
    is_interested_in_business TEXT DEFAULT 'Yes',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SKILLS & INTERESTS MASTER TABLES
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Technology', 'Business', 'Creative', 'Other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_skills (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.profile_interests (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, interest_id)
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    solution_description TEXT,
    category TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('Idea', 'Validation', 'Prototype', 'MVP', 'Early launch', 'Growing')),
    city TEXT NOT NULL DEFAULT 'Sfax',
    collaboration_format TEXT NOT NULL CHECK (collaboration_format IN ('In person', 'Remote', 'Hybrid')),
    commitment_expectation TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_skills (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.project_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    description TEXT,
    filled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Member',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- 6. CONNECTION REQUESTS
CREATE TABLE IF NOT EXISTS public.connection_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sender_not_receiver CHECK (sender_id <> receiver_id)
);

-- Partial index to prevent duplicate pending connection requests between same users
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_connection
ON public.connection_requests (sender_id, receiver_id)
WHERE status = 'pending';

-- 7. CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 8. PROJECT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.project_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    availability_note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, applicant_id)
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    related_entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SAVED PROJECTS & BLOCKS & REPORTS
CREATE TABLE IF NOT EXISTS public.saved_projects (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT blocker_not_blocked CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reported_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('Spam', 'Harassment', 'Fake identity', 'Inappropriate content', 'Fraud or suspicious activity', 'Other')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON public.profiles(discoverable);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_city ON public.projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read_at);

-- 12. HELPER FUNCTIONS & TRIGGERS

-- Function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users have blocked each other
CREATE OR REPLACE FUNCTION public.is_blocked_between(u1 UUID, u2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blocks
        WHERE (blocker_id = u1 AND blocked_id = u2)
           OR (blocker_id = u2 AND blocked_id = u1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone when discoverable"
ON public.profiles FOR SELECT
USING (
    (discoverable = TRUE OR auth.uid() = id)
    AND NOT public.is_blocked_between(auth.uid(), id)
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Skills & Interests (Read only for public, insert for admin)
CREATE POLICY "Skills readable by everyone" ON public.skills FOR SELECT USING (TRUE);
CREATE POLICY "Interests readable by everyone" ON public.interests FOR SELECT USING (TRUE);

-- Profile Skills & Interests
CREATE POLICY "Profile skills viewable with profile" ON public.profile_skills FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own profile skills" ON public.profile_skills FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Profile interests viewable with profile" ON public.profile_interests FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own profile interests" ON public.profile_interests FOR ALL USING (auth.uid() = profile_id);

-- Projects Policies
CREATE POLICY "Public projects are viewable by everyone"
ON public.projects FOR SELECT
USING (
    (visibility = 'public' AND status <> 'archived')
    OR auth.uid() = owner_id
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can create projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY "Owners can delete own projects"
ON public.projects FOR DELETE
USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY "Project skills and roles readable with project" ON public.project_skills FOR SELECT USING (TRUE);
CREATE POLICY "Project owners manage project skills" ON public.project_skills FOR ALL
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()));

CREATE POLICY "Project roles viewable by everyone" ON public.project_roles FOR SELECT USING (TRUE);
CREATE POLICY "Project owners manage project roles" ON public.project_roles FOR ALL
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()));

CREATE POLICY "Project members viewable by members and public" ON public.project_members FOR SELECT USING (TRUE);
CREATE POLICY "Project owners manage members" ON public.project_members FOR ALL
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()));

-- Connection Requests Policies
CREATE POLICY "Users view own connection requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send connection requests if not blocked"
ON public.connection_requests FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND NOT public.is_blocked_between(sender_id, receiver_id)
);

CREATE POLICY "Users can update their connection requests"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Conversations Policies
CREATE POLICY "Members view conversations"
ON public.conversations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
));

CREATE POLICY "Members view conversation members"
ON public.conversation_members FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.conversation_members AS cm
    WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
));

CREATE POLICY "Members view messages"
ON public.messages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Members send messages if not blocked"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

-- Project Applications Policies
CREATE POLICY "Applicants and owners view applications"
ON public.project_applications FOR SELECT
USING (
    auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
);

CREATE POLICY "Applicants can apply"
ON public.project_applications FOR INSERT
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants or owners can update applications"
ON public.project_applications FOR UPDATE
USING (
    auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
);

-- Notifications Policies
CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Saved Projects Policies
CREATE POLICY "Users manage saved projects"
ON public.saved_projects FOR ALL
USING (auth.uid() = user_id);

-- Blocks Policies
CREATE POLICY "Users manage their blocks"
ON public.blocks FOR ALL
USING (auth.uid() = blocker_id);

-- Reports Policies
CREATE POLICY "Users can insert reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users view own reports or admin views all"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins update reports"
ON public.reports FOR UPDATE
USING (public.is_admin(auth.uid()));

-- User Roles Policies
CREATE POLICY "Admins or user can read their role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 14. SEED INITIAL SKILLS AND INTERESTS
INSERT INTO public.skills (name, category) VALUES
    ('Web development', 'Technology'),
    ('Mobile development', 'Technology'),
    ('Backend development', 'Technology'),
    ('Python', 'Technology'),
    ('AI and machine learning', 'Technology'),
    ('Data science', 'Technology'),
    ('Automation', 'Technology'),
    ('Cybersecurity', 'Technology'),
    ('Business development', 'Business'),
    ('Entrepreneurship', 'Business'),
    ('Sales', 'Business'),
    ('Marketing', 'Business'),
    ('Finance', 'Business'),
    ('Business strategy', 'Business'),
    ('UI/UX design', 'Creative'),
    ('Graphic design', 'Creative'),
    ('Video editing', 'Creative'),
    ('Content creation', 'Creative'),
    ('Branding', 'Creative'),
    ('Product management', 'Other'),
    ('Operations', 'Other'),
    ('Research', 'Other'),
    ('Public speaking', 'Other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.interests (name, category) VALUES
    ('AI & Machine Learning', 'Tech'),
    ('SaaS', 'Tech'),
    ('E-commerce', 'Commerce'),
    ('FinTech', 'Finance'),
    ('EdTech', 'Education'),
    ('GreenTech & Sustainability', 'Impact'),
    ('Robotics & IoT', 'Hardware'),
    ('Gaming', 'Entertainment'),
    ('Digital services', 'Services'),
    ('Local businesses (Sfax & Tunisia)', 'Local Economy'),
    ('Social impact', 'Social')
ON CONFLICT (name) DO NOTHING;
