create or replace function public.haversine_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) returns numeric
language sql immutable as $$
	select round((6371 * 2 * atan2(sqrt(half_chord), sqrt(1 - half_chord)))::numeric, 1)
	from (
		select power(sin(radians(lat2 - lat1) / 2), 2)
			+ cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2) as half_chord
	) as chord;
$$;

create or replace function public.transport_cost_for(km numeric) returns numeric
language sql immutable as $$
	select round(250 + 0.35 * km);
$$;

create or replace function public.transit_time_for(km numeric) returns interval
language sql immutable as $$
	select greatest(1, ceil(km / 800)) * interval '1 hour';
$$;

create or replace function public.condition_after_transport(condition numeric, km numeric) returns numeric
language sql immutable as $$
	select greatest(5, condition - least(25, floor(km / 200)));
$$;

create or replace function public.distance_between_lakes(from_lake uuid, to_lake uuid) returns numeric
language sql stable security definer set search_path = public as $$
	select public.haversine_km(origin.latitude, origin.longitude, destination.latitude, destination.longitude)
	from public.lakes as origin, public.lakes as destination
	where origin.id = from_lake and destination.id = to_lake;
$$;

create or replace function public.transport_cost_between(from_lake uuid, to_lake uuid) returns numeric
language sql stable security definer set search_path = public as $$
	select public.transport_cost_for(public.distance_between_lakes(from_lake, to_lake));
$$;

create or replace function public.pinned_lake_of(player uuid) returns public.lakes
language plpgsql stable security definer set search_path = public as $$
declare
	the_lake public.lakes;
begin
	select * into the_lake from public.lakes where owner_id = player;
	if the_lake.id is null then raise exception 'You need a water of your own to buy fish'; end if;
	if the_lake.latitude is null or the_lake.longitude is null then
		raise exception 'Pin your water on the globe before you buy fish';
	end if;
	return the_lake;
end;
$$;

revoke execute on function public.pinned_lake_of(uuid) from public, anon, authenticated;
