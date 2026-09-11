create or replace function public.assert_dealer_will_buy(the_carp public.carp) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	lowest_condition constant numeric := 30;
	sales_per_lake_per_day constant integer := 3;
	sold_today integer;
begin
	if not the_carp.is_catalogued then raise exception 'The dealer only buys fish that have been catalogued'; end if;
	if the_carp.transit_until is not null then raise exception 'That fish is in transit'; end if;
	if the_carp.quarantine_until is not null then raise exception 'That fish is in quarantine'; end if;
	if the_carp.condition < lowest_condition then
		raise exception 'The dealer won''t take a fish under % condition', lowest_condition;
	end if;
	select count(*) into sold_today from public.carp_transfers
	where kind = 'dealer_purchase' and from_lake_id = the_carp.lake_id and departed_at >= date_trunc('hour', now());
	if sold_today >= sales_per_lake_per_day then
		raise exception 'The dealer has taken % fish from your water today; try again tomorrow', sales_per_lake_per_day;
	end if;
end;
$$;

create or replace function public.sell_to_dealer(fish uuid) returns numeric
language plpgsql security definer set search_path = public as $$
declare
	dealer_share constant numeric := 0.55;
	the_carp public.carp;
	offer numeric;
begin
	select * into the_carp from public.carp where id = fish and public.is_lake_owner(lake_id) for update;
	if the_carp.id is null then raise exception 'That fish is not in your water'; end if;
	perform public.assert_dealer_will_buy(the_carp);
	offer := round(public.guide_price_of(the_carp.weight_lb, the_carp.strain, the_carp.condition, the_carp.fame) * dealer_share);
	insert into public.carp_transfers (carp_id, carp_name, kind, from_lake_id, price)
	values (the_carp.id, the_carp.name, 'dealer_purchase', the_carp.lake_id, offer);
	delete from public.carp where id = fish;
	perform public.credit_money(auth.uid(), offer);
	return offer;
end;
$$;

revoke execute on function public.assert_dealer_will_buy(public.carp) from public, anon, authenticated;
