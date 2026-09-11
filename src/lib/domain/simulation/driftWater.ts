import type { Lake } from '../types';
import { clampToScale, colourFromSilt, DailyWaterDrift, transparencyFromSiltAndWeed } from '../waterQuality';

export function driftWaterForOneDay(lake: Lake): Lake {
	const silt = clampToScale(lake.silt + DailyWaterDrift.SiltRise - bailiffSiltClearing(lake) - pikeClearing(lake));
	const weed = clampToScale(lake.weed + DailyWaterDrift.WeedRise - bailiffWeedClearing(lake));
	const bank_tidiness = clampToScale(lake.bank_tidiness + bankChange(lake));
	return { ...lake, silt, weed, bank_tidiness, transparency: transparencyFromSiltAndWeed(silt, weed), water_colour: colourFromSilt(silt) };
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

function bankChange(lake: Lake) {
	return lake.has_bailiff ? DailyWaterDrift.BailiffBankTidy : -DailyWaterDrift.UntendedBankDecline;
}
