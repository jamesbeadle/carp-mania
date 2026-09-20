import type { RandomFraction } from '../random';
import type { NewNamedFish } from '../stock/individualise';
import type { NewShoal, Shoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';
import { isWorldNewYear } from '../world/worldClock';
import type { DayContext } from './dayTypes';
import { hasAerator } from './driftWater';
import { Heatwave } from './heatwave';
import { ageShoals, lapseShoalTransfers, nameTheTopOfEachShoal, shoalsSufferHeatwave } from './shoalsDay';
import { spawnFryShoal } from './spawnShoal';
import { isFirstDayOfSpring } from './spawning';

export interface ShoalsToday {
	shoals: Shoal[];
	fryShoals: NewShoal[];
	named: NewNamedFish[];
}

export function shoalsAfterTheDay(lake: Lake, shoals: Shoal[], carp: Carp[], context: DayContext, isHeatwave: boolean, random: RandomFraction): ShoalsToday {
	const lapsed = lapseShoalTransfers(shoals, context.dayEnd);
	const survived = isHeatwave && !hasAerator(lake) ? shoalsSufferHeatwave(lapsed, heatwaveLossFor(lake)) : lapsed;
	const aged = isWorldNewYear(context.dayStart, context.dayEnd) ? ageShoals(survived) : survived;
	const named = nameTheTopOfEachShoal(lake, aged, carp.length, random);
	const fry = isFirstDayOfSpring(context.dayStart, context.dayEnd, lake.latitude) ? spawnFryShoal(lake, carp, random) : null;
	return { shoals: named.shoals, fryShoals: fry ? [fry] : [], named: named.named };
}

function heatwaveLossFor(lake: Pick<Lake, 'layout'>) {
	const isShallow = lake.layout.baseDepthFeet < Heatwave.ShallowLakeBelowFeet;
	return isShallow ? Heatwave.ConditionLossShallow : Heatwave.ConditionLossDeep;
}
