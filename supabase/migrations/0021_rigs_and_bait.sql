update public.tackle_owned set item_id = replace(item_id, '-bait-fishmeal_boilie', '-bait-shelf_life_boilie') where item_id like '%-bait-fishmeal_boilie';
update public.tackle_owned set item_id = replace(item_id, '-bait-particle', '-bait-tiger_nut') where item_id like '%-bait-particle';
update public.profiles set saved_rods = replace(replace(saved_rods::text, '-bait-fishmeal_boilie', '-bait-shelf_life_boilie'), '-bait-particle', '-bait-tiger_nut')::jsonb;

create or replace function public.grant_starter_kit(player uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
	perform public.add_tackle(player, 'bankside_basics-rod-2.75-12', 3, null);
	perform public.add_tackle(player, 'bankside_basics-reel-carp_large', 3, null);
	perform public.add_tackle(player, 'bankside_basics-line-15-clear', 3000, null);
	perform public.add_tackle(player, 'bankside_basics-hook-4-micro-matt', 20, null);
	perform public.add_tackle(player, 'bankside_basics-rig-hair_lead_clip', 10, null);
	perform public.add_tackle(player, 'bankside_basics-lead', 20, null);
	perform public.add_tackle(player, 'bankside_basics-tubing-brown', 10, null);
	perform public.add_tackle(player, 'meadowmill-bait-shelf_life_boilie', 300, null);
end;
$$;
