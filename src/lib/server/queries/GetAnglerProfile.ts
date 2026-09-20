import type { FishermanDiary } from '$lib/contracts/FishermanDiary';
import type { ListPage } from '$lib/domain/lists/paging';
import type { TrophyRoom } from '$lib/contracts/TrophyRoom';
import type { Trophy } from '$lib/domain/matches/matchTypes';
import { anglerRatingOf, type AnglerRating } from '$lib/domain/anglerRating';
import type { Catch, Profile } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { diaryOf } from './GetFishermanDiary';
import { loadCarpNames, loadCatchHistoryOf } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';
import { loadPersonalBestOf } from './loadPersonalBest';
import { loadTrophiesOf } from './loadTrophies';
import { loadTrophyRoom } from './loadTrophyRoom';
import { skillsOf } from './skillsOf';

export interface AnglerProfile {
	profile: Profile;
	diary: FishermanDiary;
	catches: ListPage<Catch>;
	carpNames: Record<string, string>;
	lakeNames: Record<string, string>;
	personalBestLb: number;
	rating: AnglerRating;
	trophies: Trophy[];
	trophyRoom: TrophyRoom;
}

export async function GetAnglerProfile(locals: App.Locals, pageNumber: number): Promise<AnglerProfile> {
	const profile = await loadProfile(locals);
	const diary = await diaryOf(locals, profile.id);
	const fishermanId = diary.current.id;
	const [catches, personalBestLb, trophies, trophyRoom] = await Promise.all([
		loadCatchHistoryOf(locals, { fisherman_id: fishermanId }, pageNumber),
		loadPersonalBestOf(locals, fishermanId),
		loadTrophiesOf(locals, fishermanId),
		loadTrophyRoom(locals, profile.id)
	]);
	const [carpNames, lakeNames] = await Promise.all([
		loadCarpNames(locals, catches.items.map((caught) => caught.carp_id)),
		loadLakeNames(locals, catches.items.map((caught) => caught.lake_id))
	]);
	return { profile, diary, catches, carpNames, lakeNames, personalBestLb, rating: anglerRatingOf(skillsOf(profile), personalBestLb), trophies, trophyRoom };
}
