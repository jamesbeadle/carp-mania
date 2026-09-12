import type { RecordsBroken } from './fame';

export interface StandingRecords {
	lakeRecordLb: number;
	regionRecordLb: number;
	worldRecordLb: number;
}

export function recordsBrokenBy(weightLb: number, standing: StandingRecords): RecordsBroken {
	return {
		isLakeRecord: weightLb > standing.lakeRecordLb,
		isRegionRecord: weightLb > standing.regionRecordLb,
		isWorldRecord: weightLb > standing.worldRecordLb
	};
}

export function raiseRecords(weightLb: number, standing: StandingRecords): StandingRecords {
	return {
		lakeRecordLb: Math.max(standing.lakeRecordLb, weightLb),
		regionRecordLb: Math.max(standing.regionRecordLb, weightLb),
		worldRecordLb: Math.max(standing.worldRecordLb, weightLb)
	};
}

export function noRecordsYet(): StandingRecords {
	return { lakeRecordLb: 0, regionRecordLb: 0, worldRecordLb: 0 };
}
