-- Sponsors write to a water with standing: a rating of fifty, thirty fishery days open and a hundred fish.
-- The day the gates opened is recorded so the days can be counted; waters already open count from the day they were dug.

alter table public.lakes add column opened_at timestamptz;
update public.lakes set opened_at = created_at where is_setup_complete;
