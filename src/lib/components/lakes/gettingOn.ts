import type { Lake } from '$lib/domain/types';
import { dayWords, nextFreeDay, type DiaryDay } from '$lib/domain/water/bookings';
import { isSyndicateWater, placesOnSale } from '$lib/domain/water/syndicate';

const OnePlace = 1;

const Label = 'Getting on';

export function gettingOnStat(lake: Lake, diary: DiaryDay[], now: Date) {
	const isASyndicate = isSyndicateWater(lake);
	if (isASyndicate) return { label: Label, value: 'Syndicate', caption: syndicatePlacesWords(placesOnSale(lake)) };
	if (!lake.is_booking_on) return { label: Label, value: 'Walk on', caption: 'buy a ticket when you arrive' };
	const nextFree = nextFreeDay(diary);
	return { label: Label, value: 'Booking', caption: nextFree ? `next free peg ${dayWords(nextFree, now).toLowerCase()}` : 'full for the week' };
}

function syndicatePlacesWords(places: number) {
	if (places === 0) return 'full for the year, no day tickets';
	return `${places} ${places === OnePlace ? 'place' : 'places'} left this year`;
}
