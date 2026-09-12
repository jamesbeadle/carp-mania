export interface BookedWindow {
	startsAt: string;
	endsAt: string;
}

export function isBookedOut(bookings: BookedWindow[], dayStart: Date, dayEnd: Date) {
	return bookings.some((booking) => new Date(booking.startsAt) < dayEnd && new Date(booking.endsAt) > dayStart);
}
