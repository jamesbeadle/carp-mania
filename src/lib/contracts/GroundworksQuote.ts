import type { WorkPrice } from '$lib/domain/groundworks/priceDraft';

export interface GroundworksQuote extends WorkPrice {
	failures: string[];
}
