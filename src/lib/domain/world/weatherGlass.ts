export type Glass = 'rising' | 'steady' | 'falling';
export type WindDirection = 'north' | 'east' | 'south' | 'west' | 'south_west';

export const GlassOdds = { FallingBelow: 0.3, RisingAbove: 0.7 } as const;
const WindOdds = { SouthWestBelow: 0.35, SouthBelow: 0.5, WestBelow: 0.65, EastBelow: 0.82 } as const;

export const GlassWords: Record<Glass, string> = { rising: 'a rising glass', steady: 'a steady glass', falling: 'a falling glass' };
export const WindWords: Record<WindDirection, string> = {
	north: 'a cold northerly',
	east: 'an easterly',
	south: 'a warm southerly',
	west: 'a westerly',
	south_west: 'a warm south-westerly'
};

export function glassFor(roll: number, isRain: boolean): Glass {
	if (isRain || roll < GlassOdds.FallingBelow) return 'falling';
	if (roll > GlassOdds.RisingAbove) return 'rising';
	return 'steady';
}

export function windDirectionFor(roll: number): WindDirection {
	if (roll < WindOdds.SouthWestBelow) return 'south_west';
	if (roll < WindOdds.SouthBelow) return 'south';
	if (roll < WindOdds.WestBelow) return 'west';
	if (roll < WindOdds.EastBelow) return 'east';
	return 'north';
}

export function isWarmWind(direction: WindDirection) {
	return direction === 'south' || direction === 'south_west';
}
