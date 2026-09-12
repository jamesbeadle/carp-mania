import { sound } from '../sound/soundEngine.svelte';
import type { SoundName } from '../sound/soundLibrary';
import type { FightOutcome } from './fightState.svelte';

const OutcomeSounds: Record<FightOutcome, SoundName> = { landed: 'net', snapped: 'snap', hook_pulled: 'hook_pulled' };

export function followTheBiteAlarm(hasBite: boolean, isAlarmMuted: boolean) {
	if (!hasBite || isAlarmMuted) return sound.stopLoop('alarm');
	sound.startLoop('alarm');
}

export function soundTheOutcome(outcome: FightOutcome | null | undefined) {
	if (outcome) sound.play(OutcomeSounds[outcome]);
}

export function followTheFight(isReeling: boolean, isRunning: boolean) {
	if (isReeling) sound.startLoop('reel');
	else sound.stopLoop('reel');
	if (isRunning) sound.startLoop('clutch');
	else sound.stopLoop('clutch');
}

export function quietTheBank() {
	sound.stopLoops();
}
