import type { PegBooking } from '$lib/domain/water/bookings';

export interface MyDiaryEntry {
	booking: PegBooking;
	lakeName: string;
	swimName: string;
}
