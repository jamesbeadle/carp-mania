import { layoutScaleFor } from '../layout/layoutScale';
import type { LayoutPoint } from '../layout/layoutTypes';
import { isClearOfOtherSwims, isClearOfSanctuaries, isOnTheBank, swimCapFor, SwimRules } from '../layout/swimRules';
import { isInWater } from '../layout/waterArea';
import type { Lake, Swim } from '../types';

export type SwimIntent = 'build' | 'move';

export function whySwimIsRefused(lake: Pick<Lake, 'layout' | 'plot_acres' | 'acres'>, otherSwims: Pick<Swim, 'position_x' | 'position_y'>[], point: LayoutPoint, intent: SwimIntent): string | null {
	const scale = layoutScaleFor(Number(lake.plot_acres));
	if (isInWater(lake.layout, point)) return 'A swim sits on the bank, not in the water';
	if (!isOnTheBank(lake.layout, scale, point)) return `A swim must be within ${SwimRules.MaximumFeetFromWater} ft of the water`;
	if (!isClearOfOtherSwims(scale, point, otherSwims)) return `Swims must be at least ${SwimRules.MinimumSpacingFeet} ft apart`;
	if (!isClearOfSanctuaries(lake.layout, scale, point)) return `No peg within ${SwimRules.SanctuaryPegFeet} ft of a sanctuary`;
	const cap = swimCapFor(Number(lake.acres));
	if (intent === 'build' && otherSwims.length >= cap) return `${lake.acres} acres of water takes at most ${cap} swims`;
	return null;
}
