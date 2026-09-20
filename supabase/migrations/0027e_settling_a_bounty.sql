create or replace function public.settle_bounty(bounty_id uuid, winner uuid, the_catch uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	bounty public.bounties;
	the_winner_name text;
	lake_name text;
	is_paid_in_kind boolean := true;
	words text;
begin
	select * into bounty from public.bounties where id = bounty_id and status = 'open' for update;
	if bounty.id is null then return; end if;
	select display_name into the_winner_name from public.profiles where id = winner;
	select name into lake_name from public.lakes where id = bounty.lake_id;
	if bounty.prize_kind = 'peg_at_a_legend' then is_paid_in_kind := public.pay_peg_at_a_legend(winner, bounty);
	elsif bounty.prize_kind = 'stocked_fish' then is_paid_in_kind := public.pay_stocked_fish(winner, bounty);
	elsif bounty.prize_kind = 'money' then is_paid_in_kind := false;
	else perform public.pay_prize_tackle(winner, bounty);
	end if;
	if not is_paid_in_kind then perform public.credit_money(winner, bounty.prize_money); end if;
	update public.bounties set status = 'won', winner_id = winner, winner_name = the_winner_name, winning_catch_id = the_catch, settled_at = now(),
		prize_kind = case when is_paid_in_kind then prize_kind else 'money' end
	where id = bounty_id;
	words := case when is_paid_in_kind then bounty.prize_kind else 'money' end;
	perform public.send_notification(winner, 'bounty_won', 'You took the bounty at ' || lake_name, 'The ' || replace(bounty.kind, '_', ' ') || ' bounty is yours: ' || replace(words, '_', ' ') || '.', '/lakes/' || bounty.lake_id);
	insert into public.world_events (kind, lake_id, payload)
	values ('bounty_won', bounty.lake_id, jsonb_build_object('bountyId', bounty_id, 'bountyKind', bounty.kind, 'sponsor', bounty.sponsor_brand, 'prizeKind', words, 'prizeMoney', bounty.prize_money, 'anglerId', winner, 'anglerName', the_winner_name));
end;
$$;

create or replace function public.try_bounties_on_catch(the_catch uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	caught public.catches;
	bounty public.bounties;
begin
	select * into caught from public.catches where id = the_catch;
	if caught.angler_id is null then return; end if;
	for bounty in select * from public.bounties where lake_id = caught.lake_id and status = 'open' and kind in ('named_fish', 'over_the_line') and caught.caught_at >= opens_at and caught.caught_at < ends_at loop
		if (bounty.kind = 'named_fish' and caught.carp_id = bounty.target_carp_id) or (bounty.kind = 'over_the_line' and caught.weight_lb >= bounty.target_weight_lb) then
			perform public.settle_bounty(bounty.id, caught.angler_id, the_catch);
		end if;
	end loop;
end;
$$;

create or replace function public.bounty_winner_of(bounty public.bounties) returns public.catches
language sql stable security definer set search_path = public as $$
	with in_window as (
		select * from public.catches where lake_id = bounty.lake_id and angler_id is not null and caught_at >= bounty.opens_at and caught_at < bounty.ends_at
			and (bounty.kind <> 'peg_prize' or swim_name = bounty.swim_name)
	),
	graft as (select angler_id, count(*) as landed from in_window group by angler_id order by landed desc limit 1)
	select in_window.* from in_window
	where bounty.kind in ('top_of_the_water', 'peg_prize') or (bounty.kind = 'hard_graft' and angler_id = (select angler_id from graft))
	order by case when bounty.kind = 'hard_graft' then 0 else -weight_lb end, caught_at limit 1;
$$;

create or replace function public.close_ended_bounties() returns integer
language plpgsql security definer set search_path = public as $$
declare
	bounty public.bounties;
	winning public.catches;
	closed integer := 0;
begin
	for bounty in select * from public.bounties where status = 'open' and ends_at <= now() for update loop
		winning := public.bounty_winner_of(bounty);
		if winning.id is null then update public.bounties set status = 'unclaimed', settled_at = now() where id = bounty.id;
		else perform public.settle_bounty(bounty.id, winning.angler_id, winning.id);
		end if;
		closed := closed + 1;
	end loop;
	return closed;
end;
$$;

revoke execute on function public.settle_bounty(uuid, uuid, uuid), public.try_bounties_on_catch(uuid), public.close_ended_bounties(), public.bounty_winner_of(public.bounties) from public, anon, authenticated;
grant execute on function public.settle_bounty(uuid, uuid, uuid), public.try_bounties_on_catch(uuid), public.close_ended_bounties() to service_role;
