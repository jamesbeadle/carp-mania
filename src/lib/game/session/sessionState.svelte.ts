import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import { FishingDay } from '$lib/domain/fishing/sessionClock';
import { isFishable } from '$lib/domain/simulation/lapseTransfers';
import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
import { seasonFor, type Season } from '$lib/domain/world/seasons';
import type { RodOnBank } from '../scene/rodState';
import { rollForBite, StrikeWindowSeconds } from './biteRoller';
import type { FightState } from './fightState.svelte';
import type { LandedFish } from './landFish';

export type SessionPhase = 'choose_swim' | 'tackle_up' | 'fishing' | 'fighting' | 'landed' | 'day_over';

export interface ActiveBite {
	rodIndex: number;
	secondsLeft: number;
}

export class SessionState {
	phase = $state<SessionPhase>('choose_swim');
	hour = $state<number>(FishingDay.StartHour);
	swim = $state<Swim | null>(null);
	rods = $state<RodOnBank[]>([]);
	bite = $state<ActiveBite | null>(null);
	fight = $state<FightState | null>(null);
	lastLanded = $state<LandedFish | null>(null);
	landedToday = $state<LandedFish[]>([]);
	lostToday = $state(0);
	notice = $state<string | null>(null);
	readonly lake: Lake;
	readonly carp: Carp[];
	readonly profile: Profile;
	readonly season: Season;

	constructor(lake: Lake, carp: Carp[], profile: Profile) {
		this.lake = lake;
		this.carp = carp.filter(isFishable);
		this.profile = profile;
		this.season = seasonFor(lake, new Date());
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

	tick(secondsElapsed: number) {
		if (this.phase !== 'fishing') return;
		this.hour += secondsElapsed / FishingDay.RealSecondsPerFishingHour;
		if (this.isDayOver) return this.endDay();
		if (this.bite) return this.countDownBite(secondsElapsed);
		this.rollAllRods(secondsElapsed);
	}

	private rollAllRods(secondsElapsed: number) {
		for (const rod of this.rods) {
			const isBiting = rollForBite(this.lake, rod, this.overallSkill, this.hour, secondsElapsed, Math.random, this.season);
			if (!isBiting) continue;
			rod.phase = 'biting';
			this.bite = { rodIndex: rod.index, secondsLeft: StrikeWindowSeconds };
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
		this.phase = 'day_over';
	}
}
