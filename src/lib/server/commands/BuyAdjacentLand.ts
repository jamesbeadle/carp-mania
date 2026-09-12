import { fail } from '@sveltejs/kit';
import { landQuoteFor } from '$lib/domain/groundworks/landPurchase';
import { rescaleLayoutForPlot, rescaleSwimForPlot } from '$lib/domain/groundworks/rescaleForPlot';
import { isEarthwork, isWorkKind } from '$lib/domain/groundworks/workKinds';
import { waterAcres } from '$lib/domain/layout/waterArea';
import type { Lake, Swim } from '$lib/domain/types';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadWorksInProgress } from '../queries/loadWorksInProgress';
import { loadSwimsOf } from './swimGates';

export async function BuyAdjacentLand(locals: App.Locals) {
	const lake = await requireOwnedLake(locals);
	const works = await loadWorksInProgress(locals, lake.id);
	const quote = landQuoteFor(lake, works.some((work) => isWorkKind(work.kind) && isEarthwork(work.kind)));
	if (quote.refusal) return fail(400, { message: quote.refusal });

	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, quote.cost);
	if (shortfall) return shortfall;

	const swims = await loadSwimsOf(locals, lake.id);
	await growPlot(lake, swims, quote.plotAfter);
	await spendMoney(profile, quote.cost);
	return { message: `Bought ${quote.acres} acres for ${formatMoney(quote.cost)} — the plot is now ${quote.plotAfter} acres` };
}

async function growPlot(lake: Lake, swims: Swim[], plotAfter: number) {
	const plotBefore = Number(lake.plot_acres);
	const layout = rescaleLayoutForPlot(lake.layout, plotBefore, plotAfter);
	const trusted = trustedSupabase();
	await trusted.from('lakes').update({ plot_acres: plotAfter, layout, acres: waterAcres(layout, plotAfter) }).eq('id', lake.id);
	for (const swim of swims) await trusted.from('swims').update(rescaleSwimForPlot(swim, plotBefore, plotAfter)).eq('id', swim.id);
}
