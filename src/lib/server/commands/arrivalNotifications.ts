import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Notification } from '$lib/domain/worldTypes';
import { formatWeight } from '$lib/format/weight';

export type NewNotification = Omit<Notification, 'id' | 'created_at' | 'read_at'>;

export function arrivalNotifications(profileId: string, outcomes: DayOutcome[]): NewNotification[] {
	const arrived = outcomes.flatMap((day) => day.arrivedCarp).map((fish) => ({
		profile_id: profileId,
		kind: 'arrived' as const,
		title: `${fish.name} has arrived`,
		body: fish.quarantine_until ? `${fish.name} is in the lake and in quarantine until it settles.` : `${fish.name} is in the lake and ready to be fished for.`,
		link: `/carp/${fish.id}`
	}));
	const released = outcomes.flatMap((day) => day.carpOutOfQuarantine).map((fish) => ({
		profile_id: profileId,
		kind: 'quarantine_over' as const,
		title: `${fish.name} is out of quarantine`,
		body: `${fish.name} can be fished for again.`,
		link: `/carp/${fish.id}`
	}));
	const bigFish = visitorsBigFishNotifications(profileId, outcomes);
	return [...arrived, ...released, ...bigFish];
}

function visitorsBigFishNotifications(profileId: string, outcomes: DayOutcome[]): NewNotification[] {
	const anglersBestLb = outcomes[0].records.lakeRecordLb;
	const biggestLb = outcomes[outcomes.length - 1].records.lakeRecordLb;
	if (biggestLb <= anglersBestLb) return [];
	return [{ profile_id: profileId, kind: 'big_catch_on_your_water', title: `A visitor had ${formatWeight(biggestLb)} from your water`, body: 'Bigger than any angler has had here — the lake record is there for the taking.', link: '/lake' }];
}
