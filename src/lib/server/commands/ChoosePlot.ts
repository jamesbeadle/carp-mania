import { fail, redirect } from '@sveltejs/kit';
import { whyPlotIsRefused } from '$lib/domain/world/plotRules';
import { isRegionCode } from '$lib/domain/world/regionCodes';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { alreadyHasAWater, hasLakeAlready } from '../gates/requireNoLakeYet';
import { requireUser } from '../gates/requireUser';

const Latitude = { South: -90, North: 90 } as const;
const Longitude = { West: -180, East: 180 } as const;
const NextStep = '/setup?step=2';

export async function ChoosePlot(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	if (await hasLakeAlready(locals)) return alreadyHasAWater();

	const region = String(formData.get('region') ?? '');
	if (!isRegionCode(region)) return fail(400, { message: 'Choose a region first' });
	const latitude = readFormNumber(formData, 'latitude', Latitude.South, Latitude.North);
	if (latitude.failure) return latitude.failure;
	const longitude = readFormNumber(formData, 'longitude', Longitude.West, Longitude.East);
	if (longitude.failure) return longitude.failure;
	const refusal = whyPlotIsRefused(region, latitude.value, longitude.value);
	if (refusal) return fail(400, { message: refusal });

	await trustedSupabase()
		.from('profiles')
		.update({ home_region: region, plot_latitude: latitude.value, plot_longitude: longitude.value })
		.eq('id', user.id);
	redirect(303, NextStep);
}
