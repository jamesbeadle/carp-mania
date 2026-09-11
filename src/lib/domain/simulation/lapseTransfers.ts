import type { Carp } from '../types';

export interface LapsedTransfers {
	carp: Carp[];
	arrived: Carp[];
	outOfQuarantine: Carp[];
}

export function lapseTransfersForOneDay(carp: Carp[], at: Date): LapsedTransfers {
	const arrived: Carp[] = [];
	const outOfQuarantine: Carp[] = [];
	const lapsed = carp.map((fish) => {
		let updated = fish;
		if (hasLapsed(fish.transit_until, at)) {
			updated = { ...updated, transit_until: null };
			arrived.push(updated);
		}
		if (updated.transit_until === null && hasLapsed(fish.quarantine_until, at)) {
			updated = { ...updated, quarantine_until: null };
			outOfQuarantine.push(updated);
		}
		return updated;
	});
	return { carp: lapsed, arrived, outOfQuarantine };
}

export function isFishable(carp: Pick<Carp, 'transit_until' | 'quarantine_until'>) {
	return carp.transit_until === null && carp.quarantine_until === null;
}

function hasLapsed(until: string | null, at: Date) {
	return until !== null && new Date(until).getTime() <= at.getTime();
}
