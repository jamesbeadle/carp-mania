import { currentWaterOf } from '$lib/domain/estate/estateRules';
import { loadCurrentLakeId, loadMyWaters } from '../queries/loadMyWaters';

const OpenDuringSetup = ['/setup', '/auth', '/inbox', '/world', '/lakes', '/carp', '/anglers'];
const OpenOnceTheWaterExists = ['/lake/works'];
const RunTheWaterPaths = ['/lake'];
const SetupPath = '/setup';

export async function whereSetupSendsYou(locals: App.Locals, ownerId: string, pathname: string): Promise<string | null> {
	if (isUnderAny(pathname, OpenDuringSetup)) return null;
	const [waters, currentLakeId] = await Promise.all([loadMyWaters(locals, ownerId), loadCurrentLakeId(locals, ownerId)]);
	const hasAnOpenWater = waters.some((water) => water.is_setup_complete);
	if (!hasAnOpenWater) return firstWaterGate(waters.length > 0, pathname);
	const current = currentWaterOf(waters, currentLakeId);
	const isRunningAnUnfinishedWater = current !== null && !current.is_setup_complete && isUnderAny(pathname, RunTheWaterPaths) && !isUnderAny(pathname, OpenOnceTheWaterExists);
	return isRunningAnUnfinishedWater ? SetupPath : null;
}

function firstWaterGate(hasBoughtTheSite: boolean, pathname: string) {
	if (hasBoughtTheSite && isUnderAny(pathname, OpenOnceTheWaterExists)) return null;
	return SetupPath;
}

function isUnderAny(pathname: string, roots: string[]) {
	return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
