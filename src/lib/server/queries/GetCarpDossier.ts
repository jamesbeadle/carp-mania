import { error } from '@sveltejs/kit';
import type { CarpDossier, DossierLake, GrowthPoint } from '$lib/contracts/CarpDossier';
import { dealerOfferFor } from '$lib/domain/market/dealer';
import { guidePriceOf } from '$lib/domain/market/valuation';
import type { Carp, Catch } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { requireUser } from '../gates/requireUser';
import { loadCatchesOf, loadHeaviestCatchLbOf, loadLakeNames, loadTransfersOf } from './loadCarpHistory';

const NotVisible = 'That fish is not on any water you can see';

type LakeEmbed = { id: string; name: string; region: RegionCode; owner_id: string; profiles: { display_name: string } | null };
type CarpRow = Carp & { lakes: LakeEmbed | null };

export async function GetCarpDossier(locals: App.Locals, carpId: string): Promise<CarpDossier> {
	const user = requireUser(locals);
	const { carp, lake } = await loadCarpWithLake(locals, carpId);
	const [catches, heaviestCatchLb, transfers] = await Promise.all([loadCatchesOf(locals, carpId), loadHeaviestCatchLbOf(locals, carpId), loadTransfersOf(locals, carpId)]);
	const lakeNames = await loadLakeNames(locals, [lake.id, carp.origin_lake_id, ...transfers.flatMap((transfer) => [transfer.from_lake_id, transfer.to_lake_id])]);
	return {
		carp,
		lake,
		originLakeName: carp.origin_lake_id ? (lakeNames[carp.origin_lake_id] ?? null) : null,
		catches,
		transfers,
		lakeNames,
		guidePrice: guidePriceOf(carp),
		dealerOffer: dealerOfferFor(carp),
		bestEverLb: Math.max(heaviestCatchLb, Number(carp.weight_lb)),
		growth: growthOf(catches, carp, new Date()),
		openListingId: null,
		isMine: lake.ownerId === user.id
	};
}

async function loadCarpWithLake(locals: App.Locals, carpId: string) {
	const { data: row } = await locals.supabase
		.from('carp')
		.select('*, lakes!carp_lake_id_fkey(id, name, region, owner_id, profiles!lakes_owner_id_fkey(display_name))')
		.eq('id', carpId)
		.maybeSingle();
	if (!row) error(404, NotVisible);
	const { lakes, ...carp } = row as CarpRow;
	if (!lakes) error(404, NotVisible);
	return { carp, lake: dossierLakeFrom(lakes) };
}

function dossierLakeFrom(embed: LakeEmbed): DossierLake {
	return { id: embed.id, name: embed.name, region: embed.region, ownerId: embed.owner_id, ownerName: embed.profiles?.display_name ?? 'Unknown owner' };
}

function growthOf(catches: Catch[], carp: Carp, now: Date): GrowthPoint[] {
	const caughtWeights = [...catches].reverse().map((caught) => ({ at: caught.caught_at, weightLb: Number(caught.weight_lb) }));
	return [...caughtWeights, { at: now.toISOString(), weightLb: Number(carp.weight_lb) }];
}
