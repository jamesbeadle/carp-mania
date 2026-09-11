import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import type { RequestHandler } from './$types';

const HttpStatus = { Unauthorised: 401, ServerError: 500 } as const;

export const GET: RequestHandler = async ({ request }) => {
	if (!isTheScheduler(request)) error(HttpStatus.Unauthorised, 'This path is for the scheduler');
	const { data: closed, error: closingError } = await trustedSupabase().rpc('close_ended_listings');
	if (closingError) error(HttpStatus.ServerError, closingError.message);
	return json({ closed });
};

function isTheScheduler(request: Request) {
	const secret = env.CRON_SECRET;
	if (!secret) return false;
	return request.headers.get('authorization') === `Bearer ${secret}`;
}
