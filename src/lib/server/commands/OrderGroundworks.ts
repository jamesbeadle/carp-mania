import { json } from '@sveltejs/kit';
import { isWorkDraft, withTrimmedName } from '$lib/domain/groundworks/isWorkDraft';
import { GetGroundworksQuote, type WorkQuote } from '$lib/domain/groundworks/quote';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import { completesOn } from '$lib/domain/groundworks/worksLedger';
import type { Lake, Swim } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadWorksInProgress } from '../queries/loadWorksInProgress';

const HttpStatus = { BadRequest: 400 } as const;

export async function OrderGroundworks(locals: App.Locals, body: unknown) {
	const lake = await requireOwnedLake(locals);
	const draft = draftFrom(body);
	if (!draft) return refusal('That is not a kind of groundworks the crew can do');

	const [swims, works] = await Promise.all([loadSwimsOf(locals, lake.id), loadWorksInProgress(locals, lake.id)]);
	const quote = GetGroundworksQuote(draft, lake, swims, works);
	if (quote.failures.length > 0) return refusal(quote.failures.join('. '));
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, quote.cost);
	if (shortfall) return refusal(shortfall.data.message);

	const workId = await insertWork(lake, draft, quote);
	if (!workId) return refusal('The order could not be placed — try again');
	await trustedSupabase().from('lakes').update({ disturbance: Number(lake.disturbance) + quote.disturbance }).eq('id', lake.id);
	await spendMoney(profile, quote.cost);
	return json({ workId });
}

function draftFrom(body: unknown): WorkDraft | null {
	const candidate = (body as { draft?: unknown } | null)?.draft;
	return isWorkDraft(candidate) ? withTrimmedName(candidate) : null;
}

function refusal(message: string) {
	return json({ message }, { status: HttpStatus.BadRequest });
}

async function insertWork(lake: Lake, draft: WorkDraft, quote: WorkQuote) {
	const { kind, ...parameters } = draft;
	const startsOn = new Date(lake.simulated_until);
	const row = { lake_id: lake.id, kind, parameters, cost: quote.cost, starts_on: startsOn.toISOString(), completes_on: completesOn(startsOn, quote.days).toISOString() };
	const { data: work } = await trustedSupabase().from('lake_works').insert(row).select('id').single();
	return (work as { id: string } | null)?.id ?? null;
}

async function loadSwimsOf(locals: App.Locals, lakeId: string) {
	const { data: swims } = await locals.supabase.from('swims').select('*').eq('lake_id', lakeId);
	return (swims ?? []) as Swim[];
}
