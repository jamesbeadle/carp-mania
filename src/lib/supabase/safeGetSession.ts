import type { SupabaseClient } from '@supabase/supabase-js';

export async function safeGetSession(supabase: SupabaseClient) {
	const {
		data: { session }
	} = await supabase.auth.getSession();
	if (!session) return { session: null, user: null };

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error) return { session: null, user: null };

	return { session, user };
}
