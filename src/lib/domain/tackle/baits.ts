import type { FeedType } from '../types';

export type BaitName = 'fishmeal_boilie' | 'hemp' | 'sweetcorn' | 'particle' | 'worm' | 'shrimp' | 'bread' | 'pop_up';

export interface BaitProfile {
	label: string;
	feedCounterpart: FeedType | null;
	isYellow: boolean;
	naturalAppeal: number;
}

export const BaitCatalogue: Record<BaitName, BaitProfile> = {
	fishmeal_boilie: { label: 'Fishmeal boilie', feedCounterpart: 'fishmeal_boilies', isYellow: false, naturalAppeal: 0.5 },
	hemp: { label: 'Hemp', feedCounterpart: 'hemp', isYellow: false, naturalAppeal: 0.6 },
	sweetcorn: { label: 'Sweetcorn', feedCounterpart: 'maize', isYellow: true, naturalAppeal: 0.65 },
	particle: { label: 'Particle mix', feedCounterpart: 'particles', isYellow: false, naturalAppeal: 0.55 },
	worm: { label: 'Worm', feedCounterpart: 'worms', isYellow: false, naturalAppeal: 0.8 },
	shrimp: { label: 'Shrimp', feedCounterpart: 'shrimp', isYellow: false, naturalAppeal: 0.75 },
	bread: { label: 'Bread', feedCounterpart: null, isYellow: false, naturalAppeal: 0.45 },
	pop_up: { label: 'Bright pop-up', feedCounterpart: null, isYellow: true, naturalAppeal: 0.5 }
};

export const BaitNames = Object.keys(BaitCatalogue) as BaitName[];
