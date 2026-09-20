import { anglersOnTheBank, onTheBankSince, type VisitOnTheBank } from '$lib/domain/fishing/onTheBank';

interface VisitRow {
	angler_id: string;
	angler_name: string;
	visited_at: string;
	fish_caught: number;
}

const VisitColumns = 'angler_id, angler_name, visited_at, fish_caught';

export async function GetAnglersOnTheBank(locals: App.Locals, lakeId: string, now: Date): Promise<VisitOnTheBank[]> {
	const { data } = await locals.supabase
		.from('lake_visits')
		.select(VisitColumns)
		.eq('lake_id', lakeId)
		.not('angler_id', 'is', null)
		.gte('visited_at', onTheBankSince(now).toISOString());
	const visits = ((data ?? []) as VisitRow[]).map(visitOnTheBankOf);
	return anglersOnTheBank(visits, now);
}

function visitOnTheBankOf(row: VisitRow): VisitOnTheBank {
	return { anglerId: row.angler_id, anglerName: row.angler_name, arrivedAt: row.visited_at, fishCaught: row.fish_caught };
}
