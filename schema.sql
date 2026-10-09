-- Skema asas untuk Supabase. Jalankan selepas semakan dan sebelum masukkan data sebenar.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'teacher');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'teacher',
  created_at timestamptz not null default now()
);

create table public.school_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.class_teachers (
  class_id uuid not null references public.school_classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  primary key (class_id, teacher_id)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete restrict,
  student_code text,
  full_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (class_id, student_code)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  attendance_date date not null,
  status public.attendance_status not null,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create index students_class_id_idx on public.students(class_id);
create index attendance_date_idx on public.attendance_records(attendance_date);
create index attendance_student_date_idx on public.attendance_records(student_id, attendance_date);

-- Helper functions avoid recursive RLS checks on profiles/class_teachers.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;

create or replace function public.can_access_class(target_class uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.class_teachers ct
    where ct.class_id = target_class and ct.teacher_id = (select auth.uid())
  );
$$;

alter table public.profiles enable row level security;
alter table public.school_classes enable row level security;
alter table public.class_teachers enable row level security;
alter table public.students enable row level security;
alter table public.attendance_records enable row level security;

create policy "profiles read self or admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());
create policy "admin manages profiles" on public.profiles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "users read assigned classes" on public.school_classes for select to authenticated
using (public.is_admin() or exists(select 1 from public.class_teachers ct where ct.class_id = id and ct.teacher_id = (select auth.uid())));
create policy "admin manages classes" on public.school_classes for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "read own class assignments or admin" on public.class_teachers for select to authenticated
using (teacher_id = (select auth.uid()) or public.is_admin());
create policy "admin manages class assignments" on public.class_teachers for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "read students in assigned classes" on public.students for select to authenticated
using (public.can_access_class(class_id));
create policy "admin or assigned teacher adds students" on public.students for insert to authenticated
with check (public.can_access_class(class_id));
create policy "admin or assigned teacher updates students" on public.students for update to authenticated
using (public.can_access_class(class_id)) with check (public.can_access_class(class_id));
create policy "admin manages student deletion" on public.students for delete to authenticated
using (public.is_admin());

create policy "read attendance for assigned classes" on public.attendance_records for select to authenticated
using (exists(select 1 from public.students s where s.id = student_id and public.can_access_class(s.class_id)));
create policy "assigned teacher marks attendance" on public.attendance_records for insert to authenticated
with check (
  marked_by = (select auth.uid()) and
  exists(select 1 from public.students s where s.id = student_id and public.can_access_class(s.class_id))
);
create policy "assigned teacher updates attendance" on public.attendance_records for update to authenticated
using (exists(select 1 from public.students s where s.id = student_id and public.can_access_class(s.class_id)))
with check (
  marked_by = (select auth.uid()) and
  exists(select 1 from public.students s where s.id = student_id and public.can_access_class(s.class_id))
);
create policy "admin deletes attendance" on public.attendance_records for delete to authenticated
using (public.is_admin());

-- Pentadbir pertama perlu diwujudkan secara terkawal:
-- 1) Cipta akaun melalui Supabase Auth.
-- 2) Masukkan id auth.users tersebut ke public.profiles dengan role='admin'.
-- Jangan dedahkan service_role key dalam frontend.
