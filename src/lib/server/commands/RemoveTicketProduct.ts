import { fail } from '@sveltejs/kit';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const ProductField = 'productId';
const KeepOneProduct = 'A water needs at least one ticket on sale';

export async function RemoveTicketProduct(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const productId = String(formData.get(ProductField) ?? '');
	const { count } = await locals.supabase.from('ticket_products').select('id', { count: 'exact', head: true }).eq('lake_id', lake.id).eq('is_on_sale', true).neq('id', productId);
	if ((count ?? 0) === 0) return fail(400, { message: KeepOneProduct });
	const { error } = await locals.supabase.from('ticket_products').delete().eq('id', productId).eq('lake_id', lake.id);
	if (error) return fail(400, { message: error.message });
	return { message: 'Ticket taken off the book' };
}

export async function SetBarbedRule(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const isBanned = formData.get('isBarbedBanned') === 'true';
	const { error } = await locals.supabase.from('lakes').update({ is_barbed_banned: isBanned }).eq('id', lake.id);
	if (error) return fail(400, { message: error.message });
	return { message: isBanned ? 'Barbed hooks are banned on this water' : 'Barbed hooks are allowed again' };
}
