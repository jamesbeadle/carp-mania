-- Badges are the keeper's own honours: an admin makes a badge — a name, a few words, a metal — and pins it
-- on any angler for whatever they see fit. The badge stays on the angler's page, and a note goes up for them.

alter table public.profiles add column is_admin boolean not null default false;

create table public.badges (
	id uuid primary key default gen_random_uuid(),
	name text not null check (length(name) between 2 and 40),
	words text not null check (length(words) <= 160),
	metal text not null check (metal in ('bronze', 'silver', 'gold', 'platinum')),
	created_by uuid references public.profiles (id) on delete set null,
	created_at timestamptz not null default now()
);
create unique index badges_one_of_each_name on public.badges (lower(name));
alter table public.badges enable row level security;
create policy "badges are public" on public.badges for select to authenticated using (true);

create table public.badge_awards (
	id uuid primary key default gen_random_uuid(),
	badge_id uuid not null references public.badges (id) on delete cascade,
	profile_id uuid not null references public.profiles (id) on delete cascade,
	citation text not null default '' check (length(citation) <= 160),
	awarded_by uuid references public.profiles (id) on delete set null,
	awarded_at timestamptz not null default now(),
	unique (badge_id, profile_id)
);
create index badge_awards_by_angler on public.badge_awards (profile_id, awarded_at desc);
alter table public.badge_awards enable row level security;
create policy "badge awards are public" on public.badge_awards for select to authenticated using (true);

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died',
	'match_booked', 'match_cancelled', 'match_won', 'match_over', 'record_lost', 'board_place_lost',
	'award_won', 'bounty_posted', 'bounty_won', 'prototype_lost', 'badge_awarded'
));

create or replace function public.is_admin(player uuid) returns boolean
language sql stable security definer set search_path = public as $$
	select coalesce((select is_admin from public.profiles where id = player), false);
$$;

create or replace function public.require_admin() returns uuid
language plpgsql stable security definer set search_path = public as $$
begin
	if auth.uid() is null then raise exception 'No angler is signed in'; end if;
	if not public.is_admin(auth.uid()) then raise exception 'Only the keeper hands out badges'; end if;
	return auth.uid();
end;
$$;

create or replace function public.create_badge(badge_name text, badge_words text, badge_metal text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	keeper uuid := public.require_admin();
	created uuid;
begin
	if exists (select 1 from public.badges where lower(name) = lower(badge_name)) then raise exception 'There is already a badge called %', badge_name; end if;
	insert into public.badges (name, words, metal, created_by) values (badge_name, badge_words, badge_metal, keeper) returning id into created;
	return created;
end;
$$;

create or replace function public.award_badge(badge uuid, angler uuid, badge_citation text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	keeper uuid := public.require_admin();
	the_badge public.badges;
	awarded uuid;
begin
	select * into the_badge from public.badges where id = badge;
	if the_badge.id is null then raise exception 'No badge by that name'; end if;
	if not exists (select 1 from public.profiles where id = angler) then raise exception 'No angler by that name'; end if;
	insert into public.badge_awards (badge_id, profile_id, citation, awarded_by) values (badge, angler, coalesce(badge_citation, ''), keeper)
	on conflict do nothing returning id into awarded;
	if awarded is null then raise exception 'They already wear the % badge', the_badge.name; end if;
	perform public.send_notification(angler, 'badge_awarded', 'You have been given the ' || the_badge.name || ' badge',
		coalesce(nullif(badge_citation, ''), the_badge.words), '/angler');
	return awarded;
end;
$$;

revoke execute on function public.is_admin(uuid), public.require_admin() from public, anon, authenticated;
grant execute on function public.create_badge(text, text, text), public.award_badge(uuid, uuid, text) to authenticated;

-- The keepers, by their profile ids: James and Nigel.
update public.profiles set is_admin = true
where id in ('6b58c30e-dc16-4cba-b380-84aa11824c9f', 'ba32413f-8ce9-48e3-bdf6-89aad6e10356');

-- The first badge, pinned on Jeff by James.
with first_badge as (
	insert into public.badges (name, words, metal, created_by)
	select 'Silver Carp', 'Pinned on by the keeper for angling the whole bank talked about.', 'silver', keeper.id
	from public.profiles as keeper where keeper.id = '6b58c30e-dc16-4cba-b380-84aa11824c9f'
	returning id, created_by
)
insert into public.badge_awards (badge_id, profile_id, citation, awarded_by)
select first_badge.id, jeff.id, 'The first Silver Carp ever pinned on. Well done.', first_badge.created_by
from first_badge, public.profiles as jeff
where jeff.id = '62d976a0-cf05-47b6-9713-ecd3708b7a91';
