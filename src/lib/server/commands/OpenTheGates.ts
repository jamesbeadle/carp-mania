import { fail, redirect } from '@sveltejs/kit';
import { newWaterEvent } from '$lib/domain/simulation/worldEvents';
import { isStockedToOpen, restockingWords } from '$lib/domain/stock/stockedToOpen';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadFishInTheWater } from '../queries/loadFishInTheWater';

const DayTicket = { MinimumFee: 0, MaximumFee: 250 } as const;
const HomeAfterOpening = '/home';

export async function OpenTheGates(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	if (lake.is_setup_complete) return fail(400, { message: 'The gates are already open' });
	const fee = readFormNumber(formData, 'fee', DayTicket.MinimumFee, DayTicket.MaximumFee);
	if (fee.failure) return fee.failure;
	const fishCount = await loadFishInTheWater(locals.supabase, lake.id);
	if (!isStockedToOpen(fishCount)) return fail(400, { message: restockingWords(fishCount) });

	const trusted = trustedSupabase();
	const opening = { day_ticket_fee: fee.value, is_public: true, is_setup_complete: true, simulated_until: new Date().toISOString() };
	const { error } = await trusted.from('lakes').update(opening).eq('id', lake.id);
	if (error) return fail(500, { message: `Could not open the gates: ${error.message}` });
	await trusted.from('world_events').insert(newWaterEvent(lake.id, lake.name, lake.region));
	redirect(303, HomeAfterOpening);
}
