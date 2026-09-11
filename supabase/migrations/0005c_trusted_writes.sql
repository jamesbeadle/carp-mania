drop policy "owners manage carp" on public.carp;
drop policy "owners manage swims" on public.swims;
drop policy "owners record simulated catches" on public.catches;
drop policy "owners record simulated visits" on public.lake_visits;
revoke insert, update, delete on public.carp from authenticated;
revoke insert, update, delete on public.swims from authenticated;

revoke update on public.lakes from authenticated;
grant update (name, day_ticket_fee, is_public) on public.lakes to authenticated;

revoke update on public.profiles from authenticated;
grant update (display_name, saved_rods) on public.profiles to authenticated;

alter table public.carp_transfers enable row level security;
create policy "transfers follow the visibility of the lakes they touch" on public.carp_transfers
	for select to authenticated using (public.is_lake_visible(from_lake_id) or public.is_lake_visible(to_lake_id));

create or replace function public.pounds_sterling(amount numeric) returns text
language sql immutable as $$
	select '£' || to_char(round(amount), 'FM999,999,999,990');
$$;

create or replace function public.debit_money(player uuid, pounds numeric, purpose text) returns void
language plpgsql security definer set search_path = public as $$
declare
	balance numeric;
begin
	select money into balance from public.profiles where id = player for update;
	if balance is null then raise exception 'No angler is signed in'; end if;
	if balance < pounds then
		raise exception '% costs % and you have %', purpose, public.pounds_sterling(pounds), public.pounds_sterling(balance);
	end if;
	update public.profiles set money = money - pounds where id = player;
end;
$$;

create or replace function public.credit_money(player uuid, pounds numeric) returns void
language sql security definer set search_path = public as $$
	update public.profiles set money = money + pounds where id = player;
$$;

revoke execute on function public.debit_money(uuid, numeric, text), public.credit_money(uuid, numeric)
	from public, anon, authenticated;
