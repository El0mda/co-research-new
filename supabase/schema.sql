-- =====================================================================
-- Co-Research Hub — Supabase schema
-- Paste the entire file into the Supabase SQL Editor and run.
-- Safe to re-run: every CREATE uses IF NOT EXISTS / OR REPLACE.
-- =====================================================================

-- ---------- Enums ----------------------------------------------------
do $$ begin
  create type project_type as enum ('empirical', 'mixed', 'theoretical', 'qualitative');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('idea', 'in-progress', 'final');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('in-progress', 'under-review', 'completed');
exception when duplicate_object then null; end $$;

-- ---------- researchers ---------------------------------------------
-- one row per registered user, linked 1:1 to auth.users
create table if not exists public.researchers (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  name_en       text not null,
  email         text not null unique,
  avatar        text default '',
  degree        text not null,
  degree_en     text not null,
  university    text not null,
  university_en text not null,
  faculty       text not null,
  faculty_en    text not null,
  field         text not null,
  field_en      text not null,
  sub_field     text not null,
  sub_field_en  text not null,
  interests     text[] not null default '{}',
  interests_en  text[] not null default '{}',
  orcid         text,
  scholar       text,
  scopus        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- projects ------------------------------------------------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  title_en       text not null,
  description    text not null,
  description_en text not null,
  field          text not null,
  field_en       text not null,
  sub_field      text not null,
  sub_field_en   text not null,
  interests      text[] not null default '{}',
  interests_en   text[] not null default '{}',
  type           project_type   not null,
  status         project_status not null default 'idea',
  start_date     date not null,
  end_date       date not null,
  max_members    int  not null check (max_members > 0),
  leader_id      uuid not null references public.researchers(id) on delete restrict,
  completion     int  not null default 0 check (completion between 0 and 100),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists projects_leader_idx on public.projects(leader_id);
create index if not exists projects_status_idx on public.projects(status);

-- ---------- project_members (many-to-many) --------------------------
create table if not exists public.project_members (
  project_id    uuid not null references public.projects(id) on delete cascade,
  researcher_id uuid not null references public.researchers(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  primary key (project_id, researcher_id)
);

create index if not exists project_members_researcher_idx
  on public.project_members(researcher_id);

-- ---------- tasks ---------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  title          text not null,
  title_en       text not null,
  description    text not null,
  description_en text not null,
  assignee_id    uuid references public.researchers(id) on delete set null,
  status         task_status not null default 'in-progress',
  due_date       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);

-- ---------- messages ------------------------------------------------
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  sender_id       uuid not null references public.researchers(id) on delete cascade,
  text            text not null,
  text_en         text not null default '',
  attachment_name text,
  attachment_type text,
  created_at      timestamptz not null default now()
);

create index if not exists messages_project_idx on public.messages(project_id, created_at);

-- ---------- updated_at trigger --------------------------------------
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_researchers_updated on public.researchers;
create trigger trg_researchers_updated before update on public.researchers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated on public.tasks;
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------- auto-add leader as member -------------------------------
create or replace function public.add_leader_as_member() returns trigger as $$
begin
  insert into public.project_members (project_id, researcher_id)
  values (new.id, new.leader_id)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_project_leader_member on public.projects;
create trigger trg_project_leader_member after insert on public.projects
  for each row execute function public.add_leader_as_member();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.researchers     enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks           enable row level security;
alter table public.messages        enable row level security;

-- researchers: everyone authenticated can read; user can update own row
drop policy if exists "researchers read all"  on public.researchers;
create policy "researchers read all" on public.researchers
  for select to authenticated using (true);

drop policy if exists "researchers insert self" on public.researchers;
create policy "researchers insert self" on public.researchers
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "researchers update self" on public.researchers;
create policy "researchers update self" on public.researchers
  for update to authenticated using (auth.uid() = id);

-- projects: read all; only authenticated can insert (must be leader); leader/members can update; leader can delete
drop policy if exists "projects read all" on public.projects;
create policy "projects read all" on public.projects
  for select to authenticated using (true);

drop policy if exists "projects insert as leader" on public.projects;
create policy "projects insert as leader" on public.projects
  for insert to authenticated with check (auth.uid() = leader_id);

drop policy if exists "projects update by member" on public.projects;
create policy "projects update by member" on public.projects
  for update to authenticated using (
    auth.uid() = leader_id
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = projects.id and pm.researcher_id = auth.uid()
    )
  );

drop policy if exists "projects delete by leader" on public.projects;
create policy "projects delete by leader" on public.projects
  for delete to authenticated using (auth.uid() = leader_id);

-- project_members: read all; leader manages; researcher can leave (delete own row)
drop policy if exists "members read all" on public.project_members;
create policy "members read all" on public.project_members
  for select to authenticated using (true);

drop policy if exists "members insert by leader or self" on public.project_members;
create policy "members insert by leader or self" on public.project_members
  for insert to authenticated with check (
    auth.uid() = researcher_id
    or exists (
      select 1 from public.projects p
      where p.id = project_members.project_id and p.leader_id = auth.uid()
    )
  );

drop policy if exists "members delete by leader or self" on public.project_members;
create policy "members delete by leader or self" on public.project_members
  for delete to authenticated using (
    auth.uid() = researcher_id
    or exists (
      select 1 from public.projects p
      where p.id = project_members.project_id and p.leader_id = auth.uid()
    )
  );

-- tasks: project members read/write
drop policy if exists "tasks read by member" on public.tasks;
create policy "tasks read by member" on public.tasks
  for select to authenticated using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.researcher_id = auth.uid()
    )
  );

drop policy if exists "tasks write by member" on public.tasks;
create policy "tasks write by member" on public.tasks
  for all to authenticated
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.researcher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.researcher_id = auth.uid()
    )
  );

-- messages: project members read; sender must be member and equal to auth.uid()
drop policy if exists "messages read by member" on public.messages;
create policy "messages read by member" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = messages.project_id and pm.researcher_id = auth.uid()
    )
  );

drop policy if exists "messages insert by member" on public.messages;
create policy "messages insert by member" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.project_members pm
      where pm.project_id = messages.project_id and pm.researcher_id = auth.uid()
    )
  );

drop policy if exists "messages delete own" on public.messages;
create policy "messages delete own" on public.messages
  for delete to authenticated using (auth.uid() = sender_id);

-- =====================================================================
-- handle_new_user: auto-create a researcher row from auth signup metadata
-- The client calls supabase.auth.signUp({ email, password, options: { data: { ... } } });
-- the fields in data flow into raw_user_meta_data and we copy them here.
-- security definer lets us bypass RLS for this trusted system path.
-- =====================================================================
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.researchers (
    id, name, name_en, email,
    degree, degree_en, university, university_en,
    faculty, faculty_en, field, field_en,
    sub_field, sub_field_en, interests, interests_en,
    orcid, scholar, scopus, avatar
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'name_en', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'degree', ''),
    coalesce(new.raw_user_meta_data->>'degree_en', new.raw_user_meta_data->>'degree', ''),
    coalesce(new.raw_user_meta_data->>'university', ''),
    coalesce(new.raw_user_meta_data->>'university_en', new.raw_user_meta_data->>'university', ''),
    coalesce(new.raw_user_meta_data->>'faculty', ''),
    coalesce(new.raw_user_meta_data->>'faculty_en', new.raw_user_meta_data->>'faculty', ''),
    coalesce(new.raw_user_meta_data->>'field', ''),
    coalesce(new.raw_user_meta_data->>'field_en', new.raw_user_meta_data->>'field', ''),
    coalesce(new.raw_user_meta_data->>'sub_field', ''),
    coalesce(new.raw_user_meta_data->>'sub_field_en', new.raw_user_meta_data->>'sub_field', ''),
    coalesce(
      array(select jsonb_array_elements_text(new.raw_user_meta_data->'interests')),
      '{}'
    ),
    coalesce(
      array(select jsonb_array_elements_text(new.raw_user_meta_data->'interests_en')),
      '{}'
    ),
    nullif(new.raw_user_meta_data->>'orcid', ''),
    nullif(new.raw_user_meta_data->>'scholar', ''),
    nullif(new.raw_user_meta_data->>'scopus', ''),
    coalesce(new.raw_user_meta_data->>'avatar', '')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Realtime: publish messages + tasks so the UI can subscribe
-- =====================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; end $$;
