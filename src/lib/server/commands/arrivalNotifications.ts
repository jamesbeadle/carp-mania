import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Notification } from '$lib/domain/worldTypes';

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
		body: `${fish.name} can be fished for and listed again.`,
		link: `/carp/${fish.id}`
	}));
	const records = recordNotifications(profileId, outcomes);
	return [...arrived, ...released, ...records];
}

function recordNotifications(profileId: string, outcomes: DayOutcome[]): NewNotification[] {
	const first = outcomes[0].records;
	const last = outcomes[outcomes.length - 1].records;
	if (last.lakeRecordLb <= first.lakeRecordLb) return [];
	return [{ profile_id: profileId, kind: 'record_set', title: `New lake record: ${last.lakeRecordLb} lb`, body: 'A visiting angler set a new record on your water while you were away.', link: '/lake' }];
}
