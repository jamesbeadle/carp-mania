do $schedules$
begin
	if not exists (select 1 from pg_extension where extname = 'pg_cron') then
		raise notice 'pg_cron is not enabled: nothing will close ended listings until it is, or until /cron/close-listings is scheduled on Vercel';
		return;
	end if;
	perform cron.schedule('close-ended-listings', '* * * * *', 'select public.close_ended_listings()');
	perform cron.schedule('purge-old-world-events', '0 * * * *', $purge$delete from public.world_events where created_at < now() - interval '7 days'$purge$);
end
$schedules$;
