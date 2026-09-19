import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { anglerRatingOf } from '$lib/domain/anglerRating';
import type { TheBar } from '$lib/domain/fishing/honours';
import type { SessionWindow } from '$lib/domain/fishing/sessionWindow';
import { difficultyOfWater } from '$lib/domain/fishing/waterDifficulty';
import { carpInBiteOrder } from '$lib/domain/fishing/whoTookTheBait';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake, Profile } from '$lib/domain/types';
import { nuisanceBiteShare, type LakeSpecies } from '$lib/domain/water/species';
import { seasonFor, type Season } from '$lib/domain/world/seasons';
import { weatherFor, type Weather } from '$lib/domain/world/weather';
import { skillsOfProfile } from './skillsOfProfile';

export interface SessionSetup {
	lake: Lake;
	carp: Carp[];
	profile: Profile;
	visit: FishingVisit;
	bar: TheBar;
	shoals?: Shoal[];
	species?: LakeSpecies[];
}

export interface VisitFacts {
	readonly seed: number;
	readonly lake: Lake;
	readonly carp: Carp[];
	readonly shoals: Shoal[];
	readonly profile: Profile;
	readonly season: Season;
	readonly weather: Weather;
	readonly window: SessionWindow;
	readonly sessionsLeft: number;
	readonly visitId: string;
	readonly difficulty: number;
	readonly recentCaptures: Record<string, number>;
	readonly species: LakeSpecies[];
	readonly nuisanceShare: number;
	readonly rating: number;
}

export function visitFactsOf(setup: SessionSetup): VisitFacts {
	const { lake, profile, visit, bar } = setup;
	const shoals = setup.shoals ?? [];
	const species = setup.species ?? [];
	const carp = carpInBiteOrder(setup.carp);
	const visitedAt = new Date(visit.visitedAt);
	return {
		seed: visit.seed,
		lake,
		carp,
		shoals,
		profile,
		season: seasonFor(lake, visitedAt),
		weather: weatherFor(lake, visitedAt),
		window: visit.window,
		sessionsLeft: visit.sessionsLeft,
		visitId: visit.id,
		difficulty: difficultyOfWater(lake, carp, shoals),
		recentCaptures: visit.recentCaptures,
		species,
		nuisanceShare: nuisanceBiteShare(species, Number(lake.acres)),
		rating: anglerRatingOf(skillsOfProfile(profile), bar.pedigreeLb).rating
	};
}
