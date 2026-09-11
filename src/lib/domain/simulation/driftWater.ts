import { isReedLine } from '../layout/layoutTypes';
import { polylineLengthFraction } from '../layout/polygonArea';
import { layoutScaleFor } from '../layout/layoutScale';
import { siltFloorFor } from '../sites/siteWater';
import type { Lake } from '../types';
import { clampToScale, colourFromSilt, DailyWaterDrift, transparencyFromSiltAndWeed } from '../waterQuality';

export const WorksDisturbance = { SettlesPerDay: 2 } as const;
export const ReedBeds = { QualityPerHundredFeet: 1, MaximumQuality: 5 } as const;
export const Aerator = { QualityPerDay: 1 } as const;

export function driftWaterForOneDay(lake: Lake): Lake {
	const siltFloor = siltFloorFor(lake.site_type);
	const clearing = bailiffSiltClearing(lake) + pikeClearing(lake) + reedBedClearing(lake) + aeratorClearing(lake);
	const silt = Math.max(siltFloor, clampToScale(Number(lake.silt) + DailyWaterDrift.SiltRise - clearing));
	const weed = clampToScale(Number(lake.weed) + DailyWaterDrift.WeedRise - bailiffWeedClearing(lake));
	const bank_tidiness = clampToScale(Number(lake.bank_tidiness) + bankChange(lake));
	const disturbance = Math.max(0, Number(lake.disturbance) - WorksDisturbance.SettlesPerDay);
	return { ...lake, silt, weed, bank_tidiness, disturbance, transparency: transparencyFromSiltAndWeed(silt + disturbance, weed), water_colour: colourFromSilt(silt + disturbance) };
}

export function hasAerator(lake: Pick<Lake, 'layout'>) {
	return lake.layout.facilities.includes('aerator');
}

function bailiffSiltClearing(lake: Lake) {
	return lake.has_bailiff ? DailyWaterDrift.BailiffSiltClear : 0;
}

function bailiffWeedClearing(lake: Lake) {
	return lake.has_bailiff ? DailyWaterDrift.BailiffWeedClear : 0;
}

function pikeClearing(lake: Lake) {
	return lake.pike_count * DailyWaterDrift.PikeCrayfishClearing;
}

function reedBedClearing(lake: Lake) {
	const scale = layoutScaleFor(Number(lake.plot_acres));
	const reedFeet = lake.layout.features.filter(isReedLine).reduce((total, reeds) => total + polylineLengthFraction(reeds.points) * scale.feetAcross, 0);
	return Math.min(ReedBeds.MaximumQuality, (reedFeet / 100) * ReedBeds.QualityPerHundredFeet) * 0.1;
}

function aeratorClearing(lake: Lake) {
	return hasAerator(lake) ? Aerator.QualityPerDay * 0.1 : 0;
}

function bankChange(lake: Lake) {
	return lake.has_bailiff ? DailyWaterDrift.BailiffBankTidy : -DailyWaterDrift.UntendedBankDecline;
}
