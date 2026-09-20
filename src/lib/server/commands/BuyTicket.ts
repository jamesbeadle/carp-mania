import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { requireUser } from '../gates/requireUser';
import { GetFishingVisit } from '../queries/GetFishingVisit';

const CouldNotBuy = 'Could not buy a ticket';
const NoSeed = 'The ticket came without a seed — the session cannot start';
const NoProduct = '';

export type SessionStart = { visit: FishingVisit } | { refusal: string };

export async function BuyTicket(locals: App.Locals, lakeId: string, productId: string): Promise<SessionStart> {
	requireUser(locals);
	const bought = productId === NoProduct ? await buyTheDayTicket(locals, lakeId) : await buyTheProduct(locals, lakeId, productId);
	if (typeof bought !== 'string') return bought;
	const visit = await GetFishingVisit(locals, lakeId, bought);
	if (!visit) return { refusal: NoSeed };
	return { visit };
}

export async function SitTheNextSession(locals: App.Locals, lakeId: string, visitId: string): Promise<SessionStart> {
	requireUser(locals);
	const { error } = await locals.supabase.rpc('sit_the_next_session', { visit: visitId });
	if (error) return { refusal: error.message };
	const visit = await GetFishingVisit(locals, lakeId, visitId);
	if (!visit) return { refusal: NoSeed };
	return { visit };
}

async function buyTheProduct(locals: App.Locals, lakeId: string, productId: string) {
	const { data: visitId, error } = await locals.supabase.rpc('buy_ticket', { lake: lakeId, product: productId });
	if (error || !visitId) return { refusal: error?.message ?? CouldNotBuy };
	return visitId as string;
}

async function buyTheDayTicket(locals: App.Locals, lakeId: string) {
	const { data: visitId, error } = await locals.supabase.rpc('pay_day_ticket', { lake: lakeId });
	if (error || !visitId) return { refusal: error?.message ?? CouldNotBuy };
	return visitId as string;
}
