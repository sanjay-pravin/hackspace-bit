-- ====================================================================
-- AI CAMPUS EVENT ASSISTANT — SUPABASE POSTGRESQL SCHEMA
-- Vision Builders | HACKSPACE Hackathon
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  department TEXT,
  academic_year TEXT,
  student_id TEXT,
  avatar_url TEXT,
  interests TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  poster_url TEXT,
  organizer_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_format TEXT NOT NULL DEFAULT 'in-person' CHECK (event_format IN ('in-person', 'virtual', 'hybrid')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  registered_count INT NOT NULL DEFAULT 0 CHECK (registered_count >= 0),
  minimum_team_size INT NOT NULL DEFAULT 1 CHECK (minimum_team_size >= 1),
  maximum_team_size INT NOT NULL DEFAULT 1 CHECK (maximum_team_size >= minimum_team_size),
  eligibility_rules TEXT,
  event_rules TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_code TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_status TEXT NOT NULL DEFAULT 'pending' CHECK (membership_status IN ('pending', 'accepted', 'declined')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_registration_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  registration_type TEXT NOT NULL DEFAULT 'individual' CHECK (registration_type IN ('individual', 'team')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  qr_payload TEXT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

-- ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_method TEXT NOT NULL DEFAULT 'qr_scanner' CHECK (verification_method IN ('qr_scanner', 'manual_code'))
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'general',
  related_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_public_id ON public.registrations(public_registration_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Events viewable by public"
  ON public.events FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage events"
  ON public.events FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Registrations viewable by owners and admins"
  ON public.registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students insert registrations"
  ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students cancel registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage attendance"
  ON public.attendance FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Users manage notifications"
  ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());