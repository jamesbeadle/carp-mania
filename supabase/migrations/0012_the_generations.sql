create table public.fishermen (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles (id) on delete cascade,
	generation integer not null,
	name text not null,
	born_age integer not null,
	retires_at_age integer not null,
	started_at timestamptz not null default now(),
	retired_at timestamptz,
	final_skill numeric(5, 2),
	final_experience integer,
	catches integer,
	personal_best_lb numeric(5, 2),
	unique (profile_id, generation)
);
create index fishermen_by_profile on public.fishermen (profile_id, generation desc);
alter table public.fishermen enable row level security;
create policy "every line of fishermen is public" on public.fishermen for select to authenticated using (true);

alter table public.profiles add column current_fisherman_id uuid references public.fishermen (id) on delete set null;
alter table public.catches add column fisherman_id uuid references public.fishermen (id) on delete set null;
create index catches_by_fisherman_recent on public.catches (fisherman_id, caught_at desc);

create or replace function public.diary_age_of(fisherman public.fishermen, at timestamptz) returns integer
language sql immutable as $$
	select fisherman.born_age + floor(extract(epoch from (at - fisherman.started_at)) / (4 * 24 * 60 * 60))::integer;
$$;

create or replace function public.begin_fisherman(player uuid, fisherman_name text, generation integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	youngest_start constant integer := 20;
	oldest_start constant integer := 30;
	earliest_retirement constant integer := 80;
	latest_retirement constant integer := 100;
	created uuid;
begin
	insert into public.fishermen (profile_id, generation, name, born_age, retires_at_age)
	values (
		player, generation, fisherman_name,
		youngest_start + floor(random() * (oldest_start - youngest_start + 1)),
		earliest_retirement + floor(random() * (latest_retirement - earliest_retirement + 1))
	)
	returning id into created;
	update public.profiles set current_fisherman_id = created where id = player;
	return created;
end;
$$;

insert into public.fishermen (profile_id, generation, name, born_age, retires_at_age, started_at)
select id, 1, display_name, 20 + floor(random() * 11), 80 + floor(random() * 21), created_at from public.profiles;
update public.profiles as player set current_fisherman_id = first.id
from public.fishermen as first where first.profile_id = player.id and first.generation = 1;
update public.catches as caught set fisherman_id = player.current_fisherman_id
from public.profiles as player where player.id = caught.angler_id;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	first_generation constant integer := 1;
	fisherman_name text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
begin
	insert into public.profiles (id, display_name, avatar_url) values (new.id, fisherman_name, new.raw_user_meta_data ->> 'avatar_url');
	perform public.begin_fisherman(new.id, fisherman_name, first_generation);
	return new;
end;
$$;

alter table public.world_events drop constraint world_events_kind_check;
alter table public.world_events add constraint world_events_kind_check check (kind in (
	'big_catch', 'sale', 'record', 'new_water', 'island_built', 'fish_died', 'handover'
));

revoke execute on function public.begin_fisherman(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.begin_fisherman(uuid, text, integer) to service_role;
