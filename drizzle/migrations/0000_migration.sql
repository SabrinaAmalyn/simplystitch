create type public.app_role as enum ('maker', 'admin', 'super_admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Own profile readable" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'));
create policy "Own profile editable" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Read own or staff reads all" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'));
create policy "Super admin grants admin" on public.user_roles for insert to authenticated
  with check (role = 'admin' and public.has_role(auth.uid(),'super_admin'));
create policy "Super admin revokes admin" on public.user_roles for delete to authenticated
  using (role = 'admin' and public.has_role(auth.uid(),'super_admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'maker');
  if not exists (select 1 from public.user_roles where role = 'super_admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin');
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();