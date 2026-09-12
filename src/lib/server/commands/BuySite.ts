import { fail, redirect } from '@sveltejs/kit';
import { seededRandom } from '$lib/domain/random';
import { hasChosenPlot, type ProfileWithPlot } from '$lib/domain/sites/chosenPlot';
import { estateCatchHistory } from '$lib/domain/sites/estateHistory';
import { newLakeFor } from '$lib/domain/sites/newLake';
import { SiteCatalogue } from '$lib/domain/sites/siteCatalogue';
import { priceOfSite, templateSwimRowsFor } from '$lib/domain/sites/siteTemplates';
import { startingCarpFor } from '$lib/domain/sites/startingStock';
import type { Lake } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readSiteOrder, type SiteOrder } from '../gates/readSiteOrder';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { roomForAnotherWater } from '../gates/requireRoomForAnotherWater';

const NextStep = '/setup?step=3';

export async function BuySite(locals: App.Locals, formData: FormData) {
	const noRoom = await roomForAnotherWater(locals);
	if (noRoom) return noRoom;
	const profile = await loadProfile(locals);
	if (!hasChosenPlot(profile)) return fail(400, { message: 'Choose where in the world first' });
	const order = readSiteOrder(formData, profile.display_name);
	if (order.failure) return order.failure;
	const price = priceOfSite(order.value.site, profile.plot_region, order.value.plotAcres);
	const shortfall = moneyShortfall(profile, price);
	if (shortfall) return shortfall;

	await createTheWater(profile, order.value, new Date());
	await spendMoney(profile, price);
	redirect(303, NextStep);
}

async function createTheWater(profile: ProfileWithPlot, order: SiteOrder, now: Date) {
	const trusted = trustedSupabase();
	const { data: lake, error } = await trusted.from('lakes').insert(newLakeFor(profile, order.site, order.plotAcres, order.name, now)).select('*').single();
	if (error || !lake) throw new Error(`Could not buy the site: ${error?.message}`);
	await trusted.from('profiles').update({ current_lake_id: lake.id, plot_region: null, plot_latitude: null, plot_longitude: null }).eq('id', profile.id);

	const random = seededRandom(now.getTime());
	const stock = startingCarpFor(order.site, lake.id, profile.plot_region, random).map((fish) => ({ ...fish, id: crypto.randomUUID() }));
	const history = estateCatchHistory(lake as Lake, stock, SiteCatalogue[order.site].historyDays, random);
	await trusted.from('swims').insert(templateSwimRowsFor(order.site, lake.id));
	if (history.carp.length > 0) await trusted.from('carp').insert(history.carp);
	if (history.catches.length > 0) await trusted.from('catches').insert(history.catches);
}
