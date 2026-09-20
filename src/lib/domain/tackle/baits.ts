import type { FeedType } from '../types';
import type { Presentation } from './presentations';

export type BaitName = 'shelf_life_boilie' | 'frozen_boilie' | 'pop_up' | 'wafter' | 'pellet' | 'hemp' | 'sweetcorn' | 'tiger_nut' | 'worm' | 'maggot' | 'shrimp' | 'bread' | 'zig_foam';

export interface BaitProfile {
	label: string;
	presentation: Presentation;
	feedCounterpart: FeedType | null;
	isYellow: boolean;
	isBright: boolean;
	appeal: number;
	naturalAppeal: number;
	keepsDays: number | null;
	note: string;
}

const KeepsForever = null;
const Keeps = { FrozenDays: 6, ParticlesDays: 10, NaturalsDays: 3 } as const;

export const BaitCatalogue: Record<BaitName, BaitProfile> = {
	shelf_life_boilie: { label: 'Shelf-life boilies', presentation: 'bottom', feedCounterpart: 'fishmeal_boilies', isYellow: false, isBright: false, appeal: 0.85, naturalAppeal: 0.5, keepsDays: KeepsForever, note: 'The convenient one' },
	frozen_boilie: { label: 'Frozen boilies', presentation: 'bottom', feedCounterpart: 'fishmeal_boilies', isYellow: false, isBright: false, appeal: 1, naturalAppeal: 0.55, keepsDays: Keeps.FrozenDays, note: 'The good one — buy it for a session, not a season' },
	pop_up: { label: 'Bright pop-ups', presentation: 'pop_up', feedCounterpart: null, isYellow: true, isBright: true, appeal: 0.9, naturalAppeal: 0.5, keepsDays: KeepsForever, note: "Bright is a young fish's bait" },
	wafter: { label: 'Wafters', presentation: 'wafter', feedCounterpart: 'fishmeal_boilies', isYellow: false, isBright: false, appeal: 0.95, naturalAppeal: 0.5, keepsDays: KeepsForever, note: 'Balanced to waft just off the bottom' },
	pellet: { label: 'Pellets', presentation: 'bottom', feedCounterpart: 'fishmeal_boilies', isYellow: false, isBright: false, appeal: 0.8, naturalAppeal: 0.45, keepsDays: KeepsForever, note: 'Feed, mostly' },
	hemp: { label: 'Hemp', presentation: 'bottom', feedCounterpart: 'hemp', isYellow: false, isBright: false, appeal: 0.75, naturalAppeal: 0.6, keepsDays: Keeps.ParticlesDays, note: 'Cheap, holds fish in the swim' },
	sweetcorn: { label: 'Sweetcorn', presentation: 'bottom', feedCounterpart: 'maize', isYellow: true, isBright: true, appeal: 0.75, naturalAppeal: 0.65, keepsDays: Keeps.ParticlesDays, note: 'Bright, cheap and loved by the stockies' },
	tiger_nut: { label: 'Tiger nuts', presentation: 'bottom', feedCounterpart: 'particles', isYellow: false, isBright: false, appeal: 0.75, naturalAppeal: 0.55, keepsDays: Keeps.ParticlesDays, note: 'Prepared right, a big-fish particle' },
	worm: { label: 'Worms', presentation: 'bottom', feedCounterpart: 'worms', isYellow: false, isBright: false, appeal: 1.05, naturalAppeal: 0.8, keepsDays: Keeps.NaturalsDays, note: 'The best bait there is and the least convenient' },
	maggot: { label: 'Maggots', presentation: 'bottom', feedCounterpart: 'worms', isYellow: false, isBright: false, appeal: 1.05, naturalAppeal: 0.75, keepsDays: Keeps.NaturalsDays, note: 'Everything eats them, including the bream' },
	shrimp: { label: 'Shrimp', presentation: 'bottom', feedCounterpart: 'shrimp', isYellow: false, isBright: false, appeal: 1.05, naturalAppeal: 0.75, keepsDays: Keeps.NaturalsDays, note: 'A natural the big fish know' },
	bread: { label: 'Bread', presentation: 'pop_up', feedCounterpart: null, isYellow: false, isBright: true, appeal: 0.6, naturalAppeal: 0.45, keepsDays: KeepsForever, note: 'Floats, and the ducks love it' },
	zig_foam: { label: 'Zig foam', presentation: 'zig', feedCounterpart: null, isYellow: false, isBright: true, appeal: 0.6, naturalAppeal: 0.4, keepsDays: KeepsForever, note: 'For fishing the layers on a hot day' }
};

export const BaitNames = Object.keys(BaitCatalogue) as BaitName[];
export const BrightBaitByAge = { DrawnUnderYears: 8, SpookedOverYears: 15, DrawnFactor: 1.1, SpookedFactor: 0.9 } as const;
