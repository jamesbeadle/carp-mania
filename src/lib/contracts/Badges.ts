import type { BadgeMetal } from '$lib/domain/badges/badgeRules';

export interface Badge {
	id: string;
	name: string;
	words: string;
	metal: BadgeMetal;
	createdAt: string;
}

export interface BadgeHeld {
	badgeId: string;
	name: string;
	words: string;
	metal: BadgeMetal;
	citation: string;
	awardedAt: string;
}

export interface BadgeWearer {
	anglerId: string;
	anglerName: string;
	citation: string;
	awardedAt: string;
}

export interface BadgeOnTheDesk extends Badge {
	wearers: BadgeWearer[];
}

export interface AnglerToPin {
	id: string;
	name: string;
}

export interface BadgesDesk {
	badges: BadgeOnTheDesk[];
	anglers: AnglerToPin[];
}
