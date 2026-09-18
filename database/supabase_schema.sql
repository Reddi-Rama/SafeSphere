-- ==============================================================================
-- SafeSphere Supabase Database Schema
-- Tables: profiles, personal_emergency_contacts, emergency_requests, assessments, surveys
-- Security: Row Level Security (RLS) policies enabled across all tables
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Private User Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT 'SafeSphere Citizen',
    phone_number TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    approx_location_lat DOUBLE PRECISION,
    approx_location_lng DOUBLE PRECISION,
    approx_location_area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies: Users can ONLY access their own private profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, preferred_language)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 2. Personal Emergency Contacts (Private to Authenticated User)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_personal_contacts_user ON public.personal_emergency_contacts(user_id);

-- Enable RLS
ALTER TABLE public.personal_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Personal Contacts RLS: Strictly private to the owner
CREATE POLICY "Users can view own personal contacts"
    ON public.personal_emergency_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal contacts"
    ON public.personal_emergency_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal contacts"
    ON public.personal_emergency_contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal contacts"
    ON public.personal_emergency_contacts FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 3. Emergency Requests Table (Community Assistance)
-- Categories:
--  - Medical Assistance
--  - Fire/Evacuation Assistance
--  - Stranded / Need Transport
--  - Elderly or Child Assistance
--  - Lost / Disoriented
--  - Flood / Water Emergency
--  - Electricity Hazard
--  - Other
-- Statuses:
--  - active
--  - help_offered
--  - resolved
--  - cancelled
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'Medical Assistance',
        'Fire/Evacuation Assistance',
        'Stranded / Need Transport',
        'Elderly or Child Assistance',
        'Lost / Disoriented',
        'Flood / Water Emergency',
        'Electricity Hazard',
        'Other',
        'medical_supplies',
        'mobility',
        'shelter',
        'food_water',
        'information',
        'general'
    )),
    description TEXT NOT NULL,
    approx_location_lat DOUBLE PRECISION,
    approx_location_lng DOUBLE PRECISION,
    approx_location_area TEXT DEFAULT 'Nearby Community Area',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'help_offered', 'resolved', 'cancelled')),
    responders JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created ON public.emergency_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated community members can view active and help_offered requests (privacy blurred)
CREATE POLICY "Authenticated users can view open emergency requests"
    ON public.emergency_requests FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can create their own emergency request
CREATE POLICY "Users can create own emergency request"
    ON public.emergency_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Creators can update their own emergency request (e.g. resolve, cancel)
CREATE POLICY "Users can update own emergency request"
    ON public.emergency_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Authenticated responders can offer assistance (updates responders array and sets status = help_offered)
CREATE POLICY "Community responders can offer assistance"
    ON public.emergency_requests FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (status IN ('active', 'help_offered'));


-- ------------------------------------------------------------------------------
-- 4. Assessments Table (Safety Readiness)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    score INTEGER NOT NULL,
    rating TEXT NOT NULL,
    household_members INTEGER DEFAULT 1,
    answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
    ON public.assessments FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can submit assessment"
    ON public.assessments FOR INSERT
    WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 5. Surveys Table (Community Preparedness Feedback)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    preparedness_level TEXT,
    primary_concern TEXT,
    feedback TEXT,
    responses JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit survey"
    ON public.surveys FOR INSERT
    WITH CHECK (true);
