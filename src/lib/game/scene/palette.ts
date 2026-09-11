export const SceneSize = { Width: 960, Height: 640 } as const;

export const BankPalette = {
	GrassFar: 'hsl(96 32% 30%)',
	GrassNear: 'hsl(92 38% 38%)',
	Path: 'hsl(38 25% 55%)',
	Shore: 'hsl(40 30% 46%)',
	Reed: 'hsl(70 45% 32%)',
	ReedTip: 'hsl(40 55% 60%)',
	Peg: 'hsl(30 35% 35%)',
	PegSelected: 'hsl(119 79% 57%)',
	Label: 'hsl(42 40% 92%)'
} as const;

interface FishColours {
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

export const FishPalette: Record<'common' | 'mirror' | 'linear' | 'leather' | 'ghost' | 'pike', FishColours> = {
	common: { back: 'hsl(36 42% 28%)', flank: 'hsl(40 52% 52%)', fin: 'hsl(18 48% 32%)', scale: 'hsla(46 60% 80% / 0.35)', patch: 'transparent', snout: 'hsl(36 36% 44%)', eye: carpEye, ridge: 'hsla(34 34% 16% / 0.55)' },
	mirror: { back: 'hsl(40 46% 33%)', flank: 'hsl(44 56% 57%)', fin: 'hsl(20 46% 34%)', scale: 'hsla(46 70% 82% / 0.75)', patch: 'transparent', snout: 'hsl(40 38% 48%)', eye: carpEye, ridge: 'hsla(36 34% 18% / 0.55)' },
	linear: { back: 'hsl(34 44% 29%)', flank: 'hsl(40 50% 53%)', fin: 'hsl(18 46% 31%)', scale: 'hsla(46 68% 82% / 0.7)', patch: 'transparent', snout: 'hsl(36 36% 45%)', eye: carpEye, ridge: 'hsla(32 34% 16% / 0.55)' },
	leather: { back: 'hsl(62 22% 22%)', flank: 'hsl(56 26% 40%)', fin: 'hsl(40 24% 22%)', scale: 'transparent', patch: 'transparent', snout: 'hsl(58 22% 34%)', eye: carpEye, ridge: 'hsla(60 22% 12% / 0.55)' },
	ghost: { back: 'hsl(44 36% 76%)', flank: 'hsl(46 46% 90%)', fin: 'hsl(40 30% 62%)', scale: 'hsla(40 40% 60% / 0.3)', patch: 'hsla(30 28% 28% / 0.6)', snout: 'hsl(42 30% 70%)', eye: carpEye, ridge: 'hsla(40 26% 50% / 0.55)' },
	pike: { back: 'hsl(86 26% 30%)', flank: 'hsla(70 36% 62% / 0.35)', fin: 'hsl(20 34% 30%)', scale: 'transparent', patch: 'transparent', snout: 'hsl(86 22% 40%)', eye: carpEye, ridge: 'hsla(86 26% 18% / 0.55)' }
};

export const AnglerPalette = {
	Skin: 'hsl(28 45% 70%)',
	Jacket: 'hsl(90 20% 30%)',
	Hat: 'hsl(40 30% 25%)',
	Rod: 'hsl(30 20% 20%)',
	Line: 'hsla(192 100% 70% / 0.55)',
	Bivvy: 'hsl(95 22% 34%)'
} as const;

export function waterColour(transparency: number, depthFraction: number) {
	const clarity = transparency / 100;
	const hue = 160 + (1 - clarity) * 40;
	const saturation = 30 + clarity * 25;
	const lightness = 28 - depthFraction * 12 - (1 - clarity) * 6;
	return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function fishVisibility(transparency: number) {
	return 0.35 + (transparency / 100) * 0.65;
}

export function weedColour(alpha: number) {
	return `hsla(110 40% 30% / ${alpha})`;
}
