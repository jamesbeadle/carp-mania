import { consumeFeedForOneDay, dailyRationKilograms, feedConditionScore, feedProteinScore, growCarpForOneDay, shrinkHungryCarp } from '../carpGrowth';
import { DailyFeed } from '../feed';
import { isOverstocked, StockingDensity } from '../market/density';
import type { Carp, Lake } from '../types';
import { clampToScale } from '../waterQuality';
import { regionGrowthCeiling } from '../world/regions';
import { freeRationFraction } from './naturalFood';

export function feedTheLakeForOneDay(lake: Lake, carp: Carp[], growthFactor: number) {
	const fed = carp.filter(isFedToday);
	const proteinScore = feedProteinScore(lake.feed_stock);
	const conditionScore = feedConditionScore(lake.feed_stock);
	const ration = dailyRationKilograms(fed.length);
	const { feedStock, rationFraction } = consumeFeedForOneDay(lake.feed_stock, ration);
	const fedFraction = Math.min(1, rationFraction + freeRationFraction(lake));
	const overstocked = isOverstocked(carp, Number(lake.acres));
	const ceiling = regionGrowthCeiling(lake.region);

	const fedCarp = carp.map((fish) => {
		if (!isFedToday(fish)) return fish;
		const grown = growCarpForOneDay(fish, Math.max(proteinScore, naturalProtein(fedFraction, rationFraction)), fedFraction, growthFactor, ceiling);
		const condition = clampToScale(grown.condition + conditionChange(conditionScore, fedFraction) - (overstocked ? StockingDensity.ExtraConditionLossPerDay : 0));
		return shrinkHungryCarp({ ...grown, condition });
	});

	return { lake: { ...lake, feed_stock: feedStock }, carp: fedCarp };
}

export function isFedToday(carp: Pick<Carp, 'transit_until'>) {
	return carp.transit_until === null;
}

const NaturalFoodProteinScore = 0.5;

function naturalProtein(fedFraction: number, rationFraction: number) {
	const isLivingOffTheLake = rationFraction === 0 && fedFraction > 0;
	return isLivingOffTheLake ? NaturalFoodProteinScore : 0;
}

function conditionChange(conditionScore: number, fedFraction: number) {
	const isHungry = fedFraction < 0.5;
	if (isHungry) return -DailyFeed.HungerConditionLossPerDay * (1 - fedFraction);
	return DailyFeed.MaximumConditionGainPerDay * Math.max(conditionScore, 0.6) * fedFraction;
}
