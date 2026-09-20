create table public.lake_species (
	lake_id uuid not null references public.lakes (id) on delete cascade,
	species text not null check (species in ('bream', 'tench', 'crucian', 'roach_rudd', 'perch')),
	count integer not null check (count >= 0),
	primary key (lake_id, species)
);
alter table public.lake_species enable row level security;
create policy "species follow lake visibility" on public.lake_species for select to authenticated using (public.is_lake_visible(lake_id));

create or replace function public.seed_species(lake uuid, site text) returns void
language plpgsql security definer set search_path = public as $$
begin
	if site = 'estate_lake' then
		insert into public.lake_species (lake_id, species, count) values (lake, 'bream', 150), (lake, 'tench', 40), (lake, 'roach_rudd', 300) on conflict do nothing;
	elsif site = 'clay_pit' then
		insert into public.lake_species (lake_id, species, count) values (lake, 'bream', 300), (lake, 'roach_rudd', 200) on conflict do nothing;
	elsif site = 'gravel_pit' then
		insert into public.lake_species (lake_id, species, count) values (lake, 'tench', 30), (lake, 'perch', 60), (lake, 'roach_rudd', 200) on conflict do nothing;
	elsif site = 'farm_pond' then
		insert into public.lake_species (lake_id, species, count) values (lake, 'crucian', 80), (lake, 'roach_rudd', 100) on conflict do nothing;
	end if;
end;
$$;

select public.seed_species(id, site_type) from public.lakes;

create or replace function public.seed_species_for_new_lake() returns trigger
language plpgsql security definer set search_path = public as $$
begin
	perform public.seed_species(new.id, new.site_type);
	return new;
end;
$$;
create trigger lakes_seed_species after insert on public.lakes for each row execute function public.seed_species_for_new_lake();

create or replace function public.stock_coarse_fish(lake uuid, kind text, head_count integer, price numeric) returns void
language plpgsql security definer set search_path = public as $$
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	if head_count <= 0 then raise exception 'Stock at least one fish'; end if;
	perform public.debit_money(auth.uid(), price, 'The coarse fish');
	insert into public.lake_species (lake_id, species, count) values (lake, kind, head_count)
	on conflict (lake_id, species) do update set count = public.lake_species.count + excluded.count;
end;
$$;

create or replace function public.net_the_silvers(lake uuid, price numeric, taken_share numeric, disturbance_added numeric) returns integer
language plpgsql security definer set search_path = public as $$
declare
	taken integer;
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	select coalesce(sum(floor(count * taken_share)), 0)::integer into taken from public.lake_species where lake_id = lake;
	if taken = 0 then raise exception 'There is nothing in the net'; end if;
	perform public.debit_money(auth.uid(), price, 'The netting');
	update public.lake_species set count = count - floor(count * taken_share) where lake_id = lake;
	update public.lakes set disturbance = least(100, disturbance + disturbance_added) where id = lake;
	return taken;
end;
$$;

grant execute on function public.stock_coarse_fish(uuid, text, integer, numeric), public.net_the_silvers(uuid, numeric, numeric, numeric) to authenticated;
