import { fail } from '@sveltejs/kit';
import { MatchTerms, type MatchOrder } from '$lib/domain/matches/matchRules';

const Fields = { Title: 'title', StartsInHours: 'startsInHours', LastsHours: 'lastsHours', EntryFee: 'entryFee', HostStake: 'hostStake', MostCatchesShare: 'mostCatchesShare' } as const;

export function readMatchOrder(formData: FormData) {
	const order: MatchOrder = {
		title: String(formData.get(Fields.Title) ?? '').trim(),
		startsInHours: wholeNumber(formData, Fields.StartsInHours),
		lastsHours: wholeNumber(formData, Fields.LastsHours),
		entryFee: pounds(formData, Fields.EntryFee),
		hostStake: pounds(formData, Fields.HostStake),
		mostCatchesShare: wholeNumber(formData, Fields.MostCatchesShare)
	};
	const isSound = [order.startsInHours, order.lastsHours, order.entryFee, order.hostStake, order.mostCatchesShare].every(Number.isFinite);
	if (!isSound) return { value: null, failure: fail(400, { message: 'Every part of the match needs a number' }) };
	return { value: order, failure: null };
}

function wholeNumber(formData: FormData, field: string) {
	const value = Number(formData.get(field));
	return Number.isInteger(value) ? value : Number.NaN;
}

function pounds(formData: FormData, field: string) {
	const typed = String(formData.get(field) ?? '').trim();
	if (typed === '') return 0;
	const value = Number(typed);
	return Number.isFinite(value) && value <= MatchTerms.LargestStake ? Math.round(value) : Number.NaN;
}
