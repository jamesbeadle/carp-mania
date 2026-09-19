import { BaitCatalogue, BrightBaitByAge } from '../tackle/baits';
import { shinyHookFactor } from '../tackle/hooks';
import type { RodKit } from '../tackle/rodSetup';
import type { Carp } from '../types';
import { WaterScale } from '../waterQuality';

export type KitFactor = (carp: Pick<Carp, 'age_years'>) => number;

export function noKitFactor() {
	return 1;
}

export function brightBaitFactor(ageYears: number, transparencyShare: number) {
	const drawn = ageYears < BrightBaitByAge.DrawnUnderYears ? BrightBaitByAge.DrawnFactor : 1;
	const spooked = ageYears > BrightBaitByAge.SpookedOverYears ? BrightBaitByAge.SpookedFactor : 1;
	return 1 + (drawn * spooked - 1) * transparencyShare;
}

export function kitAgeFactorFor(kit: RodKit, transparency: number): KitFactor {
	const transparencyShare = Math.min(1, Math.max(0, transparency / WaterScale.Best));
	const isShiny = kit.hook.hook.finish === 'shiny';
	const isBright = BaitCatalogue[kit.bait.bait.kind].isBright;
	return (carp) => {
		const age = Number(carp.age_years);
		const hook = isShiny ? shinyHookFactor(age, transparencyShare) : 1;
		const bait = isBright ? brightBaitFactor(age, transparencyShare) : 1;
		return hook * bait;
	};
}
