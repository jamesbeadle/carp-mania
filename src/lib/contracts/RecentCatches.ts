import type { Catch } from '$lib/domain/types';

export interface VisitorsThisWeek {
	count: number;
	bestLb: number;
}

export interface RecentCatches {
	byAnglers: Catch[];
	byVisitors: Catch[];
	visitorsThisWeek: VisitorsThisWeek;
}
