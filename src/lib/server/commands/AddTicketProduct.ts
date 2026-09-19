import { fail } from '@sveltejs/kit';
import { MultiDay, TicketKinds, TicketPrice, productLabel, type TicketKind } from '$lib/domain/fishing/ticketBook';
import { formatMoney } from '$lib/format/money';
import { readFormChoice, readFormNumber } from '../gates/readFormNumber';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const Fields = { Kind: 'kind', Days: 'days', Price: 'price' } as const;
const OneDay = 1;

export async function AddTicketProduct(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const kind = readFormChoice(formData, Fields.Kind, TicketKinds);
	if (kind.failure) return kind.failure;
	const price = readFormNumber(formData, Fields.Price, TicketPrice.Lowest, TicketPrice.Highest);
	if (price.failure) return price.failure;
	const days = readDays(formData, kind.value);
	if (days.failure) return days.failure;

	const product = { lake_id: lake.id, kind: kind.value, days: days.value, price: Math.round(price.value), is_on_sale: true };
	const { error } = await locals.supabase.from('ticket_products').insert(product);
	if (error) return fail(400, { message: error.message });
	return { message: `${productLabel(product)} ticket on sale at ${formatMoney(product.price)}${product.kind === 'multi_day' ? ' a day' : ''}` };
}

function readDays(formData: FormData, kind: TicketKind) {
	if (kind !== 'multi_day') return { value: OneDay, failure: null };
	return readFormNumber(formData, Fields.Days, MultiDay.FewestDays, MultiDay.MostDays);
}
