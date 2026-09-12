select test.sign_up(1);
update public.profiles set money = 4200 where id = test.player(1);

insert into public.lakes (id, owner_id, name, acres, water_colour, transparency, weed, silt, bank_tidiness, day_ticket_fee, reputation, feed_stock)
values (test.player(1), test.player(1), 'Grandfather''s Water', 10, 40, 60, 30, 25, 60, 20, 20, '{}'::jsonb);

insert into public.swims (lake_id, name, position_x, position_y, bed_type, depth_feet, feature) values
	(test.player(1), 'The Point', 0.18, 0.22, 'gravel', 6, 'open_water'),
	(test.player(1), 'Reeds', 0.08, 0.55, 'silt', 4, 'reed_line'),
	(test.player(1), 'Snag Bay', 0.3, 0.84, 'clay', 8, 'snag'),
	(test.player(1), 'Island Margin', 0.62, 0.3, 'gravel', 5, 'island_margin'),
	(test.player(1), 'Weedy Corner', 0.86, 0.7, 'silt', 7, 'weed_bed'),
	(test.player(1), 'Dam Wall', 0.92, 0.35, 'clay', 12, 'open_water'),
	(test.player(1), 'Car Park Swim', 0.5, 0.92, 'gravel', 9, 'open_water');

insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition) values
	(test.player(1), 'Old Scaly', 'mirror', 14.5, 6, 70),
	(test.player(1), 'The Ghost', 'ghost', 12.25, 5, 65),
	(test.player(1), 'Bruiser', 'common', 11, 4, 80);
