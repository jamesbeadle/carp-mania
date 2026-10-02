import { error } from '@sveltejs/kit';
import type { Profile } from '$lib/domain/types';
import { loadProfile } from './requireMoney';

const HttpStatus = { NotFound: 404 } as const;
const NoSuchPage = 'Not found';

export async function requireAdmin(locals: App.Locals): Promise<Profile> {
	const profile = await loadProfile(locals);
	if (!profile.is_admin) error(HttpStatus.NotFound, NoSuchPage);
	return profile;
}
