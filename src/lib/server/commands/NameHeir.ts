import { fail, redirect } from '@sveltejs/kit';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';
import { diaryOf } from '../queries/GetFishermanDiary';

const HeirName = { Shortest: 2, Longest: 40 } as const;
const ScrapbookPath = '/angler/scrapbook';

export async function NameHeir(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const heirName = String(formData.get('heirName') ?? '').trim();
	if (heirName.length < HeirName.Shortest || heirName.length > HeirName.Longest) return fail(400, { message: `The heir needs a name of ${HeirName.Shortest} to ${HeirName.Longest} letters` });
	const diary = await diaryOf(locals, user.id);
	if (!diary.isRetirementDue) return fail(400, { message: `${diary.current.name} has years in him yet` });
	const { error } = await trustedSupabase().rpc('retire_fisherman', { player: user.id, heir_name: heirName });
	if (error) return fail(400, { message: error.message });
	redirect(303, `${ScrapbookPath}/${diary.current.id}?handedDown=1`);
}
