alter table public.profiles enable row level security;
alter table public.lakes enable row level security;
alter table public.swims enable row level security;
alter table public.carp enable row level security;
alter table public.catches enable row level security;
alter table public.lake_visits enable row level security;

create or replace function public.is_lake_visible(lake uuid) returns boolean
language sql stable security definer set search_path = public as $$
	select exists (select 1 from public.lakes where id = lake and (is_public or owner_id = auth.uid()));
$$;

create or replace function public.is_lake_owner(lake uuid) returns boolean
language sql stable security definer set search_path = public as $$
	select exists (select 1 from public.lakes where id = lake and owner_id = auth.uid());
$$;

create policy "profiles are readable by everyone signed in" on public.profiles
	for select to authenticated using (true);
create policy "players update their own profile" on public.profiles
	for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "public lakes and your own are readable" on public.lakes
	for select to authenticated using (is_public or owner_id = auth.uid());
create policy "players create their own lake" on public.lakes
	for insert to authenticated with check (owner_id = auth.uid());
create policy "owners update their lake" on public.lakes
	for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "swims follow lake visibility" on public.swims
	for select to authenticated using (public.is_lake_visible(lake_id));
create policy "owners manage swims" on public.swims
	for all to authenticated using (public.is_lake_owner(lake_id)) with check (public.is_lake_owner(lake_id));

create policy "carp follow lake visibility" on public.carp
	for select to authenticated using (public.is_lake_visible(lake_id));
create policy "owners manage carp" on public.carp
	for all to authenticated using (public.is_lake_owner(lake_id)) with check (public.is_lake_owner(lake_id));

create policy "catches follow lake visibility" on public.catches
	for select to authenticated using (public.is_lake_visible(lake_id));
create policy "owners record simulated catches" on public.catches
	for insert to authenticated with check (public.is_lake_owner(lake_id) and angler_id is null);

create policy "visits follow lake visibility" on public.lake_visits
	for select to authenticated using (public.is_lake_visible(lake_id));
create policy "owners record simulated visits" on public.lake_visits
	for insert to authenticated with check (public.is_lake_owner(lake_id) and angler_id is null);
