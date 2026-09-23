create schema test;
grant usage on schema test to anon, authenticated, service_role;

create function test.player(player_number integer) returns uuid
language sql immutable as $$
	select ('00000000-0000-0000-0000-' || lpad(player_number::text, 12, '0'))::uuid;
$$;

create function test.sign_up(player_number integer) returns uuid
language sql as $$
	insert into auth.users (id, email, raw_user_meta_data)
	values (test.player(player_number), 'player' || player_number || '@example.com', jsonb_build_object('full_name', 'Player' || player_number || ' Tester'))
	returning id;
$$;

create function test.assert_that(is_true boolean, claim text) returns void
language plpgsql as $$
begin
	if is_true is distinct from true then raise exception 'assertion failed: %', claim; end if;
end;
$$;

create function test.assert_refused(statement text, words text) returns void
language plpgsql as $$
declare
	reason text;
begin
	begin
		execute statement;
	exception when others then
		reason := sqlerrm;
	end;
	if reason is null then raise exception 'expected a refusal mentioning "%" but it went through: %', words, statement; end if;
	if position(words in reason) = 0 then raise exception 'refused for another reason (wanted "%"): %', words, reason; end if;
end;
$$;
