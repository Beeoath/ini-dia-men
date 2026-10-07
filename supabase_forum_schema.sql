-- =========================================================================
-- SIGMA FORUM MIGRATION: THREADS, REPLIES, THREAD_LIKES & STATS VIEW
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Helper function is_teacher()
create or replace function public.is_teacher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

-- 2. Table: threads
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null check (char_length(title) between 5 and 150),
  content text not null check (char_length(content) between 1 and 5000),
  is_pinned boolean not null default false,
  is_answered boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Table: replies
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Table: thread_likes
create table if not exists public.thread_likes (
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (thread_id, user_id)
);

-- Indexes
create index if not exists idx_threads_created_at on public.threads(created_at desc);
create index if not exists idx_threads_category on public.threads(category);
create index if not exists idx_threads_author on public.threads(author_id);
create index if not exists idx_replies_thread_created on public.replies(thread_id, created_at);
create index if not exists idx_replies_author on public.replies(author_id);
create index if not exists idx_thread_likes_user on public.thread_likes(user_id);

-- 5. View: threads_with_stats
create or replace view public.threads_with_stats as
select
  t.id,
  t.author_id,
  p.full_name as author_name,
  p.class_name as author_class,
  p.avatar_url as author_avatar,
  p.role as author_role,
  t.category,
  t.title,
  t.content,
  t.is_pinned,
  t.is_answered,
  t.created_at,
  coalesce(r.replies_count, 0)::int as replies_count,
  coalesce(l.likes_count, 0)::int as likes_count
from public.threads t
left join public.profiles p on t.author_id = p.id
left join (
  select thread_id, count(*)::int as replies_count
  from public.replies
  group by thread_id
) r on t.id = r.thread_id
left join (
  select thread_id, count(*)::int as likes_count
  from public.thread_likes
  group by thread_id
) l on t.id = l.thread_id;

-- 6. Trigger to prevent normal authors from modifying is_pinned, is_answered, or is_verified
create or replace function public.check_thread_update_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Jika guru, izinkan perubahan apapun
  if public.is_teacher() then
    return new;
  end if;

  -- Jika siswa/bukan guru, dilarang ubah is_pinned atau is_answered
  if (new.is_pinned is distinct from old.is_pinned) or (new.is_answered is distinct from old.is_answered) then
    raise exception 'Hanya guru yang berhak mengubah status pin atau status terjawab pada thread';
  end if;

  -- Pastikan author_id tidak dapat dipalsukan/diubah
  if new.author_id is distinct from old.author_id then
    raise exception 'Author ID tidak dapat diubah';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_threads_update_privileges on public.threads;
create trigger trg_threads_update_privileges
before update on public.threads
for each row
execute function public.check_thread_update_privileges();

create or replace function public.check_reply_update_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_teacher() then
    return new;
  end if;

  if new.is_verified is distinct from old.is_verified then
    raise exception 'Hanya guru yang berhak memverifikasi solusi balasan';
  end if;

  if new.author_id is distinct from old.author_id or new.thread_id is distinct from old.thread_id then
    raise exception 'Author ID dan Thread ID tidak dapat diubah';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_replies_update_privileges on public.replies;
create trigger trg_replies_update_privileges
before update on public.replies
for each row
execute function public.check_reply_update_privileges();

-- 7. Enable RLS
alter table public.threads enable row level security;
alter table public.replies enable row level security;
alter table public.thread_likes enable row level security;

-- THREADS RLS
drop policy if exists "threads_select_policy" on public.threads;
create policy "threads_select_policy" on public.threads
  for select to authenticated
  using (true);

drop policy if exists "threads_insert_policy" on public.threads;
create policy "threads_insert_policy" on public.threads
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "threads_update_policy" on public.threads;
create policy "threads_update_policy" on public.threads
  for update to authenticated
  using (author_id = auth.uid() or public.is_teacher())
  with check (author_id = auth.uid() or public.is_teacher());

drop policy if exists "threads_delete_policy" on public.threads;
create policy "threads_delete_policy" on public.threads
  for delete to authenticated
  using (author_id = auth.uid() or public.is_teacher());

-- REPLIES RLS
drop policy if exists "replies_select_policy" on public.replies;
create policy "replies_select_policy" on public.replies
  for select to authenticated
  using (true);

drop policy if exists "replies_insert_policy" on public.replies;
create policy "replies_insert_policy" on public.replies
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "replies_update_policy" on public.replies;
create policy "replies_update_policy" on public.replies
  for update to authenticated
  using (author_id = auth.uid() or public.is_teacher())
  with check (author_id = auth.uid() or public.is_teacher());

drop policy if exists "replies_delete_policy" on public.replies;
create policy "replies_delete_policy" on public.replies
  for delete to authenticated
  using (author_id = auth.uid() or public.is_teacher());

-- THREAD_LIKES RLS
drop policy if exists "thread_likes_select_policy" on public.thread_likes;
create policy "thread_likes_select_policy" on public.thread_likes
  for select to authenticated
  using (true);

drop policy if exists "thread_likes_insert_policy" on public.thread_likes;
create policy "thread_likes_insert_policy" on public.thread_likes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "thread_likes_delete_policy" on public.thread_likes;
create policy "thread_likes_delete_policy" on public.thread_likes
  for delete to authenticated
  using (user_id = auth.uid());

-- 8. Enable Realtime on threads and replies
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'threads'
  ) then
    alter publication supabase_realtime add table public.threads;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'replies'
  ) then
    alter publication supabase_realtime add table public.replies;
  end if;
exception
  when others then null;
end $$;
