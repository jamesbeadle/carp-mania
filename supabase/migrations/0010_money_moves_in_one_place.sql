create or replace function public.settle_day_takings(player uuid, pounds numeric) returns void
language sql security definer set search_path = public as $$
	update public.profiles set money = greatest(0, money + pounds) where id = player;
$$;

revoke execute on function public.settle_day_takings(uuid, numeric) from public, anon, authenticated;
grant execute on function public.debit_money(uuid, numeric, text), public.credit_money(uuid, numeric), public.settle_day_takings(uuid, numeric)
	to service_role;
