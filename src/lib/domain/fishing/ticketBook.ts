export type TicketKind = 'day' | 'night' | 'twenty_four_hours' | 'multi_day';

export interface TicketProduct {
	id: string;
	lake_id: string;
	kind: TicketKind;
	days: number;
	price: number;
	is_on_sale: boolean;
}

export interface TicketKindProfile {
	label: string;
	fromHour: number;
	toHour: number;
	words: string;
}

export const TicketKinds: TicketKind[] = ['day', 'night', 'twenty_four_hours', 'multi_day'];
export const HoursInADay = 24;
export const DayTicketHoursPerPrice = 12;
export const MultiDay = { FewestDays: 2, MostDays: 7 } as const;
export const TicketPrice = { Lowest: 0, Highest: 500 } as const;
const TwentyFourHourFactor = 2.5;
const PriceStep = 5;

export const TicketKindCatalogue: Record<TicketKind, TicketKindProfile> = {
	day: { label: 'Day', fromHour: 7, toHour: 19, words: 'Seven till seven. The tail of the morning; the evening is given away.' },
	night: { label: 'Night', fromHour: 19, toHour: 31, words: 'Seven in the evening till seven in the morning. Into the dark and out the other side.' },
	twenty_four_hours: { label: '24 hours', fromHour: 7, toHour: 31, words: 'A full day and night. Both magic windows are in it.' },
	multi_day: { label: 'Multi-day', fromHour: 7, toHour: 31, words: 'Several 24-hour sits on one ticket, taken one after another.' }
};

export function hoursOf(kind: TicketKind) {
	const profile = TicketKindCatalogue[kind];
	return profile.toHour - profile.fromHour;
}

export function daysOf(product: Pick<TicketProduct, 'kind' | 'days'>) {
	return product.kind === 'multi_day' ? Math.max(MultiDay.FewestDays, product.days) : 1;
}

export function ticketCostOf(product: Pick<TicketProduct, 'kind' | 'days' | 'price'>) {
	return Number(product.price) * daysOf(product);
}

export function pricePerTwelveHours(product: Pick<TicketProduct, 'kind' | 'price'>) {
	return (Number(product.price) / hoursOf(product.kind)) * DayTicketHoursPerPrice;
}

export function productLabel(product: Pick<TicketProduct, 'kind' | 'days'>) {
	if (product.kind === 'multi_day') return `${daysOf(product)} days`;
	return TicketKindCatalogue[product.kind].label;
}

export function defaultBookFor(lakeId: string, dayTicketFee: number): Omit<TicketProduct, 'id'>[] {
	const twentyFourHours = Math.round((dayTicketFee * TwentyFourHourFactor) / PriceStep) * PriceStep;
	return [
		{ lake_id: lakeId, kind: 'day', days: 1, price: dayTicketFee, is_on_sale: true },
		{ lake_id: lakeId, kind: 'twenty_four_hours', days: 1, price: twentyFourHours, is_on_sale: true }
	];
}

export function cheapestOnSale(book: TicketProduct[]): TicketProduct | null {
	const onSale = book.filter((product) => product.is_on_sale);
	return onSale.reduce<TicketProduct | null>((cheapest, product) => (cheapest === null || Number(product.price) < Number(cheapest.price) ? product : cheapest), null);
}

export function isTicketKind(value: string): value is TicketKind {
	return (TicketKinds as string[]).includes(value);
}
