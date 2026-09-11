import { totalFeedKilograms } from '../feed';
import { BaitCatalogue, type BaitName } from '../tackle/baits';
import type { FeedType } from '../types';

const UnfamiliarBaitScore = 0.35;

export function baitTrustScore(bait: BaitName, feedStock: Record<FeedType, number>) {
	const profile = BaitCatalogue[bait];
	if (!profile.feedCounterpart) return profile.naturalAppeal * 0.8;
	const total = totalFeedKilograms(feedStock);
	if (total === 0) return Math.max(UnfamiliarBaitScore, profile.naturalAppeal * 0.7);
	const shareOfDiet = feedStock[profile.feedCounterpart] / total;
	return Math.min(1, UnfamiliarBaitScore + shareOfDiet * 0.65 + profile.naturalAppeal * 0.2);
}
