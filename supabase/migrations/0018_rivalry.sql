alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died',
	'match_booked', 'match_cancelled', 'match_won', 'match_over', 'record_lost', 'board_place_lost'
));

create function public.record_holders_beaten(the_catch uuid)
returns table (holder uuid, scope text, held_lb numeric)
language sql stable security definer set search_path = public as $$
	with new_catch as (select caught.lake_id, caught.angler_id, caught.weight_lb, water.region from public.catches as caught join public.lakes as water on water.id = caught.lake_id where caught.id = the_catch),
	earlier as (
		select caught.angler_id, caught.weight_lb, caught.caught_at, caught.lake_id, water.region
		from public.catches as caught join public.lakes as water on water.id = caught.lake_id
		where caught.angler_id is not null and caught.id <> the_catch
	),
	holders as (
		(select 'lake' as scope, 1 as breadth, angler_id, weight_lb from earlier where lake_id = (select lake_id from new_catch) order by weight_lb desc, caught_at limit 1)
		union all
		(select 'region', 2, angler_id, weight_lb from earlier where region = (select region from new_catch) order by weight_lb desc, caught_at limit 1)
		union all
		(select 'world', 3, angler_id, weight_lb from earlier order by weight_lb desc, caught_at limit 1)
	)
	select distinct on (holders.angler_id) holders.angler_id, holders.scope, holders.weight_lb
	from holders, new_catch
	where holders.angler_id <> new_catch.angler_id and holders.weight_lb < new_catch.weight_lb
	order by holders.angler_id, holders.breadth desc;
$$;

create function public.board_places_taken(the_catch uuid, board_length integer)
returns table (angler_id uuid, new_rank integer)
language sql stable security definer set search_path = public as $$
	with new_catch as (select angler_id, weight_lb from public.catches where id = the_catch),
	bests as (
		select caught.angler_id, max(caught.weight_lb) as best_lb from public.catches as caught
		where caught.angler_id is not null and caught.id <> the_catch group by caught.angler_id
	),
	catchers_old_best as (select coalesce((select best_lb from bests, new_catch where bests.angler_id = new_catch.angler_id), 0) as best_lb),
	overtaken as (
		select bests.angler_id, (select count(*)::integer + 1 from bests as above where above.best_lb > bests.best_lb) as old_rank
		from bests, new_catch, catchers_old_best
		where bests.angler_id <> new_catch.angler_id and bests.best_lb < new_catch.weight_lb and bests.best_lb >= catchers_old_best.best_lb
	)
	select angler_id, old_rank + 1 from overtaken where old_rank <= board_length;
$$;

create function public.tell_the_beaten(the_catch uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	board_length constant integer := 10;
	new_catch record;
	weight text;
	beaten record;
begin
	select caught.angler_id, caught.angler_name, caught.weight_lb, water.name as lake_name into new_catch
	from public.catches as caught join public.lakes as water on water.id = caught.lake_id where caught.id = the_catch;
	weight := public.pounds_and_ounces(new_catch.weight_lb);
	for beaten in select * from public.record_holders_beaten(the_catch) loop
		perform public.send_notification(beaten.holder, 'record_lost',
			new_catch.angler_name || ' has taken your ' || beaten.scope || ' record at ' || new_catch.lake_name,
			weight || ' to your ' || public.pounds_and_ounces(beaten.held_lb) || '. It is there to be taken back.', '/anglers/' || new_catch.angler_id);
	end loop;
	for beaten in
		select * from public.board_places_taken(the_catch, board_length) where angler_id not in (select holder from public.record_holders_beaten(the_catch))
	loop
		perform public.send_notification(beaten.angler_id, 'board_place_lost',
			case when beaten.new_rank > board_length then 'You''ve dropped off the world board' else 'You''ve dropped to No. ' || beaten.new_rank || ' on the world board' end,
			new_catch.angler_name || '''s ' || weight || ' went in above you.', '/world/hall-of-fame');
	end loop;
end;
$$;

revoke execute on function public.record_holders_beaten(uuid), public.board_places_taken(uuid, integer), public.tell_the_beaten(uuid) from public, anon, authenticated;
