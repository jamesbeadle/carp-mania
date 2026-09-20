import { productLabel, ticketCostOf, type TicketProduct } from '$lib/domain/fishing/ticketBook';
import { formatMoney } from '$lib/format/money';

const NoneOnSale = '—';

export function ticketsFromStat(book: TicketProduct[]) {
	const onSale = book.filter((product) => product.is_on_sale);
	const cheapest = onSale.reduce<TicketProduct | null>(cheaperOf, null);
	if (cheapest === null) return { label: 'Tickets from', value: NoneOnSale, caption: 'none on sale' };
	return { label: 'Tickets from', value: formatMoney(ticketCostOf(cheapest)), caption: productLabel(cheapest).toLowerCase() };
}

function cheaperOf(cheapest: TicketProduct | null, product: TicketProduct) {
	if (cheapest === null) return product;
	return ticketCostOf(product) < ticketCostOf(cheapest) ? product : cheapest;
}
