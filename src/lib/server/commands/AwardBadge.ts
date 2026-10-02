import { fail } from '@sveltejs/kit';
import { BadgeCitation, isBadgeCitation } from '$lib/domain/badges/badgeRules';
import { requireAdmin } from '../gates/requireAdmin';

const Fields = { BadgeId: 'badgeId', AnglerId: 'anglerId', Citation: 'citation' } as const;

export async function AwardBadge(locals: App.Locals, formData: FormData) {
	await requireAdmin(locals);
	const badgeId = String(formData.get(Fields.BadgeId) ?? '');
	const anglerId = String(formData.get(Fields.AnglerId) ?? '');
	const citation = String(formData.get(Fields.Citation) ?? '').trim();
	if (badgeId === '') return fail(400, { message: 'Which badge?' });
	if (anglerId === '') return fail(400, { message: 'Which angler?' });
	if (!isBadgeCitation(citation)) return fail(400, { message: `A citation is at most ${BadgeCitation.LongestLength} characters` });
	const { error } = await locals.supabase.rpc('award_badge', { badge: badgeId, angler: anglerId, badge_citation: citation });
	if (error) return fail(400, { message: error.message });
	return { message: 'Pinned on' };
}
