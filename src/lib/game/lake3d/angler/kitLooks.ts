import type { BaitBrandName, BrandName } from '$lib/domain/tackle/brands';
import type { ReelKind } from '$lib/domain/tackle/reels';

export interface RodLook {
	blank: string;
	whipping: string;
	grip: string;
	fitting: string;
	sheen: number;
}

export interface ReelLook {
	body: string;
	spool: string;
}

const Matt = 0.15;
const Gloss = 0.55;
const Mirror = 0.8;

const RodLooks: Record<BrandName, RodLook> = {
	bankside_basics: { blank: '#3a3f3a', whipping: '#9aa09a', grip: '#262626', fitting: '#8a8a8a', sheen: Matt },
	tench_and_sons: { blank: '#4a3322', whipping: '#b8902c', grip: '#c49a6a', fitting: '#b08d4a', sheen: Gloss },
	marlow: { blank: '#1d2a22', whipping: '#3ee83a', grip: '#161a16', fitting: '#6a6a6a', sheen: Gloss },
	quarryman: { blank: '#3b3b36', whipping: '#e5322d', grip: '#1e1e1e', fitting: '#5a5a5a', sheen: Matt },
	fenwater: { blank: '#1e2b36', whipping: '#1fd3ff', grip: '#15191c', fitting: '#7a8288', sheen: Gloss },
	halcyon: { blank: '#2a2f3a', whipping: '#d9e2d9', grip: '#1a1c20', fitting: '#9aa0aa', sheen: Gloss },
	ironwood: { blank: '#231a14', whipping: '#8a5a2a', grip: '#121212', fitting: '#4a4038', sheen: Matt },
	north_ridge: { blank: '#1c2024', whipping: '#f2f7f2', grip: '#101214', fitting: '#b0b6bb', sheen: Gloss },
	blackmere: { blank: '#0c0e0c', whipping: '#a5fca3', grip: '#0a0a0a', fitting: '#2a2a2a', sheen: Mirror },
	vellum_and_steel: { blank: '#2c2620', whipping: '#e8d8b0', grip: '#3a2a1a', fitting: '#c8b88a', sheen: Mirror },
	silvermere: { blank: '#9aa2a8', whipping: '#1fd3ff', grip: '#1c1e20', fitting: '#dfe6ea', sheen: Mirror }
};

const ReelLooks: Partial<Record<BrandName, ReelLook>> = {
	bankside_basics: { body: '#2a2a2a', spool: '#6a6a6a' },
	marlow: { body: '#1a1f1a', spool: '#3ee83a' },
	fenwater: { body: '#1c242c', spool: '#8aa0b0' },
	ironwood: { body: '#2a211a', spool: '#a07a4a' },
	north_ridge: { body: '#202428', spool: '#c8ced2' },
	blackmere: { body: '#0a0a0a', spool: '#303030' },
	silvermere: { body: '#b8c0c6', spool: '#e8eef2' }
};

const PlainReel: ReelLook = { body: '#262626', spool: '#7a7a7a' };

export const ReelSpoolMetres: Record<ReelKind, number> = { carp_small: 0.045, carp_large: 0.052, big_pit_entry: 0.062, big_pit_full: 0.07, prototype_11000: 0.074 };

export function rodLookOf(brand: BrandName | BaitBrandName): RodLook {
	return RodLooks[brand as BrandName] ?? RodLooks.bankside_basics;
}

export function reelLookOf(brand: BrandName | BaitBrandName): ReelLook {
	return ReelLooks[brand as BrandName] ?? PlainReel;
}
