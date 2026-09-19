import { metresLostOnSnap } from './lines';
import type { RodKit } from './rodSetup';
import type { KitLine } from './starterKit';

export type TackleLossKind = 'line_snapped' | 'rig_in_snag' | 'rod_snapped' | 'hook_opened' | 'hook_snapped';

export const TackleLossKinds: TackleLossKind[] = ['line_snapped', 'rig_in_snag', 'rod_snapped', 'hook_opened', 'hook_snapped'];
export const SnagLoss = { Chance: 0.1 } as const;
export const MostLossesAVisit = 30;
const OneOfEach = 1;

export const TackleLossWords: Record<TackleLossKind, string> = {
	line_snapped: 'Crack — the line snapped. Ease off when it runs. The rig and the line past the break are gone.',
	rig_in_snag: 'It found the snag and the rig is left in it — lead, hook and all.',
	rod_snapped: 'The rod went with a crack like a gunshot. Under-gunned — that rod is firewood.',
	hook_opened: 'The hook opened under the weight and the fish rolled off at the net. A cheap hook loses the fish of the season.',
	hook_snapped: 'The hook snapped on the strike — that wire was never made for a fish this size.'
};

export function tackleLostBy(kind: TackleLossKind, kit: RodKit, castDistanceMetres: number): KitLine[] {
	if (kind === 'line_snapped') return [{ itemId: kit.line.id, quantity: metresLostOnSnap(castDistanceMetres) }, ...rigAndLead(kit)];
	if (kind === 'rig_in_snag') return rigAndLead(kit);
	if (kind === 'rod_snapped') return [{ itemId: kit.rod.id, quantity: OneOfEach }];
	return [{ itemId: kit.hook.id, quantity: OneOfEach }];
}

function rigAndLead(kit: RodKit): KitLine[] {
	return [
		{ itemId: kit.rig.id, quantity: OneOfEach },
		{ itemId: kit.lead.id, quantity: OneOfEach },
		{ itemId: kit.hook.id, quantity: OneOfEach }
	];
}

export function isTackleLossKind(value: unknown): value is TackleLossKind {
	return (TackleLossKinds as string[]).includes(value as string);
}
