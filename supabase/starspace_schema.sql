-- ==============================================================================
-- STARSPACE ✧ DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Your little universe of productivity."
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY DEFAULT ('sub-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT NOT NULL DEFAULT '#DCCAFF',
  icon TEXT NOT NULL DEFAULT '📖',
  weekly_goal_hours NUMERIC NOT NULL DEFAULT 5,
  overall_target_hours NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id TEXT PRIMARY KEY DEFAULT ('sess-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  type TEXT NOT NULL CHECK (type IN ('timer', 'manual')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT ('task-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  is_recurring TEXT DEFAULT 'none' CHECK (is_recurring IN ('none', 'daily', 'weekly')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY DEFAULT ('evt-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  type TEXT NOT NULL DEFAULT 'study' CHECK (type IN ('study', 'exam', 'assignment', 'event')),
  color TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. RESOURCE FOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.resource_folders (
  id TEXT PRIMARY KEY DEFAULT ('fld-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. RESOURCES TABLE (Documents, PDFs, PPTX, DOCX, Images, Notes, Links)
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY DEFAULT ('res-' || uuid_generate_v4()::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  folder_id TEXT REFERENCES public.resource_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'pptx', 'docx', 'image', 'link', 'note')),
  size_bytes BIGINT,
  storage_path TEXT,
  external_url TEXT,
  note_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT '',
  daily_goal_hours NUMERIC DEFAULT 0,
  weekly_goal_hours NUMERIC DEFAULT 0,
  pomodoro_focus_minutes INTEGER DEFAULT 25,
  pomodoro_short_break_minutes INTEGER DEFAULT 5,
  pomodoro_long_break_minutes INTEGER DEFAULT 15,
  pomodoro_long_break_interval INTEGER DEFAULT 4,
  sound_enabled BOOLEAN DEFAULT true,
  motivational_quotes_enabled BOOLEAN DEFAULT true,
  ambient_stars_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  max_progress NUMERIC NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- 10. INDEXES FOR HIGH-SPEED QUERYING
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.study_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON public.study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_deadline ON public.tasks(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can ONLY view and mutate their own data
-- ==============================================================================

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Subjects RLS
CREATE POLICY "Users can manage their own subjects" 
ON public.subjects FOR ALL USING (auth.uid() = user_id);

-- Study Sessions RLS
CREATE POLICY "Users can manage their own study sessions" 
ON public.study_sessions FOR ALL USING (auth.uid() = user_id);

-- Tasks RLS
CREATE POLICY "Users can manage their own tasks" 
ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Calendar Events RLS
CREATE POLICY "Users can manage their own calendar events" 
ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- Resource Folders RLS
CREATE POLICY "Users can manage their own folders" 
ON public.resource_folders FOR ALL USING (auth.uid() = user_id);

-- Resources RLS
CREATE POLICY "Users can manage their own resources" 
ON public.resources FOR ALL USING (auth.uid() = user_id);

-- User Settings RLS
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Achievements RLS
CREATE POLICY "Users can manage their own achievements" 
ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKETS (Optional Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('starspace-resources', 'starspace-resources', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own resources" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'starspace-resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view resources" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'starspace-resources');
