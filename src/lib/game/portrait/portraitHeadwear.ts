const HairBehind: Record<string, string> = {
	Long: 'M40 52C38 28 82 28 80 52l5 40c-12 5-38 5-50 0Z',
	Ponytail: 'M76 52c8 2 12 12 10 26-2 8-8 10-10 4 2-10 0-20 0-30Z'
};

const HairInFront: Record<string, string> = {
	Cropped: 'M42 52c-2-22 38-22 36 0-4-10-32-10-36 0Z',
	Swept: 'M41 54c-3-26 41-28 38-2-4-12-20-6-36-12Z',
	Long: 'M41 56c-3-28 41-28 38 0-6-14-14-12-20-14-6 4-12 6-18 14Z',
	Ponytail: 'M42 52c-2-22 38-22 36 0-4-10-32-10-36 0Z'
};

const BeardShapes: Record<string, { path: string; opacity: number }> = {
	Stubble: { path: 'M43 58c0 22 34 22 34 0-3 10-10 14-17 14s-14-4-17-14Z', opacity: 0.35 },
	Full: { path: 'M42 54c-1 30 37 30 36 0-3 9-8 10-11 10-3-2-11-2-14 0-3 0-8-1-11-10Z', opacity: 1 }
};

const HatShapes: Record<string, string> = {
	Beanie: 'M40 50C40 24 80 24 80 50Z',
	Bucket: 'M45 44c1-16 29-16 30 0ZM32 49c6-9 50-9 56 0-10-3-46-3-56 0Z',
	Cap: 'M41 47c0-20 38-20 38 0ZM40 46c8 7 32 7 40 0-8 4-32 4-40 0Z',
	Boonie: 'M44 44c1-17 31-17 32 0ZM26 50c8-11 60-11 68 0-12-4-56-4-68 0Z'
};

const BeanieBand = '<rect x="39" y="44" width="42" height="7" rx="3" fill="#000" opacity=".2"/><circle cx="60" cy="25" r="4.5"';
const MouthOverBeard = 'M54 67c3 3 9 3 12 0';

export function hairBehind(style: string, colour: string) {
	const path = HairBehind[style];
	return path ? `<path d="${path}" fill="${colour}"/>` : '';
}

export function hairInFront(style: string, colour: string, isUnderAHat: boolean) {
	const path = HairInFront[style];
	if (!path || isUnderAHat) return '';
	return `<path d="${path}" fill="${colour}"/>`;
}

export function beard(kind: string, colour: string, lipColour: string) {
	const shape = BeardShapes[kind];
	if (!shape) return '';
	return `<path d="${shape.path}" fill="${colour}" opacity="${shape.opacity}"/><path d="${MouthOverBeard}" fill="none" stroke="${lipColour}" stroke-width="2" stroke-linecap="round"/>`;
}

export function hat(kind: string, colour: string) {
	const path = HatShapes[kind];
	if (!path) return '';
	const bobble = kind === 'Beanie' ? `${BeanieBand} fill="${colour}"/>` : '';
	return `<path d="${path}" fill="${colour}"/>${bobble}`;
}
