import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

let trustedClient: SupabaseClient | null = null;

export function trustedSupabase(): SupabaseClient {
	if (trustedClient) return trustedClient;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set — the server needs it to write the world on the players\' behalf');
	trustedClient = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
	return trustedClient;
}
