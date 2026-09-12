select id as legacy_lake from public.lakes where owner_id = test.player(1) \gset

select test.assert_that((select layout ->> 'version' from public.lakes where id = :'legacy_lake') = '1', 'the classic layout is version 1');
select test.assert_that((select layout ->> 'baseBed' from public.lakes where id = :'legacy_lake') = 'gravel', 'the classic bed is gravel');
select test.assert_that((select layout ->> 'baseDepthFeet' from public.lakes where id = :'legacy_lake') = '7', 'the classic depth is 7 ft');
select test.assert_that((select jsonb_array_length(layout -> 'outline') from public.lakes where id = :'legacy_lake') = 14, 'the classic outline has 14 points');
select test.assert_that((select jsonb_array_length(layout -> 'islands') from public.lakes where id = :'legacy_lake') = 1, 'the classic lake has its island');
select test.assert_that((select layout -> 'islands' -> 0 ->> 'name' from public.lakes where id = :'legacy_lake') = 'The Island', 'the island keeps its name');
select test.assert_that((select jsonb_array_length(layout -> 'bedPatches') from public.lakes where id = :'legacy_lake') = 7, 'a bed patch per classic swim');
select test.assert_that((select jsonb_array_length(layout -> 'depthZones') from public.lakes where id = :'legacy_lake') = 7, 'a depth zone per classic swim');
select test.assert_that((select jsonb_array_length(layout -> 'features') from public.lakes where id = :'legacy_lake') = 3, 'reeds, a snag and a weed bed');
select test.assert_that(
	(select count(*) from public.lakes, jsonb_array_elements(layout -> 'bedPatches') as patch where id = :'legacy_lake' and patch ->> 'bed' = 'silt') = 2,
	'the two silty swims keep their silt'
);
select test.assert_that((select jsonb_array_length(layout -> 'facilities') from public.lakes where id = :'legacy_lake') = 0, 'no facilities yet');

select test.assert_that((select acres from public.lakes where id = :'legacy_lake') = 5.39, 'acres is now the water acreage of the classic layout');
select test.assert_that((select plot_acres from public.lakes where id = :'legacy_lake') = 10, 'the plot is the old ten acres');
select test.assert_that((select site_type from public.lakes where id = :'legacy_lake') = 'classic', 'grandfathered as classic');
select test.assert_that((select region from public.lakes where id = :'legacy_lake') = 'uk_ireland', 'at home in the UK');
select test.assert_that((select latitude is null and longitude is null from public.lakes where id = :'legacy_lake'), 'not yet pinned');
select test.assert_that((select is_setup_complete from public.lakes where id = :'legacy_lake'), 'the gates are open');
select test.assert_that((select fertility = 50 and disturbance = 0 from public.lakes where id = :'legacy_lake'), 'settled water');

select test.assert_that(
	(select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'swims'
		and column_name in ('bed_type', 'depth_feet', 'feature')) = 0,
	'swims no longer carry terrain'
);
select test.assert_that((select count(*) from public.swims where lake_id = :'legacy_lake') = 7, 'the seven classic swims remain');
select test.assert_that(
	(select count(*) from public.carp where lake_id = :'legacy_lake' and origin = 'classic' and origin_lake_id = :'legacy_lake' and fame = 0 and is_catalogued) = 3,
	'classic carp are catalogued classics from this water'
);
select test.assert_that(
	(select column_default from information_schema.columns where table_schema = 'public' and table_name = 'lakes' and column_name = 'layout') is null,
	'new lakes must bring their own layout'
);
select test.sign_up(60);
select test.assert_refused(
	$$insert into public.lakes (owner_id, name, acres, water_colour, transparency, weed, silt, bank_tidiness, day_ticket_fee, reputation, feed_stock)
		values (test.player(60), 'No Plan', 1, 1, 1, 1, 1, 1, 1, 1, '{}'::jsonb)$$,
	'"layout"'
);
