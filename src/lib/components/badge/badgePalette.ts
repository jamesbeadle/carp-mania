import type { BadgeMetal } from '$lib/domain/badges/badgeRules';

export interface MetalPaint {
	face: string;
	rim: string;
	ink: string;
}

export const BadgePalette: Record<BadgeMetal, MetalPaint> = {
	bronze: { face: 'hsl(28 55% 42%)', rim: 'hsl(28 60% 28%)', ink: 'hsl(36 60% 92%)' },
	silver: { face: 'hsl(210 12% 72%)', rim: 'hsl(210 10% 45%)', ink: 'hsl(210 20% 12%)' },
	gold: { face: 'hsl(44 85% 55%)', rim: 'hsl(40 70% 35%)', ink: 'hsl(40 60% 12%)' },
	platinum: { face: 'hsl(200 25% 88%)', rim: 'hsl(200 20% 60%)', ink: 'hsl(205 30% 15%)' }
};
