alter table public.profiles alter column money set default 100000;
update public.profiles set money = money + 95000;
alter table public.profiles add constraint profiles_money_never_negative check (money >= 0);

alter table public.profiles
	add column home_region text check (home_region in (
		'uk_ireland', 'france', 'benelux_germany', 'iberia', 'italy_balkans', 'central_europe',
		'danube', 'north_america', 'south_africa', 'australia_nz', 'japan_east_asia'
	)),
	add column plot_latitude numeric(8, 5) check (plot_latitude between -90 and 90),
	add column plot_longitude numeric(8, 5) check (plot_longitude between -180 and 180);
update public.profiles set home_region = 'uk_ireland' where id in (select owner_id from public.lakes);
