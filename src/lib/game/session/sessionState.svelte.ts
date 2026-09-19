import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { anglerRatingOf } from '$lib/domain/anglerRating';
import { isSettledAfter } from '$lib/domain/fishing/catchSettle';
import type { TheBar } from '$lib/domain/fishing/honours';
import { carpInBiteOrder } from '$lib/domain/fishing/whoTookTheBait';
import type { Shoal } from '$lib/domain/stock/shoals';
import { difficultyOfWater } from '$lib/domain/fishing/waterDifficulty';
import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
import { isWindowOver, type SessionWindow } from '$lib/domain/fishing/sessionWindow';
import { seasonFor, type Season } from '$lib/domain/world/seasons';
import { weatherFor, type Weather } from '$lib/domain/world/weather';
import type { RodOnBank } from '../scene/rodState';
import { BiteRoller, type RolledBite } from './biteRoller';
import type { FightState } from './fightState.svelte';
import type { LandedFish } from './landFish';
import type { TackleLoss } from './tackleLoss';
import { advanceTheSession } from './sessionTicks';
import { waterTodayOf } from './waterToday';
import { skillsOfProfile } from './skillsOfProfile';

export type SessionPhase = 'choose_swim' | 'tackle_up' | 'fishing' | 'fighting' | 'landed' | 'day_over';

export interface ActiveBite extends RolledBite {
	secondsLeft: number;
}

export class SessionState {
	phase = $state<SessionPhase>('choose_swim');
	hour = $state<number>(0);
	swim = $state<Swim | null>(null);
	rods = $state<RodOnBank[]>([]);
	bite = $state<ActiveBite | null>(null);
	hooked = $state<RolledBite | null>(null);
	fight = $state<FightState | null>(null);
	lastLanded = $state<LandedFish | null>(null);
	landedToday = $state<LandedFish[]>([]);
	lostToday = $state(0);
	notice = $state<string | null>(null);
	isPickingASwimToMoveTo = $state(false);
	tackleLost = $state<TackleLoss[]>([]);
	secondsSinceTheMat = $state(0);
	bar: TheBar;
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
	readonly rating: number;
	readonly roller: BiteRoller;

	constructor(lake: Lake, carp: Carp[], profile: Profile, visit: FishingVisit, bar: TheBar, shoals: Shoal[] = []) {
		this.bar = bar;
		this.seed = visit.seed;
		this.lake = lake;
		this.carp = carpInBiteOrder(carp);
		this.shoals = shoals;
		this.difficulty = difficultyOfWater(lake, this.carp, shoals);
		this.profile = profile;
		this.season = seasonFor(lake, new Date(visit.visitedAt));
		this.weather = weatherFor(lake, new Date(visit.visitedAt));
		this.window = visit.window;
		this.sessionsLeft = visit.sessionsLeft;
		this.visitId = visit.id;
		this.hour = visit.window.fromHour;
		this.rating = anglerRatingOf(skillsOfProfile(profile), bar.pedigreeLb).rating;
		this.roller = new BiteRoller(visit.seed, waterTodayOf(this));
	}

	get watercraft() {
		return Number(this.profile.watercraft);
	}

	get isDayOver() {
		return isWindowOver(this.hour, this.window);
	}

	get isSettlingAfterCatch() {
		return this.phase === 'landed' && !isSettledAfter(this.secondsSinceTheMat);
	}

	hasLandedToday(carp: Carp) {
		return this.landedToday.some((landed) => landed.carp.id === carp.id);
	}

	tick(secondsElapsed: number) {
		advanceTheSession(this, secondsElapsed);
	}
}
