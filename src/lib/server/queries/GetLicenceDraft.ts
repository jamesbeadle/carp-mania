import type { LicenceDraft } from '$lib/contracts/AnglerLicence';
import { lookOfPortraitPath } from '$lib/domain/portrait/portraitLook';
import { loadProfile } from '../gates/requireMoney';

export async function GetLicenceDraft(locals: App.Locals): Promise<LicenceDraft & { isSigned: boolean }> {
	const profile = await loadProfile(locals);
	const look = lookOfPortraitPath(profile.avatar_url);
	return { name: profile.display_name, look, purse: Number(profile.money), isSigned: profile.licence_signed_at !== null };
}
