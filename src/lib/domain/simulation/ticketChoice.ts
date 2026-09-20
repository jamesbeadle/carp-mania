import { pricePerTwelveHours, ticketCostOf, type TicketProduct } from '../fishing/ticketBook';
import type { RandomFraction } from '../random';
import type { Lake } from '../types';
import { RegionCatalogue } from '../world/regions';

export const TicketDemand = { FloorAffordability: 0.2, NobodyBuysBelow: 0.5 } as const;

export function willingnessToPayFor(reputation: number, region: Lake['region'] = 'uk_ireland') {
	return (10 + reputation * 0.6) * RegionCatalogue[region].willingnessToPayFactor;
}

export function affordabilityOf(product: Pick<TicketProduct, 'kind' | 'price'>, willingness: number) {
	return Math.min(1, willingness / Math.max(1, pricePerTwelveHours(product)));
}

export function bookAffordability(book: TicketProduct[], willingness: number) {
	const onSale = book.filter((product) => product.is_on_sale);
	if (onSale.length === 0) return 0;
	return Math.max(...onSale.map((product) => affordabilityOf(product, willingness)));
}

export function chooseTicket(book: TicketProduct[], willingness: number, random: RandomFraction): TicketProduct | null {
	const wanted = book.filter((product) => product.is_on_sale && affordabilityOf(product, willingness) >= TicketDemand.NobodyBuysBelow);
	if (wanted.length === 0) return null;
	const weights = wanted.map((product) => affordabilityOf(product, willingness));
	const total = weights.reduce((sum, weight) => sum + weight, 0);
	let roll = random() * total;
	for (const [index, product] of wanted.entries()) {
		roll -= weights[index];
		if (roll <= 0) return product;
	}
	return wanted[wanted.length - 1];
}

export function feeFor(product: TicketProduct | null, fallbackFee: number) {
	return product ? ticketCostOf(product) : fallbackFee;
}
