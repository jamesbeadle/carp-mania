import type { SiteType } from '../types';

export interface SiteWaterProfile {
	siltFloor: number;
	targetFertility: number;
}

export const SiteWater: Record<SiteType, SiteWaterProfile> = {
	gravel_pit: { siltFloor: 0, targetFertility: 45 },
	quarry: { siltFloor: 0, targetFertility: 12 },
	clay_pit: { siltFloor: 30, targetFertility: 70 },
	estate_lake: { siltFloor: 10, targetFertility: 80 },
	farm_pond: { siltFloor: 15, targetFertility: 65 },
	greenfield: { siltFloor: 0, targetFertility: 60 },
	classic: { siltFloor: 5, targetFertility: 50 }
};

export function siltFloorFor(site: SiteType) {
	return SiteWater[site].siltFloor;
}

export function targetFertilityFor(site: SiteType) {
	return SiteWater[site].targetFertility;
}
