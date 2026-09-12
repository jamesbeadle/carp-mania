import type { LandedCost } from '$lib/contracts/ListingPage';
import { transportQuote, type LakeOnGlobe } from '$lib/domain/market/transport';
import type { Listing } from '$lib/domain/marketTypes';
import type { Lake } from '$lib/domain/types';
import { loadCurrentWater } from './loadMyWaters';

type LakePin = Pick<Lake, 'id' | 'latitude' | 'longitude' | 'region'>;
type PinnedLake = LakePin & { latitude: number; longitude: number };

const PinColumns = 'id, latitude, longitude, region';

export async function landedCostFor(locals: App.Locals, listing: Listing, viewerId: string): Promise<LandedCost> {
	const isForTheViewer = listing.status === 'open' && listing.seller_id !== viewerId;
	if (!isForTheViewer) return { state: 'unavailable' };
	const myLake = await loadMyLakePin(locals, viewerId);
	if (!myLake) return { state: 'no_lake' };
	if (!isPinned(myLake)) return { state: 'unpinned' };
	const sellerLake = await loadLakePin(locals, listing.lake_id);
	if (!sellerLake || !isPinned(sellerLake)) return { state: 'unavailable' };
	return quoteBetween(locals, sellerLake, myLake);
}

async function quoteBetween(locals: App.Locals, sellerLake: PinnedLake, myLake: PinnedLake): Promise<LandedCost> {
	const between = { from_lake: sellerLake.id, to_lake: myLake.id };
	const [{ data: transportCost }, { data: distanceKilometres }] = await Promise.all([
		locals.supabase.rpc('transport_cost_between', between),
		locals.supabase.rpc('distance_between_lakes', between)
	]);
	const quote = transportQuote(onGlobe(sellerLake), onGlobe(myLake));
	return {
		state: 'quoted',
		distanceKilometres: Number(distanceKilometres ?? quote.distanceKilometres),
		transportCost: Number(transportCost ?? quote.cost),
		transitDays: quote.transitDays,
		quarantineDays: quote.quarantineDays
	};
}

async function loadMyLakePin(locals: App.Locals, ownerId: string): Promise<LakePin | null> {
	const water = await loadCurrentWater(locals, ownerId);
	return water ? { id: water.id, latitude: water.latitude, longitude: water.longitude, region: water.region } : null;
}

async function loadLakePin(locals: App.Locals, lakeId: string): Promise<LakePin | null> {
	const { data: lake } = await locals.supabase.from('lakes').select(PinColumns).eq('id', lakeId).maybeSingle();
	return lake as LakePin | null;
}

function isPinned(lake: LakePin): lake is PinnedLake {
	return lake.latitude !== null && lake.longitude !== null;
}

function onGlobe(lake: PinnedLake): LakeOnGlobe {
	return { latitude: Number(lake.latitude), longitude: Number(lake.longitude), region: lake.region };
}
