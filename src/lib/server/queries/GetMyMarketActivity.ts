import type { MyMarketActivity } from '$lib/contracts/MyMarketActivity';
import type { CarpTransfer, TransferKind } from '$lib/domain/marketTypes';
import { requireUser } from '../gates/requireUser';
import { loadLakeNames } from './loadCarpHistory';
import { loadMyBids } from './loadMyBids';
import { isOpenListing, loadMyListings } from './loadMyListings';
import { loadCurrentWater } from './loadMyWaters';

const Sale: TransferKind = 'sale';
const LedgerLimit = 50;

export async function GetMyMarketActivity(locals: App.Locals): Promise<MyMarketActivity> {
	const user = requireUser(locals);
	const myLakeId = await loadMyLakeId(locals, user.id);
	const [listings, bids, transfers] = await Promise.all([loadMyListings(locals, user.id), loadMyBids(locals, user.id), loadMySales(locals, myLakeId)]);
	const lakeNames = await loadLakeNames(locals, transfers.flatMap((transfer) => [transfer.from_lake_id, transfer.to_lake_id]));
	return {
		openListings: listings.filter(isOpenListing),
		closedListings: listings.filter((mine) => !isOpenListing(mine)),
		leadingBids: bids.leading,
		outbidBids: bids.outbid,
		sales: transfers.filter((transfer) => transfer.from_lake_id === myLakeId),
		purchases: transfers.filter((transfer) => transfer.to_lake_id === myLakeId),
		lakeNames
	};
}

async function loadMyLakeId(locals: App.Locals, ownerId: string): Promise<string | null> {
	const water = await loadCurrentWater(locals, ownerId);
	return water?.id ?? null;
}

async function loadMySales(locals: App.Locals, lakeId: string | null): Promise<CarpTransfer[]> {
	if (lakeId === null) return [];
	const { data: transfers } = await locals.supabase
		.from('carp_transfers')
		.select('*')
		.eq('kind', Sale)
		.or(`from_lake_id.eq.${lakeId},to_lake_id.eq.${lakeId}`)
		.order('departed_at', { ascending: false })
		.limit(LedgerLimit);
	return (transfers ?? []) as CarpTransfer[];
}
