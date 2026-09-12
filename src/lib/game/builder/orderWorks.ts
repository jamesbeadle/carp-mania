import type { WorkDraft } from '$lib/domain/groundworks/workKinds';

const OrderRoute = '/lake/works/order';
const OrderNotPlaced = 'The order did not go through — try again';

export type OrderOutcome = { workId: string; message?: undefined } | { message: string; workId?: undefined };

export async function orderWorks(draft: WorkDraft): Promise<OrderOutcome> {
	try {
		const response = await fetch(OrderRoute, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ draft })
		});
		return (await response.json()) as OrderOutcome;
	} catch {
		return { message: OrderNotPlaced };
	}
}
