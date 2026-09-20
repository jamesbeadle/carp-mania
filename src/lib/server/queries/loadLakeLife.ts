import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
import type { BookedWindow } from '$lib/domain/matches/bookings';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import type { LakeSpecies } from '$lib/domain/water/species';
import type { LakeWork } from '$lib/domain/worldTypes';
import { loadBailiffsOf } from './GetBailiffs';
import { loadSpeciesOf } from './GetLakeSpecies';
import { GetTicketBook } from './GetTicketBook';
import { loadBookings } from './loadBookings';
import { loadWorksInProgress } from './loadWorksInProgress';

export interface LakeLife {
	carp: Carp[];
	swims: Swim[];
	works: LakeWork[];
	bookings: BookedWindow[];
	book: TicketProduct[];
	shoals: Shoal[];
	bailiffs: Bailiff[];
	species: LakeSpecies[];
	pegsBookedByDay: Record<number, number>;
	hasOpenBounty: boolean;
}

export async function loadLakeLife(locals: App.Locals, lake: Lake): Promise<LakeLife> {
	const [{ data: carp }, { data: swims }, { data: shoals }, works, bookings, book, bailiffs, species, pegsBookedByDay, hasOpenBounty] = await Promise.all([
		locals.supabase.from('carp').select('*').eq('lake_id', lake.id),
		locals.supabase.from('swims').select('*').eq('lake_id', lake.id),
		locals.supabase.from('carp_shoals').select('*').eq('lake_id', lake.id),
		loadWorksInProgress(locals, lake.id),
		loadBookings(locals, lake.id, lake.simulated_until),
		GetTicketBook(locals, lake.id),
		loadBailiffsOf(locals, lake.id),
		loadSpeciesOf(locals, lake.id),
		loadPegsBookedByDay(locals, lake.id),
		hasAnOpenBounty(locals, lake.id)
	]);
	return { carp: (carp ?? []) as Carp[], swims: (swims ?? []) as Swim[], shoals: (shoals ?? []) as Shoal[], works, bookings, book, bailiffs, species, pegsBookedByDay, hasOpenBounty };
}

async function loadPegsBookedByDay(locals: App.Locals, lakeId: string): Promise<Record<number, number>> {
	const { data } = await locals.supabase.from('bookings').select('fishery_day').eq('lake_id', lakeId).eq('status', 'booked');
	const byDay: Record<number, number> = {};
	for (const booking of (data ?? []) as { fishery_day: number }[]) byDay[booking.fishery_day] = (byDay[booking.fishery_day] ?? 0) + 1;
	return byDay;
}

async function hasAnOpenBounty(locals: App.Locals, lakeId: string) {
	const { count } = await locals.supabase.from('bounties').select('id', { count: 'exact', head: true }).eq('lake_id', lakeId).eq('status', 'open');
	return (count ?? 0) > 0;
}
