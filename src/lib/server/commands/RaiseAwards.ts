import type { SupabaseClient } from '@supabase/supabase-js';
import { AwardCatalogue, type AwardKey } from '$lib/domain/trophies/awards';
import { newlyEarned } from '$lib/domain/trophies/awardProgress';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadAwardsHeld, loadAwardTallies } from '../queries/loadAwards';

export async function RaiseAwards(anglerId: string, catchId: string | null = null): Promise<AwardKey[]> {
	const trusted = trustedSupabase();
	const [tallies, held] = await Promise.all([loadAwardTallies(trusted, anglerId), loadAwardsHeld(trusted, anglerId)]);
	const earned = newlyEarned(tallies, held.map((award) => award.key));
	const granted: AwardKey[] = [];
	for (const key of earned) if (await grantAward(trusted, anglerId, key, catchId)) granted.push(key);
	return granted;
}

async function grantAward(trusted: SupabaseClient, anglerId: string, key: AwardKey, catchId: string | null) {
	const award = AwardCatalogue[key];
	const { data: isNew } = await trusted.rpc('grant_award', { angler: anglerId, key, the_catch: catchId, title: award.label, body: award.words });
	return isNew === true;
}
