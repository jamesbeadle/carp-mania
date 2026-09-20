import { drawBountyFor, isBountyDrawnToday, type NewBounty } from '../bounties/bountyDraw';
import type { RandomFraction } from '../random';
import type { Carp, Lake, Swim } from '../types';
import type { DayContext } from './dayTypes';

export function bountyOfTheDay(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, context: Pick<DayContext, 'hasOpenBounty' | 'dayStart'>): NewBounty | null {
	const isOpenToAnglers = lake.is_public && lake.is_setup_complete;
	if (!isOpenToAnglers || context.hasOpenBounty) return null;
	if (!isBountyDrawnToday(random)) return null;
	return drawBountyFor(carp, swims, random, context.dayStart);
}
