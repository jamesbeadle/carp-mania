import { HookBiteAppeal, type HookStats } from '../tackle/hooks';

export function hookMatchScore(hook: Pick<HookStats, 'size'>) {
	return HookBiteAppeal[hook.size];
}
