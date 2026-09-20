import { totalFeedKilograms } from '../feed';
import { BaitCatalogue } from '../tackle/baits';
import type { BaitStats } from '../tackle/tackleItem';
import type { FeedType } from '../types';

const UnfamiliarBaitScore = 0.35;
const Weights = {
	Diet: 0.65,
	Nature: 0.2,
	NoCounterpart: 0.8,
	Unfed: 0.7
} as const;

export function baitTrustScore(bait: BaitStats, feedStock: Record<FeedType, number>) {
	return Math.min(1, kindTrustScore(bait, feedStock) * bait.appealFactor);
}

function kindTrustScore(bait: BaitStats, feedStock: Record<FeedType, number>) {
	const profile = BaitCatalogue[bait.kind];
	if (!profile.feedCounterpart) return profile.naturalAppeal * Weights.NoCounterpart;
	const total = totalFeedKilograms(feedStock);
	if (total === 0) return Math.max(UnfamiliarBaitScore, profile.naturalAppeal * Weights.Unfed);
	const shareOfDiet = feedStock[profile.feedCounterpart] / total;
	const trust = UnfamiliarBaitScore + shareOfDiet * Weights.Diet + profile.naturalAppeal * Weights.Nature;
	return Math.min(1, trust);
}
