export const RegionCodes = [
	'uk_ireland',
	'france',
	'benelux_germany',
	'iberia',
	'italy_balkans',
	'central_europe',
	'danube',
	'north_america',
	'south_africa',
	'australia_nz',
	'japan_east_asia'
] as const;

export type RegionCode = (typeof RegionCodes)[number];

export function isRegionCode(value: string): value is RegionCode {
	return (RegionCodes as readonly string[]).includes(value);
}
