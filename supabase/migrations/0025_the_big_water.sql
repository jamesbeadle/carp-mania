create table public.bailiffs (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	name text not null,
	wage numeric(6, 2) not null check (wage >= 0),
	aptitude numeric(5, 2) not null check (aptitude between 0 and 100),
	performance numeric(5, 2) not null check (performance between 0 and 100),
	hired_at timestamptz not null default now()
);
create index bailiffs_by_lake on public.bailiffs (lake_id);
alter table public.bailiffs enable row level security;
create policy "bailiffs are the owner's" on public.bailiffs for select to authenticated using (public.is_lake_owner(lake_id));

insert into public.bailiffs (lake_id, name, wage, aptitude, performance)
select id, 'The old bailiff', 40, 70, 70 from public.lakes where has_bailiff;

create or replace function public.keep_has_bailiff() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	the_lake uuid := coalesce(new.lake_id, old.lake_id);
begin
	update public.lakes set has_bailiff = exists (select 1 from public.bailiffs where lake_id = the_lake) where id = the_lake;
	return coalesce(new, old);
end;
$$;
create trigger bailiffs_keep_has_bailiff after insert or delete on public.bailiffs for each row execute function public.keep_has_bailiff();

create or replace function public.hire_bailiff(lake uuid, bailiff_name text, wage numeric, aptitude numeric, performance numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	acres_per_bailiff constant numeric := 15;
	water_acres numeric;
	team_size integer;
	bailiff_id uuid;
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	select acres into water_acres from public.lakes where id = lake;
	select count(*) into team_size from public.bailiffs where lake_id = lake;
	if team_size >= greatest(1, ceil(water_acres / acres_per_bailiff)) then raise exception 'The team is full for a water of this size'; end if;
	insert into public.bailiffs (lake_id, name, wage, aptitude, performance) values (lake, bailiff_name, wage, aptitude, performance) returning id into bailiff_id;
	return bailiff_id;
end;
$$;

create or replace function public.sack_bailiff(lake uuid, bailiff uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	delete from public.bailiffs where id = bailiff and lake_id = lake;
	if not found then raise exception 'No such bailiff on this water'; end if;
end;
$$;

grant execute on function public.hire_bailiff(uuid, text, numeric, numeric, numeric), public.sack_bailiff(uuid, uuid) to authenticated;
