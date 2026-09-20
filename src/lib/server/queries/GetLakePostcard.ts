import { error } from '@sveltejs/kit';
import type { LakePostcard, PostcardNumbers } from '$lib/contracts/LakePostcard';
import type { WorldPin } from '$lib/contracts/WorldPin';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { worldPinFrom, type WorldPinRow } from './GetWorldPins';

const NotOnTheMap = 'That water is not on the map';

export async function GetLakePostcard(locals: App.Locals, lakeId: string): Promise<LakePostcard> {
	requireUser(locals);
	const [{ data: lake }, { data: pinRow }, { data: swims }, { data: carp }] = await Promise.all([
		locals.supabase.from('lakes').select('*').eq('id', lakeId).maybeSingle(),
		locals.supabase.from('world_pins').select('*').eq('id', lakeId).maybeSingle(),
		locals.supabase.from('swims').select('*').eq('lake_id', lakeId).order('name'),
		locals.supabase.from('carp').select('*').eq('lake_id', lakeId).eq('is_catalogued', true).order('weight_lb', { ascending: false })
	]);
	if (!lake || !pinRow) error(404, NotOnTheMap);
	const water = lake as Lake;
	return {
		lake: water,
		swims: (swims ?? []) as Swim[],
		carp: (carp ?? []) as Carp[],
		numbers: postcardNumbersFrom(worldPinFrom(pinRow as WorldPinRow), water.owner_id)
	};
}

function postcardNumbersFrom(pin: WorldPin, ownerId: string): PostcardNumbers {
	return {
		reputation: pin.reputation,
		acres: pin.acres,
		heaviestLb: pin.heaviestLb,
		dayTicketFee: pin.dayTicketFee,
		anglersOnBankNow: pin.anglersOnBankNow,
		ownerName: pin.ownerName,
		ownerId,
		region: pin.region
	};
}
