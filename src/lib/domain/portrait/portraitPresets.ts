import type { RandomFraction } from '../random';
import { PartChoiceCounts, PartOrder, type PortraitLook } from './portraitLook';

export const Fisherman: PortraitLook = { skin: 1, hairStyle: 0, hairColour: 1, beard: 2, hat: 1, jacket: 0 };
export const Fisherwoman: PortraitLook = { skin: 2, hairStyle: 3, hairColour: 4, beard: 0, hat: 2, jacket: 1 };

const ChanceOfABeard = 0.4;
const NoBeard = 0;

export function rolledLook(random: RandomFraction): PortraitLook {
	const rolled = Object.fromEntries(PartOrder.map((part) => [part, Math.floor(random() * PartChoiceCounts[part])])) as unknown as PortraitLook;
	const isBearded = random() < ChanceOfABeard;
	return isBearded ? rolled : { ...rolled, beard: NoBeard };
}
