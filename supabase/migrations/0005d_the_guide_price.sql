create or replace function public.guide_price_of(weight_lb numeric, strain text, condition numeric, fame integer) returns numeric
language sql immutable as $$
	select round(
		(
			least(weight_lb, 10) * 30
			+ greatest(0, least(weight_lb, 20) - 10) * 70
			+ greatest(0, least(weight_lb, 30) - 20) * 200
			+ greatest(0, least(weight_lb, 40) - 30) * 550
			+ greatest(0, least(weight_lb, 50) - 40) * 1400
			+ greatest(0, weight_lb - 50) * 3000
		)
		* case strain
			when 'mirror' then 1.05
			when 'linear' then 1.2
			when 'fully_scaled' then 1.25
			when 'leather' then 1.3
			when 'ghost' then 1.35
			else 1
		end
		* (0.6 + condition / 250)
		* (1 + least(1.5, fame / 100.0))
	);
$$;

create or replace function public.farm_bands()
returns table (band_key text, minimum_lb numeric, maximum_lb numeric, weekly_supply integer, price_per_fish numeric)
language sql immutable as $$
	values
		('stockies', 4, 6, 200, 150),
		('doubles', 8, 12, 80, 300),
		('mid_doubles', 14, 18, 30, 720),
		('twenties', 20, 25, 10, 1500);
$$;

create or replace function public.farm_band_price(band text) returns numeric
language sql immutable as $$
	select price_per_fish from public.farm_bands() where band_key = band;
$$;

create or replace function public.fishery_week_start() returns timestamptz
language sql stable as $$
	select to_timestamp(floor(extract(epoch from now()) / 25200) * 25200);
$$;

create or replace function public.farm_supply_left(region_code text, band text) returns integer
language sql stable security definer set search_path = public as $$
	select weekly_supply - (
		select count(*)::integer
		from public.carp_transfers as delivery
		join public.lakes as destination on destination.id = delivery.to_lake_id
		join public.profiles as buyer on buyer.id = destination.owner_id
		where delivery.kind = 'farm_delivery'
			and delivery.farm_band = band
			and buyer.home_region = region_code
			and delivery.departed_at >= public.fishery_week_start()
	)
	from public.farm_bands()
	where band_key = band;
$$;
