export type PlaceKind = 'lodge' | 'shop' | 'noticeboard' | 'signpost' | 'yard' | 'office' | 'jetty';

export const PlacePalette = {
	Timber: 'hsl(30 35% 35%)',
	TimberDark: 'hsl(28 35% 24%)',
	TimberPale: 'hsl(36 40% 52%)',
	Roof: 'hsl(20 30% 28%)',
	Wall: 'hsl(95 18% 30%)',
	Window: 'hsl(205 40% 40%)',
	WindowLit: 'hsl(44 95% 62%)',
	Awning: 'hsl(119 60% 38%)',
	AwningStripe: 'hsl(42 40% 92%)',
	Paper: 'hsl(44 50% 90%)',
	PaperOld: 'hsl(40 40% 78%)',
	Ink: 'hsl(30 30% 25%)',
	Pin: 'hsl(2 75% 52%)',
	Metal: 'hsl(210 10% 60%)',
	Digger: 'hsl(44 90% 52%)',
	DiggerDark: 'hsl(40 70% 35%)',
	Earth: 'hsl(28 40% 30%)',
	SignBoard: 'hsl(42 40% 92%)',
	SignText: 'hsl(2 70% 45%)',
	Hedge: 'hsl(100 35% 26%)',
	Smoke: 'hsla(0 0% 90% / 0.55)',
	Skin: 'hsl(28 45% 70%)',
	Jacket: 'hsl(90 20% 30%)',
	Hat: 'hsl(40 30% 25%)'
} as const;
