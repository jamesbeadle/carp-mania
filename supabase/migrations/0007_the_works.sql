create table public.lake_works (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	kind text not null,
	parameters jsonb not null default '{}'::jsonb,
	cost numeric(10, 2) not null,
	ordered_at timestamptz not null default now(),
	starts_on timestamptz not null,
	completes_on timestamptz not null,
	status text not null default 'in_progress' check (status in ('in_progress', 'complete', 'cancelled'))
);
create index lake_works_by_lake_and_status on public.lake_works (lake_id, status);

create table public.notifications (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles (id) on delete cascade,
	kind text not null check (kind in (
		'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water'
	)),
	title text not null,
	body text not null,
	link text not null,
	created_at timestamptz not null default now(),
	read_at timestamptz
);
create index notifications_by_profile_recent on public.notifications (profile_id, created_at desc);

alter table public.lake_works enable row level security;
alter table public.notifications enable row level security;

create policy "works follow lake visibility" on public.lake_works
	for select to authenticated using (public.is_lake_visible(lake_id));
create policy "players read their own inbox" on public.notifications
	for select to authenticated using (profile_id = auth.uid());
create policy "players mark their own inbox read" on public.notifications
	for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create or replace function public.send_notification(recipient uuid, kind text, title text, body text, link text) returns void
language plpgsql security definer set search_path = public as $$
begin
	insert into public.notifications (profile_id, kind, title, body, link) values (recipient, kind, title, body, link);
end;
$$;
revoke execute on function public.send_notification(uuid, text, text, text, text) from public, anon, authenticated;
