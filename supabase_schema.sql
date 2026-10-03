-- ==============================================================================
-- SKEMA DATABASE SUPABASE UNTUK MATEMATIKA SIGMA (MA DARUNNAJAH 9)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Tabel Profil Pengguna (Siswa & Guru)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  class_name TEXT DEFAULT 'Kelas 11',
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Lencana / Badges Siswa
CREATE TABLE IF NOT EXISTS public.user_badges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Progres Modul & Nilai Kuis Siswa
CREATE TABLE IF NOT EXISTS public.user_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  slide_idx INTEGER DEFAULT 0,
  total_slides INTEGER DEFAULT 1,
  percent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER,
  last_studied_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_module_unique UNIQUE (user_id, module_id)
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: profiles
CREATE POLICY "Semua pengguna terotentikasi dapat melihat profil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pengguna dapat mengedit profil miliknya sendiri"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat menyisipkan profil miliknya sendiri"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Kebijakan RLS: user_badges
CREATE POLICY "Semua pengguna dapat melihat lencana"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pengguna dapat menambahkan lencana miliknya sendiri"
  ON public.user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Kebijakan RLS: user_progress
CREATE POLICY "Pengguna dan Guru dapat melihat progres"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Pengguna dapat mengupdate atau memasukkan progres miliknya"
  ON public.user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger Otomatis: Saat pengguna mendaftar melalui Supabase Auth, otomatis buat row di public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, class_name, avatar_url, xp, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'class_name', 'Kelas 11'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    0,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Tabel Modul & Materi Pembelajaran PDF (Cloud Storage)
CREATE TABLE IF NOT EXISTS public.module_materials (
  module_id TEXT PRIMARY KEY,
  district_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 25,
  page_count INTEGER DEFAULT 14,
  pdf_file_name TEXT,
  pdf_url TEXT,
  is_custom_pdf BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.module_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua pengguna dapat melihat data materi modul"
  ON public.module_materials FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Pengguna terotentikasi dapat menyimpan atau memperbarui materi modul"
  ON public.module_materials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed Modul Bab 5 Data & Peluang ke database Supabase
INSERT INTO public.module_materials (module_id, district_id, title, description, duration_minutes, page_count, pdf_file_name, pdf_url, is_custom_pdf)
VALUES (
  'mod-stat-1',
  5,
  'BAB 5: DATA DAN PELUANG (Statistika & Peluang)',
  'Menampilkan 14 slide resmi Bab 5 Data dan Peluang: penyajian data grafik/tabel, ukuran pemusatan (mean, median, modus), kuartil/desil/persentil, ukuran penyebaran, kaidah pencacahan, faktorial/permutasi/kombinasi, peluang bersyarat, dan frekuensi harapan.',
  25,
  14,
  'BAB_5_DATA_DAN_PELUANG.pdf',
  '/modul_peluang.html',
  TRUE
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  page_count = EXCLUDED.page_count,
  pdf_file_name = EXCLUDED.pdf_file_name,
  pdf_url = EXCLUDED.pdf_url,
  is_custom_pdf = EXCLUDED.is_custom_pdf,
  updated_at = NOW();

