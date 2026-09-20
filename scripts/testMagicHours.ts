import assert from 'node:assert/strict';
import { carpForRolledBite } from '../src/lib/domain/fishing/whoTookTheBait';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake } from '../src/lib/domain/types';
import type { Weather } from '../src/lib/domain/world/weather';
import { stockWithThirties, waterOn } from './testSizeReachSupport';

const FirstLight = { fromHour: 5, toHour: 10 } as const;
const Afternoon = { fromHour: 10, toHour: 16 } as const;
const Seeds = 300;
const CompetentRating = 50;
const ThirtyLb = 30;
const CastPoint = { x: 0.5, y: 0.5 };
const AtLeastThreeTimes = 3;
const OrdinaryDay: Weather = { kind: 'clear', cloudCover: 0.1, windStrength: 0.5, glass: 'steady', windDirection: 'west' };

export function runMagicHourSweep() {
	const lake: Lake = { id: 'lake-magic', ...classicLake('owner-1', 'Magic Water', new Date('2026-01-01T00:00:00Z')) };
	const carp = stockWithThirties(lake.id);
	const dawn = shareOfThirties(lake, carp, FirstLight);
	const afternoon = shareOfThirties(lake, carp, Afternoon);
	assert.ok(dawn >= afternoon * AtLeastThreeTimes, `thirties are ${(dawn * 100).toFixed(1)}% of first-light takes against ${(afternoon * 100).toFixed(1)}% in the afternoon`);
	console.log('magic hours:', { dawnThirties: dawn.toFixed(3), afternoonThirties: afternoon.toFixed(3) });
}

function shareOfThirties(lake: Lake, carp: Carp[], hours: { fromHour: number; toHour: number }) {
	const water = { ...waterOn(lake, CompetentRating, '2026-07-15'), weather: OrdinaryDay };
	let takes = 0;
	let thirties = 0;
	for (let seed = 1; seed <= Seeds; seed++) {
		for (let hour = hours.fromHour; hour < hours.toHour; hour++) {
			const taker = carpForRolledBite({ seed, rodIndex: 0, hour, castPoint: CastPoint, setup: defaultRodSetup() }, water, carp);
			if (!taker) continue;
			takes += 1;
			if (Number(taker.weight_lb) >= ThirtyLb) thirties += 1;
		}
	}
	return thirties / Math.max(1, takes);
}
