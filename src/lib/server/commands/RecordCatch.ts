import { error, json } from '@sveltejs/kit';
import type { CatchReport } from '$lib/contracts/CatchReport';
import { anglerRatingOf } from '$lib/domain/anglerRating';
import type { WaterToday } from '$lib/domain/fishing/biteRoll';
import { isDayTicketStillValid } from '$lib/domain/fishing/dayTicket';
import type { Taker } from '$lib/domain/fishing/takers';
import { difficultyOfWater } from '$lib/domain/fishing/waterDifficulty';
import { takerForRolledBite } from '$lib/domain/fishing/whoTookTheBait';
import { carpNameForIndex } from '$lib/domain/naming/carpNames';
import type { Carp, Profile } from '$lib/domain/types';
import { nuisanceBiteShare } from '$lib/domain/water/species';
import { seasonFor } from '$lib/domain/world/seasons';
import { weatherFor } from '$lib/domain/world/weather';
import { readCatchReport } from '../gates/readCatchReport';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { hasCaughtDuringVisit, loadVisitOf, loadWaterOf, type VisitOnRecord, type WaterOnRecord } from '../queries/loadVisitForCatch';
import { loadStreakDays } from '../queries/loadStreak';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadCurrentFishermanId, loadHeaviestBefore } from '../queries/loadPersonalBest';
import { skillsOf } from '../queries/skillsOf';
import { honoursAfterTheCatch, recordNamedCatch, recordShoalCatch } from './recordInTheBook';

const HttpStatus = { BadRequest: 400 } as const;
const NotTheFish = 'That is not the fish that took the bait';

export async function RecordCatch(locals: App.Locals, body: unknown) {
	const user = requireUser(locals);
	const report = readCatchReport(body);
	if (!report) error(HttpStatus.BadRequest, 'That catch report is not one the bailiff can read');
	const visit = await loadVisitOf(user.id, report.visitId);
	if (!visit) error(HttpStatus.BadRequest, 'No day ticket for this visit');
	if (!isDayTicketStillValid(visit.visited_at, new Date())) error(HttpStatus.BadRequest, 'That day ticket was for another day');

	const hadItAlready = report.shoalId === null && hasCaughtDuringVisit(user.id, visit, report.carpId);
	const [water, profile, hasHadItToday] = await Promise.all([loadWaterOf(visit.lake_id), loadProfile(locals), hadItAlready]);
	if (!water) error(HttpStatus.BadRequest, 'That lake is no longer there');
	if (hasHadItToday) error(HttpStatus.BadRequest, 'You have already had that fish today');
	const [pedigreeLb, streakDays] = await Promise.all([loadPedigreeBeforeVisit(locals, user.id, visit), loadStreakDays(trustedSupabase(), user.id, visit.visited_at)]);
	const taker = takerThatWasRolled(report, visit, water, profile, { pedigreeLb, streakDays });
	if (!taker) error(HttpStatus.BadRequest, NotTheFish);
	if (taker.kind === 'named') return recordTheNamedFish(user.id, report, taker.carp);
	return recordTheShoalFish(user.id, report, taker, water);
}

async function recordTheNamedFish(anglerId: string, report: CatchReport, carp: Carp) {
	if (carp.id !== report.carpId) error(HttpStatus.BadRequest, NotTheFish);
	const catchId = await recordNamedCatch(anglerId, report, carp.id);
	const honours = await honoursAfterTheCatch(anglerId, catchId);
	return json({ catchId, carp, ...honours });
}

async function recordTheShoalFish(anglerId: string, report: CatchReport, taker: Taker & { kind: 'shoal' }, water: WaterOnRecord) {
	const isTheShoal = taker.shoal.id === report.shoalId;
	if (!isTheShoal) error(HttpStatus.BadRequest, NotTheFish);
	const fish = { ...taker.fish, name: carpNameForIndex(water.carp.length) };
	const { carpId, catchId } = await recordShoalCatch(anglerId, report, taker.shoal, fish);
	const honours = await honoursAfterTheCatch(anglerId, catchId);
	return json({ catchId, carp: { ...fish, id: carpId, times_caught: 1 }, ...honours });
}

interface AnglerOnTheDay {
	pedigreeLb: number;
	streakDays: number;
}

async function loadPedigreeBeforeVisit(locals: App.Locals, anglerId: string, visit: VisitOnRecord) {
	const fishermanId = await loadCurrentFishermanId(locals, anglerId);
	return fishermanId ? loadHeaviestBefore(locals, fishermanId, visit.visited_at) : 0;
}

function takerThatWasRolled(report: CatchReport, visit: VisitOnRecord, water: WaterOnRecord, profile: Profile, angler: AnglerOnTheDay): Taker | null {
	const skills = skillsOf(profile);
	const visitedAt = new Date(visit.visited_at);
	const today: WaterToday = {
		lake: water.lake,
		rating: anglerRatingOf(skills, angler.pedigreeLb).rating,
		watercraft: skills.watercraft,
		season: seasonFor(water.lake, visitedAt),
		weather: weatherFor(water.lake, visitedAt),
		shoals: water.shoals,
		difficulty: difficultyOfWater(water.lake, water.carp, water.shoals),
		recentCaptures: water.recentCaptures,
		nuisanceShare: nuisanceBiteShare(water.species, Number(water.lake.acres)),
		streakDays: angler.streakDays
	};
	return takerForRolledBite({ ...report, seed: visit.seed }, today, water.carp);
}
