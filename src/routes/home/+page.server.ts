import type { PageServerLoad } from './$types';
import { CreateStarterFishery } from '$lib/server/commands/CreateStarterFishery';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';

export const load: PageServerLoad = async ({ locals }) => {
	const profile = await loadProfile(locals);
	await ensureFisheryExists(locals, profile.display_name);
	const whileAway = await SimulateElapsedTime(locals);
	const fishery = await GetMyFishery(locals);
	const freshProfile = await loadProfile(locals);
	return { profile: freshProfile, fishery, whileAway };
};

async function ensureFisheryExists(locals: App.Locals, ownerName: string) {
	const { count } = await locals.supabase.from('lakes').select('id', { count: 'exact', head: true }).eq('owner_id', locals.user!.id);
	if ((count ?? 0) > 0) return;
	await CreateStarterFishery(locals, `${ownerName}'s Water`);
}
