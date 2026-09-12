import type { MemorialDossier } from '$lib/contracts/MemorialDossier';
import type { CarpMemorial } from '$lib/domain/memorialTypes';
import { requireUser } from '../gates/requireUser';
import { loadCatchesOf, loadHeaviestCatchLbOf, loadLakeNames, loadTransfersOf } from './loadCarpHistory';

export async function GetMemorialDossier(locals: App.Locals, memorial: CarpMemorial): Promise<MemorialDossier> {
	requireUser(locals);
	const [catches, heaviestCatchLb, transfers] = await Promise.all([loadCatchesOf(locals, memorial.id), loadHeaviestCatchLbOf(locals, memorial.id), loadTransfersOf(locals, memorial.id)]);
	const lakeNames = await loadLakeNames(locals, [memorial.lake_id, memorial.origin_lake_id, ...transfers.flatMap((transfer) => [transfer.from_lake_id, transfer.to_lake_id])]);
	return { memorial, catches, transfers, lakeNames, bestEverLb: Math.max(heaviestCatchLb, Number(memorial.weight_lb)) };
}
