import { fail } from '@sveltejs/kit';
import { BailiffTerms, whyCannotHire } from '$lib/domain/bailiffs/bailiffTeam';
import { candidatesThisWeek } from '$lib/domain/bailiffs/candidates';
import { formatMoney } from '$lib/format/money';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadBailiffsOf } from '../queries/GetBailiffs';

const CandidateField = 'candidateId';

export async function HireBailiff(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const candidate = candidatesThisWeek(lake.id, new Date()).find((one) => one.id === String(formData.get(CandidateField) ?? ''));
	if (!candidate) return fail(400, { message: 'That candidate is not looking for work this week' });
	const team = await loadBailiffsOf(locals, lake.id);
	const refusal = whyCannotHire(team, Number(lake.acres));
	if (refusal) return fail(400, { message: refusal });
	const isAlreadyHere = team.some((bailiff) => bailiff.name === candidate.name);
	if (isAlreadyHere) return fail(400, { message: `${candidate.name} already works here` });
	const { name, askingWage, aptitude } = candidate;
	const hire = { lake: lake.id, bailiff_name: name, wage: askingWage, aptitude, performance: BailiffTerms.StartingPerformance };
	const { error } = await locals.supabase.rpc('hire_bailiff', hire);
	if (error) return fail(400, { message: error.message });
	return { message: `${candidate.name} hired at ${formatMoney(candidate.askingWage)} a day` };
}
