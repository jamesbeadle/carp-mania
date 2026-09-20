import type { BountyKind } from './bountyKinds';

export interface OpenBounty {
	kind: BountyKind;
	swimName: string | null;
	targetCarpId: string | null;
	targetWeightLb: number | null;
	opensAt: string;
	endsAt: string;
}

export interface CatchInTheWindow {
	anglerId: string;
	carpId: string | null;
	weightLb: number;
	swimName: string;
	caughtAt: string;
}

export function isTakenBy(bounty: OpenBounty, landed: CatchInTheWindow) {
	const { targetCarpId, targetWeightLb } = bounty;
	if (bounty.kind === 'named_fish') return landed.carpId !== null && landed.carpId === targetCarpId;
	if (bounty.kind === 'over_the_line') return landed.weightLb >= (targetWeightLb ?? Number.POSITIVE_INFINITY);
	return false;
}

export function winnerOf(bounty: OpenBounty, catches: CatchInTheWindow[]): CatchInTheWindow | null {
	const inTheWindow = catches.filter((landed) => isInTheWindow(bounty, landed));
	if (bounty.kind === 'hard_graft') return mostCatchesIn(inTheWindow);
	const onThePeg = inTheWindow.filter((landed) => landed.swimName === bounty.swimName);
	if (bounty.kind === 'peg_prize') return heaviestOf(onThePeg);
	if (bounty.kind === 'top_of_the_water') return heaviestOf(inTheWindow);
	return inTheWindow.find((landed) => isTakenBy(bounty, landed)) ?? null;
}

function isInTheWindow(bounty: OpenBounty, landed: CatchInTheWindow) {
	const caughtAt = new Date(landed.caughtAt).getTime();
	return caughtAt >= new Date(bounty.opensAt).getTime() && caughtAt < new Date(bounty.endsAt).getTime();
}

function heaviestOf(catches: CatchInTheWindow[]): CatchInTheWindow | null {
	return catches.reduce<CatchInTheWindow | null>((best, landed) => (best && best.weightLb >= landed.weightLb ? best : landed), null);
}

function mostCatchesIn(catches: CatchInTheWindow[]): CatchInTheWindow | null {
	const tally = new Map<string, number>();
	for (const { anglerId } of catches) tally.set(anglerId, (tally.get(anglerId) ?? 0) + 1);
	const [leader] = [...tally.entries()].sort(([, left], [, right]) => right - left);
	return leader ? (catches.find((landed) => landed.anglerId === leader[0]) ?? null) : null;
}
