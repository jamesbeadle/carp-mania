import { consumeFeedForOneDay, dailyRationKilograms, feedConditionScore, feedProteinScore, growCarpForOneDay } from '../carpGrowth';
import { DailyFeed } from '../feed';
import type { Carp, Lake } from '../types';
import { clampToScale } from '../waterQuality';

export function feedTheLakeForOneDay(lake: Lake, carp: Carp[]) {
	const proteinScore = feedProteinScore(lake.feed_stock);
	const conditionScore = feedConditionScore(lake.feed_stock);
	const ration = dailyRationKilograms(carp.length);
	const { feedStock, rationFraction } = consumeFeedForOneDay(lake.feed_stock, ration);

	const fedCarp = carp.map((fish) => {
		const grown = growCarpForOneDay(fish, proteinScore, rationFraction);
		return { ...grown, condition: clampToScale(grown.condition + conditionChange(conditionScore, rationFraction)) };
	});

	return { lake: { ...lake, feed_stock: feedStock }, carp: fedCarp };
}

function conditionChange(conditionScore: number, rationFraction: number) {
	const isHungry = rationFraction < 0.5;
	if (isHungry) return -DailyFeed.HungerConditionLossPerDay * (1 - rationFraction);
	return DailyFeed.MaximumConditionGainPerDay * conditionScore * rationFraction;
}
