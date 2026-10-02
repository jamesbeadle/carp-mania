import { fail } from '@sveltejs/kit';
import { badgeNameRuleWords, BadgeMetals, BadgeWords, isBadgeName, isBadgeWords } from '$lib/domain/badges/badgeRules';
import { requireAdmin } from '../gates/requireAdmin';
import { readFormChoice } from '../gates/readFormNumber';

const Fields = { Name: 'name', Words: 'words', Metal: 'metal' } as const;
const NameRule = `A badge name is ${badgeNameRuleWords()}`;
const WordsRule = `The words are at most ${BadgeWords.LongestLength} characters`;

export async function CreateBadge(locals: App.Locals, formData: FormData) {
	await requireAdmin(locals);
	const name = String(formData.get(Fields.Name) ?? '').trim();
	const words = String(formData.get(Fields.Words) ?? '').trim();
	if (!isBadgeName(name)) return fail(400, { message: NameRule });
	if (!isBadgeWords(words)) return fail(400, { message: WordsRule });
	const metal = readFormChoice(formData, Fields.Metal, BadgeMetals);
	if (metal.failure) return metal.failure;
	const { error } = await locals.supabase.rpc('create_badge', { badge_name: name, badge_words: words, badge_metal: metal.value });
	if (error) return fail(400, { message: error.message });
	return { message: `${name} is a badge now` };
}
