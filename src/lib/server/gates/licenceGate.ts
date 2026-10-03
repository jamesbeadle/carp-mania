import { isUnderAny } from './pathRoots';

const OpenBeforeTheLicence = ['/welcome', '/auth', '/portrait', '/privacy', '/terms', '/rules'];
const WelcomePath = '/welcome';

type LicenceRow = { licence_signed_at: string | null };

export async function whereTheLicenceSendsYou(locals: App.Locals, anglerId: string, pathname: string): Promise<string | null> {
	if (isUnderAny(pathname, OpenBeforeTheLicence)) return null;
	const { data } = await locals.supabase.from('profiles').select('licence_signed_at').eq('id', anglerId).maybeSingle();
	const licence = data as LicenceRow | null;
	const isSigned = licence?.licence_signed_at != null;
	return isSigned ? null : WelcomePath;
}
