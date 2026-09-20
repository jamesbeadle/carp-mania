create or replace function public.open_bounty(
	lake uuid, swim uuid, swim_label text, kind text, band text, target_carp uuid, target_name text, target_lb numeric, sponsor text,
	posted_by uuid, prize_kind text, prize_money numeric, prize_brand text, prize_item text, prize_quantity numeric, prize_design text,
	opens timestamptz, ends timestamptz
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	prototypes_a_year constant integer := 2;
	issued integer;
	the_prize_kind text := prize_kind;
	bounty_id uuid;
	lake_name text;
	owner uuid;
begin
	if exists (select 1 from public.bounties where lake_id = lake and status = 'open') then return null; end if;
	if the_prize_kind = 'prototype' then
		select count(*) into issued from public.prototypes where brand = prize_brand and fishery_year = public.fishery_year_now();
		if issued >= prototypes_a_year then the_prize_kind := 'sponsorship'; end if;
	end if;
	insert into public.bounties (lake_id, swim_id, swim_name, kind, band, target_carp_id, target_carp_name, target_weight_lb, sponsor_brand, posted_by,
		prize_kind, prize_money, prize_brand, prize_item_id, prize_quantity, prize_design_id, opens_at, ends_at)
	values (lake, swim, swim_label, kind, band, target_carp, target_name, target_lb, sponsor, posted_by,
		the_prize_kind, prize_money, prize_brand, prize_item, prize_quantity, prize_design, opens, ends)
	returning id into bounty_id;
	select name, owner_id into lake_name, owner from public.lakes where id = lake;
	insert into public.world_events (kind, lake_id, payload)
	values ('bounty_posted', lake, jsonb_build_object('bountyId', bounty_id, 'bountyKind', kind, 'sponsor', sponsor, 'prizeKind', the_prize_kind, 'prizeMoney', prize_money, 'endsAt', ends, 'targetName', target_name, 'targetLb', target_lb));
	if posted_by is null then
		perform public.send_notification(owner, 'bounty_posted', 'A bounty on ' || lake_name, 'A sponsor has put a prize on your water until ' || to_char(ends, 'Dy HH24:MI') || '.', '/lakes/' || lake);
	end if;
	return bounty_id;
end;
$$;

create or replace function public.post_bounty(lake uuid, kind text, band text, target_carp uuid, target_lb numeric, money numeric, ends timestamptz) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	least_money constant numeric := 250;
	owner_name text;
	target_name text;
	bounty_id uuid;
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	if money < least_money then raise exception 'A bounty is at least £%', least_money; end if;
	if exists (select 1 from public.bounties where lake_id = lake and status = 'open') then raise exception 'There is a bounty on this water already'; end if;
	select display_name into owner_name from public.profiles where id = auth.uid();
	select name into target_name from public.carp where id = target_carp;
	perform public.debit_money(auth.uid(), money, 'The bounty');
	bounty_id := public.open_bounty(lake, null, null, kind, band, target_carp, target_name, target_lb, 'the owner', auth.uid(), 'money', money, null, null, 0, null, now(), ends);
	return bounty_id;
end;
$$;

revoke execute on function public.open_bounty(uuid, uuid, text, text, text, uuid, text, numeric, text, uuid, text, numeric, text, text, numeric, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.open_bounty(uuid, uuid, text, text, text, uuid, text, numeric, text, uuid, text, numeric, text, text, numeric, text, timestamptz, timestamptz) to service_role;
grant execute on function public.post_bounty(uuid, text, text, uuid, numeric, numeric, timestamptz) to authenticated;
