import { error } from '@sveltejs/kit';
import type { KnownFish, Scrapbook } from '$lib/contracts/Scrapbook';
import { diaryAgeOf } from '$lib/domain/legacy/diary';
import type { Catch } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { loadFisherman } from './GetFishermanDiary';
import { loadCarpNames } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';
import { loadPersonalBestOf } from './loadPersonalBest';
import { loadStillSwimming } from './loadStillSwimming';
import { loadTrophiesOf } from './loadTrophies';

const ScrapbookLength = 100;
const NoSuchFisherman = 'Nobody by that name has fished here';
const UnnamedFish = 'A fish nobody named';

export async function GetScrapbook(locals: App.Locals, fishermanId: string): Promise<Scrapbook> {
	const viewer = requireUser(locals);
	const fisherman = await loadFisherman(locals, fishermanId);
	if (!fisherman) error(404, NoSuchFisherman);
	const [{ catches, totalCatches }, personalBestLb, trophies] = await Promise.all([loadCatchesOf(locals, fishermanId), loadPersonalBestOf(locals, fishermanId), loadTrophiesOf(locals, fishermanId)]);
	const carpIds = catches.map((caught) => caught.carp_id);
	const [carpNames, lakeNames, stillSwimming] = await Promise.all([loadCarpNames(locals, carpIds), loadLakeNames(locals, catches.map((caught) => caught.lake_id)), loadStillSwimming(locals, carpIds)]);
	return {
		fisherman,
		age: diaryAgeOf(fisherman, new Date()),
		catches,
		totalCatches,
		personalBestLb,
		fishKnown: fishKnownFrom(catches, carpNames, stillSwimming),
		trophies,
		carpNames,
		lakeNames,
		isMine: fisherman.profile_id === viewer.id
	};
}

async function loadCatchesOf(locals: App.Locals, fishermanId: string) {
	const { data, count } = await locals.supabase.from('catches').select('*', { count: 'exact' }).eq('fisherman_id', fishermanId).order('caught_at', { ascending: false }).limit(ScrapbookLength);
	return { catches: (data ?? []) as Catch[], totalCatches: count ?? 0 };
}

function fishKnownFrom(catches: Catch[], carpNames: Record<string, string>, stillSwimming: Set<string>): KnownFish[] {
	const known = new Map<string, KnownFish>();
	for (const caught of catches) {
		if (!caught.carp_id) continue;
		const fish = known.get(caught.carp_id) ?? { carpId: caught.carp_id, name: carpNames[caught.carp_id] ?? UnnamedFish, bestLb: 0, timesCaught: 0, isStillSwimming: stillSwimming.has(caught.carp_id) };
		known.set(caught.carp_id, { ...fish, bestLb: Math.max(fish.bestLb, Number(caught.weight_lb)), timesCaught: fish.timesCaught + 1 });
	}
	return [...known.values()].sort((first, second) => second.bestLb - first.bestLb);
}
