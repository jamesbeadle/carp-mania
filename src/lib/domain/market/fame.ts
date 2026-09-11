export const FameGain = {
	CaughtByPlayer: 3,
	CaughtByNpcAtOrAboveLb: 20,
	CaughtByNpc: 1,
	LakeRecord: 10,
	RegionRecord: 25,
	WorldRecord: 50,
	PersonalBest: 2
} as const;

export interface RecordsBroken {
	isLakeRecord: boolean;
	isRegionRecord: boolean;
	isWorldRecord: boolean;
}

export function fameForNpcCatch(weightLb: number, records: RecordsBroken) {
	const catchFame = weightLb >= FameGain.CaughtByNpcAtOrAboveLb ? FameGain.CaughtByNpc : 0;
	return catchFame + fameForRecords(records);
}

export function fameForPlayerCatch(records: RecordsBroken, isPersonalBest: boolean) {
	return FameGain.CaughtByPlayer + fameForRecords(records) + (isPersonalBest ? FameGain.PersonalBest : 0);
}

export function fameForRecords(records: RecordsBroken) {
	return (records.isLakeRecord ? FameGain.LakeRecord : 0) + (records.isRegionRecord ? FameGain.RegionRecord : 0) + (records.isWorldRecord ? FameGain.WorldRecord : 0);
}
