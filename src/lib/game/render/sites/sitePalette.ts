import type { CarParkSurface } from '$lib/domain/layout/facilitySite';
import type { Facility } from '$lib/domain/layout/layoutTypes';

export const SurfacePalette: Record<CarParkSurface, { ground: string; marking: string }> = {
	gravel: { ground: 'hsl(40 16% 64%)', marking: 'hsl(28 34% 30%)' },
	tarmac: { ground: 'hsl(215 7% 27%)', marking: 'hsl(48 20% 94%)' }
};

export const SitePalette = {
	Kerb: 'hsl(30 18% 34%)',
	Shadow: 'hsla(0 0% 0% / 0.3)',
	Glass: 'hsla(205 30% 14% / 0.9)',
	Roof: 'hsla(0 0% 100% / 0.16)',
	LampPost: 'hsl(210 8% 20%)',
	LampGlow: 'hsla(48 100% 75% / 0.32)',
	Ridge: 'hsla(28 40% 12% / 0.55)',
	RoofShade: 'hsla(0 0% 0% / 0.18)',
	AeratorDeck: 'hsl(205 12% 40%)',
	Splash: 'hsla(190 60% 96% / 0.7)',
	Clear: 'hsla(0 0% 0% / 0)'
} as const;

export const CarPaints = ['hsl(0 62% 36%)', 'hsl(218 58% 36%)', 'hsl(0 0% 86%)', 'hsl(0 0% 16%)', 'hsl(110 28% 32%)', 'hsl(40 10% 60%)', 'hsl(200 45% 48%)'];

export const RoofTones: Record<Exclude<Facility, 'car_park' | 'aerator'>, string> = {
	lodge: 'hsl(22 38% 34%)',
	toilets: 'hsl(205 10% 44%)',
	washrooms: 'hsl(205 14% 40%)',
	club_house: 'hsl(14 46% 38%)',
	estate_house: 'hsl(10 30% 30%)',
	tackle_shop: 'hsl(150 22% 30%)',
	bar: 'hsl(4 44% 32%)',
	restaurant: 'hsl(30 30% 30%)',
	hotel: 'hsl(220 10% 30%)'
};
