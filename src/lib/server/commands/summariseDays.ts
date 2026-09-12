import type { WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { draftOf } from '$lib/domain/groundworks/worksLedger';
import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';

export function summariseDays(outcomes: DayOutcome[]): WhileYouWereAway {
	const firstRecords = outcomes[0].records;
	const lastRecords = outcomes[outcomes.length - 1].records;
	return {
		daysSimulated: outcomes.length,
		anglersVisited: sum(outcomes, (day) => day.visits.length),
		fishCaught: sum(outcomes, (day) => day.catches.length),
		feesCollected: sum(outcomes, (day) => day.feesCollected),
		lodgeTakings: sum(outcomes, (day) => day.lodgeTakings),
		bailiffWages: sum(outcomes, (day) => day.bailiffWages),
		aeratorRunning: sum(outcomes, (day) => day.aeratorRunning),
		carpTakenByPike: outcomes.flatMap((day) => day.carpTakenByPike.map((fish) => fish.name)),
		carpDiedOfOldAge: outcomes.flatMap((day) => day.carpDiedOfOldAge.map((fish) => fish.name)),
		carpArrived: outcomes.flatMap((day) => day.arrivedCarp.map((fish) => fish.name)),
		heatwaveDays: outcomes.filter((day) => day.isHeatwave).length,
		recordsSet: recordsSetBetween(firstRecords.lakeRecordLb, lastRecords.lakeRecordLb),
		worksCompleted: outcomes.flatMap((day) => day.worksCompleted.map((work) => workLabelFor(draftOf(work)))),
		frySpawned: sum(outcomes, (day) => day.spawned.length)
	};
}

function recordsSetBetween(before: number, after: number) {
	return after > before ? [`Lake record now ${after} lb`] : [];
}

function sum(outcomes: DayOutcome[], pick: (day: DayOutcome) => number) {
	return outcomes.reduce((total, day) => total + pick(day), 0);
}
