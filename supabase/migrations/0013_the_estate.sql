drop index public.lakes_one_per_owner;
create index lakes_by_owner on public.lakes (owner_id, created_at);

alter table public.profiles
	add column current_lake_id uuid references public.lakes (id) on delete set null,
	add column plot_region text check (plot_region in (
		'uk_ireland', 'france', 'benelux_germany', 'iberia', 'italy_balkans', 'central_europe', 'danube', 'north_america', 'south_africa', 'australia_nz', 'japan_east_asia'
	));

update public.profiles as player set
	current_lake_id = (select id from public.lakes where owner_id = player.id order by created_at limit 1),
	plot_region = home_region;

create or replace function public.current_lake_of(player uuid) returns public.lakes
language sql stable security definer set search_path = public as $$
	select * from public.lakes
	where owner_id = player
	order by (id = (select current_lake_id from public.profiles where id = player)) desc, created_at
	limit 1;
$$;

create or replace function public.pinned_lake_of(player uuid) returns public.lakes
language plpgsql stable security definer set search_path = public as $$
declare
	the_lake public.lakes := public.current_lake_of(player);
begin
	if the_lake.id is null then raise exception 'You need a water of your own to buy fish'; end if;
	if the_lake.latitude is null or the_lake.longitude is null then
		raise exception 'Pin your water on the globe before you buy fish';
	end if;
	return the_lake;
end;
$$;

revoke execute on function public.current_lake_of(uuid), public.pinned_lake_of(uuid) from public, anon, authenticated;
