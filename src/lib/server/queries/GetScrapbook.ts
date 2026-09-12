import { error } from '@sveltejs/kit';
import type { KnownFish, Scrapbook } from '$lib/contracts/Scrapbook';
import { diaryAgeOf } from '$lib/domain/legacy/diary';
import { requireUser } from '../gates/requireUser';
import { loadFisherman } from './GetFishermanDiary';
import { loadCarpNames, loadCatchHistoryOf } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';
import { loadPersonalBestOf } from './loadPersonalBest';
import { loadStillSwimming } from './loadStillSwimming';
import { loadTrophiesOf } from './loadTrophies';

const NoSuchFisherman = 'Nobody by that name has fished here';
const UnnamedFish = 'A fish nobody named';

type KnownFishRow = { carp_id: string; best_lb: number; times_caught: number };

export async function GetScrapbook(locals: App.Locals, fishermanId: string, pageNumber: number): Promise<Scrapbook> {
	const viewer = requireUser(locals);
	const fisherman = await loadFisherman(locals, fishermanId);
	if (!fisherman) error(404, NoSuchFisherman);
	const [catches, known, personalBestLb, trophies] = await Promise.all([
		loadCatchHistoryOf(locals, { fisherman_id: fishermanId }, pageNumber),
		loadFishKnownBy(locals, fishermanId),
		loadPersonalBestOf(locals, fishermanId),
		loadTrophiesOf(locals, fishermanId)
	]);
	const knownIds = known.map((fish) => fish.carp_id);
	const [carpNames, lakeNames, stillSwimming] = await Promise.all([
		loadCarpNames(locals, [...knownIds, ...catches.items.map((caught) => caught.carp_id)]),
		loadLakeNames(locals, catches.items.map((caught) => caught.lake_id)),
		loadStillSwimming(locals, knownIds)
	]);
	return {
		fisherman,
		age: diaryAgeOf(fisherman, new Date()),
		catches,
		personalBestLb,
		fishKnown: known.map((fish) => knownFishFrom(fish, carpNames, stillSwimming)),
		trophies,
		carpNames,
		lakeNames,
		isMine: fisherman.profile_id === viewer.id
	};
}

async function loadFishKnownBy(locals: App.Locals, fishermanId: string): Promise<KnownFishRow[]> {
	const { data } = await locals.supabase.rpc('fish_known_by', { fisherman: fishermanId });
	return (data ?? []) as KnownFishRow[];
}

function knownFishFrom(fish: KnownFishRow, carpNames: Record<string, string>, stillSwimming: Set<string>): KnownFish {
	return { carpId: fish.carp_id, name: carpNames[fish.carp_id] ?? UnnamedFish, bestLb: Number(fish.best_lb), timesCaught: fish.times_caught, isStillSwimming: stillSwimming.has(fish.carp_id) };
}
