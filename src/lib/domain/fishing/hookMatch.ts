import { HookBiteAppeal, ShinyHookVisibility, type HookChoice } from '../tackle/hooks';
import { WaterScale } from '../waterQuality';

export function hookMatchScore(hook: HookChoice, transparency: number) {
	const appeal = HookBiteAppeal[hook.size];
	if (hook.finish === 'matt') return appeal;
	const howClearlySeen = transparency / WaterScale.Best;
	return Math.max(0.1, appeal - ShinyHookVisibility * howClearlySeen);
}
