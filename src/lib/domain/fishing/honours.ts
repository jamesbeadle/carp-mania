import type { RecordsBroken } from '../market/fame';
import { raiseRecords, recordsBrokenBy, type StandingRecords } from '../market/records';

export type HonourKind = 'world_record' | 'region_record' | 'lake_record' | 'personal_best';

export interface Honours extends RecordsBroken {
	isPersonalBest: boolean;
}

export interface TheBar {
	standing: StandingRecords;
	personalBestLb: number;
	pedigreeLb: number;
}

export const HonourWords: Record<HonourKind, string> = {
	world_record: 'World record',
	region_record: 'Region record',
	lake_record: 'Lake record',
	personal_best: 'New personal best'
};

const HonoursInOrder: HonourKind[] = ['world_record', 'region_record', 'lake_record', 'personal_best'];

export function honoursFor(weightLb: number, bar: TheBar): Honours {
	return { ...recordsBrokenBy(weightLb, bar.standing), isPersonalBest: weightLb > bar.personalBestLb };
}

export function raiseTheBar(weightLb: number, bar: TheBar): TheBar {
	return { ...bar, standing: raiseRecords(weightLb, bar.standing), personalBestLb: Math.max(bar.personalBestLb, weightLb) };
}

export function honourKindsOf(honours: Honours): HonourKind[] {
	const held: Record<HonourKind, boolean> = {
		world_record: honours.isWorldRecord,
		region_record: honours.isRegionRecord,
		lake_record: honours.isLakeRecord,
		personal_best: honours.isPersonalBest
	};
	return HonoursInOrder.filter((kind) => held[kind]);
}

export function isARecord(honours: Honours) {
	return honours.isWorldRecord || honours.isRegionRecord || honours.isLakeRecord;
}
