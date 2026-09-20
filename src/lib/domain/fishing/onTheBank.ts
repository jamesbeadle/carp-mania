import { DayTicket, isDayTicketStillValid } from './dayTicket';

export interface VisitOnTheBank {
	anglerId: string;
	anglerName: string;
	arrivedAt: string;
	fishCaught: number;
}

const MillisecondsPerHour = 60 * 60 * 1000;

export function onTheBankSince(now: Date) {
	return new Date(now.getTime() - DayTicket.ValidForHours * MillisecondsPerHour);
}

export function anglersOnTheBank(visits: VisitOnTheBank[], now: Date): VisitOnTheBank[] {
	const live = visits.filter((visit) => isDayTicketStillValid(visit.arrivedAt, now));
	const latestFirst = [...live].sort(byArrivalLatestFirst);
	const seen = new Set<string>();
	return latestFirst.filter((visit) => {
		if (seen.has(visit.anglerId)) return false;
		seen.add(visit.anglerId);
		return true;
	});
}

export function fishOutBetween(anglers: VisitOnTheBank[]) {
	return anglers.reduce((total, angler) => total + angler.fishCaught, 0);
}

function byArrivalLatestFirst(one: VisitOnTheBank, other: VisitOnTheBank) {
	return new Date(other.arrivedAt).getTime() - new Date(one.arrivedAt).getTime();
}
