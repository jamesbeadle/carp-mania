import { FisheryClock } from '../simulation/elapsedDays';

export const Pressure = { RecentFisheryDays: 10, WarinessPerCapture: 0.08, MostWariness: 0.4, WaryFrom: 2 } as const;

type Caught = { carp_id: string | null; caught_at: string };

export function recentCapturesOf(catches: Caught[], carpId: string, now: Date) {
	const since = now.getTime() - Pressure.RecentFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay;
	return catches.filter((caught) => caught.carp_id === carpId && new Date(caught.caught_at).getTime() >= since).length;
}

export function pressureWariness(recentCaptures: number) {
	return Math.min(Pressure.MostWariness, recentCaptures * Pressure.WarinessPerCapture);
}

export function recentCapturesByFish(catches: Caught[], now: Date) {
	const since = now.getTime() - Pressure.RecentFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay;
	const counts = new Map<string, number>();
	for (const caught of catches) {
		if (!caught.carp_id || new Date(caught.caught_at).getTime() < since) continue;
		counts.set(caught.carp_id, (counts.get(caught.carp_id) ?? 0) + 1);
	}
	return counts;
}

export function pressureWords(recentCaptures: number) {
	if (recentCaptures >= Pressure.WaryFrom) return `caught ${recentCaptures} times this week — it will be wary`;
	if (recentCaptures === 1) return 'caught once this week';
	return 'not caught this week';
}
