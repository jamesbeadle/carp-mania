import type { CarpStrain } from '$lib/domain/types';

export interface FishColours {
	back: string;
	flank: string;
	fin: string;
	scale: string;
	patch: string;
	snout: string;
	eye: string;
	ridge: string;
}

const carpEye = 'hsl(0 0% 8%)';

export const FishPalette: Record<CarpStrain | 'pike', FishColours> = {
	common: { back: 'hsl(36 42% 28%)', flank: 'hsl(40 52% 52%)', fin: 'hsl(18 48% 32%)', scale: 'hsla(46 60% 80% / 0.35)', patch: 'transparent', snout: 'hsl(36 36% 44%)', eye: carpEye, ridge: 'hsla(34 34% 16% / 0.55)' },
	mirror: { back: 'hsl(40 46% 33%)', flank: 'hsl(44 56% 57%)', fin: 'hsl(20 46% 34%)', scale: 'hsla(46 70% 82% / 0.75)', patch: 'transparent', snout: 'hsl(40 38% 48%)', eye: carpEye, ridge: 'hsla(36 34% 18% / 0.55)' },
	linear: { back: 'hsl(34 44% 29%)', flank: 'hsl(40 50% 53%)', fin: 'hsl(18 46% 31%)', scale: 'hsla(46 68% 82% / 0.7)', patch: 'transparent', snout: 'hsl(36 36% 45%)', eye: carpEye, ridge: 'hsla(32 34% 16% / 0.55)' },
	fully_scaled: { back: 'hsl(42 52% 34%)', flank: 'hsl(46 64% 58%)', fin: 'hsl(22 48% 34%)', scale: 'hsla(48 78% 84% / 0.7)', patch: 'transparent', snout: 'hsl(42 42% 49%)', eye: carpEye, ridge: 'hsla(38 36% 18% / 0.55)' },
	leather: { back: 'hsl(62 22% 22%)', flank: 'hsl(56 26% 40%)', fin: 'hsl(40 24% 22%)', scale: 'transparent', patch: 'transparent', snout: 'hsl(58 22% 34%)', eye: carpEye, ridge: 'hsla(60 22% 12% / 0.55)' },
	ghost: { back: 'hsl(44 36% 76%)', flank: 'hsl(46 46% 90%)', fin: 'hsl(40 30% 62%)', scale: 'hsla(40 40% 60% / 0.3)', patch: 'hsla(30 28% 28% / 0.6)', snout: 'hsl(42 30% 70%)', eye: carpEye, ridge: 'hsla(40 26% 50% / 0.55)' },
	pike: { back: 'hsl(86 26% 30%)', flank: 'hsla(70 36% 62% / 0.35)', fin: 'hsl(20 34% 30%)', scale: 'transparent', patch: 'transparent', snout: 'hsl(86 22% 40%)', eye: carpEye, ridge: 'hsla(86 26% 18% / 0.55)' }
};

export function fishVisibility(transparency: number) {
	return 0.35 + (transparency / 100) * 0.65;
}
