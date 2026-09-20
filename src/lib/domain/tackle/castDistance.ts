import { feetBetween, type LayoutScale } from '../layout/layoutScale';
import type { LayoutPoint } from '../layout/layoutTypes';
import { ReelCatalogue } from './reels';
import { RigCatalogue } from './rigs';
import { RodLengthCastFactor } from './rods';
import type { RodKit } from './rodSetup';

export const BaseCastFeet = 120;
const FeetPerMetre = 3.281;

export function castDistanceFeet(kit: RodKit) {
	const rod = RodLengthCastFactor[kit.rod.rod.lengthFeet];
	const reel = ReelCatalogue[kit.reel.reel].castFactor;
	const rig = RigCatalogue[kit.rig.rig].castFactor;
	return Math.round(BaseCastFeet * rod * reel * rig);
}

export function feetToMetres(feet: number) {
	return feet / FeetPerMetre;
}

export function pointWithinCast(peg: LayoutPoint, wanted: LayoutPoint, scale: LayoutScale, reachFeet: number): LayoutPoint {
	const distance = feetBetween(scale, peg, wanted);
	if (distance <= reachFeet) return wanted;
	const share = reachFeet / distance;
	const x = peg.x + (wanted.x - peg.x) * share;
	const y = peg.y + (wanted.y - peg.y) * share;
	return { x, y };
}

export function isCastTooFar(peg: LayoutPoint, wanted: LayoutPoint, scale: LayoutScale, reachFeet: number) {
	return feetBetween(scale, peg, wanted) > reachFeet;
}
