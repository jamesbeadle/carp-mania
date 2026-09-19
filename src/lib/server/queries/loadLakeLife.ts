import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
import type { BookedWindow } from '$lib/domain/matches/bookings';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import type { LakeWork } from '$lib/domain/worldTypes';
import { loadBailiffsOf } from './GetBailiffs';
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
}

export async function loadLakeLife(locals: App.Locals, lake: Lake): Promise<LakeLife> {
	const [{ data: carp }, { data: swims }, { data: shoals }, works, bookings, book, bailiffs] = await Promise.all([
		locals.supabase.from('carp').select('*').eq('lake_id', lake.id),
		locals.supabase.from('swims').select('*').eq('lake_id', lake.id),
		locals.supabase.from('carp_shoals').select('*').eq('lake_id', lake.id),
		loadWorksInProgress(locals, lake.id),
		loadBookings(locals, lake.id, lake.simulated_until),
		GetTicketBook(locals, lake.id),
		loadBailiffsOf(locals, lake.id)
	]);
	return { carp: (carp ?? []) as Carp[], swims: (swims ?? []) as Swim[], shoals: (shoals ?? []) as Shoal[], works, bookings, book, bailiffs };
}
