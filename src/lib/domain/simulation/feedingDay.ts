import { consumeFeedForOneDay, dailyRationKilograms, feedConditionScore, feedProteinScore, growCarpForOneDay, shrinkHungryCarp } from '../carpGrowth';
import { DailyFeed } from '../feed';
import { isOverstocked, StockingDensity } from '../market/density';
import type { Shoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';
import { clampToScale } from '../waterQuality';
import { feedingConfidenceOf, lakeCeilingOf } from '../water/lakeCeiling';
import type { LakeSpecies } from '../water/species';
import { headCountOf } from '../stock/shoals';
import { freeRationFraction } from './naturalFood';

export interface FeedingDay {
	proteinScore: number;
	conditionScore: number;
	rationFraction: number;
	fedFraction: number;
	isOverstocked: boolean;
	ceilingLb: number;
	growthFactor: number;
}

const NaturalFoodProteinScore = 0.5;
const LeastFeedQuality = 0.6;

export function feedingDayFor(lake: Lake, carp: Carp[], shoals: Shoal[], mouths: number, growthFactor: number, species: LakeSpecies[] = []) {
	const proteinScore = feedProteinScore(lake.feed_stock);
	const conditionScore = feedConditionScore(lake.feed_stock);
	const { feedStock, rationFraction } = consumeFeedForOneDay(lake.feed_stock, dailyRationKilograms(mouths));
	const confidence = feedingConfidenceOf(lake.layout, Number(lake.plot_acres));
	const fedFraction = Math.min(1, (rationFraction + freeRationFraction(lake)) * confidence);
	const ceiling = lakeCeilingOf(lake, carp.length + headCountOf(shoals), species);
	const feeding: FeedingDay = {
		proteinScore,
		conditionScore,
		rationFraction,
		fedFraction,
		isOverstocked: isOverstocked(carp, Number(lake.acres), shoals),
		ceilingLb: ceiling.ceilingLb,
		growthFactor
	};
	return { feeding, feedStock };
}

export function feedOneFish(fish: Carp, feeding: FeedingDay): Carp {
	const protein = Math.max(feeding.proteinScore, naturalProtein(feeding));
	const grown = growCarpForOneDay(fish, protein, feeding.fedFraction, feeding.growthFactor, feeding.ceilingLb);
	const crowding = feeding.isOverstocked ? StockingDensity.ExtraConditionLossPerDay : 0;
	const condition = clampToScale(grown.condition + conditionChange(feeding) - crowding);
	return shrinkHungryCarp({ ...grown, condition });
}

function naturalProtein(feeding: FeedingDay) {
	const isLivingOffTheLake = feeding.rationFraction === 0 && feeding.fedFraction > 0;
	return isLivingOffTheLake ? NaturalFoodProteinScore : 0;
}

function conditionChange(feeding: FeedingDay) {
	const isHungry = feeding.fedFraction < 0.5;
	if (isHungry) return -DailyFeed.HungerConditionLossPerDay * (1 - feeding.fedFraction);
	const quality = Math.max(feeding.conditionScore, LeastFeedQuality);
	return DailyFeed.MaximumConditionGainPerDay * quality * feeding.fedFraction;
}
