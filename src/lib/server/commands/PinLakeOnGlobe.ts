import { fail, redirect } from '@sveltejs/kit';
import { newWaterEvent } from '$lib/domain/simulation/worldEvents';
import { whyPlotIsRefused } from '$lib/domain/world/plotRules';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const Latitude = { South: -90, North: 90 } as const;
const Longitude = { West: -180, East: 180 } as const;
const AlreadyPinned = 'Your water is already on the map — a pin is placed once and never moves';
const HomeOncePinned = '/home';

export async function PinLakeOnGlobe(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	if (lake.latitude !== null) return fail(400, { message: AlreadyPinned });
	const latitude = readFormNumber(formData, 'latitude', Latitude.South, Latitude.North);
	if (latitude.failure) return latitude.failure;
	const longitude = readFormNumber(formData, 'longitude', Longitude.West, Longitude.East);
	if (longitude.failure) return longitude.failure;
	const refusal = whyPlotIsRefused(lake.region, latitude.value, longitude.value);
	if (refusal) return fail(400, { message: refusal });

	const { error } = await trustedSupabase()
		.from('lakes')
		.update({ latitude: latitude.value, longitude: longitude.value })
		.eq('id', lake.id)
		.is('latitude', null);
	if (error) return fail(500, { message: `Could not pin your water: ${error.message}` });
	await trustedSupabase().from('world_events').insert(newWaterEvent(lake.id, lake.name, lake.region));
	redirect(303, HomeOncePinned);
}
