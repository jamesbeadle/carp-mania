const OpenDuringSetup = ['/setup', '/auth', '/inbox', '/world', '/lakes', '/carp', '/anglers'];
const OpenOnceTheWaterExists = ['/lake/works'];
const SetupPath = '/setup';

interface SetupState {
	id: string;
	is_setup_complete: boolean;
}

export async function whereSetupSendsYou(locals: App.Locals, ownerId: string, pathname: string): Promise<string | null> {
	if (isUnderAny(pathname, OpenDuringSetup)) return null;
	const lake = await loadSetupState(locals, ownerId);
	if (lake?.is_setup_complete) return null;
	if (lake && isUnderAny(pathname, OpenOnceTheWaterExists)) return null;
	return SetupPath;
}

function isUnderAny(pathname: string, roots: string[]) {
	return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

async function loadSetupState(locals: App.Locals, ownerId: string): Promise<SetupState | null> {
	const { data: lake } = await locals.supabase.from('lakes').select('id, is_setup_complete').eq('owner_id', ownerId).maybeSingle();
	return lake as SetupState | null;
}
