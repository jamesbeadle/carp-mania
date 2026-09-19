export async function loadRatingOf(locals: App.Locals, anglerId: string): Promise<number> {
	const { data } = await locals.supabase.from('angler_summaries').select('rating').eq('id', anglerId).maybeSingle();
	return data ? Number((data as { rating: number }).rating) : 0;
}
