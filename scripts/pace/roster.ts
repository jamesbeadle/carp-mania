import type { RegionCode } from '../../src/lib/domain/world/regionCodes';
import type { SiteType } from '../../src/lib/domain/types';

export type ArchetypeName = 'casual' | 'regular' | 'keen' | 'tycoon' | 'angler';

export interface Archetype {
	name: ArchetypeName;
	words: string;
	activeDaysPerWeek: number;
	sessionsPerActiveDay: number;
	homeShare: number;
	isInvesting: boolean;
	prizeFishAtOnce: number;
	feed: 'fishmeal' | 'hemp';
}

export const Archetypes: Record<ArchetypeName, Archetype> = {
	casual: { name: 'casual', words: 'half an hour, three evenings a week', activeDaysPerWeek: 3, sessionsPerActiveDay: 2, homeShare: 0.8, isInvesting: true, prizeFishAtOnce: 3, feed: 'fishmeal' },
	regular: { name: 'regular', words: 'about an hour a day', activeDaysPerWeek: 6, sessionsPerActiveDay: 5, homeShare: 0.5, isInvesting: true, prizeFishAtOnce: 5, feed: 'fishmeal' },
	keen: { name: 'keen', words: 'three hours a day, every day', activeDaysPerWeek: 7, sessionsPerActiveDay: 12, homeShare: 0.4, isInvesting: true, prizeFishAtOnce: 5, feed: 'fishmeal' },
	tycoon: { name: 'tycoon', words: 'runs the fishery, never picks up a rod', activeDaysPerWeek: 6, sessionsPerActiveDay: 0, homeShare: 1, isInvesting: true, prizeFishAtOnce: 10, feed: 'fishmeal' },
	angler: { name: 'angler', words: 'fishes every day, never builds anything', activeDaysPerWeek: 6, sessionsPerActiveDay: 5, homeShare: 0.1, isInvesting: false, prizeFishAtOnce: 0, feed: 'hemp' }
};

export interface SitePreset {
	key: string;
	site: SiteType;
	region: RegionCode;
	acres: number;
	startingFish: { count: number; fromLb: number; toLb: number };
	coverage: number;
	quality: number;
}

export const Sites: Record<'estate_uk' | 'pit_uk' | 'pit_france' | 'pit_danube' | 'pond_uk', SitePreset> = {
	estate_uk: { key: 'estate_uk', site: 'estate_lake', region: 'uk_ireland', acres: 10, startingFish: { count: 60, fromLb: 10, toLb: 18 }, coverage: 0.1, quality: 40 },
	pit_uk: { key: 'pit_uk', site: 'gravel_pit', region: 'uk_ireland', acres: 10, startingFish: { count: 6, fromLb: 14, toLb: 18 }, coverage: 0.08, quality: 70 },
	pit_france: { key: 'pit_france', site: 'gravel_pit', region: 'france', acres: 10, startingFish: { count: 6, fromLb: 14, toLb: 18 }, coverage: 0.08, quality: 70 },
	pit_danube: { key: 'pit_danube', site: 'gravel_pit', region: 'danube', acres: 20, startingFish: { count: 6, fromLb: 14, toLb: 18 }, coverage: 0.08, quality: 70 },
	pond_uk: { key: 'pond_uk', site: 'farm_pond', region: 'uk_ireland', acres: 4, startingFish: { count: 150, fromLb: 3, toLb: 6 }, coverage: 0.12, quality: 50 }
};

export interface RosterLine {
	archetype: ArchetypeName;
	site: keyof typeof Sites;
	count: number;
}

export const Roster: RosterLine[] = [
	{ archetype: 'casual', site: 'estate_uk', count: 10 },
	{ archetype: 'casual', site: 'pit_uk', count: 2 },
	{ archetype: 'regular', site: 'estate_uk', count: 10 },
	{ archetype: 'regular', site: 'pit_france', count: 3 },
	{ archetype: 'regular', site: 'pit_danube', count: 3 },
	{ archetype: 'keen', site: 'estate_uk', count: 2 },
	{ archetype: 'keen', site: 'pit_france', count: 2 },
	{ archetype: 'keen', site: 'pit_danube', count: 2 },
	{ archetype: 'tycoon', site: 'estate_uk', count: 1 },
	{ archetype: 'tycoon', site: 'pit_danube', count: 1 },
	{ archetype: 'angler', site: 'pond_uk', count: 2 }
];
