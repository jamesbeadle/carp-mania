import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
import { requireUser } from '../gates/requireUser';

export async function GetTicketBook(locals: App.Locals, lakeId: string): Promise<TicketProduct[]> {
	requireUser(locals);
	const { data } = await locals.supabase.from('ticket_products').select('*').eq('lake_id', lakeId).order('created_at');
	return ((data ?? []) as TicketProduct[]).map(withNumbers);
}

function withNumbers(product: TicketProduct): TicketProduct {
	return { ...product, price: Number(product.price), days: Number(product.days) };
}
