-- Brands offer a lump sum to put their name on the boards round a good water, six months at a time, up to three years.

create table public.lake_sponsorship_offers (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	brand text not null,
	term_months integer not null check (term_months in (6, 12, 18, 24, 30, 36)),
	amount numeric(10, 2) not null check (amount > 0),
	offered_at timestamptz not null default now(),
	expires_at timestamptz not null,
	status text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'expired', 'superseded'))
);
create index lake_sponsorship_offers_by_lake on public.lake_sponsorship_offers (lake_id, status);
alter table public.lake_sponsorship_offers enable row level security;
create policy "owners read the offers on their water" on public.lake_sponsorship_offers for select to authenticated
	using (exists (select 1 from public.lakes where lakes.id = lake_id and lakes.owner_id = auth.uid()));

create table public.lake_sponsorships (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	offer_id uuid references public.lake_sponsorship_offers (id) on delete set null,
	brand text not null,
	term_months integer not null,
	amount numeric(10, 2) not null,
	signed_at timestamptz not null default now(),
	runs_from timestamptz not null,
	runs_until timestamptz not null
);
create index lake_sponsorships_by_lake on public.lake_sponsorships (lake_id, runs_until desc);
alter table public.lake_sponsorships enable row level security;
create policy "the boards are there for everyone to see" on public.lake_sponsorships for select to authenticated using (true);

alter table public.lakes add column sponsor_brand text, add column sponsored_until timestamptz;

create or replace function public.refresh_lake_sponsor(lake uuid) returns void
language sql security definer set search_path = public as $$
	update public.lakes set
		sponsor_brand = (select brand from public.lake_sponsorships where lake_id = lake and runs_from <= now() and runs_until > now() order by runs_until desc limit 1),
		sponsored_until = (select runs_until from public.lake_sponsorships where lake_id = lake and runs_from <= now() and runs_until > now() order by runs_until desc limit 1)
	where id = lake;
$$;

create or replace function public.accept_lake_sponsorship(offer uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	fishery_days_per_month constant integer := 30;
	the_offer public.lake_sponsorship_offers;
	owner uuid;
	running_until timestamptz;
	starts timestamptz;
	deal_id uuid;
begin
	select * into the_offer from public.lake_sponsorship_offers where id = offer for update;
	if the_offer.id is null then raise exception 'That offer is not on the table'; end if;
	select owner_id into owner from public.lakes where id = the_offer.lake_id;
	if owner is null or owner <> auth.uid() then raise exception 'Only the owner can sign for the water'; end if;
	if the_offer.status <> 'open' or the_offer.expires_at <= now() then raise exception 'That offer has lapsed'; end if;
	select max(runs_until) into running_until from public.lake_sponsorships where lake_id = the_offer.lake_id and runs_until > now();
	starts := greatest(now(), coalesce(running_until, now()));
	insert into public.lake_sponsorships (lake_id, offer_id, brand, term_months, amount, runs_from, runs_until)
	values (the_offer.lake_id, the_offer.id, the_offer.brand, the_offer.term_months, the_offer.amount, starts, starts + make_interval(hours => the_offer.term_months * fishery_days_per_month))
	returning id into deal_id;
	perform public.credit_money(owner, the_offer.amount);
	update public.lake_sponsorship_offers set status = 'accepted' where id = the_offer.id;
	update public.lake_sponsorship_offers set status = 'superseded' where lake_id = the_offer.lake_id and status = 'open';
	perform public.refresh_lake_sponsor(the_offer.lake_id);
	return deal_id;
end;
$$;

create or replace function public.reject_lake_sponsorship(offer uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	the_offer public.lake_sponsorship_offers;
	owner uuid;
begin
	select * into the_offer from public.lake_sponsorship_offers where id = offer for update;
	if the_offer.id is null then raise exception 'That offer is not on the table'; end if;
	select owner_id into owner from public.lakes where id = the_offer.lake_id;
	if owner is null or owner <> auth.uid() then raise exception 'Only the owner can turn an offer down'; end if;
	if the_offer.status <> 'open' then raise exception 'That offer is no longer open'; end if;
	update public.lake_sponsorship_offers set status = 'rejected' where id = the_offer.id;
end;
$$;

revoke execute on function public.refresh_lake_sponsor(uuid) from public, anon, authenticated;
grant execute on function public.refresh_lake_sponsor(uuid) to service_role;
grant execute on function public.accept_lake_sponsorship(uuid), public.reject_lake_sponsorship(uuid) to authenticated;
grant select on public.lake_sponsorship_offers, public.lake_sponsorships to authenticated;
