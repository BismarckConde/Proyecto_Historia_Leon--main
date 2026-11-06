-- Execute in Supabase SQL Editor. Add the admin's auth.users UUID below after
-- they sign in once with Google. Never expose the service_role key in the app.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.content_catalog (
  id smallint primary key check (id = 1),
  catalog jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.admin_users enable row level security;
alter table public.content_catalog enable row level security;

create or replace function public.is_leon_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

drop policy if exists "Admin can read own role" on public.admin_users;
create policy "Admin can read own role" on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public can read catalog" on public.content_catalog;
create policy "Public can read catalog" on public.content_catalog for select to anon, authenticated
  using (true);

drop policy if exists "Admins can write catalog" on public.content_catalog;
create policy "Admins can write catalog" on public.content_catalog for all to authenticated
  using (public.is_leon_admin()) with check (public.is_leon_admin());

grant select on public.content_catalog to anon, authenticated;
grant insert, update, delete on public.content_catalog to authenticated;
grant select on public.admin_users to authenticated;

-- Public image URLs are rendered on the public catalog. Only listed admins
-- can upload, replace, or remove images; image files are limited to 10 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('place-photos', 'place-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view place photos" on storage.objects;
create policy "Public can view place photos" on storage.objects for select to anon, authenticated
  using (bucket_id = 'place-photos');

drop policy if exists "Admins can upload place photos" on storage.objects;
create policy "Admins can upload place photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'place-photos' and public.is_leon_admin());

drop policy if exists "Admins can update place photos" on storage.objects;
create policy "Admins can update place photos" on storage.objects for update to authenticated
  using (bucket_id = 'place-photos' and public.is_leon_admin())
  with check (bucket_id = 'place-photos' and public.is_leon_admin());

drop policy if exists "Admins can delete place photos" on storage.objects;
create policy "Admins can delete place photos" on storage.objects for delete to authenticated
  using (bucket_id = 'place-photos' and public.is_leon_admin());

-- After first Google login, find the user's UUID in Authentication > Users,
-- then run: insert into public.admin_users (user_id) values ('UUID-HERE');
