export const SessionCatches = { Fewest: 2, Most: 10 } as const;
export const LandedShareOfTakes = { HookHold: 0.92, FightWon: 0.85 } as const;

export function landedFromTakes(takes: number) {
	return takes * LandedShareOfTakes.HookHold * LandedShareOfTakes.FightWon;
}

export function isInsideTheBand(landedPerSession: number) {
	return landedPerSession >= SessionCatches.Fewest && landedPerSession <= SessionCatches.Most;
}
