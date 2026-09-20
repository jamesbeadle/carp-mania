import type { WorldPin } from '$lib/contracts/WorldPin';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { requireUser } from '../gates/requireUser';

export interface WorldPinRow {
	id: string;
	name: string;
	owner_name: string | null;
	region: RegionCode;
	latitude: number;
	longitude: number;
	reputation: number;
	heaviest_lb: number | null;
	acres: number;
	day_ticket_fee: number;
	anglers_on_bank_now: number;
}

const UnknownOwner = 'Unknown owner';

export async function GetWorldPins(locals: App.Locals): Promise<WorldPin[]> {
	requireUser(locals);
	const { data: rows } = await locals.supabase.from('world_pins').select('*');
	return ((rows ?? []) as WorldPinRow[]).map(worldPinFrom);
}

export function worldPinFrom(row: WorldPinRow): WorldPin {
	return {
		id: row.id,
		name: row.name,
		ownerName: row.owner_name ?? UnknownOwner,
		region: row.region,
		latitude: Number(row.latitude),
		longitude: Number(row.longitude),
		reputation: Number(row.reputation),
		heaviestLb: Number(row.heaviest_lb ?? 0),
		acres: Number(row.acres),
		dayTicketFee: Number(row.day_ticket_fee),
		anglersOnBankNow: Number(row.anglers_on_bank_now)
	};
}
