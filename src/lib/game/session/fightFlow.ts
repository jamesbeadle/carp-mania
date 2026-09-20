import { honoursFor, raiseTheBar } from '$lib/domain/fishing/honours';
import { doesHookSnap, hookHoldChance } from '$lib/domain/tackle/hooks';
import { SnagLoss, TackleLossWords, type TackleLossKind } from '$lib/domain/tackle/losses';
import { bringRodIn, isCastOut, type CastRod } from '../scene/rodState';
import { FightState, type FightOutcome } from './fightState.svelte';
import { landedFishFor } from './landFish';
import { fishOnTheEnd } from './sessionFlow';
import type { SessionState } from './sessionState.svelte';

const StrikeWords = {
	Pulled: 'The hook pulled on the strike — too small a hook for a carp.',
	Again: (name: string) => `${name} again — once on the bank is enough for one day. It shed the hook and went.`
} as const;

const LossOfOutcome: Partial<Record<FightOutcome, TackleLossKind>> = { snapped: 'line_snapped', rod_snapped: 'rod_snapped', hook_opened: 'hook_opened' };
const HookPulledWords = 'Slack line and the hook fell out. Keep it tight.';

export function strike(session: SessionState) {
	const bite = session.bite;
	const rod = bite ? session.rods[bite.rodIndex] : null;
	if (!bite || !rod || !isCastOut(rod)) return;
	session.bite = null;
	const carp = fishOnTheEnd(session, rod, bite);
	if (!carp) return dropTheFish(session, rod, StrikeWords.Pulled);
	const hook = rod.kit.hook.hook;
	const weightLb = Number(carp.weight_lb);
	if (doesHookSnap(hook, weightLb)) return loseTackle(session, rod, 'hook_snapped');
	const isHookHolding = Math.random() < hookHoldChance(hook, session.rating);
	if (!isHookHolding) return dropTheFish(session, rod, StrikeWords.Pulled);
	if (session.hasLandedToday(carp)) return dropTheFish(session, rod, StrikeWords.Again(carp.name));
	const isOnASnag = rod.terrain.feature === 'snag';
	if (isOnASnag && Math.random() < SnagLoss.Chance) return loseTackle(session, rod, 'rig_in_snag');
	rod.phase = 'fighting';
	session.hooked = bite;
	session.fight = new FightState(carp, rod.kit, session.rating);
	session.phase = 'fighting';
}

export function finishFight(session: SessionState) {
	const fight = session.fight;
	const hooked = session.hooked;
	const rod = session.rods.find((candidate) => candidate.phase === 'fighting');
	if (!fight?.outcome || !hooked || !rod || !isCastOut(rod) || !session.swim) return;
	session.fight = null;
	session.hooked = null;
	const loss = LossOfOutcome[fight.outcome];
	if (loss) return loseTackle(session, rod, loss);
	if (fight.outcome === 'hook_pulled') return dropTheFish(session, rod, HookPulledWords);
	const weightLb = Number(fight.carp.weight_lb);
	const honours = honoursFor(weightLb, session.bar);
	session.lastLanded = landedFishFor(session.lake, session.swim, fight.carp, rod, hooked, session.hour, honours);
	session.bar = raiseTheBar(weightLb, session.bar);
	session.landedToday = [...session.landedToday, session.lastLanded];
	bringRodIn(rod);
	session.secondsSinceTheMat = 0;
	session.phase = 'landed';
}

function loseTackle(session: SessionState, rod: CastRod, kind: TackleLossKind) {
	const loss = { kind, rodIndex: rod.index, castPoint: rod.baitPoint };
	session.tackleLost = [...session.tackleLost, loss];
	dropTheFish(session, rod, TackleLossWords[kind]);
}

function dropTheFish(session: SessionState, rod: CastRod, message: string) {
	bringRodIn(rod);
	session.lostToday += 1;
	session.notice = message;
	session.phase = 'fishing';
}
