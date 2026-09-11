export const SceneSize = { Width: 960, Height: 640 } as const;

export const BankPalette = {
	GrassFar: 'hsl(96 32% 30%)',
	GrassNear: 'hsl(92 38% 38%)',
	Path: 'hsl(38 25% 55%)',
	Shore: 'hsl(40 30% 46%)',
	Reed: 'hsl(70 45% 32%)',
	ReedTip: 'hsl(40 55% 60%)',
	Peg: 'hsl(30 35% 35%)',
	PegSelected: 'hsl(42 70% 55%)',
	Label: 'hsl(42 40% 92%)'
} as const;

export const FishPalette = {
	common: { body: 'hsl(36 45% 42%)', belly: 'hsl(42 45% 62%)', fin: 'hsl(30 40% 34%)' },
	mirror: { body: 'hsl(40 55% 48%)', belly: 'hsl(44 55% 70%)', fin: 'hsl(34 45% 38%)' },
	linear: { body: 'hsl(34 48% 40%)', belly: 'hsl(40 45% 62%)', fin: 'hsl(28 40% 32%)' },
	leather: { body: 'hsl(70 22% 30%)', belly: 'hsl(60 25% 48%)', fin: 'hsl(70 22% 22%)' },
	ghost: { body: 'hsl(44 40% 80%)', belly: 'hsl(46 45% 92%)', fin: 'hsl(40 30% 65%)' },
	pike: { body: 'hsl(80 25% 34%)', belly: 'hsl(70 25% 55%)', fin: 'hsl(80 25% 26%)' }
} as const;

export const AnglerPalette = {
	Skin: 'hsl(28 45% 70%)',
	Jacket: 'hsl(90 20% 30%)',
	Hat: 'hsl(40 30% 25%)',
	Rod: 'hsl(30 20% 20%)',
	Line: 'hsla(0 0% 100% / 0.45)',
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
