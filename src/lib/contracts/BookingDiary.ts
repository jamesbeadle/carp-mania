import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
import type { Swim } from '$lib/domain/types';
import type { DiaryDay, PegBooking } from '$lib/domain/water/bookings';
import type { SyndicatePlace } from '$lib/domain/water/syndicate';

export interface BookingDiary {
	days: DiaryDay[];
	swims: Swim[];
	book: TicketProduct[];
	myBookings: PegBooking[];
	places: SyndicatePlace[];
	isMember: boolean;
}
