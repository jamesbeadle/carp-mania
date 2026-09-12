import { nothingHappened, type WhileYouWereAway } from '../../contracts/WhileYouWereAway';

export interface WaterSummary {
	waterName: string;
	summary: WhileYouWereAway;
}

const Totals = ['daysSimulated', 'anglersVisited', 'fishCaught', 'feesCollected', 'lodgeTakings', 'bailiffWages', 'aeratorRunning', 'heatwaveDays', 'frySpawned'] as const;
const Lists = ['carpTakenByPike', 'carpDiedOfOldAge', 'carpArrived', 'recordsSet', 'worksCompleted'] as const;

export function summariseEstate(waters: WaterSummary[]): WhileYouWereAway {
	const busy = waters.filter((water) => water.summary.daysSimulated > 0);
	if (busy.length === 0) return nothingHappened();
	if (busy.length === 1) return busy[0].summary;
	const combined = nothingHappened();
	for (const total of Totals) combined[total] = busy.reduce((sum, water) => sum + water.summary[total], 0);
	for (const list of Lists) combined[list] = busy.flatMap((water) => water.summary[list].map((line) => `${water.waterName}: ${line}`));
	combined.daysSimulated = Math.max(...busy.map((water) => water.summary.daysSimulated));
	return combined;
}
