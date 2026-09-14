import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import type { TheBar } from '$lib/domain/fishing/honours';
import { FishingDay } from '$lib/domain/fishing/sessionClock';
import { carpInBiteOrder } from '$lib/domain/fishing/whoTookTheBait';
import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
import { seasonFor, type Season } from '$lib/domain/world/seasons';
import { bringRodIn, isCastOut, type RodOnBank } from '../scene/rodState';
import { BiteRoller, StrikeWindowSeconds, type RolledBite } from './biteRoller';
import type { FightState } from './fightState.svelte';
import type { LandedFish } from './landFish';

export type SessionPhase = 'choose_swim' | 'tackle_up' | 'fishing' | 'fighting' | 'landed' | 'day_over';

export interface ActiveBite extends RolledBite {
	secondsLeft: number;
}

export class SessionState {
	phase = $state<SessionPhase>('choose_swim');
	hour = $state<number>(FishingDay.StartHour);
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
	bar: TheBar;
	readonly lake: Lake;
	readonly carp: Carp[];
	readonly profile: Profile;
	readonly season: Season;
	readonly roller: BiteRoller;

	constructor(lake: Lake, carp: Carp[], profile: Profile, visit: FishingVisit, bar: TheBar) {
		this.bar = bar;
		this.lake = lake;
		this.carp = carpInBiteOrder(carp);
		this.profile = profile;
		this.season = seasonFor(lake, new Date(visit.visitedAt));
		this.roller = new BiteRoller(visit.seed, { lake, overallSkill: this.overallSkill, season: this.season });
	}

	get overallSkill() {
		return overallAnglerSkill({
			line_selection: Number(this.profile.line_selection),
			rig_selection: Number(this.profile.rig_selection),
			bait_selection: Number(this.profile.bait_selection),
			watercraft: Number(this.profile.watercraft)
		});
	}

	get isDayOver() {
		return this.hour >= FishingDay.EndHour;
	}

	hasLandedToday(carp: Carp) {
		return this.landedToday.some((landed) => landed.carp.id === carp.id);
	}

	tick(secondsElapsed: number) {
		if (this.phase !== 'fishing') return;
		this.hour += secondsElapsed / FishingDay.RealSecondsPerFishingHour;
		if (this.isDayOver) return this.endDay();
		if (this.bite) return this.countDownBite(secondsElapsed);
		this.fireTheFirstDueBite();
	}

	private fireTheFirstDueBite() {
		for (const rod of this.rods) {
			if (rod.phase !== 'cast' || !isCastOut(rod)) continue;
			const due = this.roller.biteDueOn(rod, this.hour);
			if (!due) continue;
			rod.phase = 'biting';
			this.bite = { ...due, secondsLeft: StrikeWindowSeconds };
			return;
		}
	}

	private countDownBite(secondsElapsed: number) {
		if (!this.bite) return;
		this.bite.secondsLeft -= secondsElapsed;
		if (this.bite.secondsLeft > 0) return;
		this.rods[this.bite.rodIndex].phase = 'cast';
		this.bite = null;
		this.notice = 'Too slow — the fish spat the bait out.';
	}

	private endDay() {
		this.hour = FishingDay.EndHour;
		this.bite = null;
		for (const rod of this.rods) bringRodIn(rod);
		this.phase = 'day_over';
	}
}
