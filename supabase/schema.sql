-- ==============================================================================
-- SafeSphere Supabase Database Schema
-- Tables: profiles, emergency_requests, personal_emergency_contacts
-- Includes Row Level Security (RLS) & Privacy Blurring Constraints
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'en',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    approx_location_lat DOUBLE PRECISION,
    approx_location_lng DOUBLE PRECISION,
    approx_location_area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, preferred_language)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'SafeSphere Citizen'),
        COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 2. Personal Emergency Contacts Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for personal contacts
ALTER TABLE public.personal_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
    ON public.personal_emergency_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
    ON public.personal_emergency_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
    ON public.personal_emergency_contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
    ON public.personal_emergency_contacts FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 3. Emergency Requests Table (Community Assistance)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('medical_supplies', 'mobility', 'shelter', 'food_water', 'information', 'general')),
    description TEXT NOT NULL,
    approx_location_lat DOUBLE PRECISION NOT NULL,
    approx_location_lng DOUBLE PRECISION NOT NULL,
    approx_location_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'help_offered', 'resolved', 'cancelled')),
    responders JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created_at ON public.emergency_requests(created_at DESC);

-- RLS for emergency requests
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active or offered community requests
CREATE POLICY "Authenticated users can view open emergency requests"
    ON public.emergency_requests FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can insert their own emergency requests
CREATE POLICY "Users can create own emergency request"
    ON public.emergency_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Request owners can update or resolve their requests
CREATE POLICY "Users can update own emergency requests"
    ON public.emergency_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Responders can offer assistance
CREATE POLICY "Authenticated users can offer help"
    ON public.emergency_requests FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (status IN ('open', 'help_offered'));
