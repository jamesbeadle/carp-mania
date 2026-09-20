import { isReedLine } from '../layout/layoutTypes';
import { polylineLengthFraction } from '../layout/polygonArea';
import { layoutScaleFor } from '../layout/layoutScale';
import { siltFloorFor } from '../sites/siteWater';
import type { Lake } from '../types';
import { teamClearingShare, type Bailiff } from '../bailiffs/bailiffTeam';

type Team = Pick<Bailiff, 'performance'>[];
const NoTeam: Team = [];
const FlagBailiffPerformance = 70;
import { clampToScale, colourFromSilt, DailyWaterDrift, transparencyFromSiltAndWeed } from '../waterQuality';

export const WorksDisturbance = { SettlesPerDay: 2 } as const;
export const ReedBeds = { QualityPerHundredFeet: 1, MaximumQuality: 5 } as const;
export const Aerator = { QualityPerDay: 1 } as const;

export function driftWaterForOneDay(lake: Lake, team: Team = teamOf(lake)): Lake {
	const siltFloor = siltFloorFor(lake.site_type);
	const bailiffing = teamClearingShare(team, Number(lake.acres));
	const clearing = DailyWaterDrift.BailiffSiltClear * bailiffing + pikeClearing(lake) + reedBedClearing(lake) + aeratorClearing(lake);
	const silt = Math.max(siltFloor, clampToScale(Number(lake.silt) + DailyWaterDrift.SiltRise - clearing));
	const weed = clampToScale(Number(lake.weed) + DailyWaterDrift.WeedRise - DailyWaterDrift.BailiffWeedClear * bailiffing);
	const bank_tidiness = clampToScale(Number(lake.bank_tidiness) + bankChange(bailiffing));
	const disturbance = Math.max(0, Number(lake.disturbance) - WorksDisturbance.SettlesPerDay);
	return { ...lake, silt, weed, bank_tidiness, disturbance, transparency: transparencyFromSiltAndWeed(silt + disturbance, weed), water_colour: colourFromSilt(silt + disturbance) };
}

export function hasAerator(lake: Pick<Lake, 'layout'>) {
	return lake.layout.facilities.includes('aerator');
}

function teamOf(lake: Pick<Lake, 'has_bailiff'>): Team {
	return lake.has_bailiff ? [{ performance: FlagBailiffPerformance }] : NoTeam;
}

function pikeClearing(lake: Lake) {
	return lake.pike_count * DailyWaterDrift.PikeCrayfishClearing;
}

function reedBedClearing(lake: Lake) {
	const scale = layoutScaleFor(Number(lake.plot_acres));
	const reedLines = lake.layout.features.filter(isReedLine);
	const reedFeet = reedLines.reduce((total, reeds) => total + polylineLengthFraction(reeds.points) * scale.feetAcross, 0);
	return Math.min(ReedBeds.MaximumQuality, (reedFeet / 100) * ReedBeds.QualityPerHundredFeet) * 0.1;
}

function aeratorClearing(lake: Lake) {
	return hasAerator(lake) ? Aerator.QualityPerDay * 0.1 : 0;
}

function bankChange(bailiffing: number) {
	if (bailiffing === 0) return -DailyWaterDrift.UntendedBankDecline;
	return DailyWaterDrift.BailiffBankTidy * bailiffing;
}
