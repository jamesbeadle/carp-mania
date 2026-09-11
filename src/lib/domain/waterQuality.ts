export const WaterScale = { Worst: 0, Best: 100 } as const;

export const DailyWaterDrift = {
	SiltRise: 0.6,
	WeedRise: 0.8,
	BailiffSiltClear: 2.5,
	BailiffWeedClear: 3,
	BailiffBankTidy: 4,
	UntendedBankDecline: 1,
	PikeCrayfishClearing: 0.15
} as const;

export function clampToScale(value: number) {
	const rounded = Math.round(value * 100) / 100;
	return Math.min(WaterScale.Best, Math.max(WaterScale.Worst, rounded));
}

export function transparencyFromSiltAndWeed(silt: number, weed: number) {
	return clampToScale(WaterScale.Best - silt * 0.7 - weed * 0.3);
}

export function colourFromSilt(silt: number) {
	return clampToScale(silt * 0.9);
}

export function overallWaterQuality(transparency: number, weed: number, silt: number) {
	const healthyWeed = WaterScale.Best - Math.abs(weed - 30) * 1.5;
	return clampToScale((transparency + healthyWeed + (WaterScale.Best - silt)) / 3);
}
