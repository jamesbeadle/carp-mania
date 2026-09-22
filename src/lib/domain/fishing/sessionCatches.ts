export const SessionCatches = { Fewest: 6, Most: 25 } as const;
export const ShortSessionCatches = { Fewest: 3, Most: 14 } as const;
export const LandedShareOfTakes = { HookHold: 0.92, FightWon: 0.85 } as const;

export function landedFromTakes(takes: number) {
	return takes * LandedShareOfTakes.HookHold * LandedShareOfTakes.FightWon;
}

export function isInsideTheBand(landedPerSession: number) {
	return landedPerSession >= SessionCatches.Fewest && landedPerSession <= SessionCatches.Most;
}

export function isInsideShortBand(landedPerSession: number) {
	return landedPerSession >= ShortSessionCatches.Fewest && landedPerSession <= ShortSessionCatches.Most;
}
