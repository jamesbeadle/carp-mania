create or replace function public.pay_day_ticket(lake uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	fee numeric;
	owner uuid;
	angler_name text;
	visit_id uuid;
begin
	select day_ticket_fee, owner_id into fee, owner from public.lakes
	where id = lake and ((is_public and is_setup_complete) or owner_id = auth.uid());
	if owner is null then raise exception 'That lake is not open to anglers'; end if;
	if owner = auth.uid() then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The day ticket');
	perform public.credit_money(owner, fee);
	select display_name into angler_name from public.profiles where id = auth.uid();

	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, seed)
	values (lake, auth.uid(), angler_name, fee, floor(random() * largest_seed)::bigint) returning id into visit_id;
	return visit_id;
end;
$$;

drop view public.world_pins;
create view public.world_pins with (security_invoker = true) as
select
	lake.id,
	lake.name,
	owner.display_name as owner_name,
	lake.region,
	lake.latitude,
	lake.longitude,
	lake.reputation,
	(select max(weight_lb) from public.carp where lake_id = lake.id and is_catalogued) as heaviest_lb,
	lake.acres,
	lake.day_ticket_fee,
	(select count(*)::integer from public.listings where lake_id = lake.id and status = 'open') as listing_count,
	(
		select count(distinct angler_id)::integer from public.lake_visits
		where lake_id = lake.id and angler_id is not null and visited_at > now() - interval '10 minutes'
	) as anglers_on_bank_now
from public.lakes as lake
join public.profiles as owner on owner.id = lake.owner_id
where lake.is_public and lake.is_setup_complete and lake.latitude is not null;
