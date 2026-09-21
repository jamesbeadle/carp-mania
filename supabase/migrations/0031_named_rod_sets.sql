-- An angler saves a set of rods under a name and picks it again when tackling up.

create table public.rod_sets (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles (id) on delete cascade,
	name text not null check (char_length(name) between 1 and 40),
	rods jsonb not null,
	created_at timestamptz not null default now(),
	last_used_at timestamptz not null default now(),
	unique (profile_id, name)
);
create index rod_sets_by_angler on public.rod_sets (profile_id, last_used_at desc);
alter table public.rod_sets enable row level security;
create policy "anglers see their own rod sets" on public.rod_sets for select to authenticated using (profile_id = auth.uid());
create policy "anglers save their own rod sets" on public.rod_sets for insert to authenticated with check (profile_id = auth.uid());
create policy "anglers change their own rod sets" on public.rod_sets for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "anglers drop their own rod sets" on public.rod_sets for delete to authenticated using (profile_id = auth.uid());
grant select, insert, update, delete on public.rod_sets to authenticated;
