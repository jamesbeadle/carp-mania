import { emptyFeedStock } from '../feed';
import type { Lake } from '../types';

export type UntendedWater = Pick<Lake, 'has_bailiff' | 'pike_count' | 'pike_food' | 'feed_stock' | 'shop_tier' | 'is_barbed_banned' | 'is_booking_on' | 'syndicate_places_for_sale' | 'syndicate_price'>;

export function untendedWater(): UntendedWater {
	return { has_bailiff: false, pike_count: 0, pike_food: 0, feed_stock: emptyFeedStock(), shop_tier: 'starter', is_barbed_banned: false, is_booking_on: false, syndicate_places_for_sale: 0, syndicate_price: 0 };
}
